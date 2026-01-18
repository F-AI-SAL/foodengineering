import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "default"
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
}

const baseClasses =
  "focus-ring inline-flex items-center justify-center gap-sm rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-disabled";

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-surface-alt text-secondary hover:bg-surface",
  primary: "bg-primary text-primary-contrast hover:bg-primary-hover",
  secondary: "bg-secondary text-secondary-contrast hover:bg-secondary-hover",
  outline:
    "border border-primary text-primary hover:bg-primary hover:text-primary-contrast",
  ghost: "bg-transparent text-secondary hover:bg-surface",
  destructive: "bg-destructive text-destructive-contrast hover:bg-destructive-hover"
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-sm py-xs text-sm",
  md: "px-md py-sm text-sm",
  lg: "px-lg py-sm text-md"
};

export function Button({
  variant = "default",
  size = "md",
  isLoading = false,
  loadingText,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-sm">
          <span
            className="h-sm w-sm animate-spin rounded-full border border-current border-t-transparent"
            aria-hidden="true"
          />
          {loadingText ?? "Working"}
        </span>
      ) : (
        <span className="inline-flex items-center gap-sm">
          {icon}
          {children}
        </span>
      )}
    </button>
  );
}
