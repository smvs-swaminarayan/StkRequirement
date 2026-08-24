"use client";

import { useEffect, useState } from "react";
import { getPublicCatalogUrl } from "@/lib/firebase/catalog-sync";
import { subscribeFirestoreRefresh } from "@/lib/firestore-refresh";
import { usePublicStockAvailability } from "@/hooks/use-public-stock-availability";
import type { CategoryRecord, ItemRecord } from "@/lib/firebase/types";

type WithId<T> = T & { id: string };

const CATALOG_POLL_MS = 60000;

/**
 * Fetches categories and items from Firebase Storage JSON WITHOUT requiring authentication.
 * Stock comes from `/api/stock-availability` via `usePublicStockAvailability`.
 */
export function usePublicCatalog(selectedCategoryId?: string) {
  const { stockMap, getAvailableStock } = usePublicStockAvailability();
  const [categories, setCategories] = useState<WithId<CategoryRecord>[]>([]);
  const [items, setItems] = useState<WithId<ItemRecord>[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogQuotaExceeded, setCatalogQuotaExceeded] = useState(false);

  useEffect(() => {
    let disposed = false;

    const loadCatalog = async (showLoading = false) => {
      if (showLoading) setLoading(true);

      try {
        const res = await fetch('/api/catalog', {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to fetch catalog");
        }
        
        const data = await res.json();
        
        if (disposed) return;

        const allCategories = data.categories || [];
        let allItems = data.items || [];

        // Apply client-side filtering if category is selected
        if (selectedCategoryId && selectedCategoryId !== "ALL") {
          allItems = allItems.filter((i: any) => String(i.categoryId) === String(selectedCategoryId));
        }

        setCategories(allCategories);
        setItems(allItems);
      } catch (err: any) {
        console.error("Failed to fetch static catalog:", err);
        // Set quota exceeded if we fail to fetch from API
        setCatalogQuotaExceeded(true);
      } finally {
        if (!disposed) setLoading(false);
      }
    };

    void loadCatalog(true);

    const unsubscribeRefresh = subscribeFirestoreRefresh((detail) => {
      if (
        !detail.paths?.length ||
        detail.paths.includes("categories") ||
        detail.paths.includes("items")
      ) {
        void loadCatalog();
      }
    });

    const intervalId = window.setInterval(() => {
      void loadCatalog();
    }, CATALOG_POLL_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void loadCatalog();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      unsubscribeRefresh();
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [selectedCategoryId]);

  return { categories, items, stockMap, getAvailableStock, loading, quotaExceeded: catalogQuotaExceeded };
}