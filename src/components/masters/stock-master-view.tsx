"use client";

import { useState, useMemo } from "react";
import { PencilLine, Trash2, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { Pagination } from "@/components/ui/pagination";
import { useAuth } from "@/components/providers/auth-provider";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import {
  createStockEntry,
  deleteStockEntry,
  updateStockEntry,
} from "@/lib/firebase/firestore";
import { canManageMasters } from "@/lib/permissions";
import { formatDate, formatQty } from "@/lib/utils";

export function StockMasterView() {
  const { workspaceProfile: profile } = useAuth();
  const { loading, categories, items, stockEntries } = useWorkspaceData({
    fetchOrders: false,
    fetchUsers: false,
  });
  const [stockEditId, setStockEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stockForm, setStockForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    categoryId: "",
    itemId: "",
    qty: 1,
    notes: "",
  });
  const [stockPage, setStockPage] = useState(1);
  const [stockSearch, setStockSearch] = useState("");
  const [stockCategoryFilter, setStockCategoryFilter] = useState("all");
  const ITEMS_PER_PAGE = 10;

  const actor = profile
    ? {
        actorId: profile.uid,
        actorName: profile.displayName,
        actorRole: profile.role,
      }
    : undefined;

  const resetStockForm = () => {
    setStockForm({
      date: new Date().toISOString().slice(0, 10),
      categoryId: "",
      itemId: "",
      qty: 1,
      notes: "",
    });
    setStockEditId(null);
  };

  const selectableItems = useMemo(() => {
    if (!stockForm.categoryId) return items;
    return items.filter((i) => String(i.categoryId) === String(stockForm.categoryId));
  }, [items, stockForm.categoryId]);

  const submitStock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stockForm.categoryId) {
      toast.error("Please choose a category.");
      return;
    }
    if (!stockForm.itemId) {
      toast.error("Please choose an item.");
      return;
    }
    const category = categories.find((c) => String(c.id) === String(stockForm.categoryId));
    const item = items.find((i) => String(i.id) === String(stockForm.itemId));
    if (!category || !item) {
      toast.error("Category or Item not found.");
      return;
    }

    setSubmitting(true);
    try {
      if (stockEditId) {
        await updateStockEntry(
          Number(stockEditId),
          {
            date: stockForm.date,
            categoryId: category.id,
            categoryName: category.name,
            itemId: item.id,
            itemName: item.name,
            qty: Number(stockForm.qty),
            notes: stockForm.notes,
          },
          actor,
        );
        toast.success("Stock entry updated.");
      } else {
        await createStockEntry(
          {
            date: stockForm.date,
            categoryId: category.id,
            categoryName: category.name,
            itemId: item.id,
            itemName: item.name,
            qty: Number(stockForm.qty),
            notes: stockForm.notes,
          },
          actor,
        );
        toast.success("Stock entry created.");
      }
      resetStockForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save stock entry.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStockEntries = useMemo(() => {
    return stockEntries.filter((entry) => {
      const matchesCat = stockCategoryFilter === "all" || String(entry.categoryId) === String(stockCategoryFilter);
      const matchesSearch = stockSearch
        ? entry.itemName.toLowerCase().includes(stockSearch.toLowerCase()) ||
          entry.categoryName.toLowerCase().includes(stockSearch.toLowerCase()) ||
          (entry.notes && entry.notes.toLowerCase().includes(stockSearch.toLowerCase()))
        : true;
      return matchesCat && matchesSearch;
    });
  }, [stockEntries, stockCategoryFilter, stockSearch]);

  const paginatedStockEntries = useMemo(() => {
    return filteredStockEntries.slice((stockPage - 1) * ITEMS_PER_PAGE, stockPage * ITEMS_PER_PAGE);
  }, [filteredStockEntries, stockPage]);

  const canManage = canManageMasters(profile);

  return (
    <AppShell title="Stock Entries Master">
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        {/* Form Panel */}
        {canManage ? (
          <Panel className="p-5 border border-gray-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-gray-900">
                  {stockEditId ? "Edit Stock Entry" : "New Stock Entry"}
                </h2>
              </div>
              {stockEditId ? (
                <button
                  type="button"
                  onClick={resetStockForm}
                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              ) : null}
            </div>

            <form onSubmit={submitStock} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-700">Date *</label>
                <input
                  type="date"
                  value={stockForm.date}
                  onChange={(e) => setStockForm((c) => ({ ...c, date: e.target.value }))}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Category *</label>
                <div className="mt-1">
                  <SearchableSelect
                    options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
                    value={stockForm.categoryId}
                    onChange={(val) => setStockForm((c) => ({ ...c, categoryId: val, itemId: "" }))}
                    placeholder="Select Category"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Item *</label>
                <div className="mt-1">
                  <SearchableSelect
                    options={selectableItems.map((i) => ({ value: String(i.id), label: `${i.name} (${i.unit})` }))}
                    value={stockForm.itemId}
                    onChange={(val) => setStockForm((c) => ({ ...c, itemId: val }))}
                    placeholder="Select Item"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Quantity (Stock In) *</label>
                <input
                  type="number"
                  min="1"
                  value={stockForm.qty}
                  onChange={(e) => setStockForm((c) => ({ ...c, qty: Math.max(1, Number(e.target.value)) }))}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Notes</label>
                <textarea
                  value={stockForm.notes}
                  onChange={(e) => setStockForm((c) => ({ ...c, notes: e.target.value }))}
                  rows={2}
                  placeholder="Optional supplier/invoice notes"
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-extrabold text-white hover:bg-amber-600 shadow-sm transition disabled:opacity-50"
              >
                {submitting ? "Saving..." : stockEditId ? "Update Stock" : "Add Stock Entry"}
              </button>
            </form>
          </Panel>
        ) : null}

        {/* Data Table Panel */}
        <Panel className="p-5 border border-gray-200 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">Stock Entries Log</h2>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                {filteredStockEntries.length} Total Entries
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={stockSearch}
              onChange={(e) => {
                setStockSearch(e.target.value);
                setStockPage(1);
              }}
              placeholder="Search stock..."
              className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
            />
            <select
              value={stockCategoryFilter}
              onChange={(e) => {
                setStockCategoryFilter(e.target.value);
                setStockPage(1);
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

          {loading ? (
            <div className="py-8 text-center text-xs text-gray-500">Loading stock entries...</div>
          ) : filteredStockEntries.length ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-gray-200 bg-gray-50 font-bold text-gray-700">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Item Name</th>
                      <th className="p-3">Qty Added</th>
                      <th className="p-3">Notes</th>
                      {canManage ? <th className="p-3 text-right">Actions</th> : null}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedStockEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50/80 transition">
                        <td className="p-3 font-semibold text-gray-500">{formatDate(entry.date)}</td>
                        <td className="p-3 text-gray-600">{entry.categoryName}</td>
                        <td className="p-3 font-bold text-gray-900">{entry.itemName}</td>
                        <td className="p-3 font-extrabold text-emerald-600">+{formatQty(entry.qty)}</td>
                        <td className="p-3 text-gray-500">{entry.notes || "-"}</td>
                        {canManage ? (
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setStockEditId(String(entry.id));
                                  setStockForm({
                                    date: entry.date,
                                    categoryId: String(entry.categoryId),
                                    itemId: String(entry.itemId),
                                    qty: entry.qty,
                                    notes: entry.notes || "",
                                  });
                                }}
                                className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                title="Edit"
                              >
                                <PencilLine className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm(`Delete stock entry for ${entry.itemName} (${entry.qty})?`)) {
                                    await deleteStockEntry(Number(entry.id), actor);
                                    toast.success("Stock entry deleted.");
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
                currentPage={stockPage}
                totalItems={filteredStockEntries.length}
                pageSize={ITEMS_PER_PAGE}
                onPageChange={setStockPage}
              />
            </div>
          ) : (
            <EmptyState title="No stock entries found" description="Add stock entries to maintain inventory." />
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
