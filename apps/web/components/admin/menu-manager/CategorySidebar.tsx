"use client";

import { Button } from "@/components/design-system/Button";
import { FieldWrapper, Input } from "@/components/design-system/Form";

type CategorySidebarProps = {
  activeTab: "products" | "options";
  categoryInput: string;
  categories: string[];
  selectedCategory: string;
  itemCounts: Record<string, number>;
  onTabChange: (value: "products" | "options") => void;
  onCategoryInputChange: (value: string) => void;
  onAddCategory: () => void;
  onSelectCategory: (value: string) => void;
};

export const CategorySidebar = ({
  activeTab,
  categoryInput,
  categories,
  selectedCategory,
  itemCounts,
  onTabChange,
  onCategoryInputChange,
  onAddCategory,
  onSelectCategory
}: CategorySidebarProps) => {
  const categoryList = ["all", ...categories];

  return (
    <div className="space-y-md">
      <div className="flex items-center rounded-full border border-border bg-surface-alt p-1">
        <button
          type="button"
          onClick={() => onTabChange("products")}
          className={`flex-1 rounded-full px-md py-xs text-sm font-semibold ${
            activeTab === "products" ? "bg-surface text-primary" : "text-muted"
          }`}
        >
          Products
        </button>
        <button
          type="button"
          onClick={() => onTabChange("options")}
          className={`flex-1 rounded-full px-md py-xs text-sm font-semibold ${
            activeTab === "options" ? "bg-surface text-primary" : "text-muted"
          }`}
        >
          Options
        </button>
      </div>

      <div className="space-y-sm rounded-xl border border-border bg-surface-alt p-md">
        <FieldWrapper label="Add category">
          <Input
            value={categoryInput}
            onChange={(event) => onCategoryInputChange(event.target.value)}
            placeholder="New category"
          />
        </FieldWrapper>
        <Button variant="outline" className="w-full" onClick={onAddCategory}>
          + Add category
        </Button>
      </div>

      <div className="space-y-sm">
        {categoryList.map((category) => {
          const count = itemCounts[category] ?? 0;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={`w-full rounded-xl border px-md py-md text-left transition-colors ${
                selectedCategory === category
                  ? "border-primary bg-surface text-primary"
                  : "border-border bg-surface-alt text-secondary"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{category === "all" ? "All products" : category}</p>
                  <p className="text-xs text-muted">{count} Products</p>
                </div>
                <span className="text-lg text-muted">{">"}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
