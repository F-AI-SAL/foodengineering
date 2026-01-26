"use client";

import type { MenuItem } from "@/lib/types";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/design-system/Button";
import { EmptyState } from "@/components/design-system/States";
import { PaginationControls } from "@/components/design-system/Pagination";
import { isPdfFile } from "./utils";

type MenuListProps = {
  items: MenuItem[];
  selectedCategory: string;
  onSelectItem: (id: string) => void;
  onAddProduct: () => void;
  onToggleAvailability: (item: MenuItem) => void;
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (value: number) => void;
  onPageSizeChange: (value: number) => void;
};

export const MenuList = ({
  items,
  selectedCategory,
  onSelectItem,
  onAddProduct,
  onToggleAvailability,
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange
}: MenuListProps) => (
  <div className="rounded-2xl border border-border bg-surface">
    <div className="flex flex-wrap items-center justify-between gap-sm border-b border-border px-lg py-md">
      <div className="flex items-center gap-sm">
        <h2 className="text-lg font-semibold">{selectedCategory === "all" ? "All Products" : selectedCategory}</h2>
        <button type="button" className="rounded-full border border-border p-2 text-xs">
          Edit
        </button>
      </div>
      <Button variant="outline" size="sm" onClick={onAddProduct}>
        + Add product
      </Button>
    </div>

    <div className="divide-y divide-border">
      {items.length === 0 ? (
        <div className="p-lg">
          <EmptyState title="No products" description="Create your first menu item." />
        </div>
      ) : (
        items.map((item) => {
          const optionCount = item.optionsJson?.groups?.length ?? 0;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem(item.id)}
              className="w-full px-lg py-md text-left transition-colors hover:bg-surface-alt"
            >
              <div className="flex items-center justify-between gap-md">
                <div className="flex items-start gap-md">
                  {item.image && !isPdfFile(item.image) ? (
                    <img
                      src={item.image.startsWith("/") ? `${API_BASE}${item.image}` : item.image}
                      alt={item.name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                  ) : item.image ? (
                    <a
                      href={item.image.startsWith("/") ? `${API_BASE}${item.image}` : item.image}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-alt text-xs font-semibold text-primary"
                    >
                      PDF
                    </a>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-alt text-xs text-muted">
                      No img
                    </div>
                  )}
                  <div className="space-y-xs">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted">{item.description || "No description yet."}</p>
                    <p className="text-xs text-muted">
                      BDT {Number(item.price).toFixed(2)} ?{" "}
                      {optionCount ? `${optionCount} Options` : "No Options"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleAvailability(item);
                  }}
                  className={`h-6 w-12 rounded-full border border-border p-1 ${
                    item.available ? "bg-accent" : "bg-surface"
                  }`}
                >
                  <span
                    className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                      item.available ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </button>
          );
        })
      )}
    </div>
    <div className="px-lg py-md">
      <PaginationControls
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={(size) => {
          onPageSizeChange(size);
          onPageChange(1);
        }}
      />
    </div>
  </div>
);
