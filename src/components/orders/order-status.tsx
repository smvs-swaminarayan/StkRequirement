"use client";

import { ClipboardList, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { OrderStatus } from "@/lib/firebase/types";
import { formatDateTime } from "@/lib/utils";

export function buildStatusMessage(
  status: OrderStatus,
  value?: Parameters<typeof formatDateTime>[0],
) {
  const formattedValue = formatDateTime(value);

  if (status === "APPROVED") {
    return `Your order is approved now at ${formattedValue}.`;
  }

  if (status === "REJECTED") {
    return `Your order was rejected at ${formattedValue}.`;
  }

  return `Your order is delivered now at ${formattedValue}.`;
}

export function getDecisionTitle(status: OrderStatus) {
  if (status === "APPROVED") {
    return "Approved note";
  }

  if (status === "REJECTED") {
    return "Rejected note";
  }

  return "Delivered note";
}

export function getActionLabel(status: OrderStatus) {
  if (status === "APPROVED") {
    return "Approve";
  }

  if (status === "REJECTED") {
    return "Reject";
  }

  return "Deliver";
}

export function getActionIcon(status: OrderStatus) {
  if (status === "APPROVED") {
    return ShieldCheck;
  }

  if (status === "REJECTED") {
    return ClipboardList;
  }

  return Truck;
}

export function OrderDecisionBlock({
  title,
  status,
  timestamp,
  actorName,
  customNote,
}: {
  title: string;
  status: OrderStatus;
  timestamp?: Parameters<typeof formatDateTime>[0];
  actorName?: string;
  customNote?: string;
  tone?: "default" | "commerce";
}) {
  if (!timestamp) {
    return null;
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-[var(--ink)]">{title}</p>
        <StatusBadge status={status} />
      </div>
      <p className="mt-2 text-sm text-[var(--ink)]">{buildStatusMessage(status, timestamp)}</p>
      {customNote ? (
        <p className="mt-2 rounded-[var(--radius-sm)] bg-white px-3 py-2 text-sm text-[var(--ink-soft)]">
          {customNote}
        </p>
      ) : null}
      {actorName ? (
        <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
          Action by {actorName}
        </p>
      ) : null}
    </div>
  );
}

export function OrderStatusIcon({ status }: { status: OrderStatus }) {
  const Icon = status === "APPROVED" ? ShieldCheck : status === "REJECTED" ? ClipboardList : Truck;
  return <Icon className="h-4 w-4" />;
}

export function EmptyOrderThumb() {
  return <PackageCheck className="h-6 w-6 text-[var(--ink-soft)]" />;
}
