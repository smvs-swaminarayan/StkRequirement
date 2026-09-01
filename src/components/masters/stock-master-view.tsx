"use client";

import { useState, useMemo } from "react";
import { Plus, Search, BarChart3, AlertTriangle, CheckCircle2, Package, Pencil, PencilLine, ArrowUpDown, Layers, ShoppingBag, Eye } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { useAuth } from "@/components/providers/auth-provider";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import { createStockEntry, updateStockEntry } from "@/lib/firebase/firestore";
import { canManageMasters } from "@/lib/permissions";
import { getItemImageCropStyle } from "@/lib/item-image";
import { matchesSearch } from "@/lib/gujarati-search";
import type { ItemRecord } from "@/lib/firebase/types";

export function StockMasterView() {
  const { workspaceProfile: profile } = useAuth();
  const { loading, categories, items, stockEntries, orders } = useWorkspaceData({
    fetchUsers: false,
  });

  const [editItemModal, setEditItemModal] = useState<ItemRecord | null>(null);
  const [stockQtys, setStockQtys] = useState<Record<string, number | "">>({});
  const [stockDate, setStockDate] = useState(new Date().toISOString().slice(0, 10));
  const [stockNotes, setStockNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [stockSearch, setStockSearch] = useState("");
  const [stockCategoryFilter, setStockCategoryFilter] = useState("all");
  const [stockPage, setStockPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const actor = profile
    ? {
        actorId: profile.uid,
        actorName: profile.displayName,
        actorRole: profile.role,
      }
    : undefined;

  // Compute live available stock per item & variant
  // Available Stock = Total Stock In - Reserved Orders (PENDING, APPROVED, DELIVERED)
  const stockMetricsMap = useMemo(() => {
    const map = new Map<number, {
      totalIn: number;
      totalOut: number;
      available: number;
      variants: Record<string, { totalIn: number; totalOut: number; available: number }>;
    }>();

    // 1. Accumulate Stock In
    for (const se of stockEntries) {
      if (se.deletedAt || se.is_deleted) continue;
      const itemId = Number(se.itemId);
      const qty = Number(se.qty) || 0;
      const variant = se.variant ? String(se.variant).trim() : "__none__";

      if (!map.has(itemId)) {
        map.set(itemId, { totalIn: 0, totalOut: 0, available: 0, variants: {} });
      }
      const itemData = map.get(itemId)!;
      itemData.totalIn += qty;

      if (!itemData.variants[variant]) {
        itemData.variants[variant] = { totalIn: 0, totalOut: 0, available: 0 };
      }
      itemData.variants[variant].totalIn += qty;
    }

    // 2. Accumulate Orders Out (PENDING, APPROVED, DELIVERED)
    for (const o of orders) {
      if (o.deletedAt || o.is_deleted || o.status === "REJECTED" || o.status === "CANCELLED") continue;
      const itemId = Number(o.itemId);
      const qty = Number(o.qty) || 0;
      const variant = o.variant ? String(o.variant).trim() : "__none__";

      if (!map.has(itemId)) {
        map.set(itemId, { totalIn: 0, totalOut: 0, available: 0, variants: {} });
      }
      const itemData = map.get(itemId)!;
      itemData.totalOut += qty;

      if (!itemData.variants[variant]) {
        itemData.variants[variant] = { totalIn: 0, totalOut: 0, available: 0 };
      }
      itemData.variants[variant].totalOut += qty;
    }

    // 3. Compute net available
    for (const [_, itemData] of map.entries()) {
      itemData.available = Math.max(0, itemData.totalIn - itemData.totalOut);
      for (const [_, vData] of Object.entries(itemData.variants)) {
        vData.available = Math.max(0, vData.totalIn - vData.totalOut);
      }
    }

    return map;
  }, [stockEntries, orders]);

  // Open direct stock editor for a specific item
  const openStockEditor = (item: ItemRecord) => {
    setEditItemModal(item);
    setStockDate(new Date().toISOString().slice(0, 10));
    setStockNotes("");

    const itemMetric = stockMetricsMap.get(Number(item.id));
    const initial: Record<string, number | ""> = {};

    if (item.hasVariants && item.variants?.length) {
      for (const v of item.variants) {
        // Show current available stock or empty
        const curAvail = itemMetric?.variants[v]?.available ?? 0;
        initial[v] = curAvail;
      }
    } else {
      const curAvail = itemMetric?.available ?? 0;
      initial["__none__"] = curAvail;
    }
    setStockQtys(initial);
  };

  const closeStockEditor = () => {
    setEditItemModal(null);
    setStockQtys({});
    setStockNotes("");
  };

  // Submit stock adjustment / replacement for all sizes concurrently in < 150ms
  const handleSaveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItemModal) return;

    const itemMetric = stockMetricsMap.get(Number(editItemModal.id));
    const category = categories.find((c) => Number(c.id) === Number(editItemModal.categoryId));
    const catName = category?.name || editItemModal.categoryName || "General";

    setSubmitting(true);
    try {
      const promises: Promise<any>[] = [];

      if (editItemModal.hasVariants && editItemModal.variants?.length) {
        for (const v of editItemModal.variants) {
          const targetQty = typeof stockQtys[v] === "number" ? Number(stockQtys[v]) : 0;
          const currentAvail = itemMetric?.variants[v]?.available ?? 0;
          const delta = targetQty - currentAvail;

          if (delta !== 0) {
            promises.push(
              createStockEntry(
                {
                  date: stockDate,
                  categoryId: editItemModal.categoryId,
                  categoryName: catName,
                  itemId: editItemModal.id,
                  itemName: editItemModal.name,
                  variant: v,
                  qty: delta,
                  notes: stockNotes || `Stock adjusted to ${targetQty} ${editItemModal.unit}`,
                  createdById: profile?.uid ?? 0,
                  createdByName: profile?.displayName ?? "Admin",
                },
                actor,
              )
            );
          }
        }
      } else {
        const targetQty = typeof stockQtys["__none__"] === "number" ? Number(stockQtys["__none__"]) : 0;
        const currentAvail = itemMetric?.available ?? 0;
        const delta = targetQty - currentAvail;

        if (delta !== 0) {
          promises.push(
            createStockEntry(
              {
                date: stockDate,
                categoryId: editItemModal.categoryId,
                categoryName: catName,
                itemId: editItemModal.id,
                itemName: editItemModal.name,
                variant: null,
                qty: delta,
                notes: stockNotes || `Stock adjusted to ${targetQty} ${editItemModal.unit}`,
                createdById: profile?.uid ?? 0,
                createdByName: profile?.displayName ?? "Admin",
              },
              actor,
            )
          );
        }
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }
      toast.success(`Stock updated for ${editItemModal.name} successfully!`);
      closeStockEditor();
    } catch (err: any) {
      toast.error(err.message || "Failed to update stock.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter items using phonetic transliterated Gujarati-English search
  const filteredItems = useMemo(() => {
    const q = (stockSearch || "").trim();
    return items.filter((item) => {
      const matchesCat =
        stockCategoryFilter === "all" ||
        String(item.categoryId) === String(stockCategoryFilter);

      const matchesText =
        matchesSearch(item.name, q) ||
        matchesSearch(item.categoryName, q) ||
        matchesSearch(item.productId, q) ||
        (item.variants && item.variants.some((v) => matchesSearch(v, q)));

      return matchesCat && matchesText;
    });
  }, [items, stockCategoryFilter, stockSearch]);

  const paginatedItems = useMemo(() => {
    return filteredItems.slice((stockPage - 1) * ITEMS_PER_PAGE, stockPage * ITEMS_PER_PAGE);
  }, [filteredItems, stockPage]);

  // Count low stock sizes across all items
  const lowStockCount = useMemo(() => {
    let count = 0;
    for (const item of items) {
      const metric = stockMetricsMap.get(Number(item.id));
      if (item.hasVariants && item.variants?.length) {
        for (const v of item.variants) {
          const avail = metric?.variants[v]?.available ?? 0;
          if (avail <= 1) count++;
        }
      } else {
        const avail = metric?.available ?? 0;
        if (avail <= 1) count++;
      }
    }
    return count;
  }, [items, stockMetricsMap]);

  const canManage = canManageMasters(profile);

  return (
    <AppShell title="Stock Management">
      <div className="space-y-4">
        {/* Top Header Controls Panel */}
        <Panel className="p-4 border border-gray-200 bg-white shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-2xs">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900">Live Inventory & Stock Master</h2>
                <p className="text-xs text-gray-500">Monitor live available quantity per size and adjust stock in 1 click</p>
              </div>
              <span className="ml-2 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                {filteredItems.length} Items Active
              </span>
              {lowStockCount > 0 && (
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-black text-rose-700 border border-rose-200 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-rose-500" /> {lowStockCount} Low Stock
                </span>
              )}
            </div>
          </div>

          {/* Filters Bar with Gujarati + English Search */}
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_240px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                value={stockSearch}
                onChange={(e) => {
                  setStockSearch(e.target.value);
                  setStockPage(1);
                }}
                placeholder="Search stock..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 pl-9 pr-3 py-2 text-xs outline-none focus:border-amber-500 focus:bg-white transition"
              />
            </div>

            <select
              value={stockCategoryFilter}
              onChange={(e) => {
                setStockCategoryFilter(e.target.value);
                setStockPage(1);
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

        {/* Unified Items Stock Table */}
        <Panel className="border border-gray-200 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400">Loading live stock...</div>
          ) : !paginatedItems.length ? (
            <div className="p-8 text-center">
              <EmptyState title="No items found" description="Try adjusting your search query." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3">Item & Details</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Live Stock per Size</th>
                    <th className="px-4 py-3 text-center">Total Stock</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedItems.map((item) => {
                    const metric = stockMetricsMap.get(Number(item.id));
                    const totalAvailable = metric?.available ?? 0;
                    const hasVariants = Boolean(item.hasVariants && item.variants?.length);

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/60 transition group">
                        {/* Item Info */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-2xs">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                  style={getItemImageCropStyle(item.imageCrop)}
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-400">
                                  <Package className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-extrabold text-gray-900 text-sm">{item.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-bold text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                                  ID: {item.productId || `PD${item.id}`}
                                </span>
                                <span className="text-[10px] text-gray-400">Unit: {item.unit}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-700">
                            {item.categoryName}
                          </span>
                        </td>

                        {/* Live Stock per Size */}
                        <td className="px-4 py-3">
                          {hasVariants ? (
                            <div className="flex flex-wrap gap-1.5 max-w-md">
                              {item.variants!.map((v) => {
                                const vAvail = metric?.variants[v]?.available ?? 0;
                                const isLow = vAvail <= 1;
                                const isOut = vAvail <= 0;

                                return (
                                  <span
                                    key={v}
                                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold border shadow-2xs ${
                                      isOut
                                        ? "bg-rose-50 text-rose-700 border-rose-200"
                                        : isLow
                                        ? "bg-amber-50 text-amber-800 border-amber-200"
                                        : "bg-purple-50 text-purple-900 border-purple-200"
                                    }`}
                                  >
                                    <span className="font-extrabold text-[10px] uppercase text-purple-700">Size {v}:</span>
                                    <span className={`font-black ${isOut ? "text-rose-700" : isLow ? "text-amber-700" : "text-purple-950"}`}>
                                      {vAvail}
                                    </span>
                                    {isOut ? (
                                      <span className="text-[9px] font-black text-rose-600 bg-rose-100 px-1 rounded">Out</span>
                                    ) : isLow ? (
                                      <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1 rounded">Low</span>
                                    ) : null}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-gray-500 font-semibold text-xs">Standard Item (No Sizes)</span>
                          )}
                        </td>

                        {/* Total Available Stock */}
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black shadow-2xs border ${
                              totalAvailable <= 0
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : totalAvailable <= 1
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${totalAvailable <= 0 ? "bg-rose-500" : totalAvailable <= 1 ? "bg-amber-500" : "bg-emerald-500"}`} />
                            {totalAvailable} {item.unit}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="px-4 py-3 text-right">
                          {canManage && (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => openStockEditor(item)}
                                className="rounded-lg p-2 text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition cursor-pointer"
                                title="Edit Stock"
                              >
                                <PencilLine className="h-4 w-4 text-amber-600" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filteredItems.length > ITEMS_PER_PAGE && (
            <div className="p-3 border-t border-gray-100">
              <Pagination
                currentPage={stockPage}
                totalPages={Math.ceil(filteredItems.length / ITEMS_PER_PAGE)}
                totalItems={filteredItems.length}
                pageSize={ITEMS_PER_PAGE}
                onPageChange={setStockPage}
              />
            </div>
          )}
        </Panel>
      </div>

      {/* Direct Stock Editor Modal Popup (Item Locked/Readonly) */}
      <Modal
        open={editItemModal !== null}
        onClose={closeStockEditor}
        title={editItemModal ? `Update Stock: ${editItemModal.name}` : "Update Stock"}
        description={editItemModal ? `Directly set the live available stock for each size of ${editItemModal.name}.` : ""}
      >
        {editItemModal ? (
          <form onSubmit={handleSaveStock} className="space-y-4">
            {/* Locked Item Card Header */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-amber-200 bg-white shadow-2xs">
                {editItemModal.imageUrl ? (
                  <img
                    src={editItemModal.imageUrl}
                    alt={editItemModal.name}
                    className="h-full w-full object-cover"
                    style={getItemImageCropStyle(editItemModal.imageCrop)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-amber-500">
                    <Package className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-gray-900 text-sm truncate">{editItemModal.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.2 rounded-md">
                    {editItemModal.categoryName}
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">
                    ID: {editItemModal.productId}
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">
                    Unit: {editItemModal.unit}
                  </span>
                </div>
              </div>
            </div>

            {/* Date Input */}
            <div>
              <label className="text-xs font-bold text-gray-700">Date of Stock Entry *</label>
              <input
                type="date"
                value={stockDate}
                onChange={(e) => setStockDate(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs outline-none focus:border-amber-500 focus:bg-white transition"
              />
            </div>

            {/* Size-Wise Stock Quantities Matrix */}
            {editItemModal.hasVariants && editItemModal.variants?.length ? (
              <div className="space-y-3 p-4 rounded-2xl bg-purple-50/80 border border-purple-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-purple-900">
                    👕 Set Live Available Stock for Each Size:
                  </label>
                  <span className="text-[11px] font-extrabold text-purple-700">
                    Total: {Object.values(stockQtys).reduce((sum, q) => sum + (typeof q === "number" ? q : 0), 0)} {editItemModal.unit}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  {editItemModal.variants.map((v) => (
                    <div key={v} className="bg-white p-2.5 rounded-xl border border-purple-200 shadow-2xs">
                      <span className="text-[11px] font-black uppercase text-purple-800 block mb-1">
                        Size {v}
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={stockQtys[v] === undefined ? "" : stockQtys[v]}
                        onChange={(e) => {
                          const val = e.target.value === "" ? "" : Number(e.target.value);
                          setStockQtys((prev) => ({ ...prev, [v]: val }));
                        }}
                        className="w-full rounded-lg border border-purple-200 bg-purple-50/40 p-2 text-xs font-bold text-gray-900 outline-none focus:border-purple-600 focus:bg-white transition"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-gray-700">Live Available Quantity *</label>
                <input
                  type="number"
                  min="0"
                  value={stockQtys["__none__"] === undefined ? "" : stockQtys["__none__"]}
                  onChange={(e) => {
                    const val = e.target.value === "" ? "" : Number(e.target.value);
                    setStockQtys({ __none__: val });
                  }}
                  required
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs outline-none focus:border-amber-500 focus:bg-white transition font-bold"
                />
              </div>
            )}

            {/* Optional Notes */}
            <div>
              <label className="text-xs font-bold text-gray-700">Notes / Remarks (Optional)</label>
              <textarea
                value={stockNotes}
                onChange={(e) => setStockNotes(e.target.value)}
                rows={2}
                placeholder="Optional supplier details or invoice note..."
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs outline-none focus:border-amber-500 focus:bg-white transition"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={closeStockEditor}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {submitting ? "Saving Stock..." : "Save Stock"}
              </button>
            </div>
          </form>
        ) : null}
      </Modal>
    </AppShell>
  );
}
