"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { subscribeFirestoreRefresh } from "@/lib/firestore-refresh";

type WithId<T> = T & { id: number };

const POLL_INTERVAL_MS = 15000;
const collectionMemoryCache = new Map<string, any[]>();

export function useFirestoreCollection<T extends DocumentData>(
  path: string,
  constraints?: QueryConstraint[],
  options?: { disabled?: boolean },
) {
  const cacheKey = `${path}:${options?.disabled ? "disabled" : "enabled"}`;
  const cachedItems = collectionMemoryCache.get(cacheKey) as Array<WithId<T>> | undefined;
  const [items, setItems] = useState<Array<WithId<T>>>(cachedItems ?? []);
  const [loading, setLoading] = useState(!cachedItems || cachedItems.length === 0);
  const [error, setError] = useState<number | null>(null);

  useEffect(() => {
    if (options?.disabled) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    let disposed = false;

    const baseRef = collection(db, path);
    const collectionQuery =
      constraints && constraints.length > 0
        ? query(baseRef, ...constraints)
        : query(baseRef, orderBy("createdAt", "desc"));

    const loadCollection = async (showLoading = false) => {
      if (showLoading && !collectionMemoryCache.has(cacheKey)) {
        setLoading(true);
      }

      try {
        const snapshot = await getDocs(collectionQuery);

        if (disposed) {
          return;
        }

        const mapped = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...(docItem.data() as T),
        })) as Array<WithId<T>>;

        collectionMemoryCache.set(cacheKey, mapped);
        setItems(mapped);
        setError(null);
      } catch (collectionError: any) {
        if (disposed) {
          return;
        }

        if (collectionError?.code === 'resource-exhausted' || collectionError?.message?.includes('Quota exceeded')) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('quota-exceeded'));
          }
        }

        setError(
          collectionError instanceof Error
            ? collectionError.message
            : "Unable to load collection.",
        );
      } finally {
        if (!disposed) {
          setLoading(false);
        }
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadCollection();
      }
    };
    const onFocus = () => {
      void loadCollection();
    };

    void loadCollection(true);
    const unsubscribeRefresh = subscribeFirestoreRefresh((detail) => {
      if (!detail.paths?.length || detail.paths.includes(path)) {
        void loadCollection();
      }
    });
    const intervalId = window.setInterval(() => {
      void loadCollection();
    }, POLL_INTERVAL_MS);

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      disposed = true;
      unsubscribeRefresh();
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [constraints, options?.disabled, path]);

  if (options?.disabled) {
    return { items: [] as Array<WithId<T>>, loading: false, error: null };
  }

  return { items, loading, error };
}
