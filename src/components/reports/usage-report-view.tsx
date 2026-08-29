"use client";

import { useState, useMemo } from "react";
import { Download, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { Pagination } from "@/components/ui/pagination";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import { buildItemUsageRows } from "@/lib/selectors";
import { isLeader, isSuperAdmin } from "@/lib/permissions";
import { downloadCsv, formatQty } from "@/lib/utils";

export function UsageReportView() {
  const { loading, orders, profile } = useWorkspaceData({
    fetchStockEntries: false,
    fetchUsers: false,
  });

  const adminMode = isSuperAdmin(profile);
  const leaderMode = isLeader(profile);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const usageRows = useMemo(() => {
    return buildItemUsageRows(orders).filter((row) =>
      search
        ? row.itemName.toLowerCase().includes(search.toLowerCase()) ||
          row.categoryName.toLowerCase().includes(search.toLowerCase())
        : true,
    );
  }, [orders, search]);

  const paginatedUsageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return usageRows.slice(start, start + pageSize);
  }, [usageRows, page, pageSize]);

  return (
    <AppShell title={adminMode ? "System Item Usage Report" : leaderMode ? "Assigned Item Usage Report" : "My Requested Items Report"}>
      <Panel className="p-5 border border-gray-200 bg-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 leading-tight">Item Usage Summary</h2>
              <span className="text-[11px] font-semibold text-blue-600">{usageRows.length} Total Items</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search item..."
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={() =>
                downloadCsv(
                  "item-usage-report.csv",
                  usageRows.map((row, index) => ({
                    "Sr No": index + 1,
                    "Item Name": row.itemName,
                    Category: row.categoryName,
                    "Total Orders": row.total,
                  })),
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs transition"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-gray-500">Loading usage data...</div>
        ) : usageRows.length ? (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-200 bg-gray-50 text-gray-700 font-bold">
                  <tr>
                    <th className="p-3">Sr No</th>
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Total Orders Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedUsageRows.map((row, index) => (
                    <tr key={`${row.itemName}-${row.categoryName}`} className="hover:bg-gray-50/80 transition">
                      <td className="p-3 font-semibold text-gray-500">
                        {(page - 1) * pageSize + index + 1}
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
              currentPage={page}
              totalItems={usageRows.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 25, 50]}
            />
          </div>
        ) : (
          <EmptyState title="No usage data" description="Place orders to view item usage summary." />
        )}
      </Panel>
    </AppShell>
  );
}
