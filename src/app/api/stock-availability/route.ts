import { NextResponse } from "next/server";
import { executeDbQuery } from "@/lib/sqlite-action";

export async function GET() {
  try {
    const [stockSnap, ordersSnap, itemsSnap] = await Promise.all([
      executeDbQuery({ action: "getDocs", collection: "stockEntries" }),
      executeDbQuery({ action: "getDocs", collection: "orders" }),
      executeDbQuery({ action: "getDocs", collection: "items" }),
    ]);

    const stockIn = new Map<string, number>();
    const stockOut = new Map<string, number>();
    const variantStockIn = new Map<string, number>();
    const variantStockOut = new Map<string, number>();

    for (const data of (stockSnap as any[])) {
      if (data.deletedAt) continue;
      if (data.active === false) continue;
      const itemId = String(data.itemId);
      const variant = data.variant ? String(data.variant).trim() : "";
      const qty = Number(data.qty || 0);

      stockIn.set(itemId, (stockIn.get(itemId) ?? 0) + qty);
      if (variant) {
        const vKey = `${itemId}__${variant}`;
        variantStockIn.set(vKey, (variantStockIn.get(vKey) ?? 0) + qty);
      }
    }

    for (const data of (ordersSnap as any[])) {
      const status = data.status as string;
      // Reserved Stock logic: PENDING, APPROVED, and DELIVERED orders reserve stock.
      // Only REJECTED and CANCELLED orders release stock back to available pool.
      if (status === "REJECTED" || status === "CANCELLED") continue;
      const itemId = String(data.itemId);
      const variant = data.variant ? String(data.variant).trim() : "";
      const qty = Number(data.qty || 0);

      stockOut.set(itemId, (stockOut.get(itemId) ?? 0) + qty);
      if (variant) {
        const vKey = `${itemId}__${variant}`;
        variantStockOut.set(vKey, (variantStockOut.get(vKey) ?? 0) + qty);
      }
    }

    const availability: Record<string, number> = {};
    const variantAvailability: Record<string, number> = {};

    const allItemIds = new Set([...stockIn.keys(), ...stockOut.keys()]);
    for (const itemId of allItemIds) {
      const totalIn = stockIn.get(itemId) ?? 0;
      const totalOut = stockOut.get(itemId) ?? 0;
      availability[itemId] = Math.max(0, totalIn - totalOut);
    }

    for (const data of (itemsSnap as any[])) {
      if (data.deletedAt) continue;
      if (data.active === false) continue;
      const itemId = String(data.id);
      if (availability[itemId] === undefined) {
        availability[itemId] = 0;
      }
    }

    const allVariantKeys = new Set([...variantStockIn.keys(), ...variantStockOut.keys()]);
    for (const vKey of allVariantKeys) {
      const totalIn = variantStockIn.get(vKey) ?? 0;
      const totalOut = variantStockOut.get(vKey) ?? 0;
      variantAvailability[vKey] = Math.max(0, totalIn - totalOut);
    }

    return NextResponse.json(
      { availability, variantAvailability },
      {
        headers: {
          "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch stock.";
    return NextResponse.json(
      { error: message, availability: {}, variantAvailability: {}, quotaExceeded: false },
      { status: 500 }
    );
  }
}
