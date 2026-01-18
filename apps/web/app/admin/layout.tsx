import type { ReactNode } from "react";
import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-lg py-2xl">
        <div className="mx-auto w-full max-w-content space-y-2xl">{children}</div>
      </main>
    </div>
  );
}
