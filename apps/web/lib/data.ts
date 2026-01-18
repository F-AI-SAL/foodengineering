import type {
  ChatMessage,
  ChatThread,
  Customer,
  MenuItem,
  Order,
  Reservation,
  Rider,
  Promotion,
  Coupon,
  Segment,
  LoyaltyMember,
  AutomationRule,
  AutomationExecution,
  AuditLogEntry,
  UpsellRule,
  Experiment
} from "./types";

export const menuItems: MenuItem[] = [
  {
    id: "menu-1",
    name: "Smoked Pepper Ribeye",
    description: "Char-grilled ribeye with pepper glaze and herb butter.",
    price: 32.0,
    category: "Mains",
    image: "/images/menu/ribeye.jpg",
    available: true,
    prepTime: 22,
    tags: ["popular", "signature"]
  },
  {
    id: "menu-2",
    name: "Citrus Char Salmon",
    description: "Maple citrus salmon with toasted grains and fennel salad.",
    price: 26.0,
    category: "Mains",
    image: "/images/menu/salmon.jpg",
    available: true,
    prepTime: 18,
    tags: ["chef_choice"]
  },
  {
    id: "menu-3",
    name: "Garden Harvest Bowl",
    description: "Roasted squash, quinoa, chickpeas, and lemon tahini.",
    price: 18.5,
    category: "Bowls",
    image: "/images/menu/harvest.jpg",
    available: true,
    prepTime: 14,
    tags: ["vegan"]
  },
  {
    id: "menu-4",
    name: "Truffle Mushroom Tagliatelle",
    description: "House pasta with wild mushrooms and truffle crema.",
    price: 21.0,
    category: "Pasta",
    image: "/images/menu/tagliatelle.jpg",
    available: false,
    prepTime: 20,
    tags: ["seasonal"]
  }
];

export const orders: Order[] = [
  {
    id: "order-1042",
    customerId: "cust-001",
    customerName: "Jordan Lee",
    status: "on_delivery",
    total: 58.5,
    items: [
      { itemId: "menu-1", name: "Smoked Pepper Ribeye", quantity: 1, price: 32.0 },
      { itemId: "menu-3", name: "Garden Harvest Bowl", quantity: 1, price: 18.5 },
      { itemId: "menu-5", name: "Citrus Tonic", quantity: 2, price: 4.0 }
    ],
    createdAt: "2024-06-25T18:42:00Z",
    assignedRiderId: "rider-2",
    deliveryAddress: "184 Atlas Avenue",
    timeline: [
      { status: "pending", timestamp: "2024-06-25T18:42:00Z" },
      { status: "confirmed", timestamp: "2024-06-25T18:46:00Z" },
      { status: "preparing", timestamp: "2024-06-25T18:52:00Z" },
      { status: "ready", timestamp: "2024-06-25T19:05:00Z" },
      { status: "on_delivery", timestamp: "2024-06-25T19:12:00Z" }
    ]
  },
  {
    id: "order-1043",
    customerId: "cust-002",
    customerName: "Avery Quinn",
    status: "preparing",
    total: 41.0,
    items: [
      { itemId: "menu-2", name: "Citrus Char Salmon", quantity: 1, price: 26.0 },
      { itemId: "menu-6", name: "Herb Focaccia", quantity: 1, price: 7.0 },
      { itemId: "menu-7", name: "Seasonal Citrus Tart", quantity: 1, price: 8.0 }
    ],
    createdAt: "2024-06-25T19:05:00Z",
    assignedRiderId: "rider-1",
    deliveryAddress: "22 Pinecrest Lane",
    timeline: [
      { status: "pending", timestamp: "2024-06-25T19:05:00Z" },
      { status: "confirmed", timestamp: "2024-06-25T19:08:00Z" },
      { status: "preparing", timestamp: "2024-06-25T19:14:00Z" }
    ]
  }
];

