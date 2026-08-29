"use client";

import { useState, useMemo } from "react";
import { Download, Boxes } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { Panel } from "@/components/ui/panel";
import { Pagination } from "@/components/ui/pagination";
import { SearchableMultiSelect } from "@/components/ui/searchable-multi-select";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import {
  buildStockRows,
  matchesList,
  matchesMonths,
  uniqueMonthOptions,
  withinDateRange,
} from "@/lib/selectors";
import { getAssignedCategoryIds, isLeader } from "@/lib/permissions";
import { downloadCsv, formatQty } from "@/lib/utils";

export function StockReportView() {
  const { loading, categories, items, orders, stockEntries, profile } = useWorkspaceData({
    fetchUsers: false,
  });

  const leaderMode = isLeader(profile);
  const [stockPage, setStockPage] = useState(1);
  const [stockPageSize, setStockPageSize] = useState(10);

  const leaderCategoryIds = leaderMode ? getAssignedCategoryIds(profile) : [];
  const reportCategoryOptions = leaderMode
    ? categories.filter((c) => leaderCategoryIds.includes(c.id))
    : categories;

  const [stockFilters, setStockFilters] = useState(() => ({
    startDate: "",
    endDate: "",
    months: [] as string[],
    categoryIds: leaderCategoryIds,
    itemIds: [] as string[],
  }));

  const monthOptions = uniqueMonthOptions([
    ...orders.map((o) => o.date),
    ...stockEntries.map((e) => e.date),
  ]).map((v) => ({ value: v, label: v }));

  const stockEntriesInFilter = stockEntries.filter((entry) => {
    return (
      withinDateRange(entry.date, stockFilters.startDate, stockFilters.endDate) &&
      matchesMonths(entry.date, stockFilters.months) &&
      matchesList(entry.categoryId, stockFilters.categoryIds) &&
      matchesList(entry.itemId, stockFilters.itemIds)
    );
  });

  const ordersForStock = orders.filter((order) => {
    return (
      withinDateRange(order.date, stockFilters.startDate, stockFilters.endDate) &&
      matchesMonths(order.date, stockFilters.months) &&
      matchesList(order.categoryId, stockFilters.categoryIds) &&
      matchesList(order.itemId, stockFilters.itemIds)
    );
  });

  const stockRows = useMemo(() => {
    return buildStockRows(items, stockEntriesInFilter, ordersForStock).filter(
      (row) =>
        matchesList(row.categoryId, stockFilters.categoryIds) &&
        matchesList(row.itemId, stockFilters.itemIds),
    );
  }, [items, stockEntriesInFilter, ordersForStock, stockFilters]);

  const lowStockRows = stockRows.filter((r) => r.availableStock <= 0);

  const paginatedStockRows = useMemo(() => {
    const start = (stockPage - 1) * stockPageSize;
    return stockRows.slice(start, start + stockPageSize);
  }, [stockRows, stockPage, stockPageSize]);

  return (
    <AppShell title="Stock Master Report">
      {/* Top Metrics */}
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total Items in Report" value={stockRows.length} accent="primary" />
        <MetricCard label="Low / Zero Stock Items" value={lowStockRows.length} accent="danger" />
        <MetricCard label="Categories Tracked" value={reportCategoryOptions.length} accent="success" />
      </section>

      <Panel className="p-5 border border-gray-200 bg-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <Boxes className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 leading-tight">Stock Master Report</h2>
              <span className="text-[11px] font-semibold text-emerald-600">{stockRows.length} Items Evaluated</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              downloadCsv(
                "stock-master-report.csv",
                stockRows.map((row, index) => ({
                  "Sr No": index + 1,
                  Category: row.categoryName,
                  "Item Name": row.itemName,
                  Unit: row.unit,
                  "Stock In": `${row.stockIn} ${row.unit}`,
                  "Stock Out": `${row.stockOut} ${row.unit}`,
                  "Available Stock": `${row.availableStock} ${row.unit}`,
                })),
              )
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs transition"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="grid gap-3 lg:grid-cols-2">
          <label className="text-xs font-bold text-gray-700">
            Start Date
            <input
              type="date"
              value={stockFilters.startDate}
              onChange={(e) => {
                setStockFilters((c) => ({ ...c, startDate: e.target.value }));
                setStockPage(1);
              }}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
            />
          </label>
          <label className="text-xs font-bold text-gray-700">
            End Date
            <input
              type="date"
              value={stockFilters.endDate}
              onChange={(e) => {
                setStockFilters((c) => ({ ...c, endDate: e.target.value }));
                setStockPage(1);
              }}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
            />
          </label>
        </div>

        <div className="grid gap-3 xl:grid-cols-3">
          <SearchableMultiSelect
            label="Months"
            options={monthOptions}
            selected={stockFilters.months}
            onChange={(months) => {
              setStockFilters((c) => ({ ...c, months }));
              setStockPage(1);
            }}
            placeholder="Search month"
          />
          <SearchableMultiSelect
            label="Categories"
            options={reportCategoryOptions.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
            selected={stockFilters.categoryIds}
            onChange={(categoryIds) => {
              setStockFilters((c) => ({ ...c, categoryIds }));
              setStockPage(1);
            }}
            placeholder="Search category"
          />
          <SearchableMultiSelect
            label="Items"
            options={items.map((item) => ({ value: item.id, label: item.name }))}
            selected={stockFilters.itemIds}
            onChange={(itemIds) => {
              setStockFilters((c) => ({ ...c, itemIds }));
              setStockPage(1);
            }}
            placeholder="Search item"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-8 text-center text-xs text-gray-500">Loading stock data...</div>
        ) : stockRows.length ? (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-200 bg-gray-50 text-gray-700 font-bold">
                  <tr>
                    <th className="p-3">Sr No</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3">Stock In</th>
                    <th className="p-3">Stock Out</th>
                    <th className="p-3">Available Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedStockRows.map((row, index) => (
                    <tr key={row.itemId} className="hover:bg-gray-50/80 transition">
                      <td className="p-3 font-semibold text-gray-500">
                        {(stockPage - 1) * stockPageSize + index + 1}
                      </td>
                      <td className="p-3 text-gray-600">{row.categoryName}</td>
                      <td className="p-3 font-bold text-gray-900">{row.itemName}</td>
                      <td className="p-3 text-gray-600">{row.unit}</td>
                      <td className="p-3 text-emerald-600 font-semibold">{formatQty(row.stockIn)}</td>
                      <td className="p-3 text-rose-600 font-semibold">{formatQty(row.stockOut)}</td>
                      <td className="p-3 font-extrabold text-gray-900">{formatQty(row.availableStock)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={stockPage}
              totalItems={stockRows.length}
              pageSize={stockPageSize}
              onPageChange={setStockPage}
              onPageSizeChange={setStockPageSize}
              pageSizeOptions={[10, 25, 50]}
            />
          </div>
        ) : (
          <EmptyState title="Stock report is empty" description="Add stock entries to view inventory reports." />
        )}
      </Panel>
    </AppShell>
  );
}
