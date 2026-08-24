import { Package } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--paper)] px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-soft)]">
        <Package className="h-5 w-5 text-[var(--primary)]" />
      </div>
      <p className="mt-4 text-base font-bold text-[var(--ink)]">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--ink-soft)]">{description}</p>
    </div>
  );
}
