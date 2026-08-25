"use client";

import { useState, useMemo } from "react";
import {
  AlertTriangle,
  Download,
  FolderTree,
  PackageSearch,
  Users,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Boxes,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { Panel } from "@/components/ui/panel";
import { Pagination } from "@/components/ui/pagination";
import { SearchableMultiSelect } from "@/components/ui/searchable-multi-select";
import { StatusBadge } from "@/components/ui/status-badge";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import {
  buildItemUsageRows,
  buildMemberwiseRows,
  buildOrderMetrics,
  buildStockRows,
  matchesList,
  matchesMonths,
  uniqueMonthOptions,
  withinDateRange,
} from "@/lib/selectors";
import {
  canViewMemberwiseReport,
  getAssignedCategoryIds,
  hasRole,
  isLeader,
  isSuperAdmin,
  isUser,
} from "@/lib/permissions";
import { downloadCsv, formatQty, isCurrentMonth } from "@/lib/utils";
import { cn } from "@/lib/utils";

function getReportSurfaceTitle(isAdmin: boolean, leader: boolean) {
  if (isAdmin) return "Reports Admin";
  if (leader) return "Reports Leader";
  return "Reports User";
}

function getReportSurfaceDescription(isAdmin: boolean, leader: boolean) {
  if (isAdmin) {
    return "System-wide monthly, stock, category, and exception reports are available in one controlled surface.";
  }
  if (leader) {
    return "Assigned-category order, stock, and usage reports are isolated to your operational scope.";
  }
  return "Personal order history, status summary, and request trends stay limited to your own account.";
}

function getOrderSectionTitle(isAdmin: boolean, leader: boolean) {
  if (isAdmin) return "Admin Order Report";
  if (leader) return "Assigned Order Report";
  return "My Order Report";
}

function getUsageTitle(isAdmin: boolean, leader: boolean) {
  if (isAdmin) return "System Item Usage";
  if (leader) return "Assigned Item Usage";
  return "My Requested Items";
}

export function ReportsView() {
  const { loading, categories, items, orders, profile, stockEntries, users } = useWorkspaceData();

  const adminMode = isSuperAdmin(profile);
  const leaderMode = isLeader(profile);
  const userMode = isUser(profile);

  // Collapsible panel state
  const [orderSectionOpen, setOrderSectionOpen] = useState(true);
  const [stockSectionOpen, setStockSectionOpen] = useState(true);
  const [usageSectionOpen, setUsageSectionOpen] = useState(true);
  const [memberSectionOpen, setMemberSectionOpen] = useState(true);

  // Pagination states
  const [orderPage, setOrderPage] = useState(1);
  const [orderPageSize, setOrderPageSize] = useState(10);

  const [stockPage, setStockPage] = useState(1);
  const [stockPageSize, setStockPageSize] = useState(10);

  const [usagePage, setUsagePage] = useState(1);
  const [usagePageSize, setUsagePageSize] = useState(10);

  const [memberPage, setMemberPage] = useState(1);
  const [memberPageSize, setMemberPageSize] = useState(10);

  const leaderDefaultCategoryId =
    leaderMode && profile?.defaultLeaderCategoryId
      ? profile.defaultLeaderCategoryId
      : null;

  const leaderCategoryIds = leaderMode ? getAssignedCategoryIds(profile) : [];
  const leaderCategoryIdsForFilter = leaderMode
    ? leaderCategoryIds.filter((id) => categories.some((c) => c.id === id))
    : [];

  const leaderDefaultCategoryIdsForFilter =
    leaderMode && leaderDefaultCategoryId && leaderCategoryIdsForFilter.includes(leaderDefaultCategoryId)
      ? [leaderDefaultCategoryId]
      : leaderCategoryIdsForFilter;

  const reportCategoryOptions = leaderMode
    ? categories.filter((c) => leaderCategoryIdsForFilter.includes(c.id))
    : categories;

  const [orderFilters, setOrderFilters] = useState(() => ({
    startDate: "",
    endDate: "",
    months: [] as string[],
    categoryIds: leaderDefaultCategoryIdsForFilter,
    statuses: userMode ? (["DELIVERED"] as string[]) : ([] as string[]),
  }));

  const [stockFilters, setStockFilters] = useState(() => ({
    startDate: "",
    endDate: "",
    months: [] as string[],
    categoryIds: leaderDefaultCategoryIdsForFilter,
    itemIds: [] as string[],
  }));

  const [memberFilters, setMemberFilters] = useState({
    months: [] as string[],
    categoryIds: [] as string[],
    itemIds: [] as string[],
    username: "",
  });

  const reportSurfaceTitle = getReportSurfaceTitle(adminMode, leaderMode);
  const reportSurfaceDescription = getReportSurfaceDescription(adminMode, leaderMode);

  const monthOptions = uniqueMonthOptions([
    ...orders.map((order) => order.date),
    ...stockEntries.map((entry) => entry.date),
  ]).map((value) => ({
    value,
    label: value,
  }));

  const currentMonthOrders = orders.filter((order) => isCurrentMonth(order.date || order.createdAt));
  const currentMonthMetrics = buildOrderMetrics(currentMonthOrders);
  const overallStockRows = buildStockRows(items, stockEntries, orders);
  const lowStockRows = overallStockRows.filter((row) => row.availableStock <= 0);
  const assignedCategoryNames = categories
    .filter((category) => getAssignedCategoryIds(profile).includes(category.id))
    .map((category) => category.name);
  const leadersWithoutCategoryCount = users.filter(
    (user) => hasRole(user, "LEADER") && getAssignedCategoryIds(user).length === 0,
  ).length;
  const currentMonthRejectedCount = currentMonthOrders.filter(
    (order) => order.status === "REJECTED",
  ).length;

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

  const paginatedStockRows = useMemo(() => {
    const start = (stockPage - 1) * stockPageSize;
    return stockRows.slice(start, start + stockPageSize);
  }, [stockRows, stockPage, stockPageSize]);

  const memberRows = useMemo(() => {
    return buildMemberwiseRows(
      orders.filter((order) => {
        return (
          matchesMonths(order.date, memberFilters.months) &&
          matchesList(order.categoryId, memberFilters.categoryIds) &&
          matchesList(order.itemId, memberFilters.itemIds) &&
          (memberFilters.username ? order.requestedByUsername === memberFilters.username : true)
        );
      }),
    );
  }, [orders, memberFilters]);

  const paginatedMemberRows = useMemo(() => {
    const start = (memberPage - 1) * memberPageSize;
    return memberRows.slice(start, start + memberPageSize);
  }, [memberRows, memberPage, memberPageSize]);

  const usageRows = useMemo(() => {
    return buildItemUsageRows(filteredOrders);
  }, [filteredOrders]);

  const paginatedUsageRows = useMemo(() => {
    const start = (usagePage - 1) * usagePageSize;
    return usageRows.slice(start, start + usagePageSize);
  }, [usageRows, usagePage, usagePageSize]);

  return (
    <AppShell title={reportSurfaceTitle}>
      {loading ? (
        <Panel className="p-8 text-sm text-[var(--ink-soft)]">Loading reports...</Panel>
      ) : (
        <>
          {/* Top Metrics Cards */}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {adminMode ? (
              <>
                <MetricCard label="Current Month Orders" value={currentMonthMetrics.total} accent="primary" />
                <MetricCard label="Rejected Orders" value={currentMonthRejectedCount} accent="accent" />
                <MetricCard label="Low Stock Items" value={lowStockRows.length} accent="danger" />
                <MetricCard
                  label="Leaders without Category"
                  value={leadersWithoutCategoryCount}
                  accent="success"
                />
              </>
            ) : leaderMode ? (
              <>
                <MetricCard label="Current Month Orders" value={currentMonthMetrics.total} accent="primary" />
                <MetricCard label="Pending Orders" value={currentMonthMetrics.pending} accent="accent" />
                <MetricCard label="Approved Orders" value={currentMonthMetrics.approved} accent="success" />
                <MetricCard label="Low Stock Items" value={lowStockRows.length} accent="danger" />
              </>
            ) : (
              <>
                <MetricCard label="My Total Orders" value={currentMonthMetrics.total} accent="primary" />
                <MetricCard label="My Pending Orders" value={currentMonthMetrics.pending} accent="accent" />
                <MetricCard label="My Approved Orders" value={currentMonthMetrics.approved} accent="success" />
                <MetricCard label="My Delivered Orders" value={currentMonthMetrics.delivered} accent="danger" />
              </>
            )}
          </section>

          {/* ─── 1. ORDER REPORT (COLLAPSIBLE WITH PAGINATION) ─── */}
          <Panel className="overflow-hidden border border-gray-200 bg-white shadow-sm transition">
            {/* Header Accordion Bar */}
            <div
              onClick={() => setOrderSectionOpen(!orderSectionOpen)}
              className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-rose-50/50 to-white px-4 py-3 cursor-pointer hover:bg-rose-50/80 transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white shadow-xs">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">
                    {getOrderSectionTitle(adminMode, leaderMode)}
                  </h3>
                  <span className="text-[11px] font-semibold text-rose-600">
                    {filteredOrders.length} Total Orders Filtered
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(
                      adminMode
                        ? "admin-order-report.csv"
                        : leaderMode
                        ? "leader-order-report.csv"
                        : "user-order-report.csv",
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
                <button
                  type="button"
                  onClick={() => setOrderSectionOpen(!orderSectionOpen)}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition"
                >
                  {orderSectionOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Content */}
            {orderSectionOpen ? (
              <div className="p-4 space-y-4">
                {/* Date & Filter Controls */}
                <div className="grid gap-3 lg:grid-cols-2">
                  <label className="text-xs font-bold text-gray-700">
                    Start Date
                    <input
                      type="date"
                      value={orderFilters.startDate}
                      onChange={(event) => {
                        setOrderFilters((current) => ({ ...current, startDate: event.target.value }));
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
                      onChange={(event) => {
                        setOrderFilters((current) => ({ ...current, endDate: event.target.value }));
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
                      setOrderFilters((current) => ({ ...current, months }));
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
                      setOrderFilters((current) => ({ ...current, categoryIds }));
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
                      setOrderFilters((current) => ({ ...current, statuses }));
                      setOrderPage(1);
                    }}
                    placeholder="Search status"
                  />
                </div>

                {/* Table Data */}
                {filteredOrders.length ? (
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
                    {/* Pagination */}
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
                  <EmptyState
                    title="Order report is empty"
                    description="Adjust the filters or create some orders first."
                  />
                )}
              </div>
            ) : null}
          </Panel>

          {/* ─── 2. STOCK REPORT (COLLAPSIBLE WITH PAGINATION) ─── */}
          {!userMode ? (
            <Panel className="overflow-hidden border border-gray-200 bg-white shadow-sm transition">
              <div
                onClick={() => setStockSectionOpen(!stockSectionOpen)}
                className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-white px-4 py-3 cursor-pointer hover:bg-emerald-50/80 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                    <Boxes className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight">Stock Master Report</h3>
                    <span className="text-[11px] font-semibold text-emerald-600">
                      {stockRows.length} Items Evaluated
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() =>
                      downloadCsv(
                        leaderMode ? "leader-stock-report.csv" : "admin-stock-report.csv",
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
                  <button
                    type="button"
                    onClick={() => setStockSectionOpen(!stockSectionOpen)}
                    className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition"
                  >
                    {stockSectionOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {stockSectionOpen ? (
                <div className="p-4 space-y-4">
                  <div className="grid gap-3 lg:grid-cols-2">
                    <label className="text-xs font-bold text-gray-700">
                      Start Date
                      <input
                        type="date"
                        value={stockFilters.startDate}
                        onChange={(event) => {
                          setStockFilters((current) => ({ ...current, startDate: event.target.value }));
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
                        onChange={(event) => {
                          setStockFilters((current) => ({ ...current, endDate: event.target.value }));
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
                        setStockFilters((current) => ({ ...current, months }));
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
                        setStockFilters((current) => ({ ...current, categoryIds }));
                        setStockPage(1);
                      }}
                      placeholder="Search category"
                    />
                    <SearchableMultiSelect
                      label="Items"
                      options={items.map((item) => ({ value: item.id, label: item.name }))}
                      selected={stockFilters.itemIds}
                      onChange={(itemIds) => {
                        setStockFilters((current) => ({ ...current, itemIds }));
                        setStockPage(1);
                      }}
                      placeholder="Search item"
                    />
                  </div>

                  {stockRows.length ? (
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
                                <td className="p-3 font-extrabold text-gray-900">
                                  {formatQty(row.availableStock)}
                                </td>
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
                    <EmptyState
                      title="Stock report is empty"
                      description="Add stock entries or approve orders to populate this report."
                    />
                  )}
                </div>
              ) : null}
            </Panel>
          ) : null}

          {/* ─── 3. ITEM USAGE & MEMBERWISE (COLLAPSIBLE WITH PAGINATION) ─── */}
          <section className="grid gap-4 xl:grid-cols-2">
            {/* Item Usage Summary */}
            <Panel className="overflow-hidden border border-gray-200 bg-white shadow-sm transition">
              <div
                onClick={() => setUsageSectionOpen(!usageSectionOpen)}
                className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white px-4 py-3 cursor-pointer hover:bg-blue-50/80 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight">
                      {getUsageTitle(adminMode, leaderMode)}
                    </h3>
                    <span className="text-[11px] font-semibold text-blue-600">
                      {usageRows.length} Items Tracked
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() =>
                      downloadCsv(
                        adminMode
                          ? "admin-item-usage.csv"
                          : leaderMode
                          ? "leader-item-usage.csv"
                          : "user-item-usage.csv",
                        usageRows.map((row, index) => ({
                          "Sr No": index + 1,
                          "Item Name": row.itemName,
                          Category: row.categoryName,
                          "Total Order Count": row.total,
                        })),
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </button>
                  <button
                    type="button"
                    onClick={() => setUsageSectionOpen(!usageSectionOpen)}
                    className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition"
                  >
                    {usageSectionOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {usageSectionOpen ? (
                <div className="p-4">
                  {usageRows.length ? (
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-gray-200 bg-gray-50 text-gray-700 font-bold">
                            <tr>
                              <th className="p-3">No</th>
                              <th className="p-3">Item Name</th>
                              <th className="p-3">Category</th>
                              <th className="p-3">Total Orders</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {paginatedUsageRows.map((row, index) => (
                              <tr
                                key={`${row.itemName}-${row.categoryName}`}
                                className="hover:bg-gray-50/80 transition"
                              >
                                <td className="p-3 font-semibold text-gray-500">
                                  {(usagePage - 1) * usagePageSize + index + 1}
                                </td>
                                <td className="p-3 font-bold text-gray-900">{row.itemName}</td>
                                <td className="p-3 text-gray-600">{row.categoryName}</td>
                                <td className="p-3 font-extrabold text-blue-600">{formatQty(row.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Pagination
                        currentPage={usagePage}
                        totalItems={usageRows.length}
                        pageSize={usagePageSize}
                        onPageChange={setUsagePage}
                        onPageSizeChange={setUsagePageSize}
                        pageSizeOptions={[10, 25, 50]}
                      />
                    </div>
                  ) : (
                    <EmptyState
                      title="Usage report is empty"
                      description="It will populate after approved or delivered orders are recorded."
                    />
                  )}
                </div>
              ) : null}
            </Panel>

            {/* Memberwise Breakdown (Admin Only) */}
            {canViewMemberwiseReport(profile) ? (
              <Panel className="overflow-hidden border border-gray-200 bg-white shadow-sm transition">
                <div
                  onClick={() => setMemberSectionOpen(!memberSectionOpen)}
                  className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-purple-50/50 to-white px-4 py-3 cursor-pointer hover:bg-purple-50/80 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 leading-tight">Memberwise Order Report</h3>
                      <span className="text-[11px] font-semibold text-purple-600">
                        {memberRows.length} User Line Items
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() =>
                        downloadCsv(
                          "admin-memberwise-report.csv",
                          memberRows.map((row, index) => ({
                            "Sr No": index + 1,
                            User: row.requestedByName,
                            Username: row.username,
                            Category: row.categoryName,
                            "Item Name": row.itemName,
                            "Total Order": row.totalOrder,
                          })),
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs transition"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberSectionOpen(!memberSectionOpen)}
                      className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition"
                    >
                      {memberSectionOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {memberSectionOpen ? (
                  <div className="p-4 space-y-3">
                    <div className="grid gap-3">
                      <label className="text-xs font-bold text-gray-700">
                        Select User
                        <select
                          value={memberFilters.username}
                          onChange={(event) => {
                            setMemberFilters((current) => ({
                              ...current,
                              username: event.target.value,
                            }));
                            setMemberPage(1);
                          }}
                          className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
                        >
                          <option value="">All Users</option>
                          {users.map((user) => (
                            <option key={user.uid ?? user.id ?? user.username} value={user.username}>
                              {user.displayName} (@{user.username})
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {memberRows.length ? (
                      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="border-b border-gray-200 bg-gray-50 text-gray-700 font-bold">
                              <tr>
                                <th className="p-3">Sr No</th>
                                <th className="p-3">User</th>
                                <th className="p-3">Category</th>
                                <th className="p-3">Item Name</th>
                                <th className="p-3">Total Qty</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {paginatedMemberRows.map((row, index) => (
                                <tr
                                  key={`${row.username}-${row.itemName}-${row.categoryName}`}
                                  className="hover:bg-gray-50/80 transition"
                                >
                                  <td className="p-3 font-semibold text-gray-500">
                                    {(memberPage - 1) * memberPageSize + index + 1}
                                  </td>
                                  <td className="p-3 font-bold text-gray-900">
                                    {row.requestedByName} (@{row.username})
                                  </td>
                                  <td className="p-3 text-gray-600">{row.categoryName}</td>
                                  <td className="p-3 text-gray-900">{row.itemName}</td>
                                  <td className="p-3 font-extrabold text-purple-600">
                                    {formatQty(row.totalOrder)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <Pagination
                          currentPage={memberPage}
                          totalItems={memberRows.length}
                          pageSize={memberPageSize}
                          onPageChange={setMemberPage}
                          onPageSizeChange={setMemberPageSize}
                          pageSizeOptions={[10, 25, 50]}
                        />
                      </div>
                    ) : (
                      <EmptyState
                        title="Memberwise report is empty"
                        description="Adjust the filters or let users place more orders."
                      />
                    )}
                  </div>
                ) : null}
              </Panel>
            ) : null}
          </section>
        </>
      )}
    </AppShell>
  );
}
