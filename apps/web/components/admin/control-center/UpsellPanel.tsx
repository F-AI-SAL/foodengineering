"use client";

import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { FieldWrapper, Input, Select, Textarea } from "@/components/design-system/Form";
import { UPSELL_TYPES } from "./constants";

type UpsellPanelProps = {
  name: string;
  type: string;
  threshold: number;
  message: string;
  statusMessage?: string;
  onNameChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onThresholdChange: (value: number) => void;
  onMessageChange: (value: string) => void;
  onSave: () => void;
};

export const UpsellPanel = ({
  name,
  type,
  threshold,
  message,
  statusMessage,
  onNameChange,
  onTypeChange,
  onThresholdChange,
  onMessageChange,
  onSave
}: UpsellPanelProps) => (
  <Card title="Growth Sales Boost" subtitle="Upsell and cross-sell rules.">
    <div className="grid gap-md md:grid-cols-2">
      <FieldWrapper label="Rule name">
        <Input value={name} onChange={(event) => onNameChange(event.target.value)} />
      </FieldWrapper>
      <FieldWrapper label="Type">
        <Select value={type} onChange={(event) => onTypeChange(event.target.value)}>
          {UPSELL_TYPES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
      </FieldWrapper>
      <FieldWrapper label="Trigger threshold (à§³)">
        <Input
          type="number"
          value={threshold}
          onChange={(event) => onThresholdChange(Number(event.target.value))}
        />
      </FieldWrapper>
      <div className="md:col-span-2">
        <FieldWrapper label="Customer message">
          <Textarea value={message} onChange={(event) => onMessageChange(event.target.value)} />
        </FieldWrapper>
      </div>
    </div>
    <div className="mt-md flex flex-wrap items-center gap-sm">
      <Button variant="primary" onClick={onSave}>
        Save upsell rule
      </Button>
      <p className="text-xs text-muted">{statusMessage}</p>
    </div>
  </Card>
);
