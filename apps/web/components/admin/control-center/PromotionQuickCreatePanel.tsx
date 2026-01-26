"use client";

import type { Segment } from "@/lib/types";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { FieldWrapper, Input, Select } from "@/components/design-system/Form";

type PromotionQuickCreatePanelProps = {
  promoName: string;
  promoMinSpend: number;
  promoType: "percent" | "fixed" | "free_delivery";
  promoValue: number;
  promoMaxDiscount: number;
  promoSegmentId: string;
  promoStackable: boolean;
  promoPreview: string;
  segments: Segment[];
  statusMessage?: string;
  onNameChange: (value: string) => void;
  onMinSpendChange: (value: number) => void;
  onTypeChange: (value: "percent" | "fixed" | "free_delivery") => void;
  onValueChange: (value: number) => void;
  onMaxDiscountChange: (value: number) => void;
  onSegmentChange: (value: string) => void;
  onStackableChange: (value: boolean) => void;
  onPublish: () => void;
};

export const PromotionQuickCreatePanel = ({
  promoName,
  promoMinSpend,
  promoType,
  promoValue,
  promoMaxDiscount,
  promoSegmentId,
  promoStackable,
  promoPreview,
  segments,
  statusMessage,
  onNameChange,
  onMinSpendChange,
  onTypeChange,
  onValueChange,
  onMaxDiscountChange,
  onSegmentChange,
  onStackableChange,
  onPublish
}: PromotionQuickCreatePanelProps) => (
  <Card title="Promotion Quick Create" subtitle="Simple IF/THEN offer builder.">
    <div className="grid gap-md md:grid-cols-2">
      <FieldWrapper label="Offer name">
        <Input value={promoName} onChange={(event) => onNameChange(event.target.value)} />
      </FieldWrapper>
      <FieldWrapper label="Min spend (à§³)">
        <Input type="number" value={promoMinSpend} onChange={(event) => onMinSpendChange(Number(event.target.value))} />
      </FieldWrapper>
      <FieldWrapper label="Discount type">
        <Select value={promoType} onChange={(event) => onTypeChange(event.target.value as typeof promoType)}>
          <option value="percent">Percent off</option>
          <option value="fixed">Fixed amount</option>
          <option value="free_delivery">Free delivery</option>
        </Select>
      </FieldWrapper>
      <FieldWrapper label="Discount value">
        <Input
          type="number"
          value={promoValue}
          onChange={(event) => onValueChange(Number(event.target.value))}
          disabled={promoType === "free_delivery"}
        />
      </FieldWrapper>
      <FieldWrapper label="Max discount cap (à§³)">
        <Input
          type="number"
          value={promoMaxDiscount}
          onChange={(event) => onMaxDiscountChange(Number(event.target.value))}
          disabled={promoType !== "percent"}
        />
      </FieldWrapper>
      <FieldWrapper label="Target segment">
        <Select value={promoSegmentId} onChange={(event) => onSegmentChange(event.target.value)}>
          <option value="all">All customers</option>
          {segments.map((segment) => (
            <option key={segment.id} value={segment.id}>
              {segment.name}
            </option>
          ))}
        </Select>
      </FieldWrapper>
      <FieldWrapper label="Stacking">
        <Select
          value={promoStackable ? "stackable" : "exclusive"}
          onChange={(event) => onStackableChange(event.target.value === "stackable")}
        >
          <option value="stackable">Stackable</option>
          <option value="exclusive">Exclusive</option>
        </Select>
      </FieldWrapper>
      <div className="md:col-span-2">
        <FieldWrapper label="Preview">
          <Input value={promoPreview} readOnly />
        </FieldWrapper>
      </div>
    </div>
    <div className="mt-md flex flex-wrap items-center gap-sm">
      <Button variant="primary" onClick={onPublish}>
        Publish promotion
      </Button>
      <p className="text-xs text-muted">{statusMessage}</p>
    </div>
  </Card>
);
