"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/design-system/Card";
import { ErrorState, LoadingState } from "@/components/design-system/States";

type OfferMetrics = {
  totalRedemptions: number;
  totalRevenue: number;
  avgOrderValue: number;
  redemptionRate: number;
  revenueUplift: number;
  segmentConversion: number;
};

type RoiMetrics = {
  totalInvestment: number;
  totalReturn: number;
  roi: number;
  netProfit: number;
};

export function AnalyticsDashboard() {
  const [offerMetrics, setOfferMetrics] = useState<OfferMetrics | null>(null);
  const [roiMetrics, setRoiMetrics] = useState<RoiMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([apiFetch<OfferMetrics>("/analytics/offers"), apiFetch<RoiMetrics>("/analytics/roi")])
      .then(([offers, roi]) => {
        if (active) {
          setOfferMetrics(offers);
          setRoiMetrics(roi);
          setError(null);
        }
      })
      .catch(() => {
        if (active) {
          setError("Unable to load analytics.");
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

  const metrics = useMemo(() => {
    if (!offerMetrics) {
      return [];
    }
    return [
      { label: "Redemption rate", value: `${Math.round(offerMetrics.redemptionRate * 100)}%` },
      { label: "Revenue uplift", value: `+${Math.round(offerMetrics.revenueUplift * 100)}%` },
      { label: "Average order value", value: `৳${offerMetrics.avgOrderValue.toFixed(2)}` },
      { label: "Segment conversion", value: `${Math.round(offerMetrics.segmentConversion * 100)}%` }
    ];
  }, [offerMetrics]);

  return (
    <div className="space-y-2xl">
      <div>
        <h1 className="text-3xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted">Offer performance and ROI insights.</p>
      </div>

      {loading ? <LoadingState message="Loading analytics..." /> : null}
      {error ? <ErrorState message={error} /> : null}

      <div className="grid gap-md md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <p className="text-xs text-muted">{metric.label}</p>
            <p className="text-2xl font-semibold">{metric.value}</p>
          </Card>
        ))}
      </div>

      <Card title="Offer Performance" subtitle="Redemption and revenue overview.">
        <div className="grid gap-md md:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-md">
            <p className="text-sm font-semibold">Total redemptions</p>
            <p className="text-xs text-muted">{offerMetrics?.totalRedemptions ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-md">
            <p className="text-sm font-semibold">Total revenue</p>
            <p className="text-xs text-muted">৳{offerMetrics?.totalRevenue.toFixed(2) ?? "0.00"}</p>
          </div>
        </div>
      </Card>

      <Card title="ROI Breakdown" subtitle="Investment vs return per channel.">
        <div className="grid gap-md md:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-md">
            <p className="text-sm font-semibold">Total investment</p>
            <p className="text-xs text-muted">৳{roiMetrics?.totalInvestment ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-md">
            <p className="text-sm font-semibold">Total return</p>
            <p className="text-xs text-muted">৳{roiMetrics?.totalReturn ?? 0}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
