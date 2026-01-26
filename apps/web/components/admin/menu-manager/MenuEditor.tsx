"use client";

import type { MenuItem } from "@/lib/types";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { FieldWrapper, Input, Select, Textarea } from "@/components/design-system/Form";

type MenuEditorProps = {
  item: MenuItem;
  categories: string[];
  uploadMessage: string;
  statusMessage: string;
  onUpdate: (field: keyof MenuItem, value: MenuItem[keyof MenuItem]) => void;
  onSave: () => void;
  onUpload: () => void;
  onUploadFileChange: (file: File | null) => void;
};

export const MenuEditor = ({
  item,
  categories,
  uploadMessage,
  statusMessage,
  onUpdate,
  onSave,
  onUpload,
  onUploadFileChange
}: MenuEditorProps) => (
  <Card title="Edit item" subtitle="Update product details, pricing, and stock.">
    <div className="grid gap-md md:grid-cols-2">
      <FieldWrapper label="Name">
        <Input value={item.name} onChange={(event) => onUpdate("name", event.target.value)} />
      </FieldWrapper>
      <FieldWrapper label="Category">
        <Select value={item.category} onChange={(event) => onUpdate("category", event.target.value)}>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </FieldWrapper>
      <FieldWrapper label="Price (?)">
        <Input
          type="number"
          value={item.price}
          onChange={(event) => onUpdate("price", Number(event.target.value))}
        />
      </FieldWrapper>
      <FieldWrapper label="Prep time (min)">
        <Input
          type="number"
          value={item.prepTime}
          onChange={(event) => onUpdate("prepTime", Number(event.target.value))}
        />
      </FieldWrapper>
      <FieldWrapper label="Stock status">
        <Select
          value={item.available ? "available" : "unavailable"}
          onChange={(event) => onUpdate("available", event.target.value === "available")}
        >
          <option value="available">Available</option>
          <option value="unavailable">Out of stock</option>
        </Select>
      </FieldWrapper>
      <FieldWrapper label="Tags">
        <Input
          value={item.tags.join(", ")}
          onChange={(event) =>
            onUpdate(
              "tags",
              event.target.value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
            )
          }
        />
      </FieldWrapper>
      <div className="md:col-span-2">
        <FieldWrapper label="Description">
          <Textarea value={item.description} onChange={(event) => onUpdate("description", event.target.value)} />
        </FieldWrapper>
      </div>
      <div className="md:col-span-2">
        <FieldWrapper label="Image URL">
          <Input value={item.image} onChange={(event) => onUpdate("image", event.target.value)} />
        </FieldWrapper>
        {item.image ? (
          <a
            href={item.image.startsWith("/") ? `${API_BASE}${item.image}` : item.image}
            target="_blank"
            rel="noreferrer"
            className="mt-xs inline-flex text-xs font-semibold text-primary"
          >
            Open current file
          </a>
        ) : null}
      </div>
      <div className="md:col-span-2">
        <FieldWrapper label="Upload image or PDF">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.svg,.pdf"
            onChange={(event) => onUploadFileChange(event.target.files?.[0] ?? null)}
            className="w-full rounded-md border border-border bg-surface-alt px-md py-sm text-sm text-secondary"
          />
          <p className="text-xs text-muted">Supported: JPG, PNG, SVG, PDF (max 10MB).</p>
        </FieldWrapper>
      </div>
    </div>
    <div className="mt-md flex flex-wrap items-center gap-sm">
      <Button variant="primary" onClick={onSave}>
        Save changes
      </Button>
      <Button variant="outline" onClick={onUpload}>
        Upload file
      </Button>
      <span className="text-xs text-muted">{statusMessage}</span>
      <span className="text-xs text-muted">{uploadMessage}</span>
    </div>
  </Card>
);
