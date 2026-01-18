"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Rider } from "@/lib/types";
import { Card } from "@/components/design-system/Card";
import { Badge } from "@/components/design-system/Badge";
import { EmptyState, ErrorState, LoadingState } from "@/components/design-system/States";

export function RiderBoard() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<any[]>("/riders")
      .then((data) => {
        if (!active) {
          return;
        }
        const normalized = data.map((rider) => ({
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
              : undefined,
          activeOrderId: rider.activeOrderId ?? undefined
        }));
        setRiders(normalized);
        setError(null);
      })
      .catch(() => {
        if (active) {
          setError("Unable to load riders.");
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

  return (
    <Card title="Rider Management" subtitle="Monitor availability and live location.">
      {loading ? <LoadingState message="Loading riders..." /> : null}
      {error ? <ErrorState message={error} /> : null}
      <div className="grid gap-lg lg:grid-cols-2">
        <div className="space-y-md">
          {!riders.length ? (
            <EmptyState title="No riders online" description="Rider status updates will appear here." />
          ) : (
            riders.map((rider) => (
              <div key={rider.id} className="rounded-lg border border-border bg-surface-alt p-md">
                <div className="flex items-center justify-between gap-sm">
                  <div>
                    <p className="text-sm font-semibold">{rider.name}</p>
                    <p className="text-xs text-muted">{rider.id}</p>
                  </div>
                  <Badge
                    label={rider.status.replace("_", " ")}
                    variant={rider.status === "offline" ? "warning" : "success"}
                    size="sm"
                  />
                </div>
                {rider.currentLocation ? (
                  <p className="mt-sm text-xs text-muted">
                    Last seen: {rider.currentLocation.lat.toFixed(3)}, {rider.currentLocation.lng.toFixed(3)}
                  </p>
                ) : (
                  <p className="mt-sm text-xs text-muted">Location pending.</p>
                )}
                {rider.activeOrderId ? (
                  <p className="mt-xs text-xs text-muted">Active order: {rider.activeOrderId}</p>
                ) : null}
              </div>
            ))
          )}
        </div>
        <div className="rounded-lg border border-dashed border-border bg-surface p-lg">
          <p className="text-sm font-semibold">Live Map</p>
          <p className="text-xs text-muted">Realtime rider tracking ready for Mapbox/Google Maps.</p>
          <div className="mt-md h-map-panel rounded-lg border border-border bg-surface-alt" />
        </div>
      </div>
    </Card>
  );
}
