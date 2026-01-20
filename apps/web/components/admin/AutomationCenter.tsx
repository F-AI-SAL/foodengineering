"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, apiFetchList, apiFetchPage } from "@/lib/api";
import type { AutomationRule, Coupon, Promotion, Segment } from "@/lib/types";
import { Card } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import { FieldWrapper, Input, Select, Textarea } from "@/components/design-system/Form";
import { PaginationControls } from "@/components/design-system/Pagination";
import { EmptyState, ErrorState, LoadingState } from "@/components/design-system/States";

const steps = ["Basics", "Trigger", "Action", "Review"];

type AutomationWithExecutions = AutomationRule & {
  executions?: { id: string; status: string; ranAt?: string }[];
};

export function AutomationCenter() {
  const [rules, setRules] = useState<AutomationWithExecutions[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState("schedule");
  const [triggerDetail, setTriggerDetail] = useState("");
  const [scheduleCadence, setScheduleCadence] = useState("weekly");
  const [scheduleDays, setScheduleDays] = useState<string[]>(["friday"]);
  const [scheduleTime, setScheduleTime] = useState("00:00");
  const [eventType, setEventType] = useState("birthday_week");
  const [inactiveDays, setInactiveDays] = useState(60);

  const [actionType, setActionType] = useState("activate_promotion");
  const [promotionId, setPromotionId] = useState("");
  const [couponId, setCouponId] = useState("");
  const [segmentId, setSegmentId] = useState("");
  const [notification, setNotification] = useState("");
  const [awardPoints, setAwardPoints] = useState(100);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetchPage<AutomationWithExecutions>("/automation", {}, page, pageSize),
      apiFetchList<Promotion>("/promotions", {}, 1, 200),
      apiFetchList<Coupon>("/coupons", {}, 1, 200),
      apiFetchList<Segment>("/segments", {}, 1, 200)
    ])
      .then(([response, promoRows, couponRows, segmentRows]) => {
        if (active) {
          setRules(response.data);
          setTotalPages(response.totalPages);
          setTotal(response.total);
          setPromotions(promoRows);
          setCoupons(couponRows);
          setSegments(segmentRows);
          setError(null);
        }
      })
      .catch(() => {
        if (active) {
          setError("Unable to load automation rules.");
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

  const executions = useMemo(
    () => rules.flatMap((rule) => rule.executions?.map((exec) => ({ ...exec, ruleId: rule.id })) ?? []),
    [rules]
  );

  const toggleScheduleDay = (day: string) => {
    setScheduleDays((prev) => (prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]));
  };

  const handleSave = async (isActive: boolean) => {
    setStatusMessage("Saving...");
    try {
      const triggerConfigJson =
        triggerType === "schedule"
          ? { cadence: scheduleCadence, days: scheduleDays, time: scheduleTime }
          : triggerType === "event"
            ? { event: eventType, detail: triggerDetail }
            : { inactiveDays, detail: triggerDetail };

      const actionConfigJson =
        actionType === "activate_promotion" || actionType === "deactivate_promotion"
          ? { promotionId }
          : actionType === "send_coupon"
            ? { couponId }
            : actionType === "update_segment"
              ? { segmentId }
              : actionType === "award_loyalty"
                ? { points: awardPoints }
                : { message: notification };

      const created = await apiFetch<AutomationWithExecutions>("/automation", {
        method: "POST",
        body: JSON.stringify({
          name: name || "New Automation",
          triggerType,
          triggerConfigJson,
          actionType,
          actionConfigJson,
          isActive
        })
      });
      setRules((prev) => [created, ...prev]);
      setStatusMessage(isActive ? "Activated." : "Draft saved.");
    } catch (saveError) {
      setStatusMessage("Save failed.");
    }
  };

  const handleRun = async (ruleId: string) => {
    try {
      await apiFetch(`/automation/${ruleId}/run`, { method: "POST" });
    } catch (runError) {
      setError("Unable to run automation.");
    }
  };

  return (
    <div className="space-y-2xl">
      <div>
        <h1 className="text-3xl font-semibold">Automation</h1>
        <p className="text-sm text-muted">Schedules and triggers that run automatically.</p>
      </div>

      <Card title="Automation Wizard" subtitle="Define when something happens and what to do next.">
        {loading ? <LoadingState message="Loading automations..." /> : null}
        {error ? <ErrorState message={error} /> : null}

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

        <div className="mt-lg space-y-md">
          {activeStep === 0 && (
            <div className="grid gap-md md:grid-cols-2">
              <FieldWrapper label="Rule name">
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </FieldWrapper>
              <FieldWrapper label="Status">
                <Input value="Draft" disabled />
              </FieldWrapper>
            </div>
          )}

          {activeStep === 1 && (
            <div className="grid gap-md md:grid-cols-2">
              <FieldWrapper label="Trigger type">
                <Select value={triggerType} onChange={(event) => setTriggerType(event.target.value)}>
                  <option value="schedule">Schedule</option>
                  <option value="event">Event</option>
                  <option value="condition">Condition</option>
                </Select>
              </FieldWrapper>
              {triggerType === "schedule" ? (
                <FieldWrapper label="Cadence">
                  <Select value={scheduleCadence} onChange={(event) => setScheduleCadence(event.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </Select>
                </FieldWrapper>
              ) : null}

              {triggerType === "schedule" && scheduleCadence === "weekly" ? (
                <div className="md:col-span-2">
                  <FieldWrapper label="Days of week">
                    <div className="flex flex-wrap gap-xs">
                      {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
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
                </div>
              ) : null}

              {triggerType === "schedule" ? (
                <FieldWrapper label="Time">
                  <Input type="time" value={scheduleTime} onChange={(event) => setScheduleTime(event.target.value)} />
                </FieldWrapper>
              ) : null}

              {triggerType === "event" ? (
                <FieldWrapper label="Event">
                  <Select value={eventType} onChange={(event) => setEventType(event.target.value)}>
                    <option value="birthday_week">Birthday week</option>
                    <option value="customer_signup">Customer signup</option>
                    <option value="order_placed">Order placed</option>
                    <option value="tier_upgraded">Tier upgraded</option>
                  </Select>
                </FieldWrapper>
              ) : null}

              {triggerType === "condition" ? (
                <FieldWrapper label="Inactive days">
                  <Input
                    type="number"
                    value={inactiveDays}
                    onChange={(event) => setInactiveDays(Number(event.target.value))}
                  />
                </FieldWrapper>
              ) : null}

              <div className="md:col-span-2">
                <FieldWrapper label="Trigger details">
                  <Textarea value={triggerDetail} onChange={(event) => setTriggerDetail(event.target.value)} />
                </FieldWrapper>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="grid gap-md md:grid-cols-2">
              <FieldWrapper label="Action">
                <Select value={actionType} onChange={(event) => setActionType(event.target.value)}>
                  <option value="activate_promotion">Activate promotion</option>
                  <option value="deactivate_promotion">Deactivate promotion</option>
                  <option value="send_coupon">Send coupon</option>
                  <option value="send_notification">Send notification</option>
                  <option value="update_segment">Update segment</option>
                  <option value="award_loyalty">Award loyalty points</option>
                </Select>
              </FieldWrapper>

              {(actionType === "activate_promotion" || actionType === "deactivate_promotion") && (
                <FieldWrapper label="Promotion">
                  <Select value={promotionId} onChange={(event) => setPromotionId(event.target.value)}>
                    <option value="">Select promotion</option>
                    {promotions.map((promotion) => (
                      <option key={promotion.id} value={promotion.id}>
                        {promotion.name}
                      </option>
                    ))}
                  </Select>
                </FieldWrapper>
              )}

              {actionType === "send_coupon" && (
                <FieldWrapper label="Coupon">
                  <Select value={couponId} onChange={(event) => setCouponId(event.target.value)}>
                    <option value="">Select coupon</option>
                    {coupons.map((coupon) => (
                      <option key={coupon.id} value={coupon.id}>
                        {coupon.name}
                      </option>
                    ))}
                  </Select>
                </FieldWrapper>
              )}

              {actionType === "update_segment" && (
                <FieldWrapper label="Segment">
                  <Select value={segmentId} onChange={(event) => setSegmentId(event.target.value)}>
                    <option value="">Select segment</option>
                    {segments.map((segment) => (
                      <option key={segment.id} value={segment.id}>
                        {segment.name}
                      </option>
                    ))}
                  </Select>
                </FieldWrapper>
              )}

              {actionType === "award_loyalty" && (
                <FieldWrapper label="Points">
                  <Input type="number" value={awardPoints} onChange={(event) => setAwardPoints(Number(event.target.value))} />
                </FieldWrapper>
              )}

              {actionType === "send_notification" && (
                <div className="md:col-span-2">
                  <FieldWrapper label="Notification message">
                    <Textarea value={notification} onChange={(event) => setNotification(event.target.value)} />
                  </FieldWrapper>
                </div>
              )}
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-md">
              <div className="rounded-lg border border-border bg-surface p-md">
                <p className="text-sm font-semibold">Preview</p>
                <p className="text-xs text-muted">Rule: {name || "New Automation"}</p>
                <p className="text-xs text-muted">Trigger: {triggerType}</p>
                <p className="text-xs text-muted">Action: {actionType}</p>
              </div>
              <div className="flex flex-wrap gap-sm">
                <Button variant="secondary" onClick={() => handleSave(false)}>Save draft</Button>
                <Button variant="primary" onClick={() => handleSave(true)}>Activate rule</Button>
                <span className="text-xs text-muted">{statusMessage}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title="Automation Rules" subtitle="Live and scheduled workflows.">
        {rules.length === 0 ? (
          <EmptyState title="No automations" description="Create your first rule." />
        ) : (
          <div className="space-y-sm">
            {rules.map((rule) => (
              <div key={rule.id} className="rounded-lg border border-border bg-surface p-md">
                <div className="flex flex-wrap items-center justify-between gap-sm">
                  <div>
                    <p className="text-sm font-semibold">{rule.name}</p>
                    <p className="text-xs text-muted">Trigger: {rule.triggerType}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleRun(rule.id)}>
                    Run now
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

      <Card title="Execution Logs" subtitle="Automations executed with timestamps.">
        {executions.length === 0 ? (
          <EmptyState title="No executions" description="Executions will appear here." />
        ) : (
          <div className="space-y-sm">
            {executions.map((execution) => (
              <div key={execution.id} className="rounded-lg border border-border bg-surface p-md">
                <p className="text-sm font-semibold">Rule {execution.ruleId}</p>
                <p className="text-xs text-muted">Status: {execution.status}</p>
                <p className="text-xs text-muted">Ran at: {execution.ranAt ?? "Pending"}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
