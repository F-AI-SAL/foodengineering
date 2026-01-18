export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "on_delivery"
  | "delivered"
  | "cancelled";

export type ReservationStatus = "pending" | "confirmed" | "cancelled";

export type RiderStatus = "online" | "offline" | "on_delivery";

export type ChatThreadStatus = "open" | "closed";

export type ChatParticipantRole = "customer" | "support" | "admin";

export type UserRole = "owner" | "admin" | "manager" | "support" | "rider";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  prepTime: number;
  tags: string[];
  optionsJson?: {
    groups: MenuItemOptionGroup[];
  };
}

export interface MenuItemOptionChoice {
  id: string;
  name: string;
  price: number;
}

export interface MenuItemOptionGroup {
  id: string;
  name: string;
  required: boolean;
  min: number;
  max: number;
  choices: MenuItemOptionChoice[];
}

export interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  createdAt: string;
  assignedRiderId?: string;
  deliveryAddress: string;
  timeline: OrderTimelineEvent[];
}

export interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  status: ReservationStatus;
  notes?: string;
}

export interface RiderLocation {
  lat: number;
  lng: number;
  updatedAt: string;
}

export interface Rider {
  id: string;
  name: string;
  status: RiderStatus;
  currentLocation?: RiderLocation;
  activeOrderId?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  lastOrderAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderRole: ChatParticipantRole;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface ChatThread {
  id: string;
  orderId: string;
  participants: ChatParticipantRole[];
  lastMessage: string;
  status: ChatThreadStatus;
}

export interface Permission {
  id: string;
  label: string;
  description: string;
}

export interface RoleConfig {
  role: UserRole;
  label: string;
  description: string;
  permissions: Permission[];
}

export interface StatusConfig {
  label: string;
  helper: string;
  tone:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "on_delivery"
    | "delivered"
    | "cancelled";
}

export type PromotionStatus = "draft" | "scheduled" | "active" | "paused" | "expired";
export type CouponType = "percent" | "fixed" | "free_delivery";
export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum";
export type AutomationTriggerType = "schedule" | "event" | "condition";
export type AutomationActionType =
  | "activate_promotion"
  | "deactivate_promotion"
  | "send_coupon"
  | "send_notification"
  | "update_segment"
  | "award_loyalty";
export type AutomationExecutionStatus = "queued" | "running" | "success" | "failed";

export interface PromotionRule {
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>;
}

export interface Promotion {
  id: string;
  name: string;
  description?: string;
  status: PromotionStatus;
  startAt?: string;
  endAt?: string;
  stackable: boolean;
  priority: number;
  rulesJson: PromotionRule;
  scheduleJson?: Record<string, unknown>;
  budgetCap?: number;
  maxDiscount?: number;
}

export interface Coupon {
  id: string;
  name: string;
  code: string;
  type: CouponType;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  perUserLimit?: number;
  totalLimit?: number;
  startAt?: string;
  endAt?: string;
  segmentIds?: string[];
  stackable?: boolean;
  isPublic: boolean;
  isActive: boolean;
}

export interface LoyaltyMember {
  id: string;
  name: string;
  tier: LoyaltyTier;
  points: number;
  lifetimeSpend: number;
  orderCount: number;
  lastOrderAt?: string;
}

export interface Segment {
  id: string;
  name: string;
  definitionJson: Record<string, unknown>;
  isDynamic: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  triggerType: AutomationTriggerType;
  triggerConfigJson: Record<string, unknown>;
  actionType: AutomationActionType;
  actionConfigJson: Record<string, unknown>;
  isActive: boolean;
}

export interface AutomationExecution {
  id: string;
  ruleId: string;
  status: AutomationExecutionStatus;
  ranAt?: string;
}

export interface AuditLogEntry {
  id: string;
  actorUserId?: string;
  entityType: string;
  entityId: string;
  action: string;
  createdAt: string;
}

export interface UpsellRule {
  id: string;
  name: string;
  type: string;
  conditionsJson: Record<string, unknown>;
  actionsJson: Record<string, unknown>;
  isActive: boolean;
}

export interface Experiment {
  id: string;
  name: string;
  hypothesis?: string;
  status: string;
  primaryMetric: string;
}
