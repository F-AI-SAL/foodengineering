"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { getAuthToken } from "@/lib/auth";

type AdminAuthGateProps = {
  children: ReactNode;
};

export function AdminAuthGate({ children }: AdminAuthGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) {
      return;
    }
    const token = getAuthToken();
    if (!token) {
      router.replace("/admin/login");
    }
  }, [isLogin, router]);

  if (isLogin) {
    return <div className="min-h-screen bg-surface px-lg py-2xl">{children}</div>;
  }

  const token = getAuthToken();
  if (!token) {
    return <div className="min-h-screen bg-surface px-lg py-2xl">Checking session...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-lg py-2xl">
        <div className="mx-auto w-full max-w-content space-y-2xl">{children}</div>
      </main>
    </div>
  );
}
