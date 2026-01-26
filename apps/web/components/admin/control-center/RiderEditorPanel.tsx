"use client";

import type { RiderStatus } from "@/lib/types";
import type { RiderRecord } from "./types";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { EmptyState } from "@/components/design-system/States";
import { FieldWrapper, Input, Select } from "@/components/design-system/Form";

type RiderEditorPanelProps = {
  riders: RiderRecord[];
  selectedId: string;
  riderName: string;
  riderStatus: RiderStatus;
  statusMessage?: string;
  onSelect: (value: string) => void;
  onNameChange: (value: string) => void;
  onStatusChange: (value: RiderStatus) => void;
  onSave: () => void;
};

export const RiderEditorPanel = ({
  riders,
  selectedId,
  riderName,
  riderStatus,
  statusMessage,
  onSelect,
  onNameChange,
  onStatusChange,
  onSave
}: RiderEditorPanelProps) => (
  <Card title="Rider Editor" subtitle="Update rider name and status instantly.">
    {riders.length === 0 ? (
      <EmptyState title="No riders found" description="Add riders to start managing them." />
    ) : (
      <div className="space-y-md">
        <FieldWrapper label="Pick rider">
          <Select value={selectedId} onChange={(event) => onSelect(event.target.value)}>
            {riders.map((rider) => (
              <option key={rider.id} value={rider.id}>
                {rider.name}
              </option>
            ))}
          </Select>
        </FieldWrapper>
        <FieldWrapper label="Rider name">
          <Input value={riderName} onChange={(event) => onNameChange(event.target.value)} />
        </FieldWrapper>
        <FieldWrapper label="Status">
          <Select value={riderStatus} onChange={(event) => onStatusChange(event.target.value as RiderStatus)}>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="on_delivery">On delivery</option>
          </Select>
        </FieldWrapper>
        <div className="flex flex-wrap items-center gap-sm">
          <Button variant="primary" onClick={onSave}>
            Save rider update
          </Button>
          <p className="text-xs text-muted">{statusMessage}</p>
        </div>
      </div>
    )}
  </Card>
);
