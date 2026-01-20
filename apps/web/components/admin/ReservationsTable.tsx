"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiFetchList, apiFetchPage } from "@/lib/api";
import type { Reservation } from "@/lib/types";
import { RESERVATION_STATUS_CONFIG } from "@/lib/config";
import { ReservationStatusBadge } from "@/components/design-system/Badge";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { PaginationControls } from "@/components/design-system/Pagination";
import { EmptyState, ErrorState, LoadingState } from "@/components/design-system/States";

export function ReservationsTable() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let active = true;
    apiFetchPage<Reservation>("/reservations", {}, page, pageSize)
      .then((response) => {
        if (active) {
          setReservations(response.data);
          setTotalPages(response.totalPages);
          setTotal(response.total);
          setError(null);
        }
      })
      .catch(() => {
        if (active) {
          setError("Unable to load reservations.");
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
  }, [page, pageSize]);

  const handleStatus = async (id: string, status: Reservation["status"]) => {
    try {
      await apiFetch(`/reservations/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === id ? { ...reservation, status } : reservation
        )
      );
    } catch (updateError) {
      setError("Unable to update reservation.");
    }
  };

  return (
    <Card title="Reservation Requests" subtitle="Approve or decline bookings.">
      {loading ? <LoadingState message="Loading reservations..." /> : null}
      {error ? <ErrorState message={error} /> : null}
      <div className="space-y-md">
        {!reservations.length ? (
          <EmptyState title="No reservations" description="Incoming requests will show up here." />
        ) : (
          reservations.map((reservation) => (
            <div key={reservation.id} className="rounded-lg border border-border bg-surface-alt p-md">
              <div className="flex flex-wrap items-center justify-between gap-sm">
                <div>
                  <p className="text-sm font-semibold">{reservation.name}</p>
                  <p className="text-xs text-muted">
                    {reservation.date} at {reservation.time}
                  </p>
                </div>
                <ReservationStatusBadge status={reservation.status} />
              </div>
              <p className="mt-sm text-xs text-muted">
                Guests: {reservation.guests} | Contact: {reservation.phone}
              </p>
              {reservation.notes ? (
                <p className="mt-xs text-xs text-muted">Notes: {reservation.notes}</p>
              ) : null}
              <div className="mt-md flex flex-wrap gap-sm">
                <Button variant="primary" size="sm" onClick={() => handleStatus(reservation.id, "confirmed")}
                >
                  Approve
                </Button>
                <Button variant="outline" size="sm">
                  Message
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleStatus(reservation.id, "cancelled")}
                >
                  Decline
                </Button>
                <span className="text-xs text-muted">
                  {RESERVATION_STATUS_CONFIG[reservation.status].helper}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <PaginationControls
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </Card>
  );
}
