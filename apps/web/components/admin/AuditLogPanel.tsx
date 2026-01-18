"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { AuditLogEntry } from "@/lib/types";
import { Card } from "@/components/design-system/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/design-system/States";

export function AuditLogPanel() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<AuditLogEntry[]>("/audit")
      .then((data) => {
        if (active) {
          setLogs(data);
          setError(null);
        }
      })
      .catch(() => {
        if (active) {
          setError("Unable to load audit log.");
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
    <div className="space-y-2xl">
      <div>
        <h1 className="text-3xl font-semibold">Audit Log</h1>
        <p className="text-sm text-muted">Track every change and automation event.</p>
      </div>

      <Card title="Recent Activity" subtitle="Every update recorded.">
        {loading ? <LoadingState message="Loading audit logs..." /> : null}
        {error ? <ErrorState message={error} /> : null}
        {logs.length === 0 ? (
          <EmptyState title="No logs yet" description="Changes will appear here." />
        ) : (
          <div className="space-y-sm">
            {logs.map((log) => (
              <div key={log.id} className="rounded-lg border border-border bg-surface p-md">
                <p className="text-sm font-semibold">{log.entityType}</p>
                <p className="text-xs text-muted">{log.action}</p>
                <p className="text-xs text-muted">{log.createdAt}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