export const reservations: Reservation[] = [
  {
    id: "res-301",
    name: "Morgan Patel",
    email: "morgan@example.com",
    phone: "555-0101",
    date: "2024-06-28",
    time: "19:30",
    guests: 4,
    status: "pending",
    notes: "Anniversary seating requested"
  },
  {
    id: "res-302",
    name: "Taylor Brooks",
    email: "taylor@example.com",
    phone: "555-0192",
    date: "2024-06-29",
    time: "20:00",
    guests: 2,
    status: "confirmed"
  }
];

export const riders: Rider[] = [
  {
    id: "rider-1",
    name: "Noah Kim",
    status: "online",
    currentLocation: {
      lat: 40.7128,
      lng: -74.006,
      updatedAt: "2024-06-25T19:10:00Z"
    }
  },
  {
    id: "rider-2",
    name: "Evelyn Hart",
    status: "on_delivery",
    currentLocation: {
      lat: 40.7099,
      lng: -74.015,
      updatedAt: "2024-06-25T19:16:00Z"
    },
    activeOrderId: "order-1042"
  }
];

export const customers: Customer[] = [
  {
    id: "cust-001",
    name: "Jordan Lee",
    email: "jordan@example.com",
    phone: "555-0110",
    totalOrders: 12,
    lastOrderAt: "2024-06-25T18:42:00Z"
  },
  {
    id: "cust-002",
    name: "Avery Quinn",
    email: "avery@example.com",
    phone: "555-0165",
    totalOrders: 6,
    lastOrderAt: "2024-06-25T19:05:00Z"
  }
];

export const chatThreads: ChatThread[] = [
  {
    id: "thread-501",
    orderId: "order-1042",
    participants: ["customer", "support", "admin"],
    lastMessage: "Rider is five minutes away.",
    status: "open"
  },
  {
    id: "thread-502",
    orderId: "order-1043",
    participants: ["customer", "support"],
    lastMessage: "Allergen note received.",
    status: "open"
  }
];

export const chatMessages: ChatMessage[] = [
  {
    id: "msg-901",
    threadId: "thread-501",
    senderRole: "support",
    senderName: "Support Team",
    message: "Rider picked up the order and is on the way.",
    createdAt: "2024-06-25T19:12:00Z"
  },
  {
    id: "msg-902",
    threadId: "thread-501",
    senderRole: "customer",
    senderName: "Jordan Lee",
    message: "Thanks for the update.",
    createdAt: "2024-06-25T19:14:00Z"
  }
];

export const promotions: Promotion[] = [
  {
    id: "promo-101",
    name: "Weekend Flash Sale",
    description: "15% off weekends with ৳25 cap.",
    status: "active",
    startAt: "2026-01-20T00:00:00Z",
    endAt: "2026-02-20T00:00:00Z",
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
      actions: {
        type: "percent",
        value: 15,
        maxDiscount: 25
      }
    },
    scheduleJson: { days: ["saturday", "sunday"] },
    budgetCap: 2500,
    maxDiscount: 25
  },
  {
    id: "promo-102",
    name: "Free Delivery Push",
    description: "Free delivery on orders above ৳75.",
    status: "scheduled",
    startAt: "2026-02-01T00:00:00Z",
    endAt: "2026-03-01T00:00:00Z",
    stackable: true,
    priority: 3,
    rulesJson: {
      conditions: {
        logic: "AND",
        conditions: [{ field: "subtotal", operator: ">=", value: 75 }]
      },
      actions: { type: "free_delivery" }
    },
    scheduleJson: { days: ["monday", "tuesday", "wednesday", "thursday", "friday"] }
  }
];

export const coupons: Coupon[] = [
  {
    id: "coupon-201",
    name: "VIP15OFF",
    code: "VIPX-15AB",
    type: "percent",
    value: 15,
    minPurchase: 100,
    maxDiscount: 30,
    perUserLimit: 3,
    totalLimit: 500,
    startAt: "2026-01-15T00:00:00Z",
    endAt: "2026-03-01T00:00:00Z",
    segmentIds: ["seg-vip"],
    stackable: false,
    isPublic: false,
    isActive: true
  },
  {
    id: "coupon-202",
    name: "Comeback 25",
    code: "COME-25BK",
    type: "percent",
    value: 25,
    minPurchase: 60,
    maxDiscount: 40,
    perUserLimit: 1,
    totalLimit: 200,
    segmentIds: ["seg-inactive-60"],
    stackable: false,
    isPublic: false,
    isActive: true
  }
];

