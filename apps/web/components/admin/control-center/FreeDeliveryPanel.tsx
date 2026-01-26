"use client";

import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { FieldWrapper, Input } from "@/components/design-system/Form";

type FreeDeliveryPanelProps = {
  promptAt: number;
  threshold: number;
  statusMessage?: string;
  onPromptChange: (value: number) => void;
  onThresholdChange: (value: number) => void;
  onSave: () => void;
};

export const FreeDeliveryPanel = ({
  promptAt,
  threshold,
  statusMessage,
  onPromptChange,
  onThresholdChange,
  onSave
}: FreeDeliveryPanelProps) => (
  <Card title="Free Delivery Range" subtitle="Control the progress bar and free delivery goal.">
    <div className="grid gap-md md:grid-cols-2">
      <FieldWrapper label="Show progress after (à§³)">
        <Input type="number" value={promptAt} onChange={(event) => onPromptChange(Number(event.target.value))} />
      </FieldWrapper>
      <FieldWrapper label="Free delivery at (à§³)">
        <Input
          type="number"
          value={threshold}
          onChange={(event) => onThresholdChange(Number(event.target.value))}
        />
      </FieldWrapper>
    </div>
    <div className="mt-md flex flex-wrap items-center gap-sm">
      <Button variant="primary" onClick={onSave}>
        Save free delivery range
      </Button>
      <p className="text-xs text-muted">{statusMessage}</p>
    </div>
  </Card>
);
