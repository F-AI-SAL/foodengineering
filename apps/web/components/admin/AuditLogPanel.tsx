"use client";

import { useEffect, useState } from "react";
import { apiFetchPage } from "@/lib/api";
import type { AuditLogEntry } from "@/lib/types";
import { Card } from "@/components/design-system/Card";
import { PaginationControls } from "@/components/design-system/Pagination";
import { EmptyState, ErrorState, LoadingState } from "@/components/design-system/States";

export function AuditLogPanel() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let active = true;
    apiFetchPage<AuditLogEntry>("/audit", {}, page, pageSize)
      .then((response) => {
        if (active) {
          setLogs(response.data);
          setTotalPages(response.totalPages);
          setTotal(response.total);
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
  }, [page, pageSize]);

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
    </div>
  );
}