export const segments: Segment[] = [
  {
    id: "seg-new",
    name: "New Customers (30 days)",
    definitionJson: { windowDays: 30, metric: "createdAt" },
    isDynamic: true
  },
  {
    id: "seg-regular",
    name: "Regular Guests (5-20 orders)",
    definitionJson: { minOrders: 5, maxOrders: 20 },
    isDynamic: true
  },
  {
    id: "seg-vip",
    name: "VIP (20+ orders or ৳2,000 spend)",
    definitionJson: { minOrders: 20, minSpend: 2000 },
    isDynamic: true
  },
  {
    id: "seg-inactive-60",
    name: "Inactive 60 days",
    definitionJson: { inactiveDays: 60 },
    isDynamic: true
  },
  {
    id: "seg-birthday",
    name: "Birthday Week",
    definitionJson: { birthdayWindowDays: 7 },
    isDynamic: true
  }
];

export const loyaltyMembers: LoyaltyMember[] = [
  {
    id: "cust-001",
    name: "Jordan Lee",
    tier: "gold",
    points: 1840,
    lifetimeSpend: 2450,
    orderCount: 18,
    lastOrderAt: "2026-01-10T12:30:00Z"
  },
  {
    id: "cust-002",
    name: "Avery Quinn",
    tier: "silver",
    points: 820,
    lifetimeSpend: 980,
    orderCount: 9,
    lastOrderAt: "2026-01-12T18:10:00Z"
  }
];

export const automationRules: AutomationRule[] = [
  {
    id: "auto-301",
    name: "Weekend Sale Activation",
    triggerType: "schedule",
    triggerConfigJson: { schedule: "weekly", days: ["friday"], time: "00:00" },
    actionType: "activate_promotion",
    actionConfigJson: { promotionId: "promo-101" },
    isActive: true
  },
  {
    id: "auto-302",
    name: "Birthday Week Gift",
    triggerType: "event",
    triggerConfigJson: { event: "birthday_week" },
    actionType: "send_coupon",
    actionConfigJson: { template: "birthday-20" },
    isActive: true
  }
];

export const automationExecutions: AutomationExecution[] = [
  {
    id: "exec-1",
    ruleId: "auto-301",
    status: "success",
    ranAt: "2026-01-12T00:00:00Z"
  }
];

export const auditLogs: AuditLogEntry[] = [
  {
    id: "audit-1",
    actorUserId: "admin-1",
    entityType: "Promotion",
    entityId: "promo-101",
    action: "Updated min spend to 500",
    createdAt: "2026-01-15T14:30:00Z"
  },
  {
    id: "audit-2",
    actorUserId: "admin-2",
    entityType: "Coupon",
    entityId: "coupon-202",
    action: "Created winback coupon",
    createdAt: "2026-01-14T11:10:00Z"
  }
];

export const upsellRules: UpsellRule[] = [
  {
    id: "upsell-1",
    name: "Free Delivery Push",
    type: "free_delivery_progress",
    conditionsJson: { threshold: 75 },
    actionsJson: { message: "Add ৳15 more for free delivery" },
    isActive: true
  },
  {
    id: "upsell-2",
    name: "Chef Pairings",
    type: "cross_sell",
    conditionsJson: { category: "Mains" },
    actionsJson: { recommend: ["Seasonal Citrus Tart", "Citrus Tonic"] },
    isActive: true
  }
];

export const experiments: Experiment[] = [
  {
    id: "exp-1",
    name: "Free Delivery Threshold Test",
    hypothesis: "Higher threshold lifts AOV",
    status: "running",
    primaryMetric: "aov"
  },
  {
    id: "exp-2",
    name: "Discount Message Copy",
    hypothesis: "SAVE ৳12 beats 20% OFF",
    status: "draft",
    primaryMetric: "conversion"
  }
];
