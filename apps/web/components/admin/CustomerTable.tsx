"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/design-system/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/design-system/States";

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
};

export function CustomerTable() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<CustomerRow[]>("/customers")
      .then((data) => {
        if (active) {
          setCustomers(data);
          setError(null);
        }
      })
      .catch(() => {
        if (active) {
          setError("Unable to load customers.");
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
    <Card title="Customer Directory" subtitle="Customer insights and order history.">
      {loading ? <LoadingState message="Loading customers..." /> : null}
      {error ? <ErrorState message={error} /> : null}
      <div className="space-y-md">
        {!customers.length ? (
          <EmptyState title="No customers" description="Customer profiles will appear here." />
        ) : (
          customers.map((customer) => (
            <div key={customer.id} className="rounded-lg border border-border bg-surface-alt p-md">
              <div className="flex flex-wrap items-center justify-between gap-sm">
                <div>
                  <p className="text-sm font-semibold">{customer.name}</p>
                  <p className="text-xs text-muted">{customer.email}</p>
                </div>
                <span className="text-xs text-muted">Joined: {customer.createdAt}</span>
              </div>
              {customer.phone ? (
                <p className="mt-xs text-xs text-muted">Phone: {customer.phone}</p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
