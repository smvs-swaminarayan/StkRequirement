"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useMemo } from "react";
import { ImagePlus, LockKeyhole, PencilLine, Trash2, Plus, X, Package } from "lucide-react";
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
  createItem,
  deleteItem,
  recoverItem,
  updateItem,
} from "@/lib/firebase/firestore";
import { canManageMasters } from "@/lib/permissions";
import type { ItemImageCrop, ItemRecord } from "@/lib/firebase/types";
import {
  DEFAULT_ITEM_IMAGE_CROP,
  getItemImageCropStyle,
  normalizeItemImageCrop,
} from "@/lib/item-image";

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

export function ItemsMasterView() {
  const { workspaceProfile: profile } = useAuth();
  const { loading, categories, items } = useWorkspaceData({
    fetchOrders: false,
    fetchStockEntries: false,
    fetchUsers: false,
  });
  const allItemsState = useFirestoreCollection<ItemRecord>("items");
  const [itemEditId, setItemEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [recoverModalOpen, setRecoverModalOpen] = useState(false);
  const [recoverSearch, setRecoverSearch] = useState("");
  const [additionalCropIndex, setAdditionalCropIndex] = useState<number | null>(null);
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
  const [itemUnitMode, setItemUnitMode] = useState<"preset" | "custom">("preset");
  const [itemPage, setItemPage] = useState(1);
  const [recoverPage, setRecoverPage] = useState(1);
  const [itemSearch, setItemSearch] = useState("");
  const [itemCategoryFilter, setItemCategoryFilter] = useState("all");
  const ITEMS_PER_PAGE = 10;

  const actor = profile
    ? {
        actorId: profile.uid,
        actorName: profile.displayName,
        actorRole: profile.role,
      }
    : undefined;

  const resetItemForm = () => {
    setItemForm({
      name: "",
      description: "",
      categoryId: "",
      unit: "piece",
      imageUrl: "",
      imageCrop: DEFAULT_ITEM_IMAGE_CROP,
      images: [],
      is_permission: "NO",
      active: true,
    });
    setItemUnitMode("preset");
    setItemEditId(null);
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setItemForm((current) => ({
        ...current,
        imageUrl: result,
        imageCrop: DEFAULT_ITEM_IMAGE_CROP,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAdditionalImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setItemForm((current) => ({
        ...current,
        images: [...current.images, { url: result, crop: DEFAULT_ITEM_IMAGE_CROP }],
      }));
    };
    reader.readAsDataURL(file);
  };

  const submitItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!itemForm.categoryId) {
      toast.error("Please choose a category.");
      return;
    }
    const category = categories.find((item) => String(item.id) === String(itemForm.categoryId));
    if (!category) {
      toast.error("Selected category does not exist.");
      return;
    }

    setSubmitting(true);
    try {
      if (itemEditId) {
        await updateItem(
          itemEditId,
          {
            name: itemForm.name,
            description: itemForm.description,
            categoryId: category.id,
            categoryName: category.name,
            unit: itemForm.unit,
            imageUrl: itemForm.imageUrl,
            imageCrop: itemForm.imageCrop,
            images: itemForm.images,
            is_permission: itemForm.is_permission,
            active: itemForm.active,
          },
          actor,
        );
        toast.success("Item updated.");
      } else {
        await createItem(
          {
            name: itemForm.name,
            description: itemForm.description,
            categoryId: category.id,
            categoryName: category.name,
            unit: itemForm.unit,
            imageUrl: itemForm.imageUrl,
            imageCrop: itemForm.imageCrop,
            images: itemForm.images,
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

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = itemCategoryFilter === "all" || String(item.categoryId) === String(itemCategoryFilter);
      const matchesSearch = itemSearch
        ? item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
          item.unit.toLowerCase().includes(itemSearch.toLowerCase()) ||
          (item.productId && item.productId.toLowerCase().includes(itemSearch.toLowerCase()))
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [items, itemCategoryFilter, itemSearch]);

  const paginatedItems = useMemo(() => {
    return filteredItems.slice((itemPage - 1) * ITEMS_PER_PAGE, itemPage * ITEMS_PER_PAGE);
  }, [filteredItems, itemPage]);

  const deletedItems = useMemo(() => {
    return allItemsState.items.filter((item) => Boolean(item.deletedAt));
  }, [allItemsState.items]);

  const filteredDeletedItems = useMemo(() => {
    return deletedItems.filter((item) => {
      return recoverSearch
        ? item.name.toLowerCase().includes(recoverSearch.toLowerCase()) ||
          item.categoryName.toLowerCase().includes(recoverSearch.toLowerCase())
        : true;
    });
  }, [deletedItems, recoverSearch]);

  const paginatedDeletedItems = useMemo(() => {
    return filteredDeletedItems.slice((recoverPage - 1) * ITEMS_PER_PAGE, recoverPage * ITEMS_PER_PAGE);
  }, [filteredDeletedItems, recoverPage]);

  const canManage = canManageMasters(profile);

  return (
    <AppShell title="Items Master">
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        {/* Form Panel */}
        {canManage ? (
          <Panel className="p-5 border border-gray-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                  <Package className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-gray-900">
                  {itemEditId ? "Edit Item" : "New Item Master"}
                </h2>
              </div>
              {itemEditId ? (
                <button
                  type="button"
                  onClick={resetItemForm}
                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              ) : null}
            </div>

            <form onSubmit={submitItem} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-700">Category *</label>
                <div className="mt-1">
                  <SearchableSelect
                    options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
                    value={itemForm.categoryId}
                    onChange={(val) => setItemForm((c) => ({ ...c, categoryId: val }))}
                    placeholder="Select Category"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Item Name *</label>
                <input
                  value={itemForm.name}
                  onChange={(e) => setItemForm((c) => ({ ...c, name: e.target.value }))}
                  required
                  placeholder="e.g. A4 Paper Rim"
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Unit *</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <select
                    value={itemUnitMode === "custom" ? CUSTOM_UNIT_KEY : itemForm.unit}
                    onChange={(e) => {
                      if (e.target.value === CUSTOM_UNIT_KEY) {
                        setItemUnitMode("custom");
                        setItemForm((c) => ({ ...c, unit: "" }));
                      } else {
                        setItemUnitMode("preset");
                        setItemForm((c) => ({ ...c, unit: e.target.value }));
                      }
                    }}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                    <option value={CUSTOM_UNIT_KEY}>Custom...</option>
                  </select>
                  {itemUnitMode === "custom" ? (
                    <input
                      value={itemForm.unit}
                      onChange={(e) => setItemForm((c) => ({ ...c, unit: e.target.value }))}
                      required
                      placeholder="Custom unit"
                      className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
                    />
                  ) : null}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Description</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm((c) => ({ ...c, description: e.target.value }))}
                  rows={2}
                  placeholder="Optional details"
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">P. Santo Permission Required?</label>
                <div className="mt-1 flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="is_permission"
                      value="YES"
                      checked={itemForm.is_permission === "YES"}
                      onChange={() => setItemForm((c) => ({ ...c, is_permission: "YES" }))}
                      className="text-amber-600"
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="is_permission"
                      value="NO"
                      checked={itemForm.is_permission === "NO"}
                      onChange={() => setItemForm((c) => ({ ...c, is_permission: "NO" }))}
                      className="text-amber-600"
                    />
                    No
                  </label>
                </div>
              </div>

              {/* Main Image Upload */}
              <div>
                <label className="text-xs font-bold text-gray-700">Product Image</label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                    }}
                    className="text-xs text-gray-500 file:mr-2 file:rounded-lg file:border-0 file:bg-amber-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-extrabold text-white hover:bg-amber-600 shadow-sm transition disabled:opacity-50"
              >
                {submitting ? "Saving..." : itemEditId ? "Update Item" : "Create Item"}
              </button>
            </form>
          </Panel>
        ) : null}

        {/* Data Table Panel */}
        <Panel className="p-5 border border-gray-200 bg-white shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">Items Catalog</h2>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                {filteredItems.length} Total
              </span>
            </div>

            <div className="flex items-center gap-2">
              {deletedItems.length > 0 && canManage ? (
                <button
                  type="button"
                  onClick={() => setRecoverModalOpen(true)}
                  className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition"
                >
                  Recover Deleted ({deletedItems.length})
                </button>
              ) : null}
            </div>
          </div>

          {/* Filters */}
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={itemSearch}
              onChange={(e) => {
                setItemSearch(e.target.value);
                setItemPage(1);
              }}
              placeholder="Search items..."
              className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
            />
            <select
              value={itemCategoryFilter}
              onChange={(e) => {
                setItemCategoryFilter(e.target.value);
                setItemPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-8 text-center text-xs text-gray-500">Loading items...</div>
          ) : filteredItems.length ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-gray-200 bg-gray-50 font-bold text-gray-700">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Item Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Unit</th>
                      <th className="p-3">Permission</th>
                      {canManage ? <th className="p-3 text-right">Actions</th> : null}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition">
                        <td className="p-3 font-semibold text-gray-500">{item.productId || "-"}</td>
                        <td className="p-3 font-bold text-gray-900">{item.name}</td>
                        <td className="p-3 text-gray-600">{item.categoryName}</td>
                        <td className="p-3 text-gray-600">{item.unit}</td>
                        <td className="p-3">
                          {item.is_permission === "YES" ? (
                            <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold text-red-600">
                              Permission
                            </span>
                          ) : (
                            <span className="text-gray-400 font-semibold">-</span>
                          )}
                        </td>
                        {canManage ? (
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setItemEditId(String(item.id));
                                  setItemForm({
                                    name: item.name,
                                    description: item.description || "",
                                    categoryId: String(item.categoryId),
                                    unit: item.unit,
                                    imageUrl: item.imageUrl || "",
                                    imageCrop: item.imageCrop || DEFAULT_ITEM_IMAGE_CROP,
                                    images: item.images || [],
                                    is_permission: item.is_permission || "NO",
                                    active: item.active !== false,
                                  });
                                  setItemUnitMode(isPresetUnit(item.unit) ? "preset" : "custom");
                                }}
                                className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                title="Edit"
                              >
                                <PencilLine className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm(`Delete item ${item.name}?`)) {
                                    await deleteItem(Number(item.id), actor);
                                    toast.success("Item deleted.");
                                  }
                                }}
                                className="rounded p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={itemPage}
                totalItems={filteredItems.length}
                pageSize={ITEMS_PER_PAGE}
                onPageChange={setItemPage}
              />
            </div>
          ) : (
            <EmptyState title="No items found" description="Create an item or adjust your search filters." />
          )}
        </Panel>
      </div>

      {/* Recover Deleted Modal */}
      <Modal open={recoverModalOpen} onClose={() => setRecoverModalOpen(false)} title="Recover Deleted Items">
        <div className="space-y-3 p-2">
          <input
            value={recoverSearch}
            onChange={(e) => {
              setRecoverSearch(e.target.value);
              setRecoverPage(1);
            }}
            placeholder="Search deleted items..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
          />
          {filteredDeletedItems.length ? (
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {paginatedDeletedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-xs font-bold text-gray-900">{item.name}</p>
                    <p className="text-[11px] text-gray-500">{item.categoryName} · {item.unit}</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await recoverItem(Number(item.id), actor);
                      toast.success(`Recovered ${item.name}`);
                    }}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 py-4 text-center">No deleted items to recover.</p>
          )}
        </div>
      </Modal>
    </AppShell>
  );
}
