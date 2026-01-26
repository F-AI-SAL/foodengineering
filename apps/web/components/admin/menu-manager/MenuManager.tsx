"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, apiFetchList, apiFetchPage, API_BASE } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";
import type { MenuItem, MenuItemOptionChoice, MenuItemOptionGroup } from "@/lib/types";
import { ErrorState, LoadingState } from "@/components/design-system/States";
import { MenuHeader } from "./MenuHeader";
import { CategorySidebar } from "./CategorySidebar";
import { MenuToolbar } from "./MenuToolbar";
import { MenuList } from "./MenuList";
import { MenuEditor } from "./MenuEditor";
import { OptionBuilder } from "./OptionBuilder";
import { createId } from "./utils";

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetchPage<MenuItem>("/menu", {}, page, pageSize),
      apiFetchList<SettingRecord>("/settings", {}, 1, 200)
    ])
      .then(([response, settings]) => {
        if (!active) {
          return;
        }
        const normalized = response.data.map((item) => ({
          ...item,
          price: Number(item.price),
          optionsJson: item.optionsJson ?? { groups: [] }
        }));
        setItems(normalized);
        setSelectedId(normalized[0]?.id ?? "");
        setTotalPages(response.totalPages);
        setTotal(response.total);

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
  }, [page, pageSize]);

  const activeItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0],
    [items, selectedId]
  );

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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    items.forEach((item) => {
      counts[item.category] = (counts[item.category] ?? 0) + 1;
    });
    return counts;
  }, [items]);

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

  return (
    <div className="space-y-2xl">
      <MenuHeader />

      {loading ? <LoadingState message="Loading menu..." /> : null}
      {error ? <ErrorState message={error} /> : null}

      <div className="grid gap-lg lg:grid-cols-[300px_1fr]">
        <CategorySidebar
          activeTab={activeTab}
          categoryInput={categoryInput}
          categories={categories}
          selectedCategory={selectedCategory}
          itemCounts={categoryCounts}
          onTabChange={setActiveTab}
          onCategoryInputChange={setCategoryInput}
          onAddCategory={handleAddCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div className="space-y-lg">
          <MenuToolbar search={search} onSearchChange={setSearch} />

          <MenuList
            items={groupedItems}
            selectedCategory={selectedCategory}
            onSelectItem={setSelectedId}
            onAddProduct={handleAddProduct}
            onToggleAvailability={handleToggleAvailability}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />

          {activeItem ? (
            <MenuEditor
              item={activeItem}
              categories={categories}
              uploadMessage={uploadMessage}
              statusMessage={statusMessage}
              onUpdate={handleUpdate}
              onSave={handleSave}
              onUpload={handleUpload}
              onUploadFileChange={setUploadFile}
            />
          ) : null}

          {activeTab === "options" && activeItem ? (
            <OptionBuilder
              groups={optionGroups}
              onAddGroup={handleAddGroup}
              onRemoveGroup={handleRemoveGroup}
              onUpdateGroup={handleUpdateGroup}
              onAddChoice={handleAddChoice}
              onUpdateChoice={handleUpdateChoice}
              onRemoveChoice={handleRemoveChoice}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
