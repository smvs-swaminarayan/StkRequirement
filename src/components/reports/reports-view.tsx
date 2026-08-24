"use client";

import { useState } from "react";
import { AlertTriangle, Download, FolderTree, PackageSearch, Users } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { Panel } from "@/components/ui/panel";
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

function getReportSurfaceTitle(isAdmin: boolean, leader: boolean) {
  if (isAdmin) {
    return "Reports Admin";
  }

  if (leader) {
    return "Reports Leader";
  }

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
  if (isAdmin) {
    return "Admin order report";
  }

  if (leader) {
    return "Assigned order report";
  }

  return "My order report";
}

function getUsageTitle(isAdmin: boolean, leader: boolean) {
  if (isAdmin) {
    return "System item usage";
  }

  if (leader) {
    return "Assigned item usage";
  }

  return "My requested items";
}

export function ReportsView() {
  const { loading, categories, items, orders, profile, stockEntries, users } = useWorkspaceData();

  const adminMode = isSuperAdmin(profile);
  const leaderMode = isLeader(profile);
  const userMode = isUser(profile);

  const leaderDefaultCategoryId =
    leaderMode && profile?.defaultLeaderCategoryId
      ? profile.defaultLeaderCategoryId
      : null;

  // Leader: compute assigned category IDs
  const leaderCategoryIds = leaderMode ? getAssignedCategoryIds(profile) : [];
  const leaderCategoryIdsForFilter = leaderMode
    ? leaderCategoryIds.filter((id) => categories.some((c) => c.id === id))
    : [];

  const leaderDefaultCategoryIdsForFilter =
    leaderMode && leaderDefaultCategoryId && leaderCategoryIdsForFilter.includes(leaderDefaultCategoryId)
      ? [leaderDefaultCategoryId]
      : leaderCategoryIdsForFilter;

  // Category options scoped to leader's assigned categories
  const reportCategoryOptions = leaderMode
    ? categories.filter((c) => leaderCategoryIdsForFilter.includes(c.id))
    : categories;

  const [orderFilters, setOrderFilters] = useState(() => ({
    startDate: "",
    endDate: "",
    months: [] as string[],
    categoryIds: leaderDefaultCategoryIdsForFilter,
    statuses: userMode ? ["DELIVERED"] as string[] : [] as string[],
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

  const filteredOrders = orders.filter((order) => {
    return (
      withinDateRange(order.date, orderFilters.startDate, orderFilters.endDate) &&
      matchesMonths(order.date, orderFilters.months) &&
      matchesList(order.categoryId, orderFilters.categoryIds) &&
      matchesList(order.status, orderFilters.statuses)
    );
  });

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
  const stockRows = buildStockRows(items, stockEntriesInFilter, ordersForStock).filter(
    (row) =>
      matchesList(row.categoryId, stockFilters.categoryIds) &&
      matchesList(row.itemId, stockFilters.itemIds),
  );

  const memberRows = buildMemberwiseRows(
    orders.filter((order) => {
      return (
        matchesMonths(order.date, memberFilters.months) &&
        matchesList(order.categoryId, memberFilters.categoryIds) &&
        matchesList(order.itemId, memberFilters.itemIds) &&
        (memberFilters.username
          ? order.requestedByUsername === memberFilters.username
          : true)
      );
    }),
  );

  const usageRows = buildItemUsageRows(filteredOrders);

  return (
    <AppShell title={reportSurfaceTitle}>
      {loading ? (
        <Panel className="p-8 text-sm text-[var(--ink-soft)]">Loading reports...</Panel>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {adminMode ? (
              <>
                <MetricCard label="Current month orders" value={currentMonthMetrics.total} accent="primary" />
                <MetricCard label="Rejected orders" value={currentMonthRejectedCount} accent="accent" />
                <MetricCard label="Low stock items" value={lowStockRows.length} accent="danger" />
                <MetricCard
                  label="Leaders without category"
                  value={leadersWithoutCategoryCount}
                  accent="success"
                />
              </>
            ) : leaderMode ? (
              <>
                <MetricCard label="Current month orders" value={currentMonthMetrics.total} accent="primary" />
                <MetricCard label="Pending orders" value={currentMonthMetrics.pending} accent="accent" />
                <MetricCard label="Approved orders" value={currentMonthMetrics.approved} accent="success" />
                <MetricCard label="Low stock items" value={lowStockRows.length} accent="danger" />
              </>
            ) : (
              <>
                <MetricCard label="My total orders" value={currentMonthMetrics.total} accent="primary" />
                <MetricCard label="My pending orders" value={currentMonthMetrics.pending} accent="accent" />
                <MetricCard label="My approved orders" value={currentMonthMetrics.approved} accent="success" />
                <MetricCard label="My delivered orders" value={currentMonthMetrics.delivered} accent="danger" />
              </>
            )}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
            <Panel className="p-4">
              <p className="section-kicker">{reportSurfaceTitle}</p>
              <h3 className="mt-1 text-lg font-bold text-[var(--ink)]">
                Report surface
              </h3>
              <p className="mt-3 max-w-3xl text-sm text-[var(--ink-soft)]">
                {reportSurfaceDescription}
              </p>
            </Panel>

            <Panel className="p-4">
              {adminMode ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
                    <AlertTriangle className="h-4 w-4 text-[var(--danger)]" />
                    Admin exceptions
                  </div>
                  <div className="grid gap-2">
                    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                        Rejected orders
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-[var(--ink)]">
                        {formatQty(currentMonthRejectedCount)}
                      </p>
                    </div>
                    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                        Leaders without categories
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-[var(--ink)]">
                        {formatQty(leadersWithoutCategoryCount)}
                      </p>
                    </div>
                    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                        Low stock items
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-[var(--ink)]">
                        {formatQty(lowStockRows.length)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : leaderMode ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
                    <FolderTree className="h-4 w-4 text-[var(--primary)]" />
                    Assigned category scope
                  </div>
                  <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                      Categories you control
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[var(--ink)]">
                      {assignedCategoryNames.length
                        ? assignedCategoryNames.join(", ")
                        : "No categories assigned yet."}
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                      Operational note
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                      This report surface only includes your assigned categories, linked stock
                      movements, and order decisions inside your own workspace.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
                    <PackageSearch className="h-4 w-4 text-[var(--primary)]" />
                    Personal scope
                  </div>
                  <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                      Personal visibility
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                      You only see your own order history, status summary, and request usage. No
                      other user or category-wide admin data is included here.
                    </p>
                  </div>
                </div>
              )}
            </Panel>
          </section>

          <Panel className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-kicker">{reportSurfaceTitle}</p>
                <h3 className="mt-1 text-lg font-bold text-[var(--ink)]">
                  {getOrderSectionTitle(adminMode, leaderMode)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    adminMode ? "admin-order-report.csv" : leaderMode ? "leader-order-report.csv" : "user-order-report.csv",
                    filteredOrders.map((order, index) => ({
                      "Sr No": index + 1,
                      "Item Name": order.itemName,
                      Category: order.categoryName,
                      Status: order.status,
                      User: order.requestedByName,
                    })),
                  )
                }
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <label className="text-sm font-semibold text-[var(--ink)]">
                Start date
                <input
                  type="date"
                  value={orderFilters.startDate}
                  onChange={(event) =>
                    setOrderFilters((current) => ({ ...current, startDate: event.target.value }))
                  }
                  className="stk-input mt-1.5"
                />
              </label>
              <label className="text-sm font-semibold text-[var(--ink)]">
                End date
                <input
                  type="date"
                  value={orderFilters.endDate}
                  onChange={(event) =>
                    setOrderFilters((current) => ({ ...current, endDate: event.target.value }))
                  }
                  className="stk-input mt-1.5"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-3">
              <SearchableMultiSelect
                label="Months"
                options={monthOptions}
                selected={orderFilters.months}
                onChange={(months) => setOrderFilters((current) => ({ ...current, months }))}
                placeholder="Search month"
              />
              <SearchableMultiSelect
                label="Categories"
                options={reportCategoryOptions.map((category) => ({
                  value: category.id,
                  label: category.name,
                }))}
                selected={orderFilters.categoryIds}
                onChange={(categoryIds) =>
                  setOrderFilters((current) => ({ ...current, categoryIds }))
                }
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
                onChange={(statuses) => setOrderFilters((current) => ({ ...current, statuses }))}
                placeholder="Search status"
              />
            </div>

            {filteredOrders.length ? (
              <div className="hide-scrollbar mt-4 overflow-auto">
                <table className="stk-table">
                  <thead>
                    <tr>
                      <th>Sr No</th>
                      <th>Item name</th>
                      <th>Category</th>
                      <th>Status</th>
                      {!userMode ? <th>User</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, index) => (
                      <tr key={order.id}>
                        <td>{index + 1}</td>
                        <td className="font-semibold">{order.itemName}</td>
                        <td className="text-[var(--ink-soft)]">{order.categoryName}</td>
                        <td>
                          <StatusBadge status={order.status} />
                        </td>
                        {!userMode ? <td className="text-[var(--ink-soft)]">{order.requestedByName}</td> : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  title="Order report is empty"
                  description="Adjust the filters or create some orders first."
                />
              </div>
            )}
          </Panel>

          {!userMode ? (
            <Panel className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="section-kicker text-xs text-[var(--accent)]">
                    {leaderMode ? "Reports Leader" : "Reports Admin"}
                  </p>
                  <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold text-[var(--ink)]">
                    Stock report
                  </h3>
                </div>
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
                  className="inline-flex items-center gap-2 rounded-[16px] border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink)]"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <label className="text-sm text-[var(--ink-soft)]">
                  Start date
                  <input
                    type="date"
                    value={stockFilters.startDate}
                    onChange={(event) =>
                      setStockFilters((current) => ({ ...current, startDate: event.target.value }))
                    }
                    className="mt-2 w-full rounded-[16px] border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
                  />
                </label>
                <label className="text-sm text-[var(--ink-soft)]">
                  End date
                  <input
                    type="date"
                    value={stockFilters.endDate}
                    onChange={(event) =>
                      setStockFilters((current) => ({ ...current, endDate: event.target.value }))
                    }
                    className="mt-2 w-full rounded-[16px] border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <SearchableMultiSelect
                  label="Months"
                  options={monthOptions}
                  selected={stockFilters.months}
                  onChange={(months) => setStockFilters((current) => ({ ...current, months }))}
                  placeholder="Search month"
                />
                <SearchableMultiSelect
                  label="Categories"
                  options={reportCategoryOptions.map((category) => ({
                    value: category.id,
                    label: category.name,
                  }))}
                  selected={stockFilters.categoryIds}
                  onChange={(categoryIds) =>
                    setStockFilters((current) => ({ ...current, categoryIds }))
                  }
                  placeholder="Search category"
                />
                <SearchableMultiSelect
                  label="Items"
                  options={items.map((item) => ({ value: item.id, label: item.name }))}
                  selected={stockFilters.itemIds}
                  onChange={(itemIds) => setStockFilters((current) => ({ ...current, itemIds }))}
                  placeholder="Search item"
                />
              </div>

              {stockRows.length ? (
                <div className="hide-scrollbar mt-6 overflow-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-[var(--ink-soft)]">
                        <th className="pb-3 pr-4 font-medium">Sr No</th>
                        <th className="pb-3 pr-4 font-medium">Category</th>
                        <th className="pb-3 pr-4 font-medium">Item name</th>
                        <th className="pb-3 pr-4 font-medium">Unit</th>
                        <th className="pb-3 pr-4 font-medium">Stock in</th>
                        <th className="pb-3 pr-4 font-medium">Stock out</th>
                        <th className="pb-3 font-medium">Available stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockRows.map((row, index) => (
                        <tr key={row.itemId} className="border-b border-[var(--border)]/60">
                          <td className="py-3 pr-4">{index + 1}</td>
                          <td className="py-3 pr-4">{row.categoryName}</td>
                          <td className="py-3 pr-4 font-medium text-[var(--ink)]">{row.itemName}</td>
                          <td className="py-3 pr-4">{row.unit}</td>
                          <td className="py-3 pr-4">{formatQty(row.stockIn)}</td>
                          <td className="py-3 pr-4">{formatQty(row.stockOut)}</td>
                          <td className="py-3 font-semibold text-[var(--ink)]">
                            {formatQty(row.availableStock)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    title="Stock report is empty"
                    description="Add stock entries or approve orders to populate this report."
                  />
                </div>
              )}
            </Panel>
          ) : null}

          <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <Panel className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="section-kicker text-xs text-[var(--primary)]">{reportSurfaceTitle}</p>
                  <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold text-[var(--ink)]">
                    {getUsageTitle(adminMode, leaderMode)}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(
                      adminMode ? "admin-item-usage.csv" : leaderMode ? "leader-item-usage.csv" : "user-item-usage.csv",
                      usageRows.map((row, index) => ({
                        "Sr No": index + 1,
                        "Item Name": row.itemName,
                        Category: row.categoryName,
                        "Total Order Count": row.total,
                      })),
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-[16px] border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink)]"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>

              {usageRows.length ? (
                <div className="hide-scrollbar mt-6 overflow-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-[var(--ink-soft)]">
                        <th className="pb-3 pr-4 font-medium">No</th>
                        <th className="pb-3 pr-4 font-medium">Item name</th>
                        <th className="pb-3 pr-4 font-medium">Category</th>
                        <th className="pb-3 font-medium">Total order count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageRows.map((row, index) => (
                        <tr
                          key={`${row.itemName}-${row.categoryName}`}
                          className="border-b border-[var(--border)]/60"
                        >
                          <td className="py-3 pr-4">{index + 1}</td>
                          <td className="py-3 pr-4 font-medium text-[var(--ink)]">{row.itemName}</td>
                          <td className="py-3 pr-4">{row.categoryName}</td>
                          <td className="py-3 font-semibold text-[var(--ink)]">{formatQty(row.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    title="Usage report is empty"
                    description="It will populate after approved or delivered orders are recorded."
                  />
                </div>
              )}
            </Panel>

            {canViewMemberwiseReport(profile) ? (
              <Panel className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="section-kicker text-xs text-[var(--accent)]">Reports Admin</p>
                    <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold text-[var(--ink)]">
                      Memberwise report
                    </h3>
                  </div>
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
                  className="inline-flex items-center gap-2 rounded-[16px] border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink)]"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                </div>

                <div className="mt-6 grid gap-4">
                  <label className="text-sm text-[var(--ink-soft)]">
                    Username
                    <select
                      value={memberFilters.username}
                      onChange={(event) =>
                        setMemberFilters((current) => ({ ...current, username: event.target.value }))
                      }
                      className="mt-2 w-full rounded-[16px] border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
                    >
                      <option value="">All users</option>
                      {users.map((user) => (
                        <option key={user.uid ?? user.id ?? user.username} value={user.username}>
                          {user.displayName} (@{user.username})
                        </option>
                      ))}
                    </select>
                  </label>
                  <SearchableMultiSelect
                    label="Months"
                    options={monthOptions}
                    selected={memberFilters.months}
                    onChange={(months) => setMemberFilters((current) => ({ ...current, months }))}
                    placeholder="Search month"
                  />
                  <SearchableMultiSelect
                    label="Categories"
                    options={reportCategoryOptions.map((category) => ({
                      value: category.id,
                      label: category.name,
                    }))}
                    selected={memberFilters.categoryIds}
                    onChange={(categoryIds) =>
                      setMemberFilters((current) => ({ ...current, categoryIds }))
                    }
                    placeholder="Search category"
                  />
                  <SearchableMultiSelect
                    label="Items"
                    options={items.map((item) => ({ value: item.id, label: item.name }))}
                    selected={memberFilters.itemIds}
                    onChange={(itemIds) => setMemberFilters((current) => ({ ...current, itemIds }))}
                    placeholder="Search item"
                  />
                </div>

                {memberRows.length ? (
                  <div className="hide-scrollbar mt-6 overflow-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)] text-[var(--ink-soft)]">
                          <th className="pb-3 pr-4 font-medium">Sr No</th>
                          <th className="pb-3 pr-4 font-medium">User</th>
                          <th className="pb-3 pr-4 font-medium">Category</th>
                          <th className="pb-3 pr-4 font-medium">Item name</th>
                          <th className="pb-3 font-medium">Total order</th>
                        </tr>
                      </thead>
                      <tbody>
                        {memberRows.map((row, index) => (
                          <tr
                            key={`${row.username}-${row.itemName}-${row.categoryName}`}
                            className="border-b border-[var(--border)]/60"
                          >
                            <td className="py-3 pr-4">{index + 1}</td>
                            <td className="py-3 pr-4 font-medium text-[var(--ink)]">
                              {row.requestedByName} (@{row.username})
                            </td>
                            <td className="py-3 pr-4">{row.categoryName}</td>
                            <td className="py-3 pr-4">{row.itemName}</td>
                            <td className="py-3 font-semibold text-[var(--ink)]">
                              {formatQty(row.totalOrder)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="mt-6">
                    <EmptyState
                      title="Memberwise report is empty"
                      description="Adjust the filters or let users place more orders."
                    />
                  </div>
                )}
              </Panel>
            ) : (
              <Panel className="p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
                  <Users className="h-4 w-4 text-[var(--primary)]" />
                  Role-based access
                </div>
                <div className="surface-muted mt-4 rounded-[18px] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                    Hidden report areas
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                    Cross-user memberwise reporting is reserved for STK Department accounts only. This
                    keeps leader and user report access scoped to their own workspace.
                  </p>
                </div>
              </Panel>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}
