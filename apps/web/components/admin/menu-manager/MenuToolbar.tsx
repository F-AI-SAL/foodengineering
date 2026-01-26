"use client";

import { Button } from "@/components/design-system/Button";
import { Input } from "@/components/design-system/Form";

type MenuToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export const MenuToolbar = ({ search, onSearchChange }: MenuToolbarProps) => (
  <div className="flex flex-wrap items-center gap-sm rounded-full border border-border bg-surface px-md py-sm">
    <span className="text-sm text-muted">Search</span>
    <Input
      value={search}
      onChange={(event) => onSearchChange(event.target.value)}
      placeholder="Search..."
      className="flex-1 border-0 bg-transparent px-0"
    />
    <Button variant="outline" size="sm">
      Filter
    </Button>
    <Button variant="ghost" size="sm">
      ...
    </Button>
  </div>
);
