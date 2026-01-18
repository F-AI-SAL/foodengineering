"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { menuItems as fallbackMenuItems } from "@/lib/data";
import { publicFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/design-system/Badge";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { EmptyState } from "@/components/design-system/States";
import { FieldWrapper, Input, Select } from "@/components/design-system/Form";
import { useWebSocket, type WebSocketMessage } from "@/lib/hooks/useWebSocket";

type MenuUpdatePayload = {
  type: "created" | "updated" | "image";
  item: (typeof fallbackMenuItems)[number];
};

export function MenuGrid() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [items, setItems] = useState(fallbackMenuItems);

  useEffect(() => {
    let active = true;

    publicFetch<typeof fallbackMenuItems>("/menu")
      .then((data) => {
        if (active && Array.isArray(data) && data.length) {
          setItems(data);
        }
      })
      .catch(() => {
        if (active) {
          setItems(fallbackMenuItems);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleMessage = useCallback(
    (message: WebSocketMessage<MenuUpdatePayload>) => {
      if (message.event !== "menu.updated") {
        return;
      }
      const { type, item } = message.data;
      setItems((prev) => {
        const index = prev.findIndex((entry) => entry.id === item.id);
        if (type === "created" && index === -1) {
          return [item, ...prev];
        }
        if (index === -1) {
          return prev;
        }
        const next = [...prev];
        next[index] = { ...next[index], ...item };
        return next;
      });
    },
    []
  );

  useWebSocket<MenuUpdatePayload>({ onMessage: handleMessage });

  const categories = useMemo(() => {
    const unique = new Set(items.map((item) => item.category));
    return ["all", ...Array.from(unique)];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [category, search, items]);

  const handleReset = () => {
    setSearch("");
    setCategory("all");
  };

  return (
    <section className="space-y-lg px-lg py-2xl">
      <div className="flex flex-wrap items-end justify-between gap-md">
        <div>
          <h2 className="text-3xl font-semibold">Menu Highlights</h2>
          <p className="text-sm text-muted">Browse curated favorites and seasonal features.</p>
        </div>
        <div className="flex flex-wrap gap-md">
          <FieldWrapper label="Search">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search dishes"
            />
          </FieldWrapper>
          <FieldWrapper label="Category">
            <Select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All categories" : option}
                </option>
              ))}
            </Select>
          </FieldWrapper>
        </div>
      </div>
      <div className="grid gap-lg md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <Card key={item.id} className="flex h-full flex-col justify-between">
            <div className="space-y-sm">
              <div className="flex items-center justify-between gap-sm">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                {!item.available ? <Badge label="Unavailable" variant="warning" size="sm" /> : null}
              </div>
              <p className="text-sm text-muted">{item.description}</p>
              <div className="flex flex-wrap gap-xs">
                {item.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-surface px-sm py-xs text-xs text-secondary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-md flex items-center justify-between gap-sm">
              <div className="space-y-xs">
                <p className="text-sm text-muted">Prep time {item.prepTime} min</p>
                <p className="text-lg font-semibold">৳{item.price.toFixed(2)}</p>
              </div>
              <Button variant={item.available ? "primary" : "ghost"} disabled={!item.available}>
                {item.available ? "Add to cart" : "Notify me"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {!filtered.length ? (
        <Card>
          <EmptyState
            title="No items found"
            description="Try a different search or category."
            action={
              <Button variant="outline" onClick={handleReset}>
                Reset filters
              </Button>
            }
          />
        </Card>
      ) : null}
    </section>
  );
}
