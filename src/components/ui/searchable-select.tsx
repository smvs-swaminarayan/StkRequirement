"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
};

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select option...",
  searchPlaceholder = "Search options...",
  emptyLabel = "No matching options.",
  className,
}: {
  value: string;
  onChange: (nextValue: string) => void;
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [options, search]);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", open && "z-50", className)}>
      <button
        type="button"
        onClick={() => setOpen((c) => !c)}
        className="field-shell flex w-full items-center justify-between rounded-[12px] px-3.5 py-2 text-left text-sm text-[var(--ink)] border border-[var(--border)] bg-white"
      >
        <span className={cn(!selectedOption && "text-[var(--ink-light)]")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-[var(--ink-soft)] transition", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-[9999] mt-1.5 w-full rounded-[14px] border border-[var(--border)] bg-white p-2 shadow-2xl max-h-72 flex flex-col">
          <label className="field-shell flex items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-xs text-[var(--ink-soft)] border border-[var(--border)] mb-2 bg-[var(--paper)]">
            <Search className="h-3.5 w-3.5 text-[var(--ink-light)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent outline-none text-sm text-[var(--ink)]"
              autoFocus
            />
          </label>

          <div className="hide-scrollbar max-h-48 space-y-1 overflow-auto pr-1">
            {filteredOptions.length ? (
              filteredOptions.map((option) => {
                const active = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-sm transition text-left",
                      active
                        ? "bg-[var(--primary-soft)] text-[var(--primary)] font-semibold"
                        : "text-[var(--ink)] hover:bg-[var(--paper)]"
                    )}
                  >
                    <span>{option.label}</span>
                    {active && <Check className="h-4 w-4" />}
                  </button>
                );
              })
            ) : (
              <div className="rounded-[10px] border border-dashed border-[var(--border)] px-3 py-4 text-center text-sm text-[var(--ink-soft)] bg-[var(--paper)]">
                {emptyLabel}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
