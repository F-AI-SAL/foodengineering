import { Injectable, Logger } from "@nestjs/common";
import { AutomationRule, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsClient } from "../common/notifications.client";

type ActionConfig = Record<string, unknown>;

/**
 * Executes the real-world effect of an automation rule based on its
 * actionType + actionConfigJson. Each handler validates its config and
 * throws a descriptive error on bad input so the execution is recorded as
 * `failed` (with a useful message) rather than a silent success.
 *
 * Action config contracts:
 *   activate_promotion / deactivate_promotion: { promotionId: string }
 *   send_notification: { channel: "email"|"whatsapp", payload?: object,
 *                        to?, subject?, message?, template? }
 *   send_coupon: { couponId?: string, code?: string, recipients: string[],
 *                  channel?: "email"|"whatsapp", subject?, message? }
 *   award_loyalty: { userId: string, points: number }
 *   update_segment: not supported yet (no segment-evaluation engine).
 */
@Injectable()
export class AutomationExecutorService {
  private readonly logger = new Logger(AutomationExecutorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsClient
  ) {}

  async execute(rule: AutomationRule): Promise<Prisma.InputJsonValue> {
    const config = (rule.actionConfigJson ?? {}) as ActionConfig;
    this.logger.log(`Executing rule ${rule.id} action=${rule.actionType}`);

    switch (rule.actionType) {
      case "activate_promotion":
        return this.setPromotionStatus(config, "active");
      case "deactivate_promotion":
        return this.setPromotionStatus(config, "paused");
      case "send_notification":
        return this.sendNotification(config);
      case "send_coupon":
        return this.sendCoupon(config);
      case "award_loyalty":
        return this.awardLoyalty(config);
      case "update_segment":
        throw new Error(
          "update_segment is not supported yet (no segment-evaluation engine in this build)."
        );
      default:
        throw new Error(`Unknown automation action type: ${rule.actionType}`);
    }
  }

  private async setPromotionStatus(
    config: ActionConfig,
    status: "active" | "paused"
  ): Promise<Prisma.InputJsonValue> {
    const promotionId = this.requireString(config, "promotionId");
    const existing = await this.prisma.promotion.findUnique({ where: { id: promotionId } });
    if (!existing) {
      throw new Error(`Promotion ${promotionId} not found.`);
    }
    await this.prisma.promotion.update({ where: { id: promotionId }, data: { status } });
    return {
      action: status === "active" ? "activate_promotion" : "deactivate_promotion",
      promotionId,
      status
    };
  }

  private async sendNotification(config: ActionConfig): Promise<Prisma.InputJsonValue> {
    const channel = this.requireChannel(config);
    const explicitPayload = config.payload as Record<string, unknown> | undefined;
    const payload = explicitPayload ?? this.pick(config, ["to", "subject", "message", "template"]);
    if (!payload || Object.keys(payload).length === 0) {
      throw new Error(
        "send_notification requires a 'payload' object or at least one of to/subject/message/template."
      );
    }
    await this.notifications.enqueue(channel, payload);
    return { action: "send_notification", channel, enqueued: true };
  }

  private async sendCoupon(config: ActionConfig): Promise<Prisma.InputJsonValue> {
    const couponId = typeof config.couponId === "string" ? config.couponId : undefined;
    const code = typeof config.code === "string" ? config.code : undefined;
    if (!couponId && !code) {
      throw new Error("send_coupon requires 'couponId' or 'code'.");
    }
    const coupon = await this.prisma.coupon.findFirst({
      where: couponId ? { id: couponId } : { code: code as string }
    });
    if (!coupon) {
      throw new Error(`Coupon ${couponId ?? code} not found.`);
    }

    const recipients = Array.isArray(config.recipients)
      ? (config.recipients as unknown[]).filter(
          (r): r is string => typeof r === "string" && r.trim().length > 0
        )
      : [];
    if (recipients.length === 0) {
      throw new Error(
        "send_coupon requires a non-empty 'recipients' array of email addresses (segment-based send not yet supported)."
      );
    }

    const channel = config.channel === "whatsapp" ? "whatsapp" : "email";
    const subject =
      typeof config.subject === "string" ? config.subject : `Here's your coupon: ${coupon.code}`;
    const message =
      typeof config.message === "string"
        ? config.message
        : `Use code ${coupon.code} at checkout.`;

    await Promise.all(
      recipients.map((to) =>
        this.notifications.enqueue(channel, { to, subject, message, couponCode: coupon.code })
      )
    );

    return {
      action: "send_coupon",
      couponId: coupon.id,
      code: coupon.code,
      channel,
      recipients: recipients.length
    };
  }

  private async awardLoyalty(config: ActionConfig): Promise<Prisma.InputJsonValue> {
    const userId = this.requireString(config, "userId");
    const points = Number(config.points);
    if (!Number.isFinite(points) || points === 0) {
      throw new Error("award_loyalty requires a non-zero numeric 'points'.");
    }
    const profile = await this.prisma.customerProfile.upsert({
      where: { userId },
      create: { userId, points },
      update: { points: { increment: points } }
    });
    return { action: "award_loyalty", userId, pointsDelta: points, pointsTotal: profile.points };
  }

  private requireString(config: ActionConfig, key: string): string {
    const value = config[key];
    if (typeof value !== "string" || !value.trim()) {
      throw new Error(`Missing required '${key}' (string) in action config.`);
    }
    return value;
  }

  private requireChannel(config: ActionConfig): "email" | "whatsapp" {
    const channel = config.channel;
    if (channel !== "email" && channel !== "whatsapp") {
      throw new Error("send_notification requires 'channel' to be 'email' or 'whatsapp'.");
    }
    return channel;
  }

  private pick(config: ActionConfig, keys: string[]): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const key of keys) {
      if (config[key] !== undefined) {
        out[key] = config[key];
      }
    }
    return out;
  }
}
