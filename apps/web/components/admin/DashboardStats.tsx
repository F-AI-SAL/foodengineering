import { Card } from "@/components/design-system/Card";

const stats = [
  { label: "Total Sales", value: "৳12,480", trend: "+8%" },
  { label: "Active Orders", value: "18", trend: "+3" },
  { label: "On Delivery", value: "6", trend: "Live" },
  { label: "Reservations", value: "9", trend: "+2" }
];

export function DashboardStats() {
  return (
    <div className="grid gap-md md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <div className="space-y-xs">
            <p className="text-xs text-muted">{stat.label}</p>
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="text-xs text-muted">{stat.trend}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
