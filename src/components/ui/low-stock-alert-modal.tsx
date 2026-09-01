"use client";

import { useState } from "react";
import { AlertTriangle, AlertCircle, ArrowRight, Package, Layers, Plus } from "lucide-react";
import Link from "next/navigation";
import { Modal } from "@/components/ui/modal";
import type { ItemRecord, StockEntryRecord, OrderRecord } from "@/lib/firebase/types";

export type LowStockItemInfo = {
  item: ItemRecord;
  available: number;
  status: "OUT_OF_STOCK" | "LOW_STOCK";
  variantStock?: Record<string, number>;
};

export function LowStockAlertModal({
  open,
  onClose,
  lowStockItems,
  onAddStock,
}: {
  open: boolean;
  onClose: () => void;
  lowStockItems: LowStockItemInfo[];
  onAddStock?: (itemId: number) => void;
}) {
  const [filterTab, setFilterTab] = useState<"ALL" | "OUT" | "LOW">("ALL");

  const outOfStockItems = lowStockItems.filter((i) => i.status === "OUT_OF_STOCK");
  const lowItems = lowStockItems.filter((i) => i.status === "LOW_STOCK");

  const displayedItems =
    filterTab === "OUT"
      ? outOfStockItems
      : filterTab === "LOW"
      ? lowItems
      : lowStockItems;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="⚠️ Low Stock & Out of Stock Warning"
      description="Items that require restocking immediately"
    >
      <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
        {/* Summary Metric Badges */}
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => setFilterTab(filterTab === "OUT" ? "ALL" : "OUT")}
            className={`p-3 rounded-xl border cursor-pointer transition select-none ${
              filterTab === "OUT" ? "bg-red-100 border-red-400 ring-2 ring-red-300" : "bg-red-50/70 border-red-200 hover:bg-red-100/60"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 mb-1">
              <AlertCircle className="w-4 h-4 text-red-600" /> Out of Stock (0 Left)
            </div>
            <div className="text-2xl font-black text-red-900">{outOfStockItems.length}</div>
          </div>

          <div
            onClick={() => setFilterTab(filterTab === "LOW" ? "ALL" : "LOW")}
            className={`p-3 rounded-xl border cursor-pointer transition select-none ${
              filterTab === "LOW" ? "bg-amber-100 border-amber-400 ring-2 ring-amber-300" : "bg-amber-50/70 border-amber-200 hover:bg-amber-100/60"
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Low Stock (1 Left)
            </div>
            <div className="text-2xl font-black text-amber-950">{lowItems.length}</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200 w-fit text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterTab("ALL")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterTab === "ALL" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All Alerts ({lowStockItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("OUT")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterTab === "OUT" ? "bg-red-600 text-white shadow-2xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Out of Stock ({outOfStockItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("LOW")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterTab === "LOW" ? "bg-amber-600 text-white shadow-2xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Low Stock ({lowItems.length})
          </button>
        </div>

        {/* Items List */}
        {displayedItems.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
            <Package className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-bold text-gray-800">All stocks in this category are healthy!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayedItems.map((info) => {
              const isOut = info.status === "OUT_OF_STOCK";
              const hasSizes = Boolean(info.item.hasVariants && info.item.variants?.length);

              return (
                <div
                  key={info.item.id}
                  className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isOut
                      ? "bg-red-50/50 border-red-200 hover:border-red-300"
                      : "bg-amber-50/40 border-amber-200 hover:border-amber-300"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          isOut
                            ? "bg-red-100 text-red-700 border-red-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                      >
                        {isOut ? "Out of Stock" : "Low Stock"}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900">{info.item.name}</h4>
                    </div>

                    <div className="text-xs text-gray-600 flex items-center gap-2 flex-wrap">
                      <span>Category: <strong>{info.item.categoryName}</strong></span>
                      <span>•</span>
                      <span>Total Stock: <strong className={isOut ? "text-red-700" : "text-amber-800"}>{info.available} {info.item.unit || "pcs"}</strong></span>
                    </div>

                    {/* Size Variants Breakdown */}
                    {hasSizes && info.variantStock && (
                      <div className="pt-1.5 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[11px] font-semibold text-gray-500">Sizes:</span>
                        {info.item.variants!.map((v) => {
                          const vQty = info.variantStock?.[v] ?? 0;
                          const isVOut = vQty <= 0;
                          const isVLow = vQty > 0 && vQty <= 3;
                          return (
                            <span
                              key={v}
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                                isVOut
                                  ? "bg-red-100 text-red-800 border-red-300"
                                  : isVLow
                                  ? "bg-amber-100 text-amber-900 border-amber-300"
                                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
                              }`}
                            >
                              <span>{v}:</span>
                              <span>{vQty}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Add Stock Action */}
                  <div className="shrink-0 flex items-center gap-2">
                    <a
                      href={`/masters/stock?itemId=${info.item.id}&categoryId=${info.item.categoryId}`}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-2xs transition flex items-center gap-1 cursor-pointer no-underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Stock
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
