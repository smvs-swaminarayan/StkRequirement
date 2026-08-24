"use client";

import { cn } from "@/lib/utils";

type Option = {
  value: string;
  label: string;
};

export function FilterChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  if (!options.length) {
    return null;
  }

  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              className={cn(
                "rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-bold transition",
                active
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--header-bg)]"
                  : "border-[var(--border)] bg-white text-[var(--ink-soft)] hover:bg-[var(--paper)] hover:text-[var(--ink)]",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
