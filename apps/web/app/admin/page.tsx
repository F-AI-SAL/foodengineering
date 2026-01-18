import { DashboardStats } from "@/components/admin/DashboardStats";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { ReservationsTable } from "@/components/admin/ReservationsTable";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-2xl">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted">Real-time operations overview.</p>
      </div>
      <DashboardStats />
      <OrdersTable />
      <ReservationsTable />
    </div>
  );
}
