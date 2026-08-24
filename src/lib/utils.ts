import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function authEmailFromUsername(value: string) {
  // Firebase Auth validates email domains; `.local` is rejected as invalid.
  // Use an RFC-reserved, syntactically valid domain for username-based logins.
  return `${normalizeUsername(value)}@stk-stock.invalid`;
}

export function titleFromSlug(value: string) {
  return value
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function toDate(value?: Timestamp | Date | string | null) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (value instanceof Timestamp) {
    return value.toDate();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

export function formatDate(value?: Timestamp | Date | string | null) {
  const date = toDate(value);
  return date ? format(date, "dd MMM yyyy") : "--";
}

export function formatDateTime(value?: Timestamp | Date | string | null) {
  const date = toDate(value);
  return date ? format(date, "dd MMM yyyy, hh:mm a") : "--";
}

export function formatMonthLabel(value?: Timestamp | Date | string | null) {
  const date = toDate(value);
  return date ? format(date, "MMMM yyyy") : "--";
}

export function toIsoDateInput(value?: Timestamp | Date | string | null) {
  const date = toDate(value);
  return date ? format(date, "yyyy-MM-dd") : "";
}

export function toMonthInput(value?: Timestamp | Date | string | null) {
  const date = toDate(value);
  return date ? format(date, "yyyy-MM") : "";
}

export function formatQty(value?: number | null) {
  return new Intl.NumberFormat("en-IN").format(value ?? 0);
}

export function monthKeyFromValue(value?: Timestamp | Date | string | null) {
  const date = toDate(value);
  return date ? format(date, "yyyy-MM") : "";
}

export function isCurrentMonth(value?: Timestamp | Date | string | null) {
  const date = toDate(value);
  if (!date) {
    return false;
  }

  const now = new Date();
  return (
    date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  );
}

export function downloadCsv(filename: string, rows: Array<Record<string, string | number>>) {
  if (!rows.length || typeof window === "undefined") {
    return;
  }

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? "";
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
