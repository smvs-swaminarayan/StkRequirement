"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
};

export function SearchableMultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = "Search options",
  emptyLabel = "No matching options.",
}: {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (nextSelected: string[]) => void;
  placeholder?: string;
  emptyLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    const needle = search.trim().toLowerCase();

    if (!needle) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [options, search]);

  const selectedOptions = useMemo(
    () => options.filter((option) => selected.includes(option.value)),
    [options, selected],
  );

  const toggleValue = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((entry) => entry !== value)
        : [...selected, value],
    );
  };

  if (!options.length) {
    return null;
  }

  return (
    <div className="surface-muted rounded-[20px] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
          {label}
        </p>
        {selected.length ? (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs font-semibold text-[var(--primary)]"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="field-shell mt-3 flex w-full items-center justify-between rounded-[16px] px-4 py-3 text-left text-sm text-[var(--ink)]"
      >
        <span>
          {selectedOptions.length
            ? `${selectedOptions.length} selected`
            : `Select ${label.toLowerCase()}`}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-[var(--ink-soft)] transition", open && "rotate-180")}
        />
      </button>

      {selectedOptions.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleValue(option.value)}
              className="inline-flex items-center gap-2 rounded-full border border-[#c9d9ec] bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--primary)]"
            >
              {option.label}
              <X className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-[var(--ink-soft)]">No {label.toLowerCase()} selected.</p>
      )}

      {open ? (
        <div className="mt-4 rounded-[18px] border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-soft)]">
          <label className="field-shell flex items-center gap-2 rounded-[14px] px-3 py-2 text-sm text-[var(--ink-soft)]">
            <Search className="h-4 w-4" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent outline-none"
            />
          </label>

          <div className="hide-scrollbar mt-3 max-h-56 space-y-2 overflow-auto pr-1">
            {filteredOptions.length ? (
              filteredOptions.map((option) => {
                const active = selected.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleValue(option.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-[14px] border px-3 py-2.5 text-sm transition",
                      active
                        ? "border-[#8ebae0] bg-[var(--primary-soft)] text-[var(--primary)]"
                        : "border-[var(--border)] bg-[var(--paper)] text-[var(--ink)] hover:bg-white",
                    )}
                  >
                    <span>{option.label}</span>
                    {active ? <Check className="h-4 w-4" /> : null}
                  </button>
                );
              })
            ) : (
              <div className="rounded-[16px] border border-dashed border-[var(--border)] px-3 py-4 text-sm text-[var(--ink-soft)]">
                {emptyLabel}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
