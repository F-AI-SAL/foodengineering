import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@foodengineering.com" },
    update: {},
    create: {
      name: "Admin Manager",
      email: "admin@foodengineering.com",
      role: "admin",
      phone: "555-0001"
    }
  });

  const customer = await prisma.user.upsert({
    where: { email: "jordan@example.com" },
    update: {},
    create: {
      name: "Jordan Lee",
      email: "jordan@example.com",
      role: "customer",
      phone: "555-0110",
      dob: new Date("1993-02-05")
    }
  });

  await prisma.customerProfile.upsert({
    where: { userId: customer.id },
    update: {
      points: 1840,
      tier: "gold",
      lifetimeSpend: 2450,
      orderCount: 18,
      lastOrderAt: new Date("2026-01-10T12:30:00Z")
    },
    create: {
      userId: customer.id,
      points: 1840,
      tier: "gold",
      lifetimeSpend: 2450,
      orderCount: 18,
      lastOrderAt: new Date("2026-01-10T12:30:00Z")
    }
  });

  const weekendPromo = await prisma.promotion.create({
    data: {
      name: "Weekend Flash Sale",
      description: "15% off weekends with ৳25 cap.",
      status: "active",
      stackable: true,
      priority: 4,
      rulesJson: {
        conditions: {
          logic: "AND",
          conditions: [
            { field: "subtotal", operator: ">=", value: 500 },
            { field: "dayOfWeek", operator: "in", value: ["saturday", "sunday"] }
          ]
        },
        actions: { type: "percent", value: 15, maxDiscount: 25 }
      },
      scheduleJson: { days: ["saturday", "sunday"], timeWindow: { start: "17:00", end: "22:00" } },
      maxDiscount: 25,
      budgetCap: 2500,
      createdBy: admin.id
    }
  });

  const vipSegment = await prisma.segment.create({
    data: {
      name: "VIP (20+ orders or ৳200000 spend)",
      definitionJson: { minOrders: 20, minSpend: 200000 },
      isDynamic: true
    }
  });

  await prisma.segment.createMany({
    data: [
      { name: "New Customers (30 days)", definitionJson: { windowDays: 30, metric: "createdAt" }, isDynamic: true },
      { name: "Regular Guests (5-20 orders)", definitionJson: { minOrders: 5, maxOrders: 20 }, isDynamic: true },
      { name: "Inactive 30 days", definitionJson: { inactiveDays: 30 }, isDynamic: true },
      { name: "Inactive 60 days", definitionJson: { inactiveDays: 60 }, isDynamic: true },
      { name: "Inactive 90 days", definitionJson: { inactiveDays: 90 }, isDynamic: true },
      { name: "Birthday Week", definitionJson: { birthdayWindowDays: 7 }, isDynamic: true },
      { name: "High Spend (৳200000+)", definitionJson: { minSpend: 200000 }, isDynamic: true },
      { name: "Order >= ৳500", definitionJson: { minOrderTotal: 500 }, isDynamic: true }
    ]
  });

  await prisma.coupon.upsert({
    where: { code: "VIPX-15AB" },
    update: {
      name: "VIP15OFF",
      type: "percent",
      value: 15,
      minPurchase: 100,
      maxDiscount: 30,
      perUserLimit: 3,
      totalLimit: 500,
      segmentIds: [vipSegment.id],
      stackable: false,
      isPublic: false,
      isActive: true
    },
    create: {
      name: "VIP15OFF",
      code: "VIPX-15AB",
      type: "percent",
      value: 15,
      minPurchase: 100,
      maxDiscount: 30,
      perUserLimit: 3,
      totalLimit: 500,
      segmentIds: [vipSegment.id],
      stackable: false,
      isPublic: false,
      isActive: true
    }
  });

  await prisma.automationRule.create({
    data: {
      name: "Weekend Sale Activation",
      triggerType: "schedule",
      triggerConfigJson: { schedule: "weekly", days: ["friday"], time: "00:00" },
      actionType: "activate_promotion",
      actionConfigJson: { promotionId: weekendPromo.id },
      isActive: true
    }
  });

  await prisma.upsellRule.create({
    data: {
      name: "Free Delivery Push",
      type: "free_delivery_progress",
      conditionsJson: { threshold: 75 },
      actionsJson: { message: "Add ৳150 more for free delivery" },
      isActive: true
    }
  });

  await prisma.setting.upsert({
    where: { key: "free_delivery" },
    update: {},
    create: {
      key: "free_delivery",
      valueJson: { promptAt: 600, threshold: 750 }
    }
  });

  await prisma.setting.upsert({
    where: { key: "loyalty_tiers" },
    update: {},
    create: {
      key: "loyalty_tiers",
      valueJson: {
        bronze: { minPoints: 0, multiplier: 1 },
        silver: { minPoints: 500, multiplier: 1.25 },
        gold: { minPoints: 1500, multiplier: 1.5 },
        platinum: { minPoints: 5000, multiplier: 2 }
      }
    }
  });

  await prisma.setting.upsert({
    where: { key: "loyalty_rewards" },
    update: {},
    create: {
      key: "loyalty_rewards",
      valueJson: {
        regularGuestReward: { minOrders: 5, maxOrders: 20, reward: "Bonus points" },
        birthdayGift: { percent: 20, windowDays: 14 },
        winback: { inactiveDays: 60, percent: 25, validityDays: 30 }
      }
    }
  });

  await prisma.setting.upsert({
    where: { key: "safety_caps" },
    update: {},
    create: {
      key: "safety_caps",
      valueJson: { maxOrderDiscount: 400, promotionBudgetCap: 25000 }
    }
  });

  await prisma.setting.upsert({
    where: { key: "stacking_rules" },
    update: {},
    create: {
      key: "stacking_rules",
      valueJson: { couponOverridesPromotions: true, freeDeliveryStacks: true }
    }
  });

  await prisma.experiment.create({
    data: {
      name: "Free Delivery Threshold Test",
      hypothesis: "Higher threshold lifts AOV",
      status: "running",
      trafficSplit: { a: 50, b: 50 },
      primaryMetric: "aov",
      variants: {
        create: [
          { name: "Control", configJson: { threshold: 50 }, isControl: true },
          { name: "Variant B", configJson: { threshold: 75 } }
        ]
      }
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      entityType: "Promotion",
      entityId: weekendPromo.id,
      action: "Seeded weekend promotion",
      afterJson: weekendPromo
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
