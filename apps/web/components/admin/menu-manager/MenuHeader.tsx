"use client";

import { Button } from "@/components/design-system/Button";

export const MenuHeader = () => (
  <div className="flex flex-wrap items-center justify-between gap-md">
    <div className="space-y-xs">
      <h1 className="text-3xl font-semibold">Menu</h1>
      <button type="button" className="flex items-center gap-xs text-sm font-semibold text-primary">
        Food Engineering - Branch 2
        <span className="text-xs text-muted">v</span>
      </button>
    </div>
    <div className="flex flex-wrap items-center gap-sm">
      <div className="flex items-center gap-xs rounded-full border border-border bg-surface px-md py-xs text-xs">
        <span className="h-2 w-2 rounded-full bg-destructive" />
        <span>0</span>
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span>2</span>
        <span className="h-2 w-2 rounded-full bg-secondary" />
        <span>0</span>
      </div>
      <Button variant="outline" size="sm">
        Help Center
      </Button>
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-alt text-sm">
        !
      </div>
    </div>
  </div>
);
