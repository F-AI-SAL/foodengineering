"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import { LoadingState, ErrorState, EmptyState } from "@/components/design-system/States";

type NotificationJob = {
  id: string;
  channel: string;
  status: string;
  attempts: number;
  scheduledAt: string;
  createdAt: string;
  sentAt?: string | null;
  lastError?: string | null;
};

type NotificationStatus = {
  providers: {
    email: string;
    whatsapp: string;
  };
  counts: {
    queued: number;
    failed: number;
    sent: number;
  };
  latest: NotificationJob[];
};

export function NotificationsMonitor() {
  const [data, setData] = useState<NotificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "queued" | "failed" | "sent">("all");
  const [actionMessage, setActionMessage] = useState("");

  const loadStatus = (active: { current: boolean }) => {
    const query = filter === "all" ? "" : `?status=${filter}`;
    apiFetch<NotificationStatus>(`/notifications/status${query}`)
      .then((response) => {
        if (active.current) {
          setData(response);
          setError(null);
        }
      })
      .catch(() => {
        if (active.current) {
          setError("Unable to load notification queue.");
        }
      })
      .finally(() => {
        if (active.current) {
          setLoading(false);
        }
      });
  };

  useEffect(() => {
    const active = { current: true };

    loadStatus(active);

    const interval = setInterval(() => {
      loadStatus(active);
    }, 10000);

    return () => {
      active.current = false;
      clearInterval(interval);
    };
  }, [filter]);

  const handleRetryFailed = async () => {
    setActionMessage("Re-queuing failed jobs...");
    try {
      await apiFetch("/notifications/retry", { method: "POST" });
      setActionMessage("Failed jobs re-queued.");
    } catch {
      setActionMessage("Unable to retry failed jobs.");
    }
  };

  if (loading) {
    return <LoadingState message="Loading notifications..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!data) {
    return <EmptyState title="No data yet" description="Queue status will appear after the first send." />;
  }

  return (
    <div className="space-y-lg">
      <div className="flex flex-wrap items-center justify-between gap-sm">
        <div className="flex flex-wrap gap-sm">
          {(["all", "queued", "failed", "sent"] as const).map((key) => (
            <Button
              key={key}
              variant={filter === key ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter(key)}
            >
              {key === "all" ? "All" : key}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <Button variant="outline" size="sm" onClick={handleRetryFailed}>
            Retry failed
          </Button>
          {actionMessage ? <span className="text-xs text-muted">{actionMessage}</span> : null}
        </div>
      </div>
      <div className="grid gap-md md:grid-cols-3">
        <Card title="Queued" subtitle="Pending sends">
          <p className="text-3xl font-semibold">{data.counts.queued}</p>
          <p className="text-xs text-muted">Email: {data.providers.email}</p>
        </Card>
        <Card title="Failed" subtitle="Needs retry">
          <p className="text-3xl font-semibold">{data.counts.failed}</p>
          <p className="text-xs text-muted">WhatsApp: {data.providers.whatsapp}</p>
        </Card>
        <Card title="Sent" subtitle="Delivered">
          <p className="text-3xl font-semibold">{data.counts.sent}</p>
          <p className="text-xs text-muted">Last 24h</p>
        </Card>
      </div>

      <Card title="Latest jobs" subtitle="Most recent notification attempts">
        {data.latest.length === 0 ? (
          <EmptyState title="No jobs yet" description="Send a reset email to generate queue activity." />
        ) : (
          <div className="divide-y divide-border">
            {data.latest.map((job) => (
              <div key={job.id} className="flex flex-wrap items-center justify-between gap-sm py-sm text-sm">
                <div>
                  <p className="font-semibold">{job.channel.toUpperCase()}</p>
                  <p className="text-xs text-muted">{job.status} • Attempts {job.attempts}</p>
                </div>
                <div className="text-xs text-muted">
                  {job.lastError ? job.lastError : "OK"}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
