import { orders } from "@/lib/data";
import { Card } from "@/components/design-system/Card";
import { StatusBadge } from "@/components/design-system/Badge";

export default function AccountPage() {
  return (
    <div className="space-y-lg px-lg py-2xl">
      <Card title="Account" subtitle="Manage profile and order history.">
        <div className="grid gap-md md:grid-cols-2">
          <div className="space-y-xs">
            <p className="text-sm font-semibold">Jordan Lee</p>
            <p className="text-xs text-muted">jordan@example.com</p>
            <p className="text-xs text-muted">Member since 2022</p>
          </div>
          <div className="space-y-xs">
            <p className="text-sm font-semibold">Delivery Preferences</p>
            <p className="text-xs text-muted">184 Atlas Avenue</p>
            <p className="text-xs text-muted">Phone: 555-0110</p>
          </div>
        </div>
      </Card>
      <Card title="Recent Orders" subtitle="Track your latest deliveries.">
        <div className="space-y-md">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-border bg-surface-alt p-md">
              <div className="flex flex-wrap items-center justify-between gap-sm">
                <div>
                  <p className="text-sm font-semibold">{order.id}</p>
                  <p className="text-xs text-muted">{order.createdAt}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-xs text-xs text-muted">Total: ৳{order.total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
