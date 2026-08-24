"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { subscribeFirestoreRefresh } from "@/lib/firestore-refresh";

/** Poll stock API so delivered/approved orders reflect without a full reload. */
const POLL_INTERVAL_MS = 8000;

async function fetchStockMap(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch("/api/stock-availability", {
      cache: "no-store",
      headers: { "ngrok-skip-browser-warning": "true" }
    });
    const data = (await res.json()) as { availability?: Record<string, number>, quotaExceeded?: boolean };
    if (data.quotaExceeded) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('quota-exceeded'));
      }
    }
    return data.availability ?? {};
  } catch (err) {
    return null;
  }
}

/**
 * Loads public stock availability from `/api/stock-availability` (no auth).
 * Refreshes on interval, tab focus, and local `emitFirestoreRefresh` for orders/stock.
 */
export function usePublicStockAvailability() {
  const [stockMap, setStockMap] = useState<Record<string, number>>({});

  useEffect(() => {
    let disposed = false;

    const load = async () => {
      const next = await fetchStockMap();
      if (disposed || next === null) return;
      setStockMap(next);
    };

    void load();

    const unsubscribeRefresh = subscribeFirestoreRefresh((detail) => {
      if (
        !detail.paths?.length ||
        detail.paths.includes("stockEntries") ||
        detail.paths.includes("orders")
      ) {
        void load();
      }
    });

    const intervalId = window.setInterval(() => void load(), POLL_INTERVAL_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void load();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      unsubscribeRefresh();
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const getAvailableStock = useCallback((itemId: string | number) => stockMap[String(itemId)] ?? 0, [stockMap]);

  return useMemo(
    () => ({ stockMap, getAvailableStock }),
    [stockMap, getAvailableStock],
  );
}
