"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { Modal } from "@/components/ui/modal";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import {
  buildCategoryChart,
  buildItemUsageRows,
  buildOrderMetrics,
  buildStatusChart,
} from "@/lib/selectors";
import type { OrderStatus } from "@/lib/firebase/types";
import { isUser } from "@/lib/permissions";
import { formatDate, formatQty, isCurrentMonth } from "@/lib/utils";

const chartPalette = ["#ff9900", "#146eb4", "#067d62", "#c7511f", "#232f3e"];

const metricMeta: Array<{
  key: "total" | "pending" | "approved" | "rejected" | "delivered";
  label: string;
  accent: "primary" | "accent" | "success" | "danger";
  status?: OrderStatus;
}> = [
  { key: "total", label: "Total orders (month)", accent: "primary" },
  { key: "pending", label: "Pending", accent: "accent", status: "PENDING" },
  { key: "approved", label: "Approved", accent: "primary", status: "APPROVED" },
  { key: "rejected", label: "Rejected", accent: "danger", status: "REJECTED" },
  { key: "delivered", label: "Delivered", accent: "success", status: "DELIVERED" },
];

export function DashboardView() {
  const { loading, orders, profile } = useWorkspaceData();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "ALL" | null>(null);

  const currentMonthOrders = orders.filter((order) => isCurrentMonth(order.date || order.createdAt));
  const metrics = buildOrderMetrics(currentMonthOrders);
  const categoryRows = buildCategoryChart(currentMonthOrders);
  const statusRows = buildStatusChart(currentMonthOrders);
  const usageRows = buildItemUsageRows(orders).slice(0, 8);
  const focusedOrders =
    selectedStatus && selectedStatus !== "ALL"
      ? currentMonthOrders.filter((order) => order.status === selectedStatus)
      : currentMonthOrders;

  return (
    <AppShell title="Dashboard">
      {loading ? (
        <Panel className="p-8">
          <div className="stk-loading h-8 w-48 rounded" />
          <div className="stk-loading mt-4 h-4 w-32 rounded" />
        </Panel>
      ) : (
        <>
          {/* ─── KPI Metrics Strip ───────────────────────── */}
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {metricMeta.map((item) => (
              <MetricCard
                key={item.key}
                label={item.label}
                value={metrics[item.key]}
                accent={item.accent}
                onClick={() => setSelectedStatus(item.status ?? "ALL")}
              />
            ))}
          </section>

          {/* ─── Charts Row ──────────────────────────────── */}
          <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Panel className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="section-kicker">Category Activity</p>
                  <h3 className="mt-1 text-lg font-bold text-[var(--ink)]">
                    Orders by category
                  </h3>
                </div>
              </div>

              {categoryRows.length ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryRows}>
                      <CartesianGrid stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "#565959", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#565959", fontSize: 12 }} allowDecimals={false} />
                      <Tooltip
                        cursor={{ fill: "rgba(255,153,0,0.06)" }}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #d5d9d9",
                          background: "#ffffff",
                          fontSize: 13,
                        }}
                      />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                        {categoryRows.map((entry, index) => (
                          <Cell key={entry.name} fill={chartPalette[index % chartPalette.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  title="No category activity"
                  description="Create or approve orders to populate this chart."
                />
              )}
            </Panel>

            <Panel className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="section-kicker">Status Breakdown</p>
                  <h3 className="mt-1 text-lg font-bold text-[var(--ink)]">
                    Order status split
                  </h3>
                </div>
              </div>

              {statusRows.some((row) => row.value > 0) ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusRows}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={3}
                      >
                        {statusRows.map((entry, index) => (
                          <Cell key={entry.status} fill={chartPalette[index % chartPalette.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #d5d9d9",
                          background: "#ffffff",
                          fontSize: 13,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  title="No status data"
                  description="Pie chart appears once current-month orders exist."
                />
              )}
            </Panel>
          </section>

          {/* ─── Tables Row ──────────────────────────────── */}
          <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Panel className="p-5">
              <div className="mb-4">
                <p className="section-kicker">Top Items</p>
                <h3 className="mt-1 text-lg font-bold text-[var(--ink)]">
                  Item usage ranking
                </h3>
              </div>

              {usageRows.length ? (
                <div className="hide-scrollbar overflow-auto">
                  <table className="stk-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Item name</th>
                        <th>Category</th>
                        <th>Total orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageRows.map((row, index) => (
                        <tr key={`${row.itemName}-${row.categoryName}`}>
                          <td className="font-medium text-[var(--ink-soft)]">{index + 1}</td>
                          <td className="font-semibold">{row.itemName}</td>
                          <td className="text-[var(--ink-soft)]">{row.categoryName}</td>
                          <td className="font-bold text-[var(--primary-dark)]">{formatQty(row.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="Usage list empty"
                  description="Approve orders to calculate item usage."
                />
              )}
            </Panel>

            <Panel className="p-5">
              <p className="section-kicker">Summary</p>
              <h3 className="mt-1 text-lg font-bold text-[var(--ink)]">
                Team snapshot
              </h3>
              <div className="mt-4 space-y-3">
                <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                    Active workload
                  </p>
                  <p className="mt-2 text-3xl font-extrabold text-[var(--ink)]">
                    {formatQty(metrics.pending + metrics.approved)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">
                    Pending + approved orders in current month
                  </p>
                </div>
                <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                    Quick note
                  </p>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">
                    {isUser(profile)
                      ? "Your dashboard shows only your orders. Use the Orders page to place requests and track decisions."
                      : "Click any metric card above to view a detailed list of orders by status."}
                  </p>
                </div>
              </div>
            </Panel>
          </section>

          {/* ─── Detail Modal ────────────────────────────── */}
          <Modal
            open={selectedStatus !== null}
            onClose={() => setSelectedStatus(null)}
            title={
              selectedStatus === "ALL" || selectedStatus === null
                ? "Current month orders"
                : `${selectedStatus.toLowerCase()} orders`
            }
            description="Click dashboard cards to view current-month report lines."
          >
            {focusedOrders.length ? (
              <div className="hide-scrollbar overflow-auto">
                <table className="stk-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Item</th>
                      <th>Category</th>
                      <th>Qty</th>
                      <th>User</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {focusedOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{formatDate(order.date || order.createdAt)}</td>
                        <td className="font-semibold">{order.itemName}</td>
                        <td className="text-[var(--ink-soft)]">{order.categoryName}</td>
                        <td className="font-medium">{formatQty(order.qty)}</td>
                        <td className="text-[var(--ink-soft)]">{order.requestedByName}</td>
                        <td>
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No matching orders"
                description="This popup will show report rows as current-month orders are created."
              />
            )}
          </Modal>
        </>
      )}
    </AppShell>
  );
}
