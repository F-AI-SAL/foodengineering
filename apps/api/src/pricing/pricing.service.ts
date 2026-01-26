import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { evaluateRuleGroup, type RuleSet } from "./rules.engine";
import { isPlainObject } from "./rules.utils";

interface PricingContext {
  subtotal: number;
  itemCount: number;
  channel: string;
  segmentIds: string[];
  dayOfWeek: string;
  time: string;
  firstOrder: boolean;
}

export interface AppliedDiscount {
  sourceType: "promotion" | "coupon";
  sourceId: string;
  amount: number;
  freeDelivery?: boolean;
}

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  async priceOrder(input: {
    orderId?: string;
    customerId: string;
    subtotal: number;
    deliveryFee: number;
    itemCount: number;
    channel: string;
    segmentIds: string[];
    couponCode?: string;
  }) {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const time = now.toISOString().slice(11, 16);

    const firstOrder =
      (await this.prisma.order.count({ where: { customerId: input.customerId } })) === 0;

    const context: PricingContext = {
      subtotal: input.subtotal,
      itemCount: input.itemCount,
      channel: input.channel,
      segmentIds: input.segmentIds,
      dayOfWeek,
      time,
      firstOrder
    };

    const [safetyCaps, stackingRules] = await Promise.all([
      this.prisma.setting.findUnique({ where: { key: "safety_caps" } }),
      this.prisma.setting.findUnique({ where: { key: "stacking_rules" } })
    ]);

    const maxOrderDiscount = Number(
      (safetyCaps?.valueJson as Record<string, unknown> | undefined)?.maxOrderDiscount ?? 0
    );
    const defaultPromotionBudget = Number(
      (safetyCaps?.valueJson as Record<string, unknown> | undefined)?.promotionBudgetCap ?? 0
    );
    const couponOverridesPromotions = Boolean(
      (stackingRules?.valueJson as Record<string, unknown> | undefined)?.couponOverridesPromotions ?? true
    );
    const freeDeliveryStacks = Boolean(
      (stackingRules?.valueJson as Record<string, unknown> | undefined)?.freeDeliveryStacks ?? true
    );

    const promotions = await this.prisma.promotion.findMany({
      where: {
        status: "active",
        OR: [{ startAt: null }, { startAt: { lte: now } }],
        AND: [{ endAt: null }, { endAt: { gte: now } }]
      },
      orderBy: { priority: "desc" }
    });

    let budgetSpentByPromotion = new Map<string, number>();
    if (promotions.length > 0) {
      const spentRows = await this.prisma.redemption.groupBy({
        by: ["promotionId"],
        where: { promotionId: { in: promotions.map((promotion) => promotion.id) } },
        _sum: { discountAmount: true }
      });
      budgetSpentByPromotion = new Map(
        spentRows
          .filter((row) => typeof row.promotionId === "string")
          .map((row) => [row.promotionId as string, Number(row._sum.discountAmount ?? 0)])
      );
    }

    const applicablePromotions = promotions.filter((promotion) => {
      const budgetCap = Number(promotion.budgetCap ?? defaultPromotionBudget ?? 0);
      if (budgetCap <= 0) {
        return true;
      }
      const spentAmount = budgetSpentByPromotion.get(promotion.id) ?? 0;
      return spentAmount < budgetCap;
    });

    const eligiblePromotions = applicablePromotions.filter((promotion) => {
      const ruleSet = promotion.rulesJson as unknown as RuleSet;
      const conditionsMet = evaluateRuleGroup(
        ruleSet.conditions,
        context as unknown as Record<string, unknown>
      );
      return conditionsMet && this.isScheduleActive(promotion.scheduleJson, context);
    });

    const exclusivePromotion = eligiblePromotions.find((promotion) => !promotion.stackable);
    const promotionsToApply = exclusivePromotion
      ? [exclusivePromotion]
      : eligiblePromotions.filter((promotion) => promotion.stackable);

    const applied: AppliedDiscount[] = [];
    let discountTotal = 0;
    let freeDelivery = false;

    for (const promotion of promotionsToApply) {
      const appliedPromotion = this.applyRuleSet(
        promotion.id,
        "promotion",
        promotion.rulesJson as unknown as RuleSet,
        input.subtotal,
        promotion.maxDiscount ? Number(promotion.maxDiscount) : undefined
      );
      discountTotal += appliedPromotion.amount;
      freeDelivery = freeDelivery || Boolean(appliedPromotion.freeDelivery);
      applied.push(appliedPromotion);
    }

    let couponApplied: AppliedDiscount | null = null;
    if (input.couponCode) {
      const coupon = await this.prisma.coupon.findFirst({
        where: {
          code: input.couponCode,
          isActive: true,
          OR: [{ startAt: null }, { startAt: { lte: now } }],
          AND: [{ endAt: null }, { endAt: { gte: now } }]
        }
      });

      if (coupon) {
        let couponEligible = true;
        const couponSegments = Array.isArray(coupon.segmentIds)
          ? coupon.segmentIds.filter((value): value is string => typeof value === "string")
          : [];
        if (couponSegments.length && !couponSegments.some((id) => input.segmentIds.includes(id))) {
          couponEligible = false;
        }

        if (couponEligible && coupon.totalLimit) {
          const totalUses = await this.prisma.redemption.count({ where: { couponId: coupon.id } });
          if (totalUses >= Number(coupon.totalLimit)) {
            couponEligible = false;
          }
        }

        if (couponEligible && coupon.perUserLimit) {
          const userUses = await this.prisma.redemption.count({
            where: { couponId: coupon.id, userId: input.customerId }
          });
          if (userUses >= Number(coupon.perUserLimit)) {
            couponEligible = false;
          }
        }

        if (couponEligible) {
          const couponStackable = coupon.stackable !== false;
          if (!couponStackable && couponOverridesPromotions) {
            if (freeDeliveryStacks) {
              const keepFreeDelivery = applied.filter((entry) => entry.freeDelivery);
              applied.splice(0, applied.length, ...keepFreeDelivery);
            } else {
              applied.splice(0, applied.length);
            }
            discountTotal = applied.reduce((sum, entry) => sum + entry.amount, 0);
            if (!freeDeliveryStacks) {
              freeDelivery = false;
            }
          }

          const couponDiscount = this.applyCoupon(coupon, input.subtotal, freeDelivery);
          couponApplied = couponDiscount;
          if (couponDiscount.sourceType === "coupon") {
            discountTotal += couponDiscount.amount;
            freeDelivery = freeDelivery || Boolean(couponDiscount.freeDelivery);
          }
        }
      }
    }

    if (couponApplied) {
      applied.push(couponApplied);
    }

    if (maxOrderDiscount > 0 && discountTotal > maxOrderDiscount) {
      let remaining = maxOrderDiscount;
      for (const entry of applied) {
        if (remaining <= 0) {
          entry.amount = 0;
          continue;
        }
        const nextAmount = Math.min(entry.amount, remaining);
        entry.amount = nextAmount;
        remaining -= nextAmount;
      }
      discountTotal = Math.min(discountTotal, maxOrderDiscount);
    }

    const deliveryFee = freeDelivery ? 0 : input.deliveryFee;
    const total = Math.max(input.subtotal + deliveryFee - discountTotal, 0);

    if (input.orderId) {
      const redemptionRows = applied
        .filter((entry) => entry.amount > 0 || entry.freeDelivery)
        .map((entry) => ({
          couponId: entry.sourceType === "coupon" ? entry.sourceId : null,
          promotionId: entry.sourceType === "promotion" ? entry.sourceId : null,
          orderId: input.orderId,
          userId: input.customerId,
          discountAmount: entry.amount
        }));

      if (redemptionRows.length > 0) {
        await this.prisma.redemption.createMany({ data: redemptionRows });
      }
    }

    return {
      subtotal: input.subtotal,
      deliveryFee,
      discountTotal,
      total,
      applied
    };
  }

  private applyRuleSet(
    sourceId: string,
    sourceType: "promotion" | "coupon",
    ruleSet: RuleSet,
    subtotal: number,
    overrideMaxDiscount?: number
  ): AppliedDiscount {
    const actions = ruleSet.actions as Record<string, unknown>;
    const type = actions.type as string | undefined;
    const value = Number(actions.value ?? 0);
    const maxDiscount = Math.max(
      Number(actions.maxDiscount ?? 0),
      Number(overrideMaxDiscount ?? 0)
    );

    let amount = 0;
    let freeDelivery = false;

    if (type === "percent") {
      amount = (subtotal * value) / 100;
      if (maxDiscount > 0) {
        amount = Math.min(amount, maxDiscount);
      }
    } else if (type === "fixed") {
      amount = value;
    } else if (type === "free_delivery") {
      freeDelivery = true;
    }

    return {
      sourceId,
      sourceType,
      amount,
      freeDelivery
    };
  }

  private applyCoupon(coupon: any, subtotal: number, hasFreeDelivery: boolean): AppliedDiscount {
    if (coupon.minPurchase && subtotal < Number(coupon.minPurchase)) {
      return { sourceId: coupon.id, sourceType: "coupon", amount: 0 };
    }

    let amount = 0;
    let freeDelivery = hasFreeDelivery;

    if (coupon.type === "percent") {
      amount = (subtotal * Number(coupon.value)) / 100;
      if (coupon.maxDiscount) {
        amount = Math.min(amount, Number(coupon.maxDiscount));
      }
    } else if (coupon.type === "fixed") {
      amount = Number(coupon.value);
    } else if (coupon.type === "free_delivery") {
      freeDelivery = true;
    }

    return {
      sourceId: coupon.id,
      sourceType: "coupon",
      amount,
      freeDelivery
    };
  }

  private isScheduleActive(scheduleJson: unknown, context: PricingContext) {
    if (!scheduleJson || !isPlainObject(scheduleJson)) {
      return true;
    }

    const schedule = scheduleJson as { days?: string[]; timeWindow?: { start: string; end: string } };
    if (schedule.days && !schedule.days.includes(context.dayOfWeek)) {
      return false;
    }

    if (schedule.timeWindow) {
      return context.time >= schedule.timeWindow.start && context.time <= schedule.timeWindow.end;
    }

    return true;
  }
}
