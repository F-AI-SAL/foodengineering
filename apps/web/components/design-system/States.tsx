import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StateProps {
  title?: string;
  message?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function LoadingState({ message = "Loading...", className }: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-sm p-lg text-center", className)}>
      <span className="h-lg w-lg animate-spin rounded-full border border-muted border-t-transparent" />
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}

export function EmptyState({ title, description, action, className }: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-sm p-lg text-center", className)}>
      {title ? <p className="text-md font-semibold">{title}</p> : null}
      {description ? <p className="text-sm text-muted">{description}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({ message, action, className }: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-sm p-lg text-center", className)}>
      <p className="text-md font-semibold text-destructive">{message}</p>
      {action}
    </div>
  );
}

export function SuccessState({ title, message, action, className }: StateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-sm p-lg text-center", className)}>
      {title ? <p className="text-md font-semibold text-success">{title}</p> : null}
      {message ? <p className="text-sm text-muted">{message}</p> : null}
      {action}
    </div>
  );
}
