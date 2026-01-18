"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { CUSTOMER_NAV } from "@/lib/config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/design-system/Button";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="flex flex-wrap items-center justify-between gap-md border-b border-border bg-surface-alt px-lg py-md">
      <div className="flex items-center gap-sm">
        <Link href="/" className="focus-ring rounded-full px-sm py-xs text-xl font-semibold text-primary font-heading">
          Food Engineering
        </Link>
        <span className="rounded-full bg-surface px-sm py-xs text-xs text-muted">Enterprise Dining</span>
      </div>
      <nav className="flex flex-wrap items-center gap-md text-sm">
        {CUSTOMER_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href as Route}
            className={cn(
              "focus-ring rounded-full px-sm py-xs font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-contrast"
                : "text-secondary hover:bg-surface"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-sm">
        <div className="relative">
          <Button variant="outline" size="sm">
            Cart
          </Button>
          <span className="badge-floating flex h-sm w-sm items-center justify-center rounded-full bg-accent text-xs text-accent-contrast">
            3
          </span>
        </div>
        <Button variant="primary" size="sm">
          Order Now
        </Button>
      </div>
    </header>
  );
}
