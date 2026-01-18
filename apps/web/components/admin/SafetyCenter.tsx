"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import { FieldWrapper, Input, Select } from "@/components/design-system/Form";
import { ErrorState, LoadingState } from "@/components/design-system/States";

type SettingRecord = {
  key: string;
  valueJson: Record<string, number | boolean>;
};

const DEFAULT_CAPS = {
  maxOrderDiscount: 400,
  promotionBudgetCap: 25000
};

const DEFAULT_STACKING = {
  couponOverridesPromotions: true,
  freeDeliveryStacks: true
};

export function SafetyCenter() {
  const [caps, setCaps] = useState(DEFAULT_CAPS);
  const [stacking, setStacking] = useState(DEFAULT_STACKING);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch<SettingRecord[]>("/settings")
      .then((data) => {
        if (!active) {
          return;
        }
        const capsRecord = data.find((item) => item.key === "safety_caps");
        if (capsRecord?.valueJson) {
          setCaps({
            maxOrderDiscount: Number(capsRecord.valueJson.maxOrderDiscount ?? DEFAULT_CAPS.maxOrderDiscount),
            promotionBudgetCap: Number(capsRecord.valueJson.promotionBudgetCap ?? DEFAULT_CAPS.promotionBudgetCap)
          });
        }
        const stackingRecord = data.find((item) => item.key === "stacking_rules");
        if (stackingRecord?.valueJson) {
          setStacking({
            couponOverridesPromotions: Boolean(
              stackingRecord.valueJson.couponOverridesPromotions ?? DEFAULT_STACKING.couponOverridesPromotions
            ),
            freeDeliveryStacks: Boolean(stackingRecord.valueJson.freeDeliveryStacks ?? DEFAULT_STACKING.freeDeliveryStacks)
          });
        }
        setError(null);
      })
      .catch(() => {
        if (active) {
          setError("Unable to load safety caps.");
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

  const handleSave = async () => {
    setStatusMessage("Saving...");
    try {
      await apiFetch("/settings", {
        method: "POST",
        body: JSON.stringify({ key: "safety_caps", valueJson: caps })
      });
      await apiFetch("/settings", {
        method: "POST",
        body: JSON.stringify({ key: "stacking_rules", valueJson: stacking })
      });
      setStatusMessage("Saved.");
    } catch (saveError) {
      setStatusMessage("Save failed.");
    }
  };

  return (
    <div className="space-y-2xl">
      <div>
        <h1 className="text-3xl font-semibold">Safety & Caps</h1>
        <p className="text-sm text-muted">Control stacking rules and maximum discount exposure.</p>
      </div>

      {loading ? <LoadingState message="Loading safety caps..." /> : null}
      {error ? <ErrorState message={error} /> : null}

      <Card title="Global Safety Caps" subtitle="Prevent over-discounting.">
        <div className="grid gap-md md:grid-cols-2">
          <FieldWrapper label="Max discount per order (৳)">
            <Input
              type="number"
              value={caps.maxOrderDiscount}
              onChange={(event) => setCaps((prev) => ({ ...prev, maxOrderDiscount: Number(event.target.value) }))}
            />
          </FieldWrapper>
          <FieldWrapper label="Promotion budget cap (৳)">
            <Input
              type="number"
              value={caps.promotionBudgetCap}
              onChange={(event) => setCaps((prev) => ({ ...prev, promotionBudgetCap: Number(event.target.value) }))}
            />
          </FieldWrapper>
        </div>
        <div className="mt-md flex flex-wrap gap-sm">
          <Button variant="primary" onClick={handleSave}>Save caps</Button>
          <span className="text-xs text-muted">{statusMessage}</span>
        </div>
      </Card>

      <Card title="Stacking Rules" subtitle="How discounts layer at checkout.">
        <div className="grid gap-md md:grid-cols-2">
          <FieldWrapper label="Coupon overrides promotions">
            <Select
              value={stacking.couponOverridesPromotions ? "yes" : "no"}
              onChange={(event) =>
                setStacking((prev) => ({ ...prev, couponOverridesPromotions: event.target.value === "yes" }))
              }
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </FieldWrapper>
          <FieldWrapper label="Allow free delivery stacking">
            <Select
              value={stacking.freeDeliveryStacks ? "yes" : "no"}
              onChange={(event) =>
                setStacking((prev) => ({ ...prev, freeDeliveryStacks: event.target.value === "yes" }))
              }
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </FieldWrapper>
        </div>
        <div className="mt-md flex flex-wrap gap-sm">
          <Button variant="primary" onClick={handleSave}>Save stacking rules</Button>
          <span className="text-xs text-muted">{statusMessage}</span>
        </div>
      </Card>

      <Card title="Pricing Order" subtitle="Applied in pricing engine order.">
        <div className="space-y-xs text-xs text-muted">
          <p>1. Exclusive promotions apply by highest priority.</p>
          <p>2. Stackable promotions apply in priority order.</p>
          <p>3. Coupons apply after promotions unless marked exclusive.</p>
          <p>4. Free delivery can stack if enabled.</p>
        </div>
      </Card>
    </div>
  );
}
