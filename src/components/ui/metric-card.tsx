"use client";

import { cn, formatQty } from "@/lib/utils";
import { TrendingUp, Clock, CheckCircle2, XCircle, Package } from "lucide-react";

const accentConfig = {
  primary: {
    bg: "bg-[var(--accent-soft)]",
    text: "text-[var(--accent)]",
    border: "border-[var(--accent)]/20",
    icon: TrendingUp,
  },
  accent: {
    bg: "bg-[var(--primary-soft)]",
    text: "text-[var(--primary-dark)]",
    border: "border-[var(--primary)]/20",
    icon: Clock,
  },
  success: {
    bg: "bg-[var(--success-soft)]",
    text: "text-[var(--success)]",
    border: "border-[var(--success)]/20",
    icon: Package,
  },
  danger: {
    bg: "bg-[var(--danger-soft)]",
    text: "text-[var(--danger)]",
    border: "border-[var(--danger)]/20",
    icon: XCircle,
  },
};

export function MetricCard({
  label,
  value,
  accent,
  onClick,
}: {
  label: string;
  value: number;
  accent: keyof typeof accentConfig;
  onClick?: () => void;
}) {
  const config = accentConfig[accent];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "stk-card-hover relative overflow-hidden p-4 text-left",
        onClick ? "cursor-pointer" : "cursor-default",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-soft)]">
            {label}
          </p>
          <p className="mt-2 text-2xl font-extrabold text-[var(--ink)]">
            {formatQty(value)}
          </p>
        </div>
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)]", config.bg)}>
          <Icon className={cn("h-4.5 w-4.5", config.text)} />
        </div>
      </div>
      <div className={cn("absolute bottom-0 left-0 h-[3px] w-full", config.bg)} />
    </button>
  );
}
