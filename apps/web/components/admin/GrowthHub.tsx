"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Experiment, UpsellRule } from "@/lib/types";
import { Card } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import { EmptyState, ErrorState, LoadingState } from "@/components/design-system/States";

export function GrowthHub() {
  const [upsellRules, setUpsellRules] = useState<UpsellRule[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([apiFetch<UpsellRule[]>("/growth/upsells"), apiFetch<Experiment[]>("/growth/experiments")])
      .then(([upsells, tests]) => {
        if (active) {
          setUpsellRules(upsells);
          setExperiments(tests);
          setError(null);
        }
      })
      .catch(() => {
        if (active) {
          setError("Unable to load growth data.");
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
        <h1 className="text-3xl font-semibold">Growth Hub</h1>
        <p className="text-sm text-muted">Upsell, personalization, churn recovery, and A/B testing.</p>
      </div>

      {loading ? <LoadingState message="Loading growth hub..." /> : null}
      {error ? <ErrorState message={error} /> : null}

      <div className="grid gap-md md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs text-muted">Total growth revenue</p>
          <p className="text-2xl font-semibold">৳127,450</p>
          <p className="text-xs text-muted">+23.5% MoM</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Active campaigns</p>
          <p className="text-2xl font-semibold">{upsellRules.length}</p>
          <p className="text-xs text-muted">Upsell rules</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Loyalty members</p>
          <p className="text-2xl font-semibold">12,547</p>
          <p className="text-xs text-muted">68% engagement</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Avg uplift</p>
          <p className="text-2xl font-semibold">+18.3%</p>
          <p className="text-xs text-muted">ROI 726%</p>
        </Card>
      </div>

      <Card title="Upsell & Cross-sell" subtitle="Smart recommendations and free delivery progress.">
        {upsellRules.length === 0 ? (
          <EmptyState title="No upsell rules" description="Create an upsell rule to start." />
        ) : (
          <div className="space-y-sm">
            {upsellRules.map((rule) => (
              <div key={rule.id} className="rounded-lg border border-border bg-surface p-md">
                <p className="text-sm font-semibold">{rule.name}</p>
                <p className="text-xs text-muted">Type: {rule.type}</p>
                <div className="mt-sm flex flex-wrap gap-sm">
                  <Button size="sm" variant="outline">
                    Preview widget
                  </Button>
                  <Button size="sm" variant="ghost">
                    Edit rule
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Personalization & Churn" subtitle="Segment-based content and winback triggers.">
        <div className="grid gap-md md:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-md">
            <p className="text-sm font-semibold">Personalized homepage</p>
            <p className="text-xs text-muted">VIPs see exclusive previews and early access.</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-md">
            <p className="text-sm font-semibold">Predictive churn targeting</p>
            <p className="text-xs text-muted">60-day inactive customers receive winback coupons.</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-md">
            <p className="text-sm font-semibold">Cart abandonment recovery</p>
            <p className="text-xs text-muted">Auto-send reminders within 2 hours of inactivity.</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-md">
            <p className="text-sm font-semibold">ROI-based offer insights</p>
            <p className="text-xs text-muted">Track uplift, ROI, and AOV impact per campaign.</p>
          </div>
        </div>
      </Card>

      <Card title="A/B Testing" subtitle="Run experiments with confidence metrics.">
        {experiments.length === 0 ? (
          <EmptyState title="No experiments" description="Create an experiment to start testing." />
        ) : (
          <div className="space-y-sm">
            {experiments.map((experiment) => (
              <div key={experiment.id} className="rounded-lg border border-border bg-surface p-md">
                <div className="flex flex-wrap items-center justify-between gap-sm">
                  <div>
                    <p className="text-sm font-semibold">{experiment.name}</p>
                    <p className="text-xs text-muted">Metric: {experiment.primaryMetric}</p>
                  </div>
                  <span className="text-xs text-muted">{experiment.status}</span>
                </div>
                <div className="mt-sm flex flex-wrap gap-sm">
                  <Button size="sm" variant="outline">
                    View results
                  </Button>
                  <Button size="sm" variant="ghost">
                    Pause test
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
