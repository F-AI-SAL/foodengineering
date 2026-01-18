"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Rider } from "@/lib/types";

type OrderRow = {
  id: string;
  customerId: string;
  customerName?: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "on_delivery" | "delivered" | "cancelled";
  total: number;
  deliveryAddress: string;
  assignedRiderId?: string;
};
import { ORDER_STATUS_CONFIG } from "@/lib/config";
import { StatusBadge } from "@/components/design-system/Badge";
import { Button } from "@/components/design-system/Button";
import { Select } from "@/components/design-system/Form";
import { Card } from "@/components/design-system/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/design-system/States";

export function OrdersTable() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusOrder = useMemo(
    () => ["pending", "confirmed", "preparing", "ready", "on_delivery", "delivered", "cancelled"],
    []
  );

  useEffect(() => {
    let active = true;
    Promise.all([apiFetch<OrderRow[]>("/orders"), apiFetch<any[]>("/riders")])
      .then(([orderRows, riderRows]) => {
        if (!active) {
          return;
        }
        const normalizedOrders = orderRows.map((order) => ({
          ...order,
          total: Number(order.total)
        }));
        const normalizedRiders = riderRows.map((rider) => ({
          id: rider.user?.id ?? rider.userId ?? rider.id,
          name: rider.user?.name ?? rider.name ?? "Unnamed rider",
          status: rider.status,
          currentLocation:
            rider.currentLat && rider.currentLng
              ? {
                  lat: rider.currentLat,
                  lng: rider.currentLng,
                  updatedAt: rider.updatedAt ?? new Date().toISOString()
                }
              : undefined
        }));
        setOrders(normalizedOrders);
        setRiders(normalizedRiders);
        setSelectedOrders(
          normalizedOrders.reduce<Record<string, string | undefined>>((acc, order) => {
            acc[order.id] = order.assignedRiderId ?? undefined;
            return acc;
          }, {})
        );
        setError(null);
      })
      .catch(() => {
        if (active) {
          setError("Unable to load orders.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleAssign = async (orderId: string, riderId?: string) => {
    try {
      await apiFetch(`/orders/${orderId}/assign`, {
        method: "PATCH",
        body: JSON.stringify({ riderId })
      });
    } catch (assignError) {
      setError("Unable to assign rider.");
    }
  };

  const handleAdvanceStatus = async (order: OrderRow) => {
    const currentIndex = statusOrder.indexOf(order.status);
    const nextStatus = statusOrder[Math.min(currentIndex + 1, statusOrder.length - 1)] as OrderRow["status"];
    try {
      await apiFetch(`/orders/${order.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus })
      });
      setOrders((prev) =>
        prev.map((item) => (item.id === order.id ? { ...item, status: nextStatus } : item))
      );
    } catch (updateError) {
      setError("Unable to update order status.");
    }
  };

  return (
    <Card title="Orders Management" subtitle="Update statuses and assign riders.">
      {loading ? <LoadingState message="Loading orders..." /> : null}
      {error ? <ErrorState message={error} /> : null}
      <div className="space-y-md">
        {!orders.length ? (
          <EmptyState title="No orders yet" description="Incoming orders will appear here." />
        ) : (
          orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-border bg-surface-alt p-md">
              <div className="flex flex-wrap items-center justify-between gap-sm">
                <div>
                  <p className="text-sm font-semibold">{order.customerName ?? order.customerId}</p>
                  <p className="text-xs text-muted">{order.id}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="mt-sm flex flex-wrap items-center gap-md text-sm">
                <span className="text-muted">{ORDER_STATUS_CONFIG[order.status].helper}</span>
                <span className="text-muted">Total: ?{order.total.toFixed(2)}</span>
                <span className="text-muted">Delivery: {order.deliveryAddress}</span>
              </div>
              <div className="mt-md flex flex-wrap items-center justify-between gap-sm">
                <Select
                  value={selectedOrders[order.id] ?? "unassigned"}
                  onChange={(event) =>
                    setSelectedOrders((prev) => {
                      const riderId =
                        event.target.value === "unassigned" ? undefined : event.target.value;
                      handleAssign(order.id, riderId);
                      return {
                        ...prev,
                        [order.id]: riderId
                      };
                    })
                  }
                >
                  <option value="unassigned">Assign rider</option>
                  {riders.map((rider) => (
                    <option key={rider.id} value={rider.id}>
                      {rider.name} ({rider.status})
                    </option>
                  ))}
                </Select>
                <div className="flex flex-wrap gap-sm">
                  <Button variant="outline" size="sm">
                    Refund
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleAdvanceStatus(order)}>
                    Update Status
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
