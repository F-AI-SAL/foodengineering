"use client";

import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { FieldWrapper, Input } from "@/components/design-system/Form";
import { DEFAULT_LOYALTY_TIERS } from "./constants";

type LoyaltyPanelProps = {
  tiers: typeof DEFAULT_LOYALTY_TIERS;
  statusMessage?: string;
  onChange: (next: typeof DEFAULT_LOYALTY_TIERS) => void;
  onSave: () => void;
};

export const LoyaltyPanel = ({ tiers, statusMessage, onChange, onSave }: LoyaltyPanelProps) => (
  <Card title="Loyalty Tier Rules" subtitle="Adjust the points needed for each badge.">
    <div className="grid gap-md md:grid-cols-2">
      {Object.entries(tiers).map(([tier, values]) => (
        <div key={tier} className="rounded-lg border border-border bg-surface p-md">
          <p className="text-sm font-semibold capitalize">{tier}</p>
          <div className="mt-sm space-y-sm">
            <FieldWrapper label="Min points">
              <Input
                type="number"
                value={values.minPoints}
                onChange={(event) =>
                  onChange({
                    ...tiers,
                    [tier]: { ...values, minPoints: Number(event.target.value) }
                  })
                }
              />
            </FieldWrapper>
            <FieldWrapper label="Points multiplier">
              <Input
                type="number"
                step="0.05"
                value={values.multiplier}
                onChange={(event) =>
                  onChange({
                    ...tiers,
                    [tier]: { ...values, multiplier: Number(event.target.value) }
                  })
                }
              />
            </FieldWrapper>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-md flex flex-wrap items-center gap-sm">
      <Button variant="primary" onClick={onSave}>
        Save loyalty tiers
      </Button>
      <p className="text-xs text-muted">{statusMessage}</p>
    </div>
  </Card>
);
