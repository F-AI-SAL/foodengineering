"use client";

import { useMemo } from "react";
import { ORDER_STATUS_CONFIG } from "@/lib/config";
import { useTrackingChannel } from "@/lib/hooks/useTrackingChannel";
import type { Order } from "@/lib/types";
import { StatusBadge } from "@/components/design-system/Badge";
import { Card } from "@/components/design-system/Card";

interface OrderTrackingProps {
  order: Order;
}

export function OrderTracking({ order }: OrderTrackingProps) {
  const { status, latestUpdate } = useTrackingChannel(order.id);

  const timeline = useMemo(() => {
    return order.timeline.map((event) => ({
      ...event,
      label: ORDER_STATUS_CONFIG[event.status].label,
      helper: ORDER_STATUS_CONFIG[event.status].helper
    }));
  }, [order.timeline]);

  const activeStatus = latestUpdate?.status ?? order.status;

  return (
    <section className="space-y-lg px-lg py-2xl">
      <Card
        title={`Order ${order.id}`}
        subtitle={`Delivery to ${order.deliveryAddress}`}
        action={<StatusBadge status={activeStatus} />}
      >
        <div className="grid gap-md md:grid-cols-2">
          <div className="space-y-md">
            <div className="rounded-lg border border-border p-md">
              <p className="text-sm font-semibold">Live status</p>
              <p className="text-xs text-muted">WebSocket: {status}</p>
              {latestUpdate?.status ? (
                <p className="text-sm text-muted">Latest update: {ORDER_STATUS_CONFIG[latestUpdate.status].label}</p>
              ) : null}
            </div>
            <div className="space-y-sm">
              {timeline.map((event) => (
                <div key={event.timestamp} className="flex items-start gap-sm">
                  <span className="mt-xs h-sm w-sm rounded-full bg-accent" />
                  <div>
                    <p className="text-sm font-semibold">{event.label}</p>
                    <p className="text-xs text-muted">{event.helper}</p>
                    <p className="text-xs text-muted">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-md">
            <div className="rounded-lg border border-border p-md">
              <p className="text-sm font-semibold">Rider</p>
              <p className="text-xs text-muted">Assigned rider: {order.assignedRiderId ?? "Awaiting assignment"}</p>
              {typeof latestUpdate?.lat === "number" && typeof latestUpdate?.lng === "number" ? (
                <p className="text-xs text-muted">
                  Last location update: {latestUpdate.lat.toFixed(3)}, {latestUpdate.lng.toFixed(3)}
                </p>
              ) : (
                <p className="text-xs text-muted">Awaiting rider location...</p>
              )}
            </div>
            <div className="rounded-lg border border-border bg-surface p-md">
              <p className="text-sm font-semibold">Live map</p>
              <p className="text-xs text-muted">Map provider integration ready</p>
              <div className="mt-sm h-map-panel rounded-lg border border-dashed border-border bg-surface-alt" />
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
