"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useMemo } from "react";
import { ImagePlus, LockKeyhole, PencilLine, Trash2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { ImageCropEditor } from "@/components/ui/image-crop-editor";
import { Modal } from "@/components/ui/modal";
import { Panel } from "@/components/ui/panel";
import { Pagination } from "@/components/ui/pagination";
import { useAuth } from "@/components/providers/auth-provider";
import { useFirestoreCollection } from "@/hooks/use-firestore-collection";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import {
  createCategory,
  createItem,
  createStockEntry,
  deleteCategory,
  deleteItem,
  deleteStockEntry,
  recoverItem,
  updateCategory,
  updateItem,
  updateStockEntry,
} from "@/lib/firebase/firestore";
import {
  canManageCategory,
  canManageMasters,
  getAssignedCategoryIds,
  isLeader,
} from "@/lib/permissions";
import type { ItemImageCrop, ItemRecord } from "@/lib/firebase/types";
import {
  DEFAULT_ITEM_IMAGE_CROP,
  getItemImageCropStyle,
  normalizeItemImageCrop,
} from "@/lib/item-image";
import { formatDate, formatQty } from "@/lib/utils";

const CUSTOM_UNIT_KEY = "__custom__";
const UNIT_OPTIONS = [
  { value: "piece", label: "Piece" },
  { value: "number", label: "Number" },
  { value: "kg", label: "Kilogram" },
  { value: "gram", label: "Gram" },
  { value: "liter", label: "Liter" },
  { value: "ml", label: "Milliliter" },
  { value: "box", label: "Box" },
  { value: "packet", label: "Packet" },
  { value: "set", label: "Set" },
];

function isPresetUnit(value: string) {
  return UNIT_OPTIONS.some((option) => option.value === value);
}

export function MastersView() {
  const { workspaceProfile: profile } = useAuth();
  const { loading, categories, items, stockEntries } = useWorkspaceData();
  const allItemsState = useFirestoreCollection<ItemRecord>("items");
  const [categoryEditId, setCategoryEditId] = useState<string | null>(null);
  const [itemEditId, setItemEditId] = useState<string | null>(null);
  const [stockEditId, setStockEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [recoverModalOpen, setRecoverModalOpen] = useState(false);
  const [recoverSearch, setRecoverSearch] = useState("");
  const [additionalCropIndex, setAdditionalCropIndex] = useState<number | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", active: true });
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    unit: "piece",
    imageUrl: "",
    imageCrop: DEFAULT_ITEM_IMAGE_CROP,
    images: [] as Array<{ url: string; crop?: ItemImageCrop | null }>,
    is_permission: "NO" as "YES" | "NO",
    active: true,
  });
  const [stockForm, setStockForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    categoryId: "",
    itemId: "",
    qty: 1,
    notes: "",
  });
  const [itemUnitMode, setItemUnitMode] = useState<"preset" | "custom">("preset");
  const [categoryPage, setCategoryPage] = useState(1);
  const [itemPage, setItemPage] = useState(1);
  const [stockPage, setStockPage] = useState(1);
  const [recoverPage, setRecoverPage] = useState(1);
  const [itemSearch, setItemSearch] = useState("");
  const [itemCategoryFilter, setItemCategoryFilter] = useState("all");
  const [stockSearch, setStockSearch] = useState("");
  const [stockCategoryFilter, setStockCategoryFilter] = useState("all");
  const ITEMS_PER_PAGE = 10;
  const actor = profile
    ? { actorId: profile.uid, actorName: profile.displayName, actorRole: profile.role }
    : undefined;

  // Leaders: get ALL assigned category IDs (supports multi-category leaders)
  const leaderCategoryIds: string[] = isLeader(profile)
    ? (() => {
        const assigned = getAssignedCategoryIds(profile);
        const valid = assigned.filter((id) => categories.some((c) => String(c.id) === String(id)));
        return valid.length > 0 ? valid : categories.map((c) => String(c.id));
      })()
    : [];
  const isLeaderLocked = isLeader(profile) && leaderCategoryIds.length === 1;
  const lockedLeaderCategoryId = isLeaderLocked ? leaderCategoryIds[0] : null;

  const itemCategoryOptions = isLeader(profile)
    ? categories.filter((category) => leaderCategoryIds.some(id => String(id) === String(category.id)))
    : categories;
  const stockCategoryOptions = isLeader(profile)
    ? categories.filter((category) => leaderCategoryIds.some(id => String(id) === String(category.id)))
    : categories;
  const stockItems = items.filter((item) =>
    stockForm.categoryId ? String(item.categoryId) === String(stockForm.categoryId) : true,
  );
  const selectedStockItem = items.find((item) => String(item.id) === String(stockForm.itemId));
  const selectedStockUnit =
    selectedStockItem?.unit ?? stockEntries.find((entry) => entry.id === stockEditId)?.unit ?? "";
  const itemCategorySearchOptions = useMemo(() => {
    return itemCategoryOptions.map(c => ({ value: String(c.id), label: c.name }));
  }, [itemCategoryOptions]);

  const stockCategorySearchOptions = useMemo(() => {
    return stockCategoryOptions.map(c => ({ value: String(c.id), label: c.name }));
  }, [stockCategoryOptions]);

  const stockItemSearchOptions = useMemo(() => {
    return stockItems.map(i => ({ value: String(i.id), label: i.name }));
  }, [stockItems]);
  const itemPreviewUrl = itemForm.imageUrl.trim();
  const itemUnitValue =
    itemUnitMode === "custom"
      ? CUSTOM_UNIT_KEY
      : isPresetUnit(itemForm.unit)
        ? itemForm.unit
        : CUSTOM_UNIT_KEY;

  const recoverableItems = allItemsState.items
    .filter((item) => Boolean(item.deletedAt) && item.active === false)
    .filter((item) =>
      isLeader(profile)
        ? leaderCategoryIds.length
          ? leaderCategoryIds.includes(String(item.categoryId))
          : false
        : true,
    )
    .filter((item) => {
      const q = recoverSearch.trim().toLowerCase();
      if (!q) return true;
      return `${item.name || ""} ${item.categoryName || ""}`.toLowerCase().includes(q);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const paginatedCategories = categories.slice((categoryPage - 1) * ITEMS_PER_PAGE, categoryPage * ITEMS_PER_PAGE);
  const totalCategoryPages = Math.ceil(categories.length / ITEMS_PER_PAGE);

  const filteredItems = items.filter(item => {
    if (itemCategoryFilter !== "all" && String(item.categoryId) !== String(itemCategoryFilter)) return false;
    if (itemSearch && !(item.name || "").toLowerCase().includes(itemSearch.toLowerCase())) return false;
    return true;
  });
  const paginatedItems = filteredItems.slice((itemPage - 1) * ITEMS_PER_PAGE, itemPage * ITEMS_PER_PAGE);
  const totalItemPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const filteredStockEntries = stockEntries.filter(entry => {
    if (stockCategoryFilter !== "all" && String(entry.categoryId) !== String(stockCategoryFilter)) return false;
    if (stockSearch && !(entry.itemName || "").toLowerCase().includes(stockSearch.toLowerCase())) return false;
    return true;
  });
  const paginatedStockEntries = filteredStockEntries.slice((stockPage - 1) * ITEMS_PER_PAGE, stockPage * ITEMS_PER_PAGE);
  const totalStockPages = Math.ceil(filteredStockEntries.length / ITEMS_PER_PAGE);

  const paginatedRecoverableItems = recoverableItems.slice((recoverPage - 1) * ITEMS_PER_PAGE, recoverPage * ITEMS_PER_PAGE);
  const totalRecoverPages = Math.ceil(recoverableItems.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (lockedLeaderCategoryId) {
      setItemForm((current) =>
        current.categoryId === lockedLeaderCategoryId
          ? current
          : { ...current, categoryId: lockedLeaderCategoryId },
      );
      return;
    }

    if (!itemForm.categoryId && itemCategoryOptions[0]) {
      setItemForm((current) => ({ ...current, categoryId: itemCategoryOptions[0].id }));
    }
  }, [itemCategoryOptions, itemForm.categoryId, lockedLeaderCategoryId]);

  useEffect(() => {
    if (lockedLeaderCategoryId) {
      setStockForm((current) =>
        current.categoryId === lockedLeaderCategoryId
          ? current
          : { ...current, categoryId: lockedLeaderCategoryId, itemId: "" },
      );
      return;
    }

    if (!stockForm.categoryId && stockCategoryOptions[0]) {
      setStockForm((current) => ({ ...current, categoryId: stockCategoryOptions[0].id }));
    }
  }, [lockedLeaderCategoryId, stockCategoryOptions, stockForm.categoryId]);

  useEffect(() => {
    if (!stockItems.length) {
      return;
    }

    if (!stockForm.itemId || !stockItems.some((item) => String(item.id) === String(stockForm.itemId))) {
      setStockForm((current) => ({ ...current, itemId: stockItems[0].id }));
    }
  }, [stockForm.itemId, stockItems]);

  if (!canManageMasters(profile)) {
    return (
      <AppShell title="Masters">
        <Panel className="p-8">
          <EmptyState
            title="Restricted"
            description="You do not have permission to open category, item, and stock masters."
          />
        </Panel>
      </AppShell>
    );
  }

  const resetCategoryForm = () => {
    setCategoryEditId(null);
    setCategoryForm({ name: "", description: "", active: true });
  };

  const resetItemForm = () => {
    setItemEditId(null);
    setItemUnitMode("preset");
    setAdditionalCropIndex(null);
    setItemForm({
      name: "",
      description: "",
      categoryId: lockedLeaderCategoryId ?? itemCategoryOptions[0]?.id ?? "",
      unit: "piece",
      imageUrl: "",
      imageCrop: DEFAULT_ITEM_IMAGE_CROP,
      images: [],
      is_permission: "NO",
      active: true,
    });
  };

  const resetStockForm = () => {
    setStockEditId(null);
    setStockForm({
      date: new Date().toISOString().slice(0, 10),
      categoryId: lockedLeaderCategoryId ?? stockCategoryOptions[0]?.id ?? "",
      itemId: "",
      qty: 1,
      notes: "",
    });
  };

  const submitCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (categoryEditId) {
        await updateCategory(categoryEditId, categoryForm, actor);
        toast.success("Category updated.");
      } else {
        await createCategory(categoryForm, actor);
        toast.success("Category created.");
      }
      resetCategoryForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save category.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const nextCategoryId = lockedLeaderCategoryId ?? itemForm.categoryId;
      const categoryName = categories.find((entry) => String(entry.id) === String(nextCategoryId))?.name ?? "";
      const unit = itemForm.unit.trim();
      const imageUrl = itemForm.imageUrl.trim();
      const imageCrop = imageUrl ? normalizeItemImageCrop(itemForm.imageCrop) : null;

      if (!nextCategoryId || !categoryName) {
        throw new Error("Select a valid category.");
      }

      if (!unit) {
        throw new Error("Select or enter a unit.");
      }

      if (itemEditId) {
        await updateItem(
          itemEditId,
          {
            ...itemForm,
            categoryId: nextCategoryId,
            categoryName,
            unit,
            imageUrl: imageUrl || null,
            imagePath: null,
            imageCrop,
            is_permission: itemForm.is_permission,
          },
          actor,
        );
        toast.success("Item updated.");
      } else {
        await createItem(
          {
            ...itemForm,
            categoryId: nextCategoryId,
            categoryName,
            unit,
            imageUrl: imageUrl || null,
            imagePath: null,
            imageCrop,
            is_permission: itemForm.is_permission,
          },
          actor,
        );
        toast.success("Item created.");
      }

      resetItemForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save item.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitStock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setSubmitting(true);

    try {
      const categoryId = lockedLeaderCategoryId ?? stockForm.categoryId;
      const categoryName = categories.find((entry) => String(entry.id) === String(categoryId))?.name ?? "";
      const item = items.find((entry) => String(entry.id) === String(stockForm.itemId));
      const itemName = item?.name ?? "";
      const unit = item?.unit ?? selectedStockUnit ?? "";

      if (!categoryId || !categoryName || !item) {
        throw new Error("Select a valid category and item.");
      }

      if (stockEditId) {
        await updateStockEntry(
          stockEditId,
          {
            ...stockForm,
            categoryId: Number(categoryId),
            categoryName,
            itemId: Number(stockForm.itemId),
            itemName,
            qty: Number(stockForm.qty),
            unit
          },
          actor,
        );
        toast.success("Stock entry updated.");
      } else {
        await createStockEntry(
          {
            ...stockForm,
            categoryId: Number(categoryId),
            categoryName,
            itemId: Number(stockForm.itemId),
            itemName,
            qty: Number(stockForm.qty),
            unit,
            createdById: profile.uid,
            createdByName: profile.displayName,
          },
          actor,
        );
        toast.success("Stock entry saved.");
      }

      resetStockForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save stock entry.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditItem = (item: ItemRecord) => {
    setItemEditId(item.id);
    setItemUnitMode(isPresetUnit(item.unit) ? "preset" : "custom");
    setAdditionalCropIndex(null);
    setItemForm({
      name: item.name,
      description: item.description ?? "",
      categoryId: lockedLeaderCategoryId ?? item.categoryId,
      unit: item.unit,
      imageUrl: item.imageUrl ?? "",
      imageCrop: normalizeItemImageCrop(item.imageCrop),
      images: item.images ?? [],
      is_permission: item.is_permission === "YES" ? "YES" : "NO",
      active: item.active,
    });
  };

  return (
    <AppShell title="Masters">
      {loading ? (
        <Panel className="p-8 text-sm text-[var(--ink-soft)]">Loading masters...</Panel>
      ) : (
        <>
          {canManageCategory(profile) ? (
            <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <Panel className="p-4">
                <p className="section-kicker">Category Master</p>
                <h3 className="mt-1 text-lg font-bold text-[var(--ink)]">
                  {categoryEditId ? "Edit category" : "Create category"}
                </h3>
                <form className="mt-4 space-y-3" onSubmit={submitCategory}>
                  <label className="block text-sm font-semibold text-[var(--ink)]">
                    Category name
                    <input
                      value={categoryForm.name}
                      onChange={(event) =>
                        setCategoryForm((current) => ({ ...current, name: event.target.value }))
                      }
                      className="stk-input mt-1.5"
                      required
                    />
                  </label>
                  <label className="block text-sm font-semibold text-[var(--ink)]">
                    Description
                    <textarea
                      value={categoryForm.description}
                      onChange={(event) =>
                        setCategoryForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      rows={3}
                      className="stk-input mt-1.5"
                    />
                  </label>
                  {categoryEditId ? (
                    <label className="inline-flex items-center gap-3 text-sm text-[var(--ink-soft)]">
                      <input
                        type="checkbox"
                        checked={categoryForm.active}
                        onChange={(event) =>
                          setCategoryForm((current) => ({
                            ...current,
                            active: event.target.checked,
                          }))
                        }
                      />
                      Active
                    </label>
                  ) : null}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-action"
                    >
                      {categoryEditId ? "Update category" : "Create category"}
                    </button>
                    {categoryEditId ? (
                      <button
                        type="button"
                        onClick={resetCategoryForm}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </form>
              </Panel>

              <Panel className="p-4">
                <h3 className="text-lg font-bold text-[var(--ink)]">
                  Category list
                </h3>
                {categories.length ? (
                  <>
                  <div className="hide-scrollbar mt-4 overflow-auto">
                    <table className="stk-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Description</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCategories.map((category) => (
                          <tr key={category.id}>
                            <td className="font-semibold">
                              {category.name}
                            </td>
                            <td className="text-[var(--ink-soft)]">
                              {category.description || "--"}
                            </td>
                            <td>{category.active ? "Active" : "Inactive"}</td>
                            <td>
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCategoryEditId(category.id);
                                    setCategoryForm({
                                      name: category.name,
                                      description: category.description,
                                      active: category.active,
                                    });
                                  }}
                                  className="rounded-[var(--radius-sm)] border border-[var(--border)] p-1.5 text-[var(--ink-soft)] hover:bg-[var(--paper)] transition"
                                >
                                  <PencilLine className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await deleteCategory(category.id, actor);
                                    toast.success("Category deleted.");
                                    if (categoryEditId === category.id) {
                                      resetCategoryForm();
                                    }
                                  }}
                                  className="rounded-[var(--radius-sm)] border border-[var(--border)] p-1.5 text-[var(--danger)] hover:bg-[var(--danger-soft)] transition"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination currentPage={categoryPage} totalPages={totalCategoryPages} onPageChange={setCategoryPage} />
                  </>
                ) : (
                  <div className="mt-6">
                    <EmptyState
                      title="No categories"
                      description="Create the first category to unlock item and stock masters."
                    />
                  </div>
                )}
              </Panel>
            </section>
          ) : null}

          <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            {(() => {
              const itemFormContent = (
                <form className="mt-4 space-y-3" onSubmit={submitItem}>
                <label className="block text-sm font-semibold text-[var(--ink)]">
                  Category
                  {lockedLeaderCategoryId ? (
                    <input
                      type="text"
                      className="stk-input mt-1.5 bg-gray-100 cursor-not-allowed"
                      value={itemCategoryOptions[0]?.name ?? ""}
                      disabled
                    />
                  ) : (
                    <SearchableSelect
                      className="mt-1.5"
                      value={String(itemForm.categoryId)}
                      onChange={(val) => setItemForm((current) => ({ ...current, categoryId: val }))}
                      options={itemCategorySearchOptions}
                      placeholder="Select a category..."
                    />
                  )}
                </label>

                <label className="block text-sm font-semibold text-[var(--ink)]">
                  Item name
                  <input
                    value={itemForm.name}
                    onChange={(event) =>
                      setItemForm((current) => ({ ...current, name: event.target.value }))
                    }
                    className="stk-input mt-1.5"
                    required
                  />
                </label>

                <label className="block text-sm font-semibold text-[var(--ink)]">
                  Permission Required (P. Santo)
                  <select
                    value={itemForm.is_permission || "NO"}
                    onChange={(event) =>
                      setItemForm((current) => ({
                        ...current,
                        is_permission: event.target.value as "YES" | "NO",
                      }))
                    }
                    className="stk-select mt-1.5"
                  >
                    <option value="NO">No Permission Required</option>
                    <option value="YES">YES - P. Santo ni permission farjiyat che</option>
                  </select>
                </label>

                <label className="block text-sm font-semibold text-[var(--ink)]">
                  Description
                  <textarea
                    value={itemForm.description}
                    onChange={(event) =>
                      setItemForm((current) => ({ ...current, description: event.target.value }))
                    }
                    rows={2}
                    className="stk-input mt-1.5"
                    placeholder="Item description (optional)"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
                  <label className="block text-sm text-[var(--ink-soft)]">
                    Unit
                    <select
                      value={itemUnitValue}
                      onChange={(event) => {
                        if (event.target.value === CUSTOM_UNIT_KEY) {
                          setItemUnitMode("custom");
                          setItemForm((current) => ({
                            ...current,
                            unit: isPresetUnit(current.unit) ? "" : current.unit,
                          }));
                          return;
                        }

                        setItemUnitMode("preset");
                        setItemForm((current) => ({ ...current, unit: event.target.value }));
                      }}
                      className="mt-2 w-full rounded-[18px] border border-[var(--border)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--primary)]"
                    >
                      {UNIT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                      <option value={CUSTOM_UNIT_KEY}>Custom unit</option>
                    </select>
                  </label>

                  {itemUnitMode === "custom" ? (
                    <label className="block text-sm text-[var(--ink-soft)]">
                      Custom unit
                      <input
                        value={itemForm.unit}
                        onChange={(event) =>
                          setItemForm((current) => ({ ...current, unit: event.target.value }))
                        }
                        placeholder="eg. roll, pair, tray"
                        className="mt-2 w-full rounded-[18px] border border-[var(--border)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--primary)]"
                        required
                      />
                    </label>
                  ) : (
                    <div className="rounded-[22px] border border-[var(--border)] bg-white/76 px-4 py-4 text-sm text-[var(--ink-soft)]">
                      This unit will be used in stock entries and stock reports.
                    </div>
                  )}
                </div>

                <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-white/72 p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--ink)]">Item image</p>
                      <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
                        Paste a public image link. Drag to crop, scroll to zoom.
                      </p>
                    </div>
                    <label className="block text-sm text-[var(--ink-soft)]">
                      Image link
                      <input
                        type="url"
                        value={itemForm.imageUrl}
                        onChange={(event) =>
                          setItemForm((current) => ({
                            ...current,
                            imageUrl: event.target.value,
                            imageCrop: normalizeItemImageCrop(current.imageCrop),
                          }))
                        }
                        placeholder="https://example.com/item-image.jpg"
                        className="mt-2 w-full rounded-[18px] border border-[var(--border)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--primary)]"
                      />
                    </label>
                    {itemPreviewUrl ? (
                      <ImageCropEditor
                        imageUrl={itemPreviewUrl}
                        crop={itemForm.imageCrop}
                        onChange={(nextCrop) =>
                          setItemForm((current) => ({ ...current, imageCrop: nextCrop }))
                        }
                        onRemove={() =>
                          setItemForm((current) => ({
                            ...current,
                            imageUrl: "",
                            imageCrop: DEFAULT_ITEM_IMAGE_CROP,
                          }))
                        }
                      />
                    ) : null}
                  </div>
                </div>

                {/* ─── Additional Images (up to 3) ───────── */}
                <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--paper)] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--ink)]">Additional images</p>
                      <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                        Add up to 3 extra images for this item.
                      </p>
                    </div>
                    {itemForm.images.length < 3 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setItemForm((current) => ({
                            ...current,
                            images: [...current.images, { url: "", crop: null }],
                          }))
                        }
                        className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--paper)] transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add image
                      </button>
                    ) : null}
                  </div>
                  {itemForm.images.length > 0 ? (
                    <div className="space-y-2">
                      {itemForm.images.map((img, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-white">
                            {img.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={img.url}
                                alt={`Image ${idx + 1}`}
                                className="h-full w-full object-cover"
                                style={getItemImageCropStyle(img.crop)}
                              />
                            ) : (
                              <ImagePlus className="h-4 w-4 text-[var(--ink-light)]" />
                            )}
                          </div>
                          <input
                            type="url"
                            value={img.url}
                            onChange={(event) => {
                              const next = [...itemForm.images];
                              next[idx] = {
                                ...next[idx],
                                url: event.target.value,
                                crop: next[idx]?.crop ?? DEFAULT_ITEM_IMAGE_CROP,
                              };
                              setItemForm((current) => ({ ...current, images: next }));
                            }}
                            placeholder={`Image ${idx + 1} URL`}
                            className="stk-input flex-1 py-2"
                          />
                          {img.url ? (
                            <button
                              type="button"
                              className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--paper)] transition"
                              onClick={() => {
                                setAdditionalCropIndex(idx);
                              }}
                            >
                              Crop
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => {
                              const next = itemForm.images.filter((_, i) => i !== idx);
                              setItemForm((current) => ({ ...current, images: next }));
                            }}
                            className="rounded-lg border border-[var(--border)] p-2 text-[var(--danger)] hover:bg-[var(--danger-soft)] transition"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--ink-light)]">No additional images added yet.</p>
                  )}

                  {additionalCropIndex !== null && itemForm.images[additionalCropIndex]?.url ? (
                    <div className="mt-4">
                      <ImageCropEditor
                        imageUrl={itemForm.images[additionalCropIndex]!.url}
                        crop={normalizeItemImageCrop(itemForm.images[additionalCropIndex]!.crop)}
                        onChange={(nextCrop) => {
                          setItemForm((current) => {
                            const next = [...current.images];
                            next[additionalCropIndex] = {
                              ...next[additionalCropIndex],
                              crop: nextCrop,
                            };
                            return { ...current, images: next };
                          });
                        }}
                        onRemove={() => {
                          setItemForm((current) => {
                            const next = [...current.images];
                            next[additionalCropIndex] = { url: "", crop: null };
                            return { ...current, images: next };
                          });
                          setAdditionalCropIndex(null);
                        }}
                      />
                    </div>
                  ) : null}
                </div>

                {itemEditId ? (
                  <label className="inline-flex items-center gap-3 text-sm text-[var(--ink-soft)]">
                    <input
                      type="checkbox"
                      checked={itemForm.active}
                      onChange={(event) =>
                        setItemForm((current) => ({
                          ...current,
                          active: event.target.checked,
                        }))
                      }
                    />
                    Active
                  </label>
                ) : null}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-action"
                  >
                    {itemEditId ? "Update item" : "Create item"}
                  </button>
                  {itemEditId ? (
                    <button
                      type="button"
                      onClick={resetItemForm}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
                </form>
              );

              return (
                <>
                  <Panel className="p-4">
                    <p className="section-kicker">Item Master</p>
                    <div className="mt-1 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-[var(--ink)]">
                          {itemEditId ? "Edit item" : "Create item"}
                        </h3>
                        {isLeader(profile) && leaderCategoryIds.length > 0 ? (
                          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--primary)]">
                            <LockKeyhole className="h-3.5 w-3.5" />
                            {isLeaderLocked
                              ? `Locked: ${itemCategoryOptions[0]?.name ?? "category"}`
                              : `${leaderCategoryIds.length} categories assigned`}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    
                    {!itemEditId ? itemFormContent : (
                      <div className="mt-6 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] p-8 text-center bg-[var(--paper)]">
                        <p className="text-sm font-semibold text-[var(--ink)]">Editing item in popup</p>
                        <button type="button" onClick={resetItemForm} className="mt-3 btn-secondary">
                          Cancel edit and create new
                        </button>
                      </div>
                    )}
                  </Panel>

                  <Modal
                    open={!!itemEditId}
                    onClose={resetItemForm}
                    title="Edit item"
                    description="Update the details of this item."
                  >
                    {itemEditId && itemFormContent}
                  </Modal>
                </>
              );
            })()}

            <Panel className="p-4">
              <h3 className="text-lg font-bold text-[var(--ink)]">
                Item list
              </h3>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-[var(--ink-soft)]">
                  Active + inactive items are shown here. Deleted items are hidden.
                </p>
                {recoverableItems.length ? (
                  <button
                    type="button"
                    onClick={() => setRecoverModalOpen(true)}
                    className="btn-secondary"
                  >
                    Recover Deactivated Items ({recoverableItems.length})
                  </button>
                ) : null}
              </div>
              <div className="mt-4 mb-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={itemSearch}
                  onChange={(e) => { setItemSearch(e.target.value); setItemPage(1); }}
                  className="stk-input w-full max-w-xs"
                />
                <select
                  value={itemCategoryFilter}
                  onChange={(e) => { setItemCategoryFilter(e.target.value); setItemPage(1); }}
                  className="stk-select w-full max-w-[200px]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {filteredItems.length ? (
                <>
                <div className="hide-scrollbar mt-4 overflow-auto">
                  <table className="stk-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Unit</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedItems.map((item) => (
                        <tr key={item.id} className="border-b border-[var(--border)]/60">
                          <td className="py-3 pr-4">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--primary-soft)]/25">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                  style={getItemImageCropStyle(item.imageCrop)}
                                />
                              ) : (
                                <ImagePlus className="h-4 w-4 text-[var(--ink-soft)]" />
                              )}
                            </div>
                          </td>
                          <td
                            className={
                              item.active !== false
                                ? "py-3 pr-4 font-medium text-[var(--ink)]"
                                : "py-3 pr-4 font-medium text-[var(--ink-light)]"
                            }
                          >
                            <div className="flex items-center gap-2">
                              <span>{item.name}</span>
                              {item.is_permission === "YES" ? (
                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-300">
                                  ⚠️ P. Santo Permission
                                </span>
                              ) : null}
                              {item.active === false ? (
                                <span className="text-xs font-bold text-[var(--danger)]">
                                  (Inactive)
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-[var(--ink-soft)]">{item.categoryName}</td>
                          <td className="py-3 pr-4">{item.unit}</td>
                          <td className="py-3 pr-4">
                            {item.active !== false ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Active</span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">Inactive</span>
                            )}
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEditItem(item)}
                                className="rounded-full border border-[var(--border)] p-2 text-[var(--ink-soft)]"
                              >
                                <PencilLine className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await deleteItem(item.id, actor);
                                  toast.success("Item deleted.");
                                  if (itemEditId === item.id) {
                                    resetItemForm();
                                  }
                                }}
                                className="rounded-full border border-[var(--border)] p-2 text-[var(--danger)]"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination currentPage={itemPage} totalPages={totalItemPages} onPageChange={setItemPage} />
                </>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    title="No items"
                    description="Create items after categories so users can place orders."
                  />
                </div>
              )}
            </Panel>
          </section>

          <Modal
            open={recoverModalOpen}
            onClose={() => setRecoverModalOpen(false)}
            title="Recover deactivated items"
            description="These items were hidden due to a previous bug (deletedAt set). Search and activate to restore them."
          >
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-[var(--ink)]">
                Search item
                <input
                  value={recoverSearch}
                  onChange={(e) => setRecoverSearch(e.target.value)}
                  placeholder="Type item name..."
                  className="stk-input mt-1.5"
                />
              </label>

              {recoverableItems.length ? (
                <>
                <div className="hide-scrollbar max-h-[360px] overflow-auto rounded-[var(--radius-lg)] border border-[var(--border)]">
                  <table className="stk-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRecoverableItems.map((item) => (
                        <tr key={item.id}>
                          <td className="font-semibold text-[var(--ink)]">{item.name}</td>
                          <td className="text-[var(--ink-soft)]">{item.categoryName}</td>
                          <td>
                            <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                              Hidden (deletedAt)
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-action"
                              disabled={submitting}
                              onClick={async () => {
                                try {
                                  setSubmitting(true);
                                  await recoverItem(item.id, actor);
                                  toast.success("Item recovered and activated.");
                                } catch (error) {
                                  toast.error(
                                    error instanceof Error ? error.message : "Unable to recover item.",
                                  );
                                } finally {
                                  setSubmitting(false);
                                }
                              }}
                            >
                              Activate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination currentPage={recoverPage} totalPages={totalRecoverPages} onPageChange={setRecoverPage} />
                </>
              ) : (
                <EmptyState
                  title="No recoverable items"
                  description="No hidden (deletedAt) inactive items found for your scope."
                />
              )}
            </div>
          </Modal>

          <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <Panel className="p-4">
              <p className="section-kicker">Stock In Master</p>
              <h3 className="mt-1 text-lg font-bold text-[var(--ink)]">
                {stockEditId ? "Edit stock entry" : "Create stock entry"}
              </h3>
              <div className="mt-5 rounded-[24px] border border-[var(--border)] bg-white/72 p-4">
                <p className="text-sm font-semibold text-[var(--ink)]">
                  `Stock In` means inward stock entry.
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                  Jyaare store ma navo maal ave, tyaare aa form ma entry karo. Aa thi available
                  balance, stock out ane report sachi rite calculate thai shake.
                </p>
              </div>

              {stockCategoryOptions.length && stockItems.length ? (
                <form className="mt-6 space-y-4" onSubmit={submitStock}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm text-[var(--ink-soft)]">
                      Date
                      <input
                        type="date"
                        value={stockForm.date}
                        onChange={(event) =>
                          setStockForm((current) => ({ ...current, date: event.target.value }))
                        }
                        className="mt-2 w-full rounded-[18px] border border-[var(--border)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--primary)]"
                        required
                      />
                    </label>
                    <label className="text-sm text-[var(--ink-soft)]">
                      Quantity {selectedStockUnit ? `(${selectedStockUnit})` : ""}
                      <input
                        type="number"
                        min={1}
                        value={stockForm.qty}
                        onChange={(event) =>
                          setStockForm((current) => ({
                            ...current,
                            qty: Number(event.target.value),
                          }))
                        }
                        className="mt-2 w-full rounded-[18px] border border-[var(--border)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--primary)]"
                        required
                      />
                    </label>
                  </div>

                  <label className="block text-sm text-[var(--ink-soft)]">
                    Category
                    {lockedLeaderCategoryId ? (
                      <input
                        type="text"
                        className="stk-input mt-2 w-full bg-gray-100 cursor-not-allowed"
                        value={stockCategoryOptions[0]?.name ?? ""}
                        disabled
                      />
                    ) : (
                      <SearchableSelect
                        className="mt-2"
                        value={String(stockForm.categoryId)}
                        onChange={(val) =>
                          setStockForm((current) => ({
                            ...current,
                            categoryId: val,
                            itemId: "",
                          }))
                        }
                        options={stockCategorySearchOptions}
                        placeholder="Select category..."
                      />
                    )}
                  </label>

                  <label className="block text-sm text-[var(--ink-soft)]">
                    Item name
                    <SearchableSelect
                      className="mt-2"
                      value={String(stockForm.itemId)}
                      onChange={(val) =>
                        setStockForm((current) => ({ ...current, itemId: val }))
                      }
                      options={stockItemSearchOptions}
                      placeholder="Select item..."
                    />
                  </label>

                  <label className="block text-sm text-[var(--ink-soft)]">
                    Notes
                    <textarea
                      value={stockForm.notes}
                      onChange={(event) =>
                        setStockForm((current) => ({ ...current, notes: event.target.value }))
                      }
                      rows={3}
                      placeholder="Optional inward note, invoice note, supplier detail..."
                      className="mt-2 w-full rounded-[18px] border border-[var(--border)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--primary)]"
                    />
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-action"
                    >
                      {stockEditId ? "Update stock" : "Save stock"}
                    </button>
                    {stockEditId ? (
                      <button
                        type="button"
                        onClick={resetStockForm}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </form>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    title="No stock targets"
                    description="Create at least one item in your available category before adding stock."
                  />
                </div>
              )}
            </Panel>

            <Panel className="p-4">
              <h3 className="text-lg font-bold text-[var(--ink)]">
                Stock entry list
              </h3>
              <div className="mt-4 mb-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Search stock by item..."
                  value={stockSearch}
                  onChange={(e) => { setStockSearch(e.target.value); setStockPage(1); }}
                  className="stk-input w-full max-w-xs"
                />
                <select
                  value={stockCategoryFilter}
                  onChange={(e) => { setStockCategoryFilter(e.target.value); setStockPage(1); }}
                  className="stk-select w-full max-w-[200px]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {filteredStockEntries.length ? (
                <>
                <div className="hide-scrollbar mt-4 overflow-auto">
                  <table className="stk-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Created by</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedStockEntries.map((entry) => (
                        <tr key={entry.id} className="border-b border-[var(--border)]/60">
                          <td className="py-3 pr-4">{formatDate(entry.date || entry.createdAt)}</td>
                          <td className="py-3 pr-4">{entry.categoryName}</td>
                          <td className="py-3 pr-4 font-medium text-[var(--ink)]">{entry.itemName}</td>
                          <td className="py-3 pr-4">
                            {formatQty(entry.qty)} {entry.unit || ""}
                          </td>
                          <td className="py-3 pr-4">{entry.createdByName}</td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setStockEditId(entry.id);
                                  setStockForm({
                                    date: entry.date,
                                    categoryId: lockedLeaderCategoryId ?? entry.categoryId,
                                    itemId: entry.itemId,
                                    qty: entry.qty,
                                    notes: entry.notes,
                                  });
                                }}
                                className="rounded-full border border-[var(--border)] p-2 text-[var(--ink-soft)]"
                              >
                                <PencilLine className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await deleteStockEntry(entry.id, actor);
                                  toast.success("Stock entry deleted.");
                                  if (stockEditId === entry.id) {
                                    resetStockForm();
                                  }
                                }}
                                className="rounded-full border border-[var(--border)] p-2 text-[var(--danger)]"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination currentPage={stockPage} totalPages={totalStockPages} onPageChange={setStockPage} />
                </>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    title="No stock entries"
                    description="Add stock-in records to generate stock reports and available balances."
                  />
                </div>
              )}
            </Panel>
          </section>
        </>
      )}
    </AppShell>
  );
}
