"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
}: PaginationProps) {
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
          Showing <strong className="font-bold text-[var(--ink)]">{startItem}</strong> to{" "}
          <strong className="font-bold text-[var(--ink)]">{endItem}</strong> of{" "}
          <strong className="font-bold text-[var(--ink)]">{totalItems}</strong> entries
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

        {/* Previous */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex h-8 items-center gap-1 rounded border border-[var(--border)] bg-white px-2.5 text-xs font-semibold text-[var(--ink-soft)] transition hover:bg-[var(--paper)] hover:text-[var(--ink)] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[var(--ink-soft)]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-8 w-6 items-center justify-center text-xs text-[var(--ink-light)]"
                >
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => onPageChange(page)}
                className={cn(
                  "flex h-8 min-w-8 items-center justify-center rounded px-2 text-xs font-bold transition",
                  isActive
                    ? "border border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm"
                    : "border border-[var(--border)] bg-white text-[var(--ink)] hover:bg-[var(--paper)]",
                )}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex h-8 items-center gap-1 rounded border border-[var(--border)] bg-white px-2.5 text-xs font-semibold text-[var(--ink-soft)] transition hover:bg-[var(--paper)] hover:text-[var(--ink)] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[var(--ink-soft)]"
        >
          <span className="hidden sm:inline">Next</span>
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
