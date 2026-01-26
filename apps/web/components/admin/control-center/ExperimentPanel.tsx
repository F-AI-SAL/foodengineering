"use client";

import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { FieldWrapper, Input, Select, Textarea } from "@/components/design-system/Form";

type ExperimentPanelProps = {
  name: string;
  hypothesis: string;
  metric: string;
  statusMessage?: string;
  onNameChange: (value: string) => void;
  onHypothesisChange: (value: string) => void;
  onMetricChange: (value: string) => void;
  onSave: () => void;
};

export const ExperimentPanel = ({
  name,
  hypothesis,
  metric,
  statusMessage,
  onNameChange,
  onHypothesisChange,
  onMetricChange,
  onSave
}: ExperimentPanelProps) => (
  <Card title="A/B Test Setup" subtitle="Create an experiment with one click.">
    <div className="grid gap-md md:grid-cols-2">
      <FieldWrapper label="Experiment name">
        <Input value={name} onChange={(event) => onNameChange(event.target.value)} />
      </FieldWrapper>
      <FieldWrapper label="Primary metric">
        <Select value={metric} onChange={(event) => onMetricChange(event.target.value)}>
          <option value="aov">Average order value</option>
          <option value="conversion">Conversion rate</option>
          <option value="retention">Retention</option>
        </Select>
      </FieldWrapper>
      <div className="md:col-span-2">
        <FieldWrapper label="Hypothesis">
          <Textarea value={hypothesis} onChange={(event) => onHypothesisChange(event.target.value)} />
        </FieldWrapper>
      </div>
    </div>
    <div className="mt-md flex flex-wrap items-center gap-sm">
      <Button variant="primary" onClick={onSave}>
        Save experiment
      </Button>
      <p className="text-xs text-muted">{statusMessage}</p>
    </div>
  </Card>
);
