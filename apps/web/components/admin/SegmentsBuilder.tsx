"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiFetchList, apiFetchPage } from "@/lib/api";
import type { Segment } from "@/lib/types";
import { Card } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import { FieldWrapper, Input, Select } from "@/components/design-system/Form";
import { PaginationControls } from "@/components/design-system/Pagination";
import { EmptyState, ErrorState, LoadingState } from "@/components/design-system/States";

type SegmentConfig = Record<string, number | string>;

const PRESETS = {
  new: { label: "New customers (last 30 days)", config: { windowDays: 30, metric: "createdAt" } },
  regular: { label: "Regular guests (5-20 orders)", config: { minOrders: 5, maxOrders: 20 } },
  vip: { label: "VIP (20+ orders or ৳200000 spend)", config: { minOrders: 20, minSpend: 200000 } },
  inactive30: { label: "Inactive 30 days", config: { inactiveDays: 30 } },
  inactive60: { label: "Inactive 60 days", config: { inactiveDays: 60 } },
  inactive90: { label: "Inactive 90 days", config: { inactiveDays: 90 } },
  birthday: { label: "Birthday week", config: { birthdayWindowDays: 7 } },
  highSpend: { label: "High spenders (৳200000+)", config: { minSpend: 200000 } },
  orderValue: { label: "Order >= ৳500", config: { minOrderTotal: 500 } }
};

export function SegmentsBuilder() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [name, setName] = useState("");
  const [segmentType, setSegmentType] = useState<keyof typeof PRESETS>("new");
  const [config, setConfig] = useState<SegmentConfig>(PRESETS.new.config);

  useEffect(() => {
    let active = true;
    apiFetchPage<Segment>("/segments", {}, page, pageSize)
      .then((response) => {
        if (active) {
          setSegments(response.data);
          setTotalPages(response.totalPages);
          setTotal(response.total);
          setError(null);
        }
      })
      .catch(() => {
        if (active) {
          setError("Unable to load segments.");
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

  const handlePresetChange = (value: keyof typeof PRESETS) => {
    setSegmentType(value);
    setConfig(PRESETS[value].config);
    setName(PRESETS[value].label);
  };

  const handleSave = async () => {
    setStatusMessage("Saving...");
    try {
      const created = await apiFetch<Segment>("/segments", {
        method: "POST",
        body: JSON.stringify({
          name: name || PRESETS[segmentType].label,
          definitionJson: config,
          isDynamic: true
        })
      });
      setSegments((prev) => [created, ...prev]);
      setStatusMessage("Saved.");
    } catch (saveError) {
      setStatusMessage("Save failed.");
    }
  };

  const updateConfig = (key: string, value: number | string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-2xl">
      <div>
        <h1 className="text-3xl font-semibold">Customer Segments</h1>
        <p className="text-sm text-muted">Create dynamic segments with simple definitions.</p>
      </div>

      <Card title="Create Segment" subtitle="Pick a preset or adjust the thresholds.">
        {loading ? <LoadingState message="Loading segments..." /> : null}
        {error ? <ErrorState message={error} /> : null}
        <div className="grid gap-md md:grid-cols-2">
          <FieldWrapper label="Segment name">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Segment type">
            <Select value={segmentType} onChange={(event) => handlePresetChange(event.target.value as keyof typeof PRESETS)}>
              {Object.entries(PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.label}
                </option>
              ))}
            </Select>
          </FieldWrapper>
        </div>

        <div className="mt-md grid gap-md md:grid-cols-2">
          {segmentType === "new" && (
            <FieldWrapper label="Signup window (days)">
              <Input
                type="number"
                value={Number(config.windowDays ?? 30)}
                onChange={(event) => updateConfig("windowDays", Number(event.target.value))}
              />
            </FieldWrapper>
          )}
          {segmentType === "regular" && (
            <>
              <FieldWrapper label="Min orders">
                <Input
                  type="number"
                  value={Number(config.minOrders ?? 5)}
                  onChange={(event) => updateConfig("minOrders", Number(event.target.value))}
                />
              </FieldWrapper>
              <FieldWrapper label="Max orders">
                <Input
                  type="number"
                  value={Number(config.maxOrders ?? 20)}
                  onChange={(event) => updateConfig("maxOrders", Number(event.target.value))}
                />
              </FieldWrapper>
            </>
          )}
          {segmentType === "vip" && (
            <>
              <FieldWrapper label="Min orders">
                <Input
                  type="number"
                  value={Number(config.minOrders ?? 20)}
                  onChange={(event) => updateConfig("minOrders", Number(event.target.value))}
                />
              </FieldWrapper>
              <FieldWrapper label="Min spend (BDT)">
                <Input
                  type="number"
                  value={Number(config.minSpend ?? 200000)}
                  onChange={(event) => updateConfig("minSpend", Number(event.target.value))}
                />
              </FieldWrapper>
            </>
          )}
          {segmentType.startsWith("inactive") && (
            <FieldWrapper label="Inactive days">
              <Input
                type="number"
                value={Number(config.inactiveDays ?? 30)}
                onChange={(event) => updateConfig("inactiveDays", Number(event.target.value))}
              />
            </FieldWrapper>
          )}
          {segmentType === "birthday" && (
            <FieldWrapper label="Window (days)">
              <Input
                type="number"
                value={Number(config.birthdayWindowDays ?? 7)}
                onChange={(event) => updateConfig("birthdayWindowDays", Number(event.target.value))}
              />
            </FieldWrapper>
          )}
          {segmentType === "highSpend" && (
            <FieldWrapper label="Min spend (BDT)">
              <Input
                type="number"
                value={Number(config.minSpend ?? 200000)}
                onChange={(event) => updateConfig("minSpend", Number(event.target.value))}
              />
            </FieldWrapper>
          )}
          {segmentType === "orderValue" && (
            <FieldWrapper label="Order >= (BDT)">
              <Input
                type="number"
                value={Number(config.minOrderTotal ?? 500)}
                onChange={(event) => updateConfig("minOrderTotal", Number(event.target.value))}
              />
            </FieldWrapper>
          )}
        </div>

        <div className="mt-md flex flex-wrap items-center gap-sm">
          <Button variant="primary" onClick={handleSave}>Save segment</Button>
          <Button variant="outline">Preview members</Button>
          <span className="text-xs text-muted">{statusMessage}</span>
        </div>
      </Card>

      <Card title="Active Segments" subtitle="Auto-updating audiences.">
        {segments.length === 0 ? (
          <EmptyState title="No segments" description="Create your first segment." />
        ) : (
          <div className="space-y-sm">
            {segments.map((segment) => (
              <div key={segment.id} className="rounded-lg border border-border bg-surface p-md">
                <p className="text-sm font-semibold">{segment.name}</p>
                <p className="text-xs text-muted">Dynamic: {segment.isDynamic ? "Yes" : "No"}</p>
                <div className="mt-sm flex flex-wrap gap-sm">
                  <Button size="sm" variant="outline">
                    View members
                  </Button>
                  <Button size="sm" variant="ghost">
                    Edit
                  </Button>
                </div>
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
