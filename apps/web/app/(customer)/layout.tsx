import type { ReactNode } from "react";
import { Header } from "@/components/customer/Header";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-content space-y-2xl">{children}</main>
    </div>
  );
}
