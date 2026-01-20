"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiFetchList, apiFetchPage } from "@/lib/api";
import type { Coupon, Segment } from "@/lib/types";
import { Card } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import { Badge } from "@/components/design-system/Badge";
import { FieldWrapper, Input, Select } from "@/components/design-system/Form";
import { PaginationControls } from "@/components/design-system/Pagination";
import { EmptyState, ErrorState, LoadingState } from "@/components/design-system/States";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generateCode = () => {
  const segment = () =>
    Array.from({ length: 4 })
      .map(() => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)])
      .join("");
  return `${segment()}-${segment()}`;
};

export function CouponsManager() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<Coupon["type"]>("percent");
  const [value, setValue] = useState(15);
  const [minPurchase, setMinPurchase] = useState(100);
  const [maxDiscount, setMaxDiscount] = useState(30);
  const [totalLimit, setTotalLimit] = useState(500);
  const [perUserLimit, setPerUserLimit] = useState(1);
  const [segmentIds, setSegmentIds] = useState<string[]>([]);
  const [visibility, setVisibility] = useState("private");
  const [stackable, setStackable] = useState("stackable");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetchPage<Coupon>("/coupons", {}, page, pageSize),
      apiFetchList<Segment>("/segments", {}, 1, 200)
    ])
      .then(([couponResponse, segmentRows]) => {
        if (!active) {
          return;
        }
        setCoupons(couponResponse.data);
        setTotalPages(couponResponse.totalPages);
        setTotal(couponResponse.total);
        setSegments(segmentRows);
        setError(null);
      })
      .catch(() => {
        if (active) {
          setError("Unable to load coupons.");
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

  const handleGenerate = () => {
    setCode(generateCode());
  };

  const handleToggleSegment = (segmentId: string) => {
    setSegmentIds((prev) =>
      prev.includes(segmentId) ? prev.filter((id) => id !== segmentId) : [...prev, segmentId]
    );
  };

  const handleSave = async () => {
    setStatusMessage("Saving...");
    try {
      const created = await apiFetch<Coupon>("/coupons", {
        method: "POST",
        body: JSON.stringify({
          name: name || "New Coupon",
          code: code || undefined,
          type,
          value: type === "free_delivery" ? 0 : value,
          minPurchase,
          maxDiscount: type === "percent" ? maxDiscount : undefined,
          perUserLimit,
          totalLimit,
          startAt: startAt || undefined,
          endAt: endAt || undefined,
          segmentIds,
          stackable: stackable === "stackable",
          isPublic: visibility === "public"
        })
      });
      setCoupons((prev) => [created, ...prev]);
      setStatusMessage("Saved.");
    } catch (saveError) {
      setStatusMessage("Save failed.");
    }
  };

  const handleSend = async (coupon: Coupon) => {
    setActionMessage("Sending...");
    try {
      const targets = coupon.segmentIds?.length ? coupon.segmentIds : segmentIds;
      await apiFetch(`/coupons/${coupon.id}/send`, {
        method: "POST",
        body: JSON.stringify({ segmentIds: targets })
      });
      setActionMessage("Distribution queued.");
    } catch (sendError) {
      setActionMessage("Send failed.");
    }
  };

  const handleExport = async (coupon: Coupon) => {
    setActionMessage("Exporting...");
    try {
      const result = await apiFetch<{ count: number }>(`/coupons/${coupon.id}/export`);
      setActionMessage(`Export ready (${result.count} redemptions).`);
    } catch (exportError) {
      setActionMessage("Export failed.");
    }
  };

  return (
    <div className="space-y-2xl">
      <div>
        <h1 className="text-3xl font-semibold">Coupons</h1>
        <p className="text-sm text-muted">
          Generate unique codes, manage usage limits, and distribute to targeted segments.
        </p>
      </div>

      <Card title="Create Coupon" subtitle="Auto-generate unpredictable codes.">
        {loading ? <LoadingState message="Loading coupon builder..." /> : null}
        {error ? <ErrorState message={error} /> : null}
        <div className="grid gap-md md:grid-cols-2">
          <FieldWrapper label="Coupon name">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Code">
            <Input value={code} onChange={(event) => setCode(event.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Discount type">
            <Select value={type} onChange={(event) => setType(event.target.value as Coupon["type"])}>
              <option value="percent">Percent</option>
              <option value="fixed">Fixed amount</option>
              <option value="free_delivery">Free delivery</option>
            </Select>
          </FieldWrapper>
          <FieldWrapper label="Value (BDT or %)">
            <Input
              type="number"
              value={value}
              onChange={(event) => setValue(Number(event.target.value))}
              disabled={type === "free_delivery"}
            />
          </FieldWrapper>
          <FieldWrapper label="Minimum spend (BDT)">
            <Input type="number" value={minPurchase} onChange={(event) => setMinPurchase(Number(event.target.value))} />
          </FieldWrapper>
          <FieldWrapper label="Max discount (BDT)">
            <Input
              type="number"
              value={maxDiscount}
              onChange={(event) => setMaxDiscount(Number(event.target.value))}
              disabled={type !== "percent"}
            />
          </FieldWrapper>
          <FieldWrapper label="Usage limit (total)">
            <Input type="number" value={totalLimit} onChange={(event) => setTotalLimit(Number(event.target.value))} />
          </FieldWrapper>
          <FieldWrapper label="Per-customer limit">
            <Input type="number" value={perUserLimit} onChange={(event) => setPerUserLimit(Number(event.target.value))} />
          </FieldWrapper>
          <FieldWrapper label="Start date">
            <Input type="date" value={startAt} onChange={(event) => setStartAt(event.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="End date">
            <Input type="date" value={endAt} onChange={(event) => setEndAt(event.target.value)} />
          </FieldWrapper>
          <FieldWrapper label="Visibility">
            <Select value={visibility} onChange={(event) => setVisibility(event.target.value)}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </Select>
          </FieldWrapper>
          <FieldWrapper label="Stacking">
            <Select value={stackable} onChange={(event) => setStackable(event.target.value)}>
              <option value="stackable">Stackable with promotions</option>
              <option value="exclusive">Exclusive (overrides offers)</option>
            </Select>
          </FieldWrapper>
        </div>
        <div className="mt-md space-y-sm">
          <p className="text-xs text-muted">Target segments</p>
          <div className="flex flex-wrap gap-xs">
            {segments.length === 0 ? (
              <span className="text-xs text-muted">No segments available</span>
            ) : (
              segments.map((segment) => (
                <button
                  key={segment.id}
                  type="button"
                  onClick={() => handleToggleSegment(segment.id)}
                  className={`rounded-full border px-sm py-xs text-xs ${
                    segmentIds.includes(segment.id)
                      ? "border-primary bg-primary text-primary-contrast"
                      : "border-border text-muted"
                  }`}
                >
                  {segment.name}
                </button>
              ))
            )}
          </div>
        </div>
        <div className="mt-md flex flex-wrap items-center gap-sm">
          <Button variant="outline" onClick={handleGenerate}>Generate code</Button>
          <Button variant="primary" onClick={handleSave}>Save coupon</Button>
          <span className="text-xs text-muted">{statusMessage}</span>
        </div>
      </Card>

      <Card title="Active Coupons" subtitle="Monitor usage and send campaigns.">
        {coupons.length === 0 ? (
          <EmptyState title="No coupons" description="Create your first coupon." />
        ) : (
          <div className="space-y-sm">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="rounded-lg border border-border bg-surface p-md">
                <div className="flex flex-wrap items-center justify-between gap-sm">
                  <div>
                    <p className="text-sm font-semibold">{coupon.name}</p>
                    <p className="text-xs text-muted">Code: {coupon.code}</p>
                  </div>
                  <Badge label={coupon.isActive ? "Active" : "Paused"} variant="success" size="sm" />
                </div>
                <div className="mt-sm flex flex-wrap gap-sm text-xs text-muted">
                  <span>Type: {coupon.type}</span>
                  <span>Value: {coupon.type === "percent" ? `${coupon.value}%` : `৳${coupon.value}`}</span>
                  <span>Stacking: {coupon.stackable !== false ? "Stackable" : "Exclusive"}</span>
                  <span>Min spend: {coupon.minPurchase ? `৳${coupon.minPurchase}` : "-"}</span>
                  <span>Expiry: {coupon.endAt ? new Date(coupon.endAt).toLocaleDateString() : "-"}</span>
                </div>
                <div className="mt-sm flex flex-wrap gap-sm">
                  <Button size="sm" variant="outline" onClick={() => handleSend(coupon)}>
                    Send to segment
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleExport(coupon)}>
                    Export redemptions
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
        {actionMessage ? <p className="mt-sm text-xs text-muted">{actionMessage}</p> : null}
      </Card>
    </div>
  );
}
