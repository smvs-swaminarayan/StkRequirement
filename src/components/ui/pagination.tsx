"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage?: number;
  page?: number;
  totalItems?: number;
  total?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination(props: PaginationProps) {
  const currentPage = Math.max(1, Number(props.currentPage ?? props.page ?? 1));
  const totalItems = Math.max(0, Number(props.totalItems ?? props.total ?? 0));
  const pageSize = Math.max(1, Number(props.pageSize ?? 10));
  const onPageChange = props.onPageChange ?? props.onChange ?? (() => {});
  const onPageSizeChange = props.onPageSizeChange;
  const pageSizeOptions = props.pageSizeOptions ?? [10, 25, 50, 100];
  const className = props.className;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("ellipsis");
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] bg-white px-4 py-3 sm:px-6",
        className,
      )}
    >
      {/* Left: Summary and Page Size */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--ink-soft)]">
        <span>
          Showing <strong className="font-bold text-[var(--ink)]">{String(startItem)}</strong> to{" "}
          <strong className="font-bold text-[var(--ink)]">{String(endItem)}</strong> of{" "}
          <strong className="font-bold text-[var(--ink)]">{String(totalItems)}</strong> entries
        </span>

        {onPageSizeChange ? (
          <div className="flex items-center gap-1.5 pl-2 border-l border-[var(--border)]">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="rounded border border-[var(--border)] bg-white px-2 py-1 text-xs font-semibold text-[var(--ink)] outline-none transition hover:border-[var(--primary)] focus:border-[var(--primary)]"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span>per page</span>
          </div>
        ) : null}
      </div>

      {/* Right: Page Navigation Buttons */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="flex h-8 w-8 items-center justify-center rounded border border-[var(--border)] bg-white text-[var(--ink-soft)] transition hover:bg-[var(--paper)] hover:text-[var(--ink)] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[var(--ink-soft)]"
          title="First Page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex h-8 w-8 items-center justify-center rounded border border-[var(--border)] bg-white text-[var(--ink-soft)] transition hover:bg-[var(--paper)] hover:text-[var(--ink)] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[var(--ink-soft)]"
          title="Previous Page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((p, idx) => {
          if (p === "ellipsis") {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-xs text-[var(--ink-soft)]">
                ...
              </span>
            );
          }
          const isCurrent = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                "flex h-8 min-w-[32px] items-center justify-center rounded px-2 text-xs font-bold transition",
                isCurrent
                  ? "bg-amber-500 text-white shadow-xs"
                  : "border border-[var(--border)] bg-white text-[var(--ink)] hover:bg-[var(--paper)]",
              )}
            >
              {p}
            </button>
          );
        })}

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded border border-[var(--border)] bg-white text-[var(--ink-soft)] transition hover:bg-[var(--paper)] hover:text-[var(--ink)] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[var(--ink-soft)]"
          title="Next Page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded border border-[var(--border)] bg-white text-[var(--ink-soft)] transition hover:bg-[var(--paper)] hover:text-[var(--ink)] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[var(--ink-soft)]"
          title="Last Page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
