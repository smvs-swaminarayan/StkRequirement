import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/client";
import type { CategoryRecord, ItemRecord } from "@/lib/firebase/types";

type WithId<T> = T & { id: string };

const categoryOrder = ["Stationary", "General Store Clothes", "Electric", "General Store Others"];

/**
 * Fetches the active categories and items from Firestore,
 * formats and sorts them, and uploads the result as a JSON file to Firebase Storage.
 */
export async function syncPublicCatalog() {
  try {
    const res = await fetch('/api/trigger-sync');
    if (!res.ok) {
      console.error("Failed to trigger sync on server:", await res.text());
    } else {
      console.log("Successfully synced catalog via server API.");
    }
  } catch (error) {
    console.error("Failed to trigger sync:", error);
  }
}

/**
 * Retrieves the public download URL of the catalog JSON file.
 */
export async function getPublicCatalogUrl(): Promise<string | null> {
  // Use direct REST URL to avoid Firebase SDK retry hangs
  return "https://firebasestorage.googleapis.com/v0/b/stk-stock-f2557.firebasestorage.app/o/public%2Fcatalog.json?alt=media";
}

