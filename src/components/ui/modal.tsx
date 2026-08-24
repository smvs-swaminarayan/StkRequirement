"use client";

import { X } from "lucide-react";

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-3 py-4 sm:px-4 sm:py-8">
      <button type="button" onClick={onClose} className="absolute inset-0 cursor-default" />
      <div
        className="hide-scrollbar relative h-[92dvh] w-full max-w-4xl animate-fade-up overflow-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4 shadow-[0_24px_48px_rgba(0,0,0,0.18)] sm:h-auto sm:max-h-[88vh] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--ink)]">
              {title}
            </h3>
            {description ? (
              <p className="mt-1 max-w-2xl text-sm text-[var(--ink-soft)]">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper)] p-1.5 text-[var(--ink-soft)] transition hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
