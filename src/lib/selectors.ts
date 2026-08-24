import type {
  CategoryRecord,
  ItemRecord,
  OrderRecord,
  OrderStatus,
  StockEntryRecord,
} from "@/lib/firebase/types";
import { monthKeyFromValue } from "@/lib/utils";

export function getRecordDate(
  record: Pick<OrderRecord, "date" | "createdAt"> | Pick<StockEntryRecord, "date" | "createdAt">,
) {
  return record.date || record.createdAt || null;
}

export function withinDateRange(
  value: string | undefined,
  startDate?: string,
  endDate?: string,
) {
  if (!value) {
    return true;
  }

  if (startDate && value < startDate) {
    return false;
  }

  if (endDate && value > endDate) {
    return false;
  }

  return true;
}

export function matchesMonths(value: string | undefined, months: string[]) {
  if (!months.length) {
    return true;
  }

  return months.includes(monthKeyFromValue(value));
}

export function matchesList(value: string, selected: string[]) {
  if (!selected.length) {
    return true;
  }

  return selected.includes(value);
}

export function buildOrderMetrics(orders: OrderRecord[]) {
  const total = orders.length;
  const pending = orders.filter((order) => order.status === "PENDING").length;
  const approved = orders.filter((order) => order.status === "APPROVED").length;
  const rejected = orders.filter((order) => order.status === "REJECTED").length;
  const delivered = orders.filter((order) => order.status === "DELIVERED").length;

  return { total, pending, approved, rejected, delivered };
}

export function buildCategoryChart(orders: OrderRecord[]) {
  const counts = new Map<string, number>();

  for (const order of orders) {
    counts.set(order.categoryName, (counts.get(order.categoryName) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((left, right) => right.total - left.total);
}

export function buildStatusChart(orders: OrderRecord[]) {
  const counts: Array<{ name: string; value: number; status: OrderStatus }> = [
    { name: "Pending", value: 0, status: "PENDING" },
    { name: "Approved", value: 0, status: "APPROVED" },
    { name: "Rejected", value: 0, status: "REJECTED" },
    { name: "Delivered", value: 0, status: "DELIVERED" },
  ];

  for (const row of counts) {
    row.value = orders.filter((order) => order.status === row.status).length;
  }

  return counts;
}

export function buildItemUsageRows(orders: OrderRecord[]) {
  const counts = new Map<string, { itemName: string; categoryName: string; total: number }>();

  for (const order of orders.filter((entry) => entry.status !== "REJECTED")) {
    const key = `${order.itemId}-${order.categoryId}`;
    const current = counts.get(key) ?? {
      itemName: order.itemName,
      categoryName: order.categoryName,
      total: 0,
    };
    current.total += 1;
    counts.set(key, current);
  }

  return Array.from(counts.values()).sort((left, right) => right.total - left.total);
}

export function buildStockRows(items: ItemRecord[], stockEntries: StockEntryRecord[], orders: OrderRecord[]) {
  const stockIn = new Map<string, number>();
  const stockOut = new Map<string, number>();

  for (const entry of stockEntries) {
    stockIn.set(entry.itemId, (stockIn.get(entry.itemId) ?? 0) + Number(entry.qty));
  }

  for (const order of orders.filter((entry) =>
    entry.status === "APPROVED" || entry.status === "DELIVERED",
  )) {
    stockOut.set(order.itemId, (stockOut.get(order.itemId) ?? 0) + Number(order.qty));
  }

  return items.map((item) => {
    const totalIn = stockIn.get(item.id) ?? 0;
    const totalOut = stockOut.get(item.id) ?? 0;

    return {
      itemId: item.id,
      itemName: item.name,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      unit: item.unit,
      stockIn: totalIn,
      stockOut: totalOut,
      availableStock: totalIn - totalOut,
    };
  });
}

export function buildMemberwiseRows(orders: OrderRecord[]) {
  const rows = new Map<
    string,
    {
      username: string;
      requestedByName: string;
      categoryName: string;
      itemName: string;
      totalOrder: number;
    }
  >();

  for (const order of orders.filter((entry) => entry.status !== "REJECTED")) {
    const key = `${order.requestedByUsername}-${order.categoryId}-${order.itemId}`;
    const current = rows.get(key) ?? {
      username: order.requestedByUsername,
      requestedByName: order.requestedByName,
      categoryName: order.categoryName,
      itemName: order.itemName,
      totalOrder: 0,
    };

    current.totalOrder += Number(order.qty);
    rows.set(key, current);
  }

  return Array.from(rows.values()).sort((left, right) => right.totalOrder - left.totalOrder);
}

export function uniqueMonthOptions(values: Array<string | undefined>) {
  return Array.from(new Set(values.map((value) => monthKeyFromValue(value)).filter(Boolean))).sort();
}

export function filterItemsByCategories(items: ItemRecord[], categoryIds: number[]) {
  if (!categoryIds.length) {
    return items;
  }

  return items.filter((item) => categoryIds.includes(item.categoryId));
}

export function findCategoryName(categories: CategoryRecord[], categoryId: number) {
  return categories.find((category) => category.id === categoryId)?.name ?? "";
}

export function findItemName(items: ItemRecord[], itemId: number) {
  return items.find((item) => item.id === itemId)?.name ?? "";
}
