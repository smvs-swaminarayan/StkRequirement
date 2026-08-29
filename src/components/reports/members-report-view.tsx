"use client";

import { useState, useMemo } from "react";
import { Download, UserCheck } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { Pagination } from "@/components/ui/pagination";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import { buildMemberwiseRows } from "@/lib/selectors";
import { downloadCsv, formatQty } from "@/lib/utils";

export function MembersReportView() {
  const { loading, orders, users } = useWorkspaceData({
    fetchStockEntries: false,
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUsername, setSelectedUsername] = useState("");

  const memberRows = useMemo(() => {
    return buildMemberwiseRows(
      orders.filter((order) => {
        return selectedUsername ? order.requestedByUsername === selectedUsername : true;
      }),
    );
  }, [orders, selectedUsername]);

  const paginatedMemberRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return memberRows.slice(start, start + pageSize);
  }, [memberRows, page, pageSize]);

  return (
    <AppShell title="Memberwise Order Report">
      <Panel className="p-5 border border-gray-200 bg-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 leading-tight">Memberwise Order Report</h2>
              <span className="text-[11px] font-semibold text-purple-600">{memberRows.length} User Line Items</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              downloadCsv(
                "memberwise-order-report.csv",
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
            Export CSV
          </button>
        </div>

        {/* User Dropdown Filter */}
        <div className="grid gap-3 max-w-sm">
          <label className="text-xs font-bold text-gray-700">
            Select User
            <select
              value={selectedUsername}
              onChange={(e) => {
                setSelectedUsername(e.target.value);
                setPage(1);
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

        {/* Table */}
        {loading ? (
          <div className="py-8 text-center text-xs text-gray-500">Loading member orders...</div>
        ) : memberRows.length ? (
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
                        {(page - 1) * pageSize + index + 1}
                      </td>
                      <td className="p-3 font-bold text-gray-900">
                        {row.requestedByName} (@{row.username})
                      </td>
                      <td className="p-3 text-gray-600">{row.categoryName}</td>
                      <td className="p-3 text-gray-900">{row.itemName}</td>
                      <td className="p-3 font-extrabold text-purple-600">{formatQty(row.totalOrder)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={page}
              totalItems={memberRows.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 25, 50]}
            />
          </div>
        ) : (
          <EmptyState title="Memberwise report is empty" description="Select a different user or place more orders." />
        )}
      </Panel>
    </AppShell>
  );
}
