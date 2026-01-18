import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function Card({ title, subtitle, action, className, children }: CardProps) {
  return (
    <section className={cn("section-surface p-lg", className)}>
      {(title || subtitle || action) && (
        <header className="flex flex-wrap items-start justify-between gap-md">
          <div>
            {title ? <h3 className="text-lg font-semibold">{title}</h3> : null}
            {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
          </div>
          {action}
        </header>
      )}
      {children ? <div className="mt-md">{children}</div> : null}
    </section>
  );
}
