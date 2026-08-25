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

    for (const data of (stockSnap as any[])) {
      if (data.deletedAt) continue;
      if (data.active === false) continue;
      const itemId = String(data.itemId);
      stockIn.set(itemId, (stockIn.get(itemId) ?? 0) + Number(data.qty || 0));
    }

    for (const data of (ordersSnap as any[])) {
      const status = data.status as string;
      if (status !== "APPROVED" && status !== "DELIVERED") continue;
      const itemId = String(data.itemId);
      stockOut.set(itemId, (stockOut.get(itemId) ?? 0) + Number(data.qty || 0));
    }

    const availability: Record<string, number> = {};
    const allItemIds = new Set([...stockIn.keys(), ...stockOut.keys()]);

    for (const itemId of allItemIds) {
      const totalIn = stockIn.get(itemId) ?? 0;
      const totalOut = stockOut.get(itemId) ?? 0;
      availability[itemId] = Math.max(0, totalIn - totalOut);
    }

    // Items with no stock-in rows still must appear as 0 available (not "unlimited").
    for (const data of (itemsSnap as any[])) {
      if (data.deletedAt) continue;
      if (data.active === false) continue;
      const itemId = String(data.id);
      if (availability[itemId] !== undefined) continue;
      const totalIn = stockIn.get(itemId) ?? 0;
      const totalOut = stockOut.get(itemId) ?? 0;
      availability[itemId] = Math.max(0, totalIn - totalOut);
    }

    return NextResponse.json({ availability }, {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch stock.";
    return NextResponse.json({ error: message, availability: {}, quotaExceeded: false }, { status: 500 });
  }
}
