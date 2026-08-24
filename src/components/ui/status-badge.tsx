import type { OrderStatus } from "@/lib/firebase/types";
import { cn } from "@/lib/utils";

const statusMap: Record<OrderStatus, { label: string; dot: string; shell: string }> = {
  PENDING: {
    label: "Pending",
    dot: "bg-[#c7511f]",
    shell: "border-[#c7511f]/30 bg-[#fff4e0] text-[#c7511f]",
  },
  APPROVED: {
    label: "Approved",
    dot: "bg-[var(--accent)]",
    shell: "border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)]",
  },
  REJECTED: {
    label: "Rejected",
    dot: "bg-[var(--danger)]",
    shell: "border-[var(--danger)]/30 bg-[var(--danger-soft)] text-[var(--danger)]",
  },
  DELIVERED: {
    label: "Delivered",
    dot: "bg-[var(--success)]",
    shell: "border-[var(--success)]/30 bg-[var(--success-soft)] text-[var(--success)]",
  },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const tone = statusMap[status];

  return (
    <span
      className={cn(
        "stk-badge border",
        tone.shell,
      )}
    >
      <span className={cn("status-dot", tone.dot)} />
      {tone.label}
    </span>
  );
}
