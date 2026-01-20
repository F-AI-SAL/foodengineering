"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, API_BASE } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";
import type { MenuItem, MenuItemOptionChoice, MenuItemOptionGroup } from "@/lib/types";
import { Button } from "@/components/design-system/Button";
import { Card } from "@/components/design-system/Card";
import { FieldWrapper, Input, Select, Textarea } from "@/components/design-system/Form";
import { EmptyState, ErrorState, LoadingState } from "@/components/design-system/States";

const createId = () => Math.random().toString(36).slice(2, 10);

type SettingRecord = {
  key: string;
  valueJson: unknown;
};

export function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"products" | "options">("products");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([apiFetch<MenuItem[]>("/menu"), apiFetch<SettingRecord[]>("/settings")])
      .then(([data, settings]) => {
        if (!active) {
          return;
        }
        const normalized = data.map((item) => ({
          ...item,
          price: Number(item.price),
          optionsJson: item.optionsJson ?? { groups: [] }
        }));
        setItems(normalized);
        setSelectedId(normalized[0]?.id ?? "");

        const stored = settings.find((entry) => entry.key === "menu_categories")?.valueJson;
        if (Array.isArray(stored) && stored.length) {
          setCategories(stored.map((value) => String(value)));
        } else {
          const unique = new Set(normalized.map((item) => item.category));
          setCategories(Array.from(unique));
        }
        setError(null);
      })
      .catch(() => {
        if (active) {
          setError("Unable to load menu items.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const activeItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0],
    [items, selectedId]
  );
  const isPdf = (value?: string | null) => Boolean(value?.toLowerCase().endsWith(".pdf"));

  const groupedItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, search, selectedCategory]);

  const handleUpdate = (field: keyof MenuItem, value: MenuItem[keyof MenuItem]) => {
    if (!activeItem) {
      return;
    }

    setItems((prev) =>
      prev.map((item) => (item.id === activeItem.id ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async () => {
    if (!activeItem) {
      return;
    }
    setStatusMessage("Saving...");
    try {
      await apiFetch(`/menu/${activeItem.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: activeItem.name,
          description: activeItem.description,
          price: Number(activeItem.price),
          category: activeItem.category,
          image: activeItem.image,
          available: activeItem.available,
          prepTime: activeItem.prepTime,
          tags: activeItem.tags,
          optionsJson: activeItem.optionsJson
        })
      });
      setStatusMessage("Saved.");
    } catch (saveError) {
      setStatusMessage("Save failed.");
    }
  };

  const handleUpload = async () => {
    if (!activeItem || !uploadFile) {
      setUploadMessage("Select a file first.");
      return;
    }

    setUploadMessage("Uploading...");
    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      const response = await fetch(`${API_BASE}/menu/${activeItem.id}/upload`, {
        method: "POST",
        headers: {
          ...getAuthHeaders()
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const updated = await response.json();
      setItems((prev) =>
        prev.map((item) => (item.id === activeItem.id ? { ...item, image: updated.image } : item))
      );
      setUploadFile(null);
      setUploadMessage("Uploaded.");
    } catch (uploadError) {
      setUploadMessage("Upload failed.");
    }
  };

  const handleAddCategory = async () => {
    if (!categoryInput.trim()) {
      return;
    }
    const updatedCategories = Array.from(new Set([categoryInput.trim(), ...categories]));
    setCategories(updatedCategories);
    setCategoryInput("");

    try {
      await apiFetch("/settings", {
        method: "POST",
        body: JSON.stringify({
          key: "menu_categories",
          valueJson: updatedCategories
        })
      });
    } catch (saveError) {
      setError("Unable to save category list.");
    }
  };

  const handleAddProduct = async () => {
    const category = selectedCategory === "all" ? categories[0] ?? "Uncategorized" : selectedCategory;
    try {
      const created = await apiFetch<MenuItem>("/menu", {
        method: "POST",
        body: JSON.stringify({
          name: "New item",
          description: "",
          price: 0,
          category,
          image: "",
          available: true,
          prepTime: 0,
          tags: [],
          optionsJson: { groups: [] }
        })
      });
      setItems((prev) => [created, ...prev]);
      setSelectedId(created.id);
    } catch (saveError) {
      setError("Unable to add product.");
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const next = !item.available;
    setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, available: next } : entry)));
    try {
      await apiFetch(`/menu/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ available: next })
      });
    } catch (saveError) {
      setError("Unable to update availability.");
    }
  };

  const optionGroups = activeItem?.optionsJson?.groups ?? [];

  const updateOptionGroups = (groups: MenuItemOptionGroup[]) => {
    if (!activeItem) {
      return;
    }
    handleUpdate("optionsJson", { groups });
  };

  const handleAddGroup = () => {
    updateOptionGroups([
      ...optionGroups,
      {
        id: createId(),
        name: "New option",
        required: false,
        min: 0,
        max: 1,
        choices: []
      }
    ]);
  };

  const handleUpdateGroup = (groupId: string, next: Partial<MenuItemOptionGroup>) => {
    updateOptionGroups(
      optionGroups.map((group) => (group.id === groupId ? { ...group, ...next } : group))
    );
  };

  const handleRemoveGroup = (groupId: string) => {
    updateOptionGroups(optionGroups.filter((group) => group.id !== groupId));
  };

  const handleAddChoice = (groupId: string) => {
    updateOptionGroups(
      optionGroups.map((group) => {
        if (group.id !== groupId) {
          return group;
        }
        const newChoice: MenuItemOptionChoice = {
          id: createId(),
          name: "New choice",
          price: 0
        };
        return { ...group, choices: [...group.choices, newChoice] };
      })
    );
  };

  const handleUpdateChoice = (
    groupId: string,
    choiceId: string,
    next: Partial<MenuItemOptionChoice>
  ) => {
    updateOptionGroups(
      optionGroups.map((group) => {
        if (group.id !== groupId) {
          return group;
        }
        return {
          ...group,
          choices: group.choices.map((choice) =>
            choice.id === choiceId ? { ...choice, ...next } : choice
          )
        };
      })
    );
  };

  const handleRemoveChoice = (groupId: string, choiceId: string) => {
    updateOptionGroups(
      optionGroups.map((group) => {
        if (group.id !== groupId) {
          return group;
        }
        return {
          ...group,
          choices: group.choices.filter((choice) => choice.id !== choiceId)
        };
      })
    );
  };

  const categoryList = ["all", ...categories];

  return (
    <div className="space-y-2xl">
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

      {loading ? <LoadingState message="Loading menu..." /> : null}
      {error ? <ErrorState message={error} /> : null}

      <div className="grid gap-lg lg:grid-cols-[300px_1fr]">
        <div className="space-y-md">
          <div className="flex items-center rounded-full border border-border bg-surface-alt p-1">
            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className={`flex-1 rounded-full px-md py-xs text-sm font-semibold ${
                activeTab === "products" ? "bg-surface text-primary" : "text-muted"
              }`}
            >
              Products
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("options")}
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
                onChange={(event) => setCategoryInput(event.target.value)}
                placeholder="New category"
              />
            </FieldWrapper>
            <Button variant="outline" className="w-full" onClick={handleAddCategory}>
              + Add category
            </Button>
          </div>

          <div className="space-y-sm">
            {categoryList.map((category) => {
              const count =
                category === "all" ? items.length : items.filter((item) => item.category === category).length;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
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

        <div className="space-y-lg">
          <div className="flex flex-wrap items-center gap-sm rounded-full border border-border bg-surface px-md py-sm">
            <span className="text-sm text-muted">Search</span>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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

          <div className="rounded-2xl border border-border bg-surface">
            <div className="flex flex-wrap items-center justify-between gap-sm border-b border-border px-lg py-md">
              <div className="flex items-center gap-sm">
                <h2 className="text-lg font-semibold">
                  {selectedCategory === "all" ? "All Products" : selectedCategory}
                </h2>
                <button type="button" className="rounded-full border border-border p-2 text-xs">
                  Edit
                </button>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddProduct}>
                + Add product
              </Button>
            </div>

            <div className="divide-y divide-border">
              {groupedItems.length === 0 ? (
                <div className="p-lg">
                  <EmptyState title="No products" description="Create your first menu item." />
                </div>
              ) : (
                groupedItems.map((item) => {
                  const optionCount = item.optionsJson?.groups?.length ?? 0;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className="w-full px-lg py-md text-left transition-colors hover:bg-surface-alt"
                    >
                      <div className="flex items-center justify-between gap-md">
                        <div className="flex items-start gap-md">
                          {item.image && !isPdf(item.image) ? (
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
                              BDT {Number(item.price).toFixed(2)} ? {optionCount ? `${optionCount} Options` : "No Options"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleToggleAvailability(item);
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
          </div>

          {activeItem ? (
            <Card title="Edit item" subtitle="Update product details, pricing, and stock.">
              <div className="grid gap-md md:grid-cols-2">
                <FieldWrapper label="Name">
                  <Input value={activeItem.name} onChange={(event) => handleUpdate("name", event.target.value)} />
                </FieldWrapper>
                <FieldWrapper label="Category">
                  <Select value={activeItem.category} onChange={(event) => handleUpdate("category", event.target.value)}>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </FieldWrapper>
                <FieldWrapper label="Price (?)">
                  <Input type="number" value={activeItem.price} onChange={(event) => handleUpdate("price", Number(event.target.value))} />
                </FieldWrapper>
                <FieldWrapper label="Prep time (min)">
                  <Input type="number" value={activeItem.prepTime} onChange={(event) => handleUpdate("prepTime", Number(event.target.value))} />
                </FieldWrapper>
                <FieldWrapper label="Stock status">
                  <Select value={activeItem.available ? "available" : "unavailable"} onChange={(event) => handleUpdate("available", event.target.value === "available")}>
                    <option value="available">Available</option>
                    <option value="unavailable">Out of stock</option>
                  </Select>
                </FieldWrapper>
                <FieldWrapper label="Tags">
                  <Input
                    value={activeItem.tags.join(", ")}
                    onChange={(event) =>
                      handleUpdate(
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
                    <Textarea value={activeItem.description} onChange={(event) => handleUpdate("description", event.target.value)} />
                  </FieldWrapper>
                </div>
                <div className="md:col-span-2">
                  <FieldWrapper label="Image URL">
                    <Input value={activeItem.image} onChange={(event) => handleUpdate("image", event.target.value)} />
                  </FieldWrapper>
                  {activeItem.image ? (
                    <a
                      href={activeItem.image.startsWith("/") ? `${API_BASE}${activeItem.image}` : activeItem.image}
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
                      onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
                      className="w-full rounded-md border border-border bg-surface-alt px-md py-sm text-sm text-secondary"
                    />
                    <p className="text-xs text-muted">Supported: JPG, PNG, SVG, PDF (max 10MB).</p>
                  </FieldWrapper>
                </div>
              </div>
              <div className="mt-md flex flex-wrap items-center gap-sm">
                <Button variant="primary" onClick={handleSave}>Save changes</Button>
                <Button variant="outline" onClick={handleUpload}>Upload file</Button>
                <span className="text-xs text-muted">{statusMessage}</span>
                <span className="text-xs text-muted">{uploadMessage}</span>
              </div>
            </Card>
          ) : null}

          {activeTab === "options" && activeItem ? (
            <Card title="Options" subtitle="Add option groups and choices.">
              <div className="space-y-md">
                {optionGroups.length === 0 ? (
                  <EmptyState title="No options" description="Add option groups to this item." />
                ) : (
                  optionGroups.map((group) => (
                    <div key={group.id} className="rounded-lg border border-border bg-surface-alt p-md">
                      <div className="grid gap-md md:grid-cols-2">
                        <FieldWrapper label="Group name">
                          <Input value={group.name} onChange={(event) => handleUpdateGroup(group.id, { name: event.target.value })} />
                        </FieldWrapper>
                        <FieldWrapper label="Required">
                          <Select value={group.required ? "yes" : "no"} onChange={(event) => handleUpdateGroup(group.id, { required: event.target.value === "yes" })}>
                            <option value="no">Optional</option>
                            <option value="yes">Required</option>
                          </Select>
                        </FieldWrapper>
                        <FieldWrapper label="Min choices">
                          <Input type="number" value={group.min} onChange={(event) => handleUpdateGroup(group.id, { min: Number(event.target.value) })} />
                        </FieldWrapper>
                        <FieldWrapper label="Max choices">
                          <Input type="number" value={group.max} onChange={(event) => handleUpdateGroup(group.id, { max: Number(event.target.value) })} />
                        </FieldWrapper>
                      </div>
                      <div className="mt-md space-y-sm">
                        {group.choices.map((choice) => (
                          <div key={choice.id} className="grid gap-sm md:grid-cols-[2fr_1fr_auto] items-end">
                            <FieldWrapper label="Choice name">
                              <Input value={choice.name} onChange={(event) => handleUpdateChoice(group.id, choice.id, { name: event.target.value })} />
                            </FieldWrapper>
                            <FieldWrapper label="Extra price (?)">
                              <Input type="number" value={choice.price} onChange={(event) => handleUpdateChoice(group.id, choice.id, { price: Number(event.target.value) })} />
                            </FieldWrapper>
                            <Button variant="ghost" onClick={() => handleRemoveChoice(group.id, choice.id)}>Remove</Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => handleAddChoice(group.id)}>Add choice</Button>
                      </div>
                      <div className="mt-md flex justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveGroup(group.id)}>Remove group</Button>
                      </div>
                    </div>
                  ))
                )}
                <Button variant="outline" onClick={handleAddGroup}>Add option group</Button>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
