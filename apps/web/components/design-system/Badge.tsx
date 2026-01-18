import { ORDER_STATUS_CONFIG, RESERVATION_STATUS_CONFIG, STATUS_BADGE_STYLES } from "@/lib/config";
import type { OrderStatus, ReservationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "primary" | "success" | "warning" | "error" | "info";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-surface text-secondary",
  primary: "bg-primary text-primary-contrast",
  success: "bg-success text-primary-contrast",
  warning: "bg-warning text-secondary",
  error: "bg-destructive text-destructive-contrast",
  info: "bg-info text-primary-contrast"
};

const badgeSizes = {
  sm: "px-sm py-xs text-xs",
  md: "px-md py-xs text-sm",
  lg: "px-md py-sm text-sm"
};

export function Badge({
  label,
  variant = "default",
  size = "md",
  dot = false,
  className
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-sm rounded-full font-medium",
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
    >
      {dot ? <span className="h-xs w-xs rounded-full bg-current" aria-hidden="true" /> : null}
      {label}
    </span>
  );
}

interface StatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ status, size = "md", showDot = true, className }: StatusBadgeProps) {
  const config = ORDER_STATUS_CONFIG[status];
  const style = STATUS_BADGE_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-sm rounded-full font-medium",
        style.badge,
        badgeSizes[size],
        className
      )}
    >
      {showDot ? <span className={cn("h-xs w-xs rounded-full", style.dot)} aria-hidden="true" /> : null}
      {config.label}
    </span>
  );
}

interface ReservationStatusBadgeProps {
  status: ReservationStatus;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
  className?: string;
}

export function ReservationStatusBadge({
  status,
  size = "md",
  showDot = true,
  className
}: ReservationStatusBadgeProps) {
  const config = RESERVATION_STATUS_CONFIG[status];
  const style = STATUS_BADGE_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-sm rounded-full font-medium",
        style.badge,
        badgeSizes[size],
        className
      )}
    >
      {showDot ? <span className={cn("h-xs w-xs rounded-full", style.dot)} aria-hidden="true" /> : null}
      {config.label}
    </span>
  );
}
