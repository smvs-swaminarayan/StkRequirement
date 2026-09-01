"use client";

import { matchesSearch } from "@/lib/gujarati-search";
/* eslint-disable @next/next/no-img-element */

import { useState, useMemo } from "react";
import { Plus, PencilLine, Trash2, Package, Search, ImagePlus, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { AppShell } from "@/components/shell/app-shell";
import { Panel } from "@/components/ui/panel";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { ImageCropEditor } from "@/components/ui/image-crop-editor";
import { useAuth } from "@/components/providers/auth-provider";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import { useFirestoreCollection } from "@/hooks/use-firestore-collection";
import {
  createItem,
  deleteItem,
  recoverItem,
  updateItem,
} from "@/lib/firebase/firestore";
import { canManageMasters } from "@/lib/permissions";
import { DEFAULT_ITEM_IMAGE_CROP, getItemImageCropStyle } from "@/lib/item-image";
import type { ItemImageCrop, ItemRecord } from "@/lib/firebase/types";

const UNIT_OPTIONS = [
  { value: "piece", label: "Piece" },
  { value: "box", label: "Box" },
  { value: "pack", label: "Pack" },
  { value: "set", label: "Set" },
  { value: "pair", label: "Pair" },
  { value: "kg", label: "Kg" },
  { value: "gram", label: "Gram" },
  { value: "meter", label: "Meter" },
  { value: "liter", label: "Liter" },
  { value: "roll", label: "Roll" },
  { value: "bottle", label: "Bottle" },
  { value: "packet", label: "Packet" },
];

const CUSTOM_UNIT_KEY = "__custom__";
const isPresetUnit = (unit: string) => UNIT_OPTIONS.some((opt) => opt.value.toLowerCase() === unit.toLowerCase());

export function ItemsMasterView() {
  const { workspaceProfile: profile } = useAuth();
  const { loading, categories, items } = useWorkspaceData({
    fetchStock: false,
    fetchOrders: false,
    fetchUsers: false,
  });

  const allItemsState = useFirestoreCollection<ItemRecord>("items", [], { allowDeleted: true });

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [itemEditId, setItemEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [recoverModalOpen, setRecoverModalOpen] = useState(false);
  const [recoverSearch, setRecoverSearch] = useState("");

  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    unit: "piece",
    imageUrl: "",
    imageCrop: DEFAULT_ITEM_IMAGE_CROP,
    images: [] as Array<{ url: string; crop?: ItemImageCrop | null }>,
    is_permission: "NO" as "YES" | "NO",
    hasVariants: false,
    variants: [] as string[],
    active: true,
  });
  const [customVariantInput, setCustomVariantInput] = useState("");
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
      hasVariants: false,
      variants: [],
      active: true,
    });
    setCustomVariantInput("");
    setItemUnitMode("preset");
    setItemEditId(null);
    setFormModalOpen(false);
  };

  const openCreateModal = () => {
    resetItemForm();
    setFormModalOpen(true);
  };

  const handleEditItem = (item: ItemRecord) => {
    const parsedVariants: string[] = Array.isArray(item.variants)
      ? item.variants
      : typeof (item as any).variants === "string" && (item as any).variants.trim()
      ? (() => {
          try {
            const p = JSON.parse((item as any).variants);
            return Array.isArray(p) ? p : [];
          } catch (e) {
            return [];
          }
        })()
      : [];

    const isVarActive = Boolean(
      item.hasVariants === true ||
      (item.hasVariants as any) === 1 ||
      (item.hasVariants as any) === "1" ||
      parsedVariants.length > 0
    );

    setItemEditId(String(item.id));
    setItemForm({
      name: item.name,
      description: item.description || "",
      categoryId: String(item.categoryId),
      unit: item.unit,
      imageUrl: item.imageUrl || "",
      imageCrop: item.imageCrop || DEFAULT_ITEM_IMAGE_CROP,
      images: item.images || [],
      is_permission: (item.is_permission === "YES" || item.is_permission === true) ? "YES" : "NO",
      hasVariants: isVarActive,
      variants: parsedVariants,
      active: item.active !== false,
    });
    setCustomVariantInput("");
    setItemUnitMode(isPresetUnit(item.unit) ? "preset" : "custom");
    setFormModalOpen(true);
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
      const cleanVariants = itemForm.hasVariants && itemForm.variants.length > 0 ? itemForm.variants : [];
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
            hasVariants: Boolean(itemForm.hasVariants && cleanVariants.length > 0),
            variants: cleanVariants,
            active: itemForm.active,
          },
          actor,
        );
        toast.success("Item updated successfully.");
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
            hasVariants: Boolean(itemForm.hasVariants && cleanVariants.length > 0),
            variants: cleanVariants,
          },
          actor,
        );
        toast.success("Item created successfully with size variants!");
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
      const q = itemSearch.toLowerCase().trim();
      const matchesSearch = q
        ? (item.name || "").toLowerCase().includes(q) ||
          (item.unit || "").toLowerCase().includes(q) ||
          (item.productId && item.productId.toLowerCase().includes(q))
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
        ? (item.name || "").toLowerCase().includes(recoverSearch.toLowerCase()) ||
          (item.categoryName || "").toLowerCase().includes(recoverSearch.toLowerCase())
        : true;
    });
  }, [deletedItems, recoverSearch]);

  const paginatedDeletedItems = useMemo(() => {
    return filteredDeletedItems.slice((recoverPage - 1) * ITEMS_PER_PAGE, recoverPage * ITEMS_PER_PAGE);
  }, [filteredDeletedItems, recoverPage]);

  const canManage = canManageMasters(profile);

  return (
    <AppShell title="Items Master">
      <div className="space-y-4">
        {/* Top Header Controls Panel */}
        <Panel className="p-4 border border-gray-200 bg-white shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-2xs">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900">Items Catalog Master</h2>
                <p className="text-xs text-gray-500">Manage all items, categories, custom sizes & stock</p>
              </div>
              <span className="ml-2 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                {filteredItems.length} Items
              </span>
            </div>

            <div className="flex items-center gap-2">
              {deletedItems.length > 0 && canManage ? (
                <button
                  type="button"
                  onClick={() => setRecoverModalOpen(true)}
                  className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition shadow-2xs"
                >
                  Recover Deleted ({deletedItems.length})
                </button>
              ) : null}

              {canManage && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-black text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> + Create New Item
                </button>
              )}
            </div>
          </div>

          {/* Filters Bar */}
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_240px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                value={itemSearch}
                onChange={(e) => {
                  setItemSearch(e.target.value);
                  setItemPage(1);
                }}
                placeholder="Search items..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 pl-9 pr-3 py-2 text-xs outline-none focus:border-amber-500 focus:bg-white transition"
              />
            </div>

            <select
              value={itemCategoryFilter}
              onChange={(e) => {
                setItemCategoryFilter(e.target.value);
                setItemPage(1);
              }}
              className="rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2 text-xs outline-none focus:border-amber-500 focus:bg-white transition"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </Panel>

        {/* Data Table */}
        <Panel className="p-0 border border-gray-200 bg-white shadow-xs overflow-hidden rounded-2xl">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500">Loading items catalog...</div>
          ) : filteredItems.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-200 bg-gray-50/80 font-bold text-gray-700">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Item Name & Sizes</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Unit</th>
                    <th className="p-3.5">Permission</th>
                    {canManage ? <th className="p-3.5 text-right">Actions</th> : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition">
                      <td className="p-3.5 font-bold text-gray-500">{item.productId || `#${item.id}`}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <div
                              className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white"
                              style={getItemImageCropStyle(item.imageCrop)}
                            >
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : null}
                          <div>
                            <span className="font-bold text-gray-900 text-sm">{item.name}</span>
                            {item.description ? (
                              <div className="text-xs text-gray-500 line-clamp-1">{item.description}</div>
                            ) : null}
                            {item.hasVariants && item.variants?.length ? (
                              <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-md">
                                  Sizes ({item.variants.length}):
                                </span>
                                {item.variants.map((v) => (
                                  <span key={v} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200 shadow-2xs">
                                    {v}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-gray-700 font-semibold">{item.categoryName}</td>
                      <td className="p-3.5 text-gray-600 font-semibold">{item.unit}</td>
                      <td className="p-3.5">
                        {item.is_permission === "YES" ? (
                          <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[10px] font-bold text-red-600">
                            Permission
                          </span>
                        ) : (
                          <span className="text-gray-400 font-semibold">-</span>
                        )}
                      </td>
                      {canManage ? (
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditItem(item)}
                              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition cursor-pointer"
                              title="Edit Item"
                            >
                              <PencilLine className="h-4 w-4 text-amber-600" />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`Delete item ${item.name}? All associated size variants will also be removed.`)) {
                                  await deleteItem(Number(item.id), actor);
                                  toast.success("Item and size variants deleted.");
                                }
                              }}
                              className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                              title="Delete Item"
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
          ) : (
            <div className="p-12 text-center text-xs text-gray-500 font-bold">No items found matching your filter.</div>
          )}

          {filteredItems.length > ITEMS_PER_PAGE ? (
            <div className="p-4 border-t border-gray-100">
              <Pagination
                page={itemPage}
                total={filteredItems.length}
                pageSize={ITEMS_PER_PAGE}
                onChange={setItemPage}
              />
            </div>
          ) : null}
        </Panel>
      </div>

      {/* 🚀 Item Create & Edit Modal Popup (Spacious & Clean) */}
      <Modal
        open={formModalOpen}
        onClose={resetItemForm}
        title={itemEditId ? "✏️ Edit Item Master" : "✨ Create New Item Master"}
        description="Configure product details, custom sizes/variants, and image"
      >
        <form onSubmit={submitItem} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid gap-3 sm:grid-cols-2">
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
                placeholder="e.g. Innerwear, Shirt, Pen..."
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
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
                  className="rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
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
                    className="rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
                  />
                ) : null}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700">P. Santo Permission Required?</label>
              <div className="mt-2.5 flex gap-4">
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
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700">Description</label>
            <textarea
              value={itemForm.description}
              onChange={(e) => setItemForm((c) => ({ ...c, description: e.target.value }))}
              rows={2}
              placeholder="Optional description or details..."
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          {/* 👕 Custom Sizes & Variants Section */}
          <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={itemForm.hasVariants}
                  onChange={(e) =>
                    setItemForm((curr) => ({ ...curr, hasVariants: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs font-bold text-purple-950">
                  👕 Has Custom Sizes / Variants?
                </span>
              </label>
              {itemForm.hasVariants && itemForm.variants.length > 0 && (
                <button
                  type="button"
                  onClick={() => setItemForm((curr) => ({ ...curr, variants: [] }))}
                  className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  Clear All Sizes
                </button>
              )}
            </div>

            {itemForm.hasVariants && (
              <div className="space-y-2.5 pt-1">
                {/* Custom Size Input with comma splitting */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type size(s) (e.g. 80, 85, 90, 95 or S, M, L)..."
                    value={customVariantInput}
                    onChange={(e) => setCustomVariantInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = customVariantInput.trim();
                        if (val) {
                          const newSizes = val
                            .split(",")
                            .map((s) => s.trim())
                            .filter((s) => s.length > 0);
                          setItemForm((curr) => ({
                            ...curr,
                            variants: Array.from(new Set([...curr.variants, ...newSizes])),
                          }));
                          setCustomVariantInput("");
                        }
                      }
                    }}
                    className="w-full rounded-xl border border-purple-200 bg-white p-2.5 text-xs outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = customVariantInput.trim();
                      if (val) {
                        const newSizes = val
                          .split(",")
                          .map((s) => s.trim())
                          .filter((s) => s.length > 0);
                        setItemForm((curr) => ({
                          ...curr,
                          variants: Array.from(new Set([...curr.variants, ...newSizes])),
                        }));
                        setCustomVariantInput("");
                      }
                    }}
                    className="px-4 py-2 text-xs font-black bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-2xs transition shrink-0 cursor-pointer"
                  >
                    + Add Size
                  </button>
                </div>

                <p className="text-[11px] text-purple-700">
                  💡 તમે અલ્પવિરામ (comma <code>,</code>) મૂકીને (દા.ત. <code>80, 85, 90, 95, 100</code>) એક જ ક્લિકમાં બધી સાઇઝ Add કરી શકો છો.
                </p>

                {/* Active Selected Size Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {itemForm.variants.map((v) => (
                    <span
                      key={v}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-white text-purple-900 border border-purple-300 shadow-2xs"
                    >
                      <span>{v}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setItemForm((curr) => ({
                            ...curr,
                            variants: curr.variants.filter((itemV) => itemV !== v),
                          }))
                        }
                        className="hover:text-red-600 font-black text-xs cursor-pointer ml-1"
                        title="Remove size"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {itemForm.variants.length === 0 && (
                    <span className="text-xs text-purple-800 italic">
                      હજુ સુધી કોઈ સાઇઝ ઉમેરી નથી. ઉપર લખીને + Add Size કરો.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 🖼️ Product Image: File Upload & Direct URL Support */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
            <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
              <span>Product Image</span>
              <span className="text-[10px] text-gray-400 font-normal">URL Paste કરો અથવા File Upload</span>
            </label>

            {/* Direct Image URL input */}
            <input
              type="url"
              placeholder="Paste Image URL (https://...)..."
              value={itemForm.imageUrl}
              onChange={(e) =>
                setItemForm((curr) => ({
                  ...curr,
                  imageUrl: e.target.value,
                  imageCrop: DEFAULT_ITEM_IMAGE_CROP,
                }))
              }
              className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs outline-none focus:border-amber-500"
            />

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="file"
                  id="item-image-file-modal"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="item-image-file-modal"
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs transition"
                >
                  <ImagePlus className="w-4 h-4 text-amber-600" />
                  Browse File
                </label>
              </div>

              {itemForm.imageUrl ? (
                <button
                  type="button"
                  onClick={() => setItemForm((c) => ({ ...c, imageUrl: "" }))}
                  className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  Remove Image
                </button>
              ) : null}
            </div>

            {/* Image Preview with Crop Tool */}
            {itemForm.imageUrl ? (
              <div className="mt-2 flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-2xl shadow-2xs">
                <div
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-300 bg-white"
                  style={getItemImageCropStyle(itemForm.imageCrop)}
                >
                  <img
                    src={itemForm.imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="text-xs space-y-1.5">
                  <p className="font-bold text-gray-800">Image Loaded</p>
                  <ImageCropEditor
                    imageUrl={itemForm.imageUrl}
                    crop={itemForm.imageCrop}
                    onChange={(crop) => setItemForm((c) => ({ ...c, imageCrop: crop }))}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={resetItemForm}
              className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-black text-white shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Saving..." : itemEditId ? "Update Item" : "Create Item"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Recover Modal */}
      <Modal
        open={recoverModalOpen}
        onClose={() => setRecoverModalOpen(false)}
        title="Recover Deleted Items"
        description="Select items to restore"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <input
            value={recoverSearch}
            onChange={(e) => {
              setRecoverSearch(e.target.value);
              setRecoverPage(1);
            }}
            placeholder="Search deleted items..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs outline-none focus:border-amber-500"
          />

          {filteredDeletedItems.length ? (
            <div className="space-y-2">
              {paginatedDeletedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div>
                    <p className="font-bold text-gray-900 text-xs">{item.name}</p>
                    <p className="text-[10px] text-gray-500">{item.categoryName} • {item.unit}</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await recoverItem(Number(item.id), actor);
                      toast.success("Item restored.");
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-gray-500 py-6">No deleted items found.</p>
          )}
        </div>
      </Modal>
    </AppShell>
  );
}
