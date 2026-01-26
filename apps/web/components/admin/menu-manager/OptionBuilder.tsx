"use client";

import type { MenuItemOptionChoice, MenuItemOptionGroup } from "@/lib/types";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { EmptyState } from "@/components/design-system/States";
import { FieldWrapper, Input, Select } from "@/components/design-system/Form";

type OptionBuilderProps = {
  groups: MenuItemOptionGroup[];
  onAddGroup: () => void;
  onRemoveGroup: (groupId: string) => void;
  onUpdateGroup: (groupId: string, next: Partial<MenuItemOptionGroup>) => void;
  onAddChoice: (groupId: string) => void;
  onUpdateChoice: (groupId: string, choiceId: string, next: Partial<MenuItemOptionChoice>) => void;
  onRemoveChoice: (groupId: string, choiceId: string) => void;
};

export const OptionBuilder = ({
  groups,
  onAddGroup,
  onRemoveGroup,
  onUpdateGroup,
  onAddChoice,
  onUpdateChoice,
  onRemoveChoice
}: OptionBuilderProps) => (
  <Card title="Options" subtitle="Add option groups and choices.">
    <div className="space-y-md">
      {groups.length === 0 ? (
        <EmptyState title="No options" description="Add option groups to this item." />
      ) : (
        groups.map((group) => (
          <div key={group.id} className="rounded-lg border border-border bg-surface-alt p-md">
            <div className="grid gap-md md:grid-cols-2">
              <FieldWrapper label="Group name">
                <Input value={group.name} onChange={(event) => onUpdateGroup(group.id, { name: event.target.value })} />
              </FieldWrapper>
              <FieldWrapper label="Required">
                <Select
                  value={group.required ? "yes" : "no"}
                  onChange={(event) => onUpdateGroup(group.id, { required: event.target.value === "yes" })}
                >
                  <option value="no">Optional</option>
                  <option value="yes">Required</option>
                </Select>
              </FieldWrapper>
              <FieldWrapper label="Min choices">
                <Input type="number" value={group.min} onChange={(event) => onUpdateGroup(group.id, { min: Number(event.target.value) })} />
              </FieldWrapper>
              <FieldWrapper label="Max choices">
                <Input type="number" value={group.max} onChange={(event) => onUpdateGroup(group.id, { max: Number(event.target.value) })} />
              </FieldWrapper>
            </div>
            <div className="mt-md space-y-sm">
              {group.choices.map((choice) => (
                <div key={choice.id} className="grid items-end gap-sm md:grid-cols-[2fr_1fr_auto]">
                  <FieldWrapper label="Choice name">
                    <Input value={choice.name} onChange={(event) => onUpdateChoice(group.id, choice.id, { name: event.target.value })} />
                  </FieldWrapper>
                  <FieldWrapper label="Extra price (?)">
                    <Input type="number" value={choice.price} onChange={(event) => onUpdateChoice(group.id, choice.id, { price: Number(event.target.value) })} />
                  </FieldWrapper>
                  <Button variant="ghost" onClick={() => onRemoveChoice(group.id, choice.id)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => onAddChoice(group.id)}>
                Add choice
              </Button>
            </div>
            <div className="mt-md flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => onRemoveGroup(group.id)}>
                Remove group
              </Button>
            </div>
          </div>
        ))
      )}
      <Button variant="outline" onClick={onAddGroup}>
        Add option group
      </Button>
    </div>
  </Card>
);
