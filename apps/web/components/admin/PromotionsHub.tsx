"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Promotion, Segment } from "@/lib/types";
import { Card } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import { Badge } from "@/components/design-system/Badge";
import { FieldWrapper, Input, Select, Textarea } from "@/components/design-system/Form";
import { EmptyState, ErrorState, LoadingState } from "@/components/design-system/States";

const steps = ["Basics", "Conditions", "Actions", "Schedule", "Review"];
const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
];

const createId = () => Math.random().toString(36).slice(2, 10);

type Condition = {
  id: string;
  field: string;
  operator: string;
  value: string | number | string[] | boolean;
};

const defaultCondition = (): Condition => ({
  id: createId(),
  field: "subtotal",
  operator: ">=",
  value: 500
});

export function PromotionsHub() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(3);
  const [stacking, setStacking] = useState<"stackable" | "exclusive">("stackable");
  const [logic, setLogic] = useState<"AND" | "OR">("AND");
  const [conditions, setConditions] = useState<Condition[]>([defaultCondition()]);
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState(15);
  const [maxDiscount, setMaxDiscount] = useState(300);
  const [budgetCap, setBudgetCap] = useState(25000);
  const [schedulePreset, setSchedulePreset] = useState("weekend");
  const [scheduleDays, setScheduleDays] = useState<string[]>(["saturday", "sunday"]);
  const [timeStart, setTimeStart] = useState("17:00");
  const [timeEnd, setTimeEnd] = useState("22:00");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([apiFetch<Promotion[]>("/promotions"), apiFetch<Segment[]>("/segments")])
      .then(([promoRows, segmentRows]) => {
        if (!active) {
          return;
        }
        setPromotions(promoRows);
        setSegments(segmentRows);
        setError(null);
      })
      .catch(() => {
        if (active) {
          setError("Unable to load promotions.");
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

  useEffect(() => {
    if (schedulePreset === "weekend") {
      setScheduleDays(["saturday", "sunday"]);
    } else if (schedulePreset === "weekday") {
      setScheduleDays(["monday", "tuesday", "wednesday", "thursday", "friday"]);
    }
  }, [schedulePreset]);

  const preview = useMemo(() => {
    const summaryConditions = conditions
      .map((condition) => {
        if (condition.field === "segmentIds") {
          const segmentLabel = segments
            .filter((segment) => (condition.value as string[])?.includes(segment.id))
            .map((segment) => segment.name)
            .join(", ");
          return `Segment is ${segmentLabel || "All"}`;
        }
        if (condition.field === "dayOfWeek") {
          return `Day is ${(condition.value as string[]).join(", ")}`;
        }
        if (condition.field === "firstOrder") {
          return `First order is ${condition.value ? "Yes" : "No"}`;
        }
        return `${condition.field} ${condition.operator} ${condition.value}`;
      })
      .join(` ${logic} `);

    return {
      name: name || "New Promotion",
      if: summaryConditions || "No conditions yet",
      then:
        discountType === "free_delivery"
          ? "Free delivery"
          : `${discountValue}${discountType === "percent" ? "%" : ""} ${discountType.replace("_", " ")}`,
      schedule: scheduleDays.length ? scheduleDays.join(", ") : "Always on",
      caps: discountType === "percent" ? `Max discount ৳${maxDiscount}` : "No cap",
      budget: `Budget cap ৳${budgetCap}`
    };
  }, [name, conditions, logic, segments, discountType, discountValue, scheduleDays, maxDiscount, budgetCap]);

  const updateCondition = (id: string, patch: Partial<Condition>) => {
    setConditions((prev) => prev.map((condition) => (condition.id === id ? { ...condition, ...patch } : condition)));
  };

  const handleAddCondition = () => {
    setConditions((prev) => [...prev, defaultCondition()]);
  };

  const handleRemoveCondition = (id: string) => {
    setConditions((prev) => prev.filter((condition) => condition.id !== id));
  };

  const handleToggleValue = (id: string, value: string) => {
    const target = conditions.find((condition) => condition.id === id);
    if (!target) {
      return;
    }
    const current = Array.isArray(target.value) ? target.value : [];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    updateCondition(id, { value: next });
  };

  const toggleScheduleDay = (day: string) => {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]
    );
  };
  const handleSavePromotion = async (status: "draft" | "active") => {
    setStatusMessage("Saving...");
    try {
      const response = await apiFetch<Promotion>("/promotions", {
        method: "POST",
        body: JSON.stringify({
          name: name || "New Promotion",
          description,
          startAt: startAt || undefined,
          endAt: endAt || undefined,
          stackable: stacking === "stackable",
          priority,
          rulesJson: {
            conditions: {
              logic,
              conditions: conditions.map((condition) => ({
                field: condition.field,
                operator: condition.operator,
                value: condition.value
              }))
            },
            actions: {
              type: discountType,
              value: discountType === "free_delivery" ? 0 : discountValue,
              maxDiscount: discountType === "percent" ? maxDiscount : undefined
            }
          },
          scheduleJson: scheduleDays.length
            ? {
                days: scheduleDays,
                timeWindow: timeStart && timeEnd ? { start: timeStart, end: timeEnd } : undefined
              }
            : undefined,
          maxDiscount: discountType === "percent" ? maxDiscount : undefined,
          budgetCap
        })
      });

      if (status === "active") {
        await apiFetch(`/promotions/${response.id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "active" })
        });
      }

      setPromotions((prev) => [response, ...prev]);
      setStatusMessage(status === "active" ? "Published." : "Draft saved.");
    } catch (saveError) {
      setStatusMessage("Save failed.");
    }
  };

  return (
    <div className="space-y-2xl">
      <div>
        <h1 className="text-3xl font-semibold">Promotions & Offers</h1>
        <p className="text-sm text-muted">
          Build rule-based offers with simple IF / THEN logic and automatic schedules.
        </p>
      </div>

      <Card title="Promotion Wizard" subtitle="Step-by-step setup designed for non-technical teams.">
        <div className="flex flex-wrap gap-sm">
          {steps.map((step, index) => (
            <Button
              key={step}
              variant={index === activeStep ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveStep(index)}
            >
              {index + 1}. {step}
            </Button>
          ))}
        </div>

        <div className="mt-lg grid gap-lg lg:grid-cols-[2fr_1fr]">
          <div className="space-y-md">
            {loading ? <LoadingState message="Loading wizard..." /> : null}
            {error ? <ErrorState message={error} /> : null}

            {activeStep === 0 && (
              <div className="grid gap-md md:grid-cols-2">
                <FieldWrapper label="Promotion name">
                  <Input value={name} onChange={(event) => setName(event.target.value)} />
                </FieldWrapper>
                <FieldWrapper label="Priority">
                  <Select value={String(priority)} onChange={(event) => setPriority(Number(event.target.value))}>
                    <option value="1">Low</option>
                    <option value="2">Medium</option>
                    <option value="3">High</option>
                    <option value="4">Top Priority</option>
                  </Select>
                </FieldWrapper>
                <FieldWrapper label="Start date">
                  <Input type="date" value={startAt} onChange={(event) => setStartAt(event.target.value)} />
                </FieldWrapper>
                <FieldWrapper label="End date">
                  <Input type="date" value={endAt} onChange={(event) => setEndAt(event.target.value)} />
                </FieldWrapper>
                <div className="md:col-span-2">
                  <FieldWrapper label="Description">
                    <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
                  </FieldWrapper>
                </div>
                <FieldWrapper label="Stacking">
                  <Select value={stacking} onChange={(event) => setStacking(event.target.value as typeof stacking)}>
                    <option value="stackable">Stackable with other offers</option>
                    <option value="exclusive">Exclusive (no stacking)</option>
                  </Select>
                </FieldWrapper>
                <FieldWrapper label="Safety cap (max discount, ৳)">
                  <Input
                    type="number"
                    value={maxDiscount}
                    onChange={(event) => setMaxDiscount(Number(event.target.value))}
                  />
                </FieldWrapper>
                <FieldWrapper label="Budget cap (৳)">
                  <Input
                    type="number"
                    value={budgetCap}
                    onChange={(event) => setBudgetCap(Number(event.target.value))}
                  />
                </FieldWrapper>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-md">
                <div className="flex flex-wrap items-center gap-sm">
                  <FieldWrapper label="Logic">
                    <Select value={logic} onChange={(event) => setLogic(event.target.value as "AND" | "OR")}>
                      <option value="AND">ALL conditions (AND)</option>
                      <option value="OR">ANY condition (OR)</option>
                    </Select>
                  </FieldWrapper>
                  <Button variant="outline" size="sm" onClick={handleAddCondition}>
                    Add condition
                  </Button>
                </div>

                {conditions.map((condition) => (
                  <div key={condition.id} className="rounded-lg border border-border bg-surface p-md">
                    <div className="grid gap-sm md:grid-cols-3">
                      <FieldWrapper label="IF">
                        <Select
                          value={condition.field}
                          onChange={(event) => {
                            const field = event.target.value;
                            const defaults =
                              field === "dayOfWeek"
                                ? { operator: "in", value: ["saturday", "sunday"] }
                                : field === "firstOrder"
                                  ? { operator: "is", value: true }
                                  : field === "segmentIds"
                                    ? { operator: "in", value: [] }
                                    : field === "channel"
                                      ? { operator: "=", value: "web" }
                                      : { operator: ">=", value: 500 };
                            updateCondition(condition.id, {
                              field,
                              operator: defaults.operator,
                              value: defaults.value
                            });
                          }}
                        >
                          <option value="subtotal">Cart total</option>
                          <option value="itemCount">Item count</option>
                          <option value="dayOfWeek">Day of week</option>
                          <option value="firstOrder">First order</option>
                          <option value="segmentIds">Customer segment</option>
                          <option value="channel">Order channel</option>
                        </Select>
                      </FieldWrapper>
                      <FieldWrapper label="Operator">
                        <Select
                          value={condition.operator}
                          onChange={(event) => updateCondition(condition.id, { operator: event.target.value })}
                        >
                          {condition.field === "dayOfWeek" || condition.field === "segmentIds" ? (
                            <option value="in">is in</option>
                          ) : condition.field === "firstOrder" ? (
                            <option value="is">is</option>
                          ) : (
                            <>
                              <option value=">=">greater than or equal</option>
                              <option value="<=">less than or equal</option>
                              <option value="=">equals</option>
                            </>
                          )}
                        </Select>
                      </FieldWrapper>
                      <FieldWrapper label="Value">
                        {condition.field === "dayOfWeek" ? (
                          <div className="flex flex-wrap gap-xs">
                            {DAYS.map((day) => (
                              <button
                                key={day}
                                type="button"
                                onClick={() => handleToggleValue(condition.id, day)}
                                className={`rounded-full border px-sm py-xs text-xs ${
                                  Array.isArray(condition.value) && condition.value.includes(day)
                                    ? "border-primary bg-primary text-primary-contrast"
                                    : "border-border text-muted"
                                }`}
                              >
                                {day.slice(0, 3)}
                              </button>
                            ))}
                          </div>
                        ) : condition.field === "segmentIds" ? (
                          <div className="flex flex-wrap gap-xs">
                            {segments.map((segment) => (
                              <button
                                key={segment.id}
                                type="button"
                                onClick={() => handleToggleValue(condition.id, segment.id)}
                                className={`rounded-full border px-sm py-xs text-xs ${
                                  Array.isArray(condition.value) && condition.value.includes(segment.id)
                                    ? "border-primary bg-primary text-primary-contrast"
                                    : "border-border text-muted"
                                }`}
                              >
                                {segment.name}
                              </button>
                            ))}
                            {segments.length === 0 ? (
                              <span className="text-xs text-muted">No segments yet</span>
                            ) : null}
                          </div>
                        ) : condition.field === "firstOrder" ? (
                          <Select
                            value={String(condition.value)}
                            onChange={(event) => updateCondition(condition.id, { value: event.target.value === "true" })}
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </Select>
                        ) : (
                          <Input
                            type={condition.field === "channel" ? "text" : "number"}
                            value={String(condition.value)}
                            onChange={(event) =>
                              updateCondition(condition.id, {
                                value: condition.field === "channel" ? event.target.value : Number(event.target.value)
                              })
                            }
                          />
                        )}
                      </FieldWrapper>
                    </div>
                    <div className="mt-sm flex justify-end">
                      <Button size="sm" variant="ghost" onClick={() => handleRemoveCondition(condition.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-md">
                <FieldWrapper label="THEN action">
                  <Select value={discountType} onChange={(event) => setDiscountType(event.target.value)}>
                    <option value="percent">Percent discount</option>
                    <option value="fixed">Fixed amount discount</option>
                    <option value="free_delivery">Free delivery</option>
                  </Select>
                </FieldWrapper>
                <FieldWrapper label="Discount value (BDT or %)">
                  <Input
                    type="number"
                    value={discountValue}
                    onChange={(event) => setDiscountValue(Number(event.target.value))}
                    disabled={discountType === "free_delivery"}
                  />
                </FieldWrapper>
                <FieldWrapper label="Max discount cap (BDT)">
                  <Input
                    type="number"
                    value={maxDiscount}
                    onChange={(event) => setMaxDiscount(Number(event.target.value))}
                    disabled={discountType !== "percent"}
                  />
                </FieldWrapper>
              </div>
            )}

            {activeStep === 3 && (
              <div className="grid gap-md md:grid-cols-2">
                <FieldWrapper label="Schedule preset">
                  <Select value={schedulePreset} onChange={(event) => setSchedulePreset(event.target.value)}>
                    <option value="weekend">Weekend only</option>
                    <option value="weekday">Weekdays only</option>
                    <option value="custom">Custom days</option>
                  </Select>
                </FieldWrapper>
                <FieldWrapper label="Active days">
                  <div className="flex flex-wrap gap-xs">
                    {DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleScheduleDay(day)}
                        className={`rounded-full border px-sm py-xs text-xs ${
                          scheduleDays.includes(day)
                            ? "border-primary bg-primary text-primary-contrast"
                            : "border-border text-muted"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </FieldWrapper>
                <FieldWrapper label="Start time">
                  <Input type="time" value={timeStart} onChange={(event) => setTimeStart(event.target.value)} />
                </FieldWrapper>
                <FieldWrapper label="End time">
                  <Input type="time" value={timeEnd} onChange={(event) => setTimeEnd(event.target.value)} />
                </FieldWrapper>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-md">
                <div className="rounded-lg border border-border bg-surface p-md">
                  <p className="text-sm font-semibold">Preview before publish</p>
                  <p className="text-xs text-muted">Name: {preview.name}</p>
                  <p className="text-xs text-muted">IF: {preview.if}</p>
                  <p className="text-xs text-muted">THEN: {preview.then}</p>
                  <p className="text-xs text-muted">Schedule: {preview.schedule}</p>
                  <p className="text-xs text-muted">Safety: {preview.caps}</p>
                  <p className="text-xs text-muted">{preview.budget}</p>
                </div>
                <div className="flex flex-wrap gap-sm">
                  <Button variant="secondary" onClick={() => handleSavePromotion("draft")}>
                    Save Draft
                  </Button>
                  <Button variant="primary" onClick={() => handleSavePromotion("active")}>
                    Publish Offer
                  </Button>
                  <span className="text-xs text-muted">{statusMessage}</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-md">
            <Card title="Active Offers" subtitle="Live and scheduled promotions.">
              <div className="space-y-sm">
                {promotions.length === 0 ? (
                  <EmptyState title="No promotions" description="Create your first offer." />
                ) : (
                  promotions.map((promo) => (
                    <div key={promo.id} className="rounded-lg border border-border bg-surface p-sm">
                      <div className="flex items-center justify-between gap-sm">
                        <div>
                          <p className="text-sm font-semibold">{promo.name}</p>
                          <p className="text-xs text-muted">Priority {promo.priority}</p>
                        </div>
                        <Badge label={promo.status} variant="info" size="sm" />
                      </div>
                      <div className="mt-sm flex flex-wrap gap-xs text-xs text-muted">
                        <span>Stackable: {promo.stackable ? "Yes" : "No"}</span>
                        <span>Cap: {promo.maxDiscount ? `৳${promo.maxDiscount}` : "-"}</span>
                      </div>
                      <div className="mt-sm flex flex-wrap gap-xs">
                        <Button size="sm" variant="outline">
                          Preview
                        </Button>
                        <Button size="sm" variant="ghost">
                          Pause
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
            <Card title="Safety Guardrails" subtitle="Always on to prevent over-discounting.">
              <div className="space-y-xs text-xs text-muted">
                <p>Max discount per order: ?{maxDiscount}</p>
                <p>Stacking rule: Exclusive offers override others.</p>
                <p>Free delivery can stack with coupons.</p>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}
