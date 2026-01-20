"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { ADMIN_NAV } from "@/lib/config";
import { cn } from "@/lib/utils";
import { Button } from "@/components/design-system/Button";
import { clearAuthToken } from "@/lib/auth";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuthToken();
    router.replace("/admin/login");
  };

  return (
    <aside className="flex h-full w-sidebar flex-col gap-md border-r border-border bg-surface-alt px-md py-lg">
      <div>
        <p className="text-sm font-semibold text-primary">Food Engineering Admin</p>
        <p className="text-xs text-muted">CMS Operations</p>
      </div>
      <nav className="flex flex-col gap-xs">
        {ADMIN_NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href as Route}
              className={cn(
                "focus-ring rounded-lg px-sm py-sm text-sm font-medium transition-colors",
                isActive ? "bg-primary text-primary-contrast" : "text-secondary hover:bg-surface"
              )}
            >
              <span className="block">{item.label}</span>
              <span className={cn("text-xs", isActive ? "text-primary-contrast" : "text-muted")}>
                {item.description}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    </aside>
  );
}
