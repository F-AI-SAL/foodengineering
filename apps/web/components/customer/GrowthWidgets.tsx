"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";
import { publicFetch } from "@/lib/api";

export function GrowthWidgets() {
  const [threshold, setThreshold] = useState(750);
  const [promptAt, setPromptAt] = useState(600);
  const [currentCart] = useState(640);

  useEffect(() => {
    publicFetch<{ valueJson?: { threshold?: number; promptAt?: number } }>(
      "/settings/public/free_delivery"
    )
      .then((data) => {
        const value = data?.valueJson ?? {};
        if (typeof value.threshold === "number") {
          setThreshold(value.threshold);
        }
        if (typeof value.promptAt === "number") {
          setPromptAt(value.promptAt);
        }
      })
      .catch(() => {
        // Keep defaults when settings are unavailable.
      });
  }, []);

  const remaining = Math.max(threshold - currentCart, 0);
  const progress = useMemo(() => {
    if (threshold <= 0) {
      return 0;
    }
    return Math.min(currentCart / threshold, 1);
  }, [currentCart, threshold]);

  const progressClass = useMemo(() => {
    if (progress >= 0.95) {
      return "w-full";
    }
    if (progress >= 0.75) {
      return "w-3/4";
    }
    if (progress >= 0.5) {
      return "w-1/2";
    }
    if (progress >= 0.25) {
      return "w-1/4";
    }
    return "w-0";
  }, [progress]);

  const shouldShow = currentCart >= promptAt;

  if (!shouldShow) {
    return null;
  }

  return (
    <section className="space-y-lg px-lg py-2xl">
      <div className="grid gap-lg lg:grid-cols-3">
        <Card
          title="Free Delivery Progress"
          subtitle={`Add ৳${remaining} more to unlock free delivery.`}
        >
          <div className="space-y-sm">
            <div className="h-sm w-full rounded-full bg-surface">
              <div className={`h-sm rounded-full bg-accent ${progressClass}`} />
            </div>
            <p className="text-xs text-muted">?{currentCart} of ?{threshold} reached</p>
            <Button variant="outline" size="sm">
              Add top sellers
            </Button>
          </div>
        </Card>
        <Card title="Personalized Picks" subtitle="Recommended for VIP regulars.">
          <div className="space-y-xs text-sm">
            <p>Chef tasting menu</p>
            <p>Limited truffle risotto</p>
            <p>Priority reservations</p>
          </div>
        </Card>
        <Card title="Social Proof" subtitle="Live demand right now.">
          <div className="space-y-xs text-sm">
            <p>18 people ordered the Ribeye today</p>
            <p>6 carts are 1 item away from free delivery</p>
            <p>Only 4 Citrus Tarts left</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
