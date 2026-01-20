import type {
  OrderStatus,
  ReservationStatus,
  RoleConfig,
  StatusConfig
} from "./types";

export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: "Pending",
    helper: "Awaiting confirmation",
    tone: "pending"
  },
  confirmed: {
    label: "Confirmed",
    helper: "Kitchen preparing",
    tone: "confirmed"
  },
  preparing: {
    label: "Preparing",
    helper: "Chef in progress",
    tone: "preparing"
  },
  ready: {
    label: "Ready",
    helper: "Ready for pickup",
    tone: "ready"
  },
  on_delivery: {
    label: "On Delivery",
    helper: "Rider en route",
    tone: "on_delivery"
  },
  delivered: {
    label: "Delivered",
    helper: "Order complete",
    tone: "delivered"
  },
  cancelled: {
    label: "Cancelled",
    helper: "Order stopped",
    tone: "cancelled"
  }
};

export const RESERVATION_STATUS_CONFIG: Record<ReservationStatus, StatusConfig> = {
  pending: {
    label: "Pending",
    helper: "Awaiting approval",
    tone: "pending"
  },
  confirmed: {
    label: "Confirmed",
    helper: "Table reserved",
    tone: "confirmed"
  },
  cancelled: {
    label: "Cancelled",
    helper: "Reservation cancelled",
    tone: "cancelled"
  }
};

export const STATUS_BADGE_STYLES: Record<OrderStatus, { badge: string; dot: string }> = {
  pending: {
    badge: "bg-status-pending text-status-contrast-pending",
    dot: "bg-status-pending"
  },
  confirmed: {
    badge: "bg-status-confirmed text-status-contrast-confirmed",
    dot: "bg-status-confirmed"
  },
  preparing: {
    badge: "bg-status-preparing text-status-contrast-preparing",
    dot: "bg-status-preparing"
  },
  ready: {
    badge: "bg-status-ready text-status-contrast-ready",
    dot: "bg-status-ready"
  },
  on_delivery: {
    badge: "bg-status-on_delivery text-status-contrast-on_delivery",
    dot: "bg-status-on_delivery"
  },
  delivered: {
    badge: "bg-status-delivered text-status-contrast-delivered",
    dot: "bg-status-delivered"
  },
  cancelled: {
    badge: "bg-status-cancelled text-status-contrast-cancelled",
    dot: "bg-status-cancelled"
  }
};

export const ADMIN_NAV = [
  {
    label: "Dashboard",
    href: "/admin",
    description: "Live operational overview"
  },
  {
    label: "Control Center",
    href: "/admin/control-center",
    description: "Edit live settings"
  },
  {
    label: "Promotions",
    href: "/admin/promotions",
    description: "Rule-based offers"
  },
  {
    label: "Coupons",
    href: "/admin/coupons",
    description: "Generate coupon codes"
  },
  {
    label: "Loyalty",
    href: "/admin/loyalty",
    description: "Points & tiers"
  },
  {
    label: "Segments",
    href: "/admin/segments",
    description: "Dynamic audiences"
  },
  {
    label: "Automation",
    href: "/admin/automation",
    description: "Schedules & triggers"
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    description: "Offer performance"
  },
  {
    label: "Safety",
    href: "/admin/safety",
    description: "Caps & stacking"
  },
  {
    label: "Audit Log",
    href: "/admin/audit",
    description: "Change history"
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    description: "Queue status"
  },
  {
    label: "Growth Hub",
    href: "/admin/growth",
    description: "Upsell & tests"
  },
  {
    label: "Orders",
    href: "/admin/orders",
    description: "Manage order flow"
  },
  {
    label: "Reservations",
    href: "/admin/reservations",
    description: "Approve bookings"
  },
  {
    label: "Menu",
    href: "/admin/menu",
    description: "Edit menu content"
  },
  {
    label: "Riders",
    href: "/admin/riders",
    description: "Track delivery team"
  },
  {
    label: "Customers",
    href: "/admin/customers",
    description: "Customer insights"
  },
  {
    label: "Live Chat",
    href: "/admin/chat",
    description: "Support inbox"
  },
  {
    label: "Roles",
    href: "/admin/roles",
    description: "Access control"
  }
];

export const CUSTOMER_NAV = [
  {
    label: "Menu",
    href: "/menu"
  },
  {
    label: "Reservations",
    href: "/reservations"
  },
  {
    label: "Track Order",
    href: "/tracking/demo-order"
  },
  {
    label: "Account",
    href: "/account"
  }
];

export const ROLE_CONFIG: RoleConfig[] = [
  {
    role: "owner",
    label: "Owner",
    description: "Full business control",
    permissions: [
      {
        id: "view_finance",
        label: "View finance",
        description: "Access revenue and payouts"
      },
      {
        id: "manage_roles",
        label: "Manage roles",
        description: "Edit permissions"
      },
      {
        id: "manage_menu",
        label: "Manage menu",
        description: "Edit menu content"
      },
      {
        id: "manage_orders",
        label: "Manage orders",
        description: "Update order status"
      },
      {
        id: "manage_reservations",
        label: "Manage reservations",
        description: "Approve bookings"
      },
      {
        id: "manage_chat",
        label: "Manage chat",
        description: "Respond to customers"
      }
    ]
  },
  {
    role: "admin",
    label: "Admin",
    description: "Operations lead",
    permissions: [
      {
        id: "manage_orders",
        label: "Manage orders",
        description: "Update order status"
      },
      {
        id: "manage_reservations",
        label: "Manage reservations",
        description: "Approve bookings"
      },
      {
        id: "manage_menu",
        label: "Manage menu",
        description: "Edit menu content"
      },
      {
        id: "manage_chat",
        label: "Manage chat",
        description: "Respond to customers"
      }
    ]
  },
  {
    role: "manager",
    label: "Manager",
    description: "Shift supervision",
    permissions: [
      {
        id: "manage_orders",
        label: "Manage orders",
        description: "Update order status"
      },
      {
        id: "manage_reservations",
        label: "Manage reservations",
        description: "Approve bookings"
      }
    ]
  },
  {
    role: "support",
    label: "Support",
    description: "Customer care",
    permissions: [
      {
        id: "manage_chat",
        label: "Manage chat",
        description: "Respond to customers"
      }
    ]
  },
  {
    role: "rider",
    label: "Rider",
    description: "Delivery partner",
    permissions: [
      {
        id: "update_location",
        label: "Update location",
        description: "Share live position"
      }
    ]
  }
];
