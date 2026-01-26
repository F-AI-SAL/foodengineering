"use client";

import type { Segment } from "@/lib/types";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { FieldWrapper, Input, Select } from "@/components/design-system/Form";

type CouponQuickCreatePanelProps = {
  couponName: string;
  couponType: "percent" | "fixed" | "free_delivery";
  couponValue: number;
  couponMinPurchase: number;
  couponMaxDiscount: number;
  couponSegmentId: string;
  couponAutoCode: boolean;
  couponStackable: boolean;
  couponCode: string;
  segments: Segment[];
  statusMessage?: string;
  onNameChange: (value: string) => void;
  onTypeChange: (value: "percent" | "fixed" | "free_delivery") => void;
  onValueChange: (value: number) => void;
  onMinPurchaseChange: (value: number) => void;
  onMaxDiscountChange: (value: number) => void;
  onSegmentChange: (value: string) => void;
  onAutoCodeChange: (value: boolean) => void;
  onStackableChange: (value: boolean) => void;
  onCodeChange: (value: string) => void;
  onSave: () => void;
};

export const CouponQuickCreatePanel = ({
  couponName,
  couponType,
  couponValue,
  couponMinPurchase,
  couponMaxDiscount,
  couponSegmentId,
  couponAutoCode,
  couponStackable,
  couponCode,
  segments,
  statusMessage,
  onNameChange,
  onTypeChange,
  onValueChange,
  onMinPurchaseChange,
  onMaxDiscountChange,
  onSegmentChange,
  onAutoCodeChange,
  onStackableChange,
  onCodeChange,
  onSave
}: CouponQuickCreatePanelProps) => (
  <Card title="Coupon Quick Create" subtitle="Generate a coupon in seconds.">
    <div className="grid gap-md md:grid-cols-2">
      <FieldWrapper label="Coupon name">
        <Input value={couponName} onChange={(event) => onNameChange(event.target.value)} />
      </FieldWrapper>
      <FieldWrapper label="Discount type">
        <Select value={couponType} onChange={(event) => onTypeChange(event.target.value as typeof couponType)}>
          <option value="percent">Percent off</option>
          <option value="fixed">Fixed amount</option>
          <option value="free_delivery">Free delivery</option>
        </Select>
      </FieldWrapper>
      <FieldWrapper label="Discount value">
        <Input
          type="number"
          value={couponValue}
          onChange={(event) => onValueChange(Number(event.target.value))}
          disabled={couponType === "free_delivery"}
        />
      </FieldWrapper>
      <FieldWrapper label="Minimum spend (à§³)">
        <Input
          type="number"
          value={couponMinPurchase}
          onChange={(event) => onMinPurchaseChange(Number(event.target.value))}
        />
      </FieldWrapper>
      <FieldWrapper label="Max discount cap (à§³)">
        <Input
          type="number"
          value={couponMaxDiscount}
          onChange={(event) => onMaxDiscountChange(Number(event.target.value))}
          disabled={couponType !== "percent"}
        />
      </FieldWrapper>
      <FieldWrapper label="Target segment">
        <Select value={couponSegmentId} onChange={(event) => onSegmentChange(event.target.value)}>
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
          value={couponStackable ? "stackable" : "exclusive"}
          onChange={(event) => onStackableChange(event.target.value === "stackable")}
        >
          <option value="stackable">Stackable</option>
          <option value="exclusive">Exclusive</option>
        </Select>
      </FieldWrapper>
      <FieldWrapper label="Code generation">
        <Select
          value={couponAutoCode ? "auto" : "manual"}
          onChange={(event) => onAutoCodeChange(event.target.value === "auto")}
        >
          <option value="auto">Auto-generate</option>
          <option value="manual">Manual code</option>
        </Select>
      </FieldWrapper>
      {!couponAutoCode ? (
        <FieldWrapper label="Manual code">
          <Input value={couponCode} onChange={(event) => onCodeChange(event.target.value)} />
        </FieldWrapper>
      ) : null}
    </div>
    <div className="mt-md flex flex-wrap items-center gap-sm">
      <Button variant="primary" onClick={onSave}>
        Save coupon
      </Button>
      <p className="text-xs text-muted">{statusMessage}</p>
    </div>
  </Card>
);
