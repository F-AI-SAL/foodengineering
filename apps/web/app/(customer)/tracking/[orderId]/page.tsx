import { orders } from "@/lib/data";
import { OrderTracking } from "@/components/customer/OrderTracking";
import { ErrorState } from "@/components/design-system/States";

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function TrackingPage({ params }: PageProps) {
  const { orderId } = await params;
  const order = orders.find((item) => item.id === orderId) ?? orders[0];

  if (!order) {
    return <ErrorState message="Order not found" />;
  }

  return <OrderTracking order={order} />;
}
