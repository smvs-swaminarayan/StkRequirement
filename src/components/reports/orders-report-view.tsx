"use client";

import { useState, useMemo } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { Panel } from "@/components/ui/panel";
import { Pagination } from "@/components/ui/pagination";
import { SearchableMultiSelect } from "@/components/ui/searchable-multi-select";
import { StatusBadge } from "@/components/ui/status-badge";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import {
  buildOrderMetrics,
  matchesList,
  matchesMonths,
  uniqueMonthOptions,
  withinDateRange,
} from "@/lib/selectors";
import {
  getAssignedCategoryIds,
  isLeader,
  isSuperAdmin,
  isUser,
} from "@/lib/permissions";
import { downloadCsv, isCurrentMonth } from "@/lib/utils";

export function OrdersReportView() {
  const { loading, categories, orders, profile } = useWorkspaceData({
    fetchItems: false,
    fetchStockEntries: false,
    fetchUsers: false,
  });

  const adminMode = isSuperAdmin(profile);
  const leaderMode = isLeader(profile);
  const userMode = isUser(profile);

  const [orderPage, setOrderPage] = useState(1);
  const [orderPageSize, setOrderPageSize] = useState(10);

  const leaderCategoryIds = leaderMode ? getAssignedCategoryIds(profile) : [];
  const leaderCategoryIdsForFilter = leaderMode
    ? leaderCategoryIds.filter((id) => categories.some((c) => c.id === id))
    : [];

  const reportCategoryOptions = leaderMode
    ? categories.filter((c) => leaderCategoryIdsForFilter.includes(c.id))
    : categories;

  const [orderFilters, setOrderFilters] = useState(() => ({
    startDate: "",
    endDate: "",
    months: [] as string[],
    categoryIds: leaderCategoryIdsForFilter,
    statuses: userMode ? (["DELIVERED"] as string[]) : ([] as string[]),
  }));

  const monthOptions = uniqueMonthOptions(orders.map((order) => order.date)).map((value) => ({
    value,
    label: value,
  }));

  const currentMonthOrders = orders.filter((order) => isCurrentMonth(order.date || order.createdAt));
  const currentMonthMetrics = buildOrderMetrics(currentMonthOrders);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      return (
        withinDateRange(order.date, orderFilters.startDate, orderFilters.endDate) &&
        matchesMonths(order.date, orderFilters.months) &&
        matchesList(order.categoryId, orderFilters.categoryIds) &&
        matchesList(order.status, orderFilters.statuses)
      );
    });
  }, [orders, orderFilters]);

  const paginatedOrders = useMemo(() => {
    const start = (orderPage - 1) * orderPageSize;
    return filteredOrders.slice(start, start + orderPageSize);
  }, [filteredOrders, orderPage, orderPageSize]);

  return (
    <AppShell title={adminMode ? "Admin Order Report" : leaderMode ? "Assigned Order Report" : "My Order Report"}>
      {/* Top Metrics Cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Month Orders" value={currentMonthMetrics.total} accent="primary" />
        <MetricCard label="Pending Orders" value={currentMonthMetrics.pending} accent="accent" />
        <MetricCard label="Approved Orders" value={currentMonthMetrics.approved} accent="success" />
        <MetricCard label="Delivered Orders" value={currentMonthMetrics.delivered} accent="danger" />
      </section>

      {/* Orders Filter & Table */}
      <Panel className="p-5 border border-gray-200 bg-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white shadow-xs">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 leading-tight">Order Report</h2>
              <span className="text-[11px] font-semibold text-rose-600">{filteredOrders.length} Filtered Records</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              downloadCsv(
                "order-report.csv",
                filteredOrders.map((order, index) => ({
                  "Sr No": index + 1,
                  "Item Name": order.itemName,
                  Category: order.categoryName,
                  Status: order.status,
                  User: order.requestedByName,
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
              value={orderFilters.startDate}
              onChange={(e) => {
                setOrderFilters((c) => ({ ...c, startDate: e.target.value }));
                setOrderPage(1);
              }}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
            />
          </label>
          <label className="text-xs font-bold text-gray-700">
            End Date
            <input
              type="date"
              value={orderFilters.endDate}
              onChange={(e) => {
                setOrderFilters((c) => ({ ...c, endDate: e.target.value }));
                setOrderPage(1);
              }}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
            />
          </label>
        </div>

        <div className="grid gap-3 xl:grid-cols-3">
          <SearchableMultiSelect
            label="Months"
            options={monthOptions}
            selected={orderFilters.months}
            onChange={(months) => {
              setOrderFilters((c) => ({ ...c, months }));
              setOrderPage(1);
            }}
            placeholder="Search month"
          />
          <SearchableMultiSelect
            label="Categories"
            options={reportCategoryOptions.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
            selected={orderFilters.categoryIds}
            onChange={(categoryIds) => {
              setOrderFilters((c) => ({ ...c, categoryIds }));
              setOrderPage(1);
            }}
            placeholder="Search category"
          />
          <SearchableMultiSelect
            label="Status"
            options={[
              { value: "PENDING", label: "Pending" },
              { value: "APPROVED", label: "Approved" },
              { value: "REJECTED", label: "Rejected" },
              { value: "DELIVERED", label: "Delivered" },
            ]}
            selected={orderFilters.statuses}
            onChange={(statuses) => {
              setOrderFilters((c) => ({ ...c, statuses }));
              setOrderPage(1);
            }}
            placeholder="Search status"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-8 text-center text-xs text-gray-500">Loading orders...</div>
        ) : filteredOrders.length ? (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-200 bg-gray-50 text-gray-700 font-bold">
                  <tr>
                    <th className="p-3">Sr No</th>
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Status</th>
                    {!userMode ? <th className="p-3">User</th> : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedOrders.map((order, index) => (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition">
                      <td className="p-3 font-semibold text-gray-500">
                        {(orderPage - 1) * orderPageSize + index + 1}
                      </td>
                      <td className="p-3 font-bold text-gray-900">{order.itemName}</td>
                      <td className="p-3 text-gray-600">{order.categoryName}</td>
                      <td className="p-3">
                        <StatusBadge status={order.status} />
                      </td>
                      {!userMode ? (
                        <td className="p-3 font-medium text-gray-700">{order.requestedByName}</td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={orderPage}
              totalItems={filteredOrders.length}
              pageSize={orderPageSize}
              onPageChange={setOrderPage}
              onPageSizeChange={setOrderPageSize}
              pageSizeOptions={[10, 25, 50]}
            />
          </div>
        ) : (
          <EmptyState title="Order report is empty" description="Adjust your filters to view matching orders." />
        )}
      </Panel>
    </AppShell>
  );
}
