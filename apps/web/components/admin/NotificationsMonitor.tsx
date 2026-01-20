"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/design-system/Card";
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

  useEffect(() => {
    let active = true;

    apiFetch<NotificationStatus>("/notifications/status")
      .then((response) => {
        if (active) {
          setData(response);
          setError(null);
        }
      })
      .catch(() => {
        if (active) {
          setError("Unable to load notification queue.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    const interval = setInterval(() => {
      apiFetch<NotificationStatus>("/notifications/status")
        .then((response) => {
          if (active) {
            setData(response);
          }
        })
        .catch(() => {
          if (active) {
            setError("Unable to load notification queue.");
          }
        });
    }, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

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
