"use client";

import type { MenuItem } from "@/lib/types";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { EmptyState } from "@/components/design-system/States";
import { FieldWrapper, Input, Select, Textarea } from "@/components/design-system/Form";

type MenuEditorPanelProps = {
  items: MenuItem[];
  selectedId: string;
  activeItem?: MenuItem;
  statusMessage?: string;
  onSelect: (value: string) => void;
  onUpdate: (field: keyof MenuItem, value: MenuItem[keyof MenuItem]) => void;
  onSave: () => void;
};

export const MenuEditorPanel = ({
  items,
  selectedId,
  activeItem,
  statusMessage,
  onSelect,
  onUpdate,
  onSave
}: MenuEditorPanelProps) => (
  <Card title="Menu Editor" subtitle="Update prices and availability with one click.">
    {items.length === 0 ? (
      <EmptyState title="No menu items" description="Create menu items to edit them." />
    ) : (
      <div className="space-y-md">
        <FieldWrapper label="Pick item">
          <Select value={selectedId} onChange={(event) => onSelect(event.target.value)}>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </FieldWrapper>
        {activeItem ? (
          <div className="grid gap-md md:grid-cols-2">
            <FieldWrapper label="Name">
              <Input value={activeItem.name} onChange={(event) => onUpdate("name", event.target.value)} />
            </FieldWrapper>
            <FieldWrapper label="Category">
              <Input
                value={activeItem.category}
                onChange={(event) => onUpdate("category", event.target.value)}
              />
            </FieldWrapper>
            <FieldWrapper label="Price (à§³)">
              <Input
                type="number"
                value={activeItem.price}
                onChange={(event) => onUpdate("price", Number(event.target.value))}
              />
            </FieldWrapper>
            <FieldWrapper label="Prep time (min)">
              <Input
                type="number"
                value={activeItem.prepTime}
                onChange={(event) => onUpdate("prepTime", Number(event.target.value))}
              />
            </FieldWrapper>
            <FieldWrapper label="Availability">
              <Select
                value={activeItem.available ? "available" : "unavailable"}
                onChange={(event) => onUpdate("available", event.target.value === "available")}
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </Select>
            </FieldWrapper>
            <div className="md:col-span-2">
              <FieldWrapper label="Description">
                <Textarea
                  value={activeItem.description}
                  onChange={(event) => onUpdate("description", event.target.value)}
                />
              </FieldWrapper>
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-sm">
          <Button variant="primary" onClick={onSave}>
            Save menu item
          </Button>
          <p className="text-xs text-muted">{statusMessage}</p>
        </div>
      </div>
    )}
  </Card>
);
