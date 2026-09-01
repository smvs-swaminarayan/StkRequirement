"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { subscribeFirestoreRefresh } from "@/lib/firestore-refresh";

const POLL_INTERVAL_MS = 8000;

async function fetchStockMap(): Promise<{
  availability: Record<string, number>;
  variantAvailability: Record<string, number>;
} | null> {
  try {
    const res = await fetch("/api/stock-availability", {
      cache: "no-store",
      headers: { "ngrok-skip-browser-warning": "true" }
    });
    const data = (await res.json()) as {
      availability?: Record<string, number>;
      variantAvailability?: Record<string, number>;
      quotaExceeded?: boolean;
    };
    if (data.quotaExceeded) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('quota-exceeded'));
      }
    }
    return {
      availability: data.availability ?? {},
      variantAvailability: data.variantAvailability ?? {},
    };
  } catch (err) {
    return null;
  }
}

export function usePublicStockAvailability() {
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [variantMap, setVariantMap] = useState<Record<string, number>>({});

  useEffect(() => {
    let disposed = false;

    const load = async () => {
      const next = await fetchStockMap();
      if (disposed || next === null) return;
      setStockMap(next.availability);
      setVariantMap(next.variantAvailability);
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

    window.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onVisibility);

    return () => {
      disposed = true;
      unsubscribeRefresh();
      window.clearInterval(intervalId);
      window.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onVisibility);
    };
  }, []);

  const getAvailableStock = useCallback(
    (itemId: string | number, variant?: string) => {
      if (variant && variant.trim()) {
        const vKey = `${String(itemId)}__${variant.trim()}`;
        return Math.max(0, variantMap[vKey] ?? 0);
      }
      return Math.max(0, stockMap[String(itemId)] ?? 0);
    },
    [stockMap, variantMap]
  );

  return useMemo(
    () => ({
      stockMap,
      variantMap,
      getAvailableStock,
    }),
    [stockMap, variantMap, getAvailableStock]
  );
}
