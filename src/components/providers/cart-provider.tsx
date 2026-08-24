"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/providers/auth-provider";

export type CartLine = {
  itemId: string;
  qty: number;
  summary: string;
  notes: string;
};

type CartContextValue = {
  cart: CartLine[];
  setCart: React.Dispatch<React.SetStateAction<CartLine[]>>;
  clearCart: () => void;
  addToCart: (itemId: string, options?: { qty?: number; notes?: string }) => void;
  updateLine: (itemId: string, values: Partial<CartLine>) => void;
  changeQty: (itemId: string, delta: number) => void;
  removeLine: (itemId: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const PENDING_CART_KEY = "stk-cart:pending";
const cartKeyForUid = (uid: string) => `stk-cart:${uid}`;

function safeParseCart(raw: string | null) {
  if (!raw) return [] as CartLine[];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [] as CartLine[];
    return parsed
      .map((line) => {
        if (!line || typeof line !== "object") return null;
        const itemId = (line as { itemId?: unknown }).itemId;
        const qty = (line as { qty?: unknown }).qty;
        const summary = (line as { summary?: unknown }).summary;
        const notes = (line as { notes?: unknown }).notes;
        if (typeof itemId !== "string" || !itemId) return null;
        return {
          itemId,
          qty: typeof qty === "number" && Number.isFinite(qty) ? Math.max(1, qty) : 1,
          summary: typeof summary === "string" ? summary : "",
          notes: typeof notes === "string" ? notes : "",
        } satisfies CartLine;
      })
      .filter(Boolean) as CartLine[];
  } catch {
    return [] as CartLine[];
  }
}

function writeCartToStorage(key: string, cart: CartLine[]) {
  // Persistence disabled so cart clears on page refresh
}

function readCartFromStorage(key: string) {
  // Return empty array to clear cart on load
  return [] as CartLine[];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const uid = profile?.uid ?? "";
  const storageKey = uid ? cartKeyForUid(uid) : PENDING_CART_KEY;
  const [cart, setCart] = useState<CartLine[]>([]);

  // Load cart for current key (uid or pending).
  useEffect(() => {
    const nextCart = readCartFromStorage(storageKey);
    startTransition(() => {
      setCart((current) =>
        JSON.stringify(current) === JSON.stringify(nextCart) ? current : nextCart,
      );
    });
  }, [storageKey]);

  // Persist cart.
  useEffect(() => {
    writeCartToStorage(storageKey, cart);
  }, [cart, storageKey]);

  // Migrate "pending" cart into user cart once uid is known.
  useEffect(() => {
    if (!uid || typeof window === "undefined") return;
    const pending = readCartFromStorage(PENDING_CART_KEY);
    if (!pending.length) return;
    const existing = readCartFromStorage(cartKeyForUid(uid));
    const merged = mergeCarts(existing, pending);
    writeCartToStorage(cartKeyForUid(uid), merged);
    window.localStorage.removeItem(PENDING_CART_KEY);
    startTransition(() => setCart(merged));
  }, [uid]);

  const value = useMemo<CartContextValue>(() => {
    const clearCart = () => setCart([]);
    const addToCart = (itemId: string, options?: { qty?: number; notes?: string }) => {
      const qty = options?.qty && Number.isFinite(options.qty) ? Math.max(1, options.qty) : 1;
      const notes = options?.notes?.trim?.() ?? "";
      setCart((current) => {
        const existing = current.find((line) => line.itemId === itemId);
        if (existing) {
          return current.map((line) =>
            line.itemId === itemId
              ? { ...line, qty: line.qty + qty, notes: notes || line.notes }
              : line,
          );
        }
        return [...current, { itemId, qty, summary: "", notes }];
      });
    };
    const updateLine = (itemId: string, values: Partial<CartLine>) => {
      setCart((current) =>
        current.map((line) => (line.itemId === itemId ? { ...line, ...values } : line)),
      );
    };
    const changeQty = (itemId: string, delta: number) => {
      setCart((current) =>
        current.map((line) =>
          line.itemId === itemId ? { ...line, qty: Math.max(1, line.qty + delta) } : line,
        ),
      );
    };
    const removeLine = (itemId: string) => {
      setCart((current) => current.filter((line) => line.itemId !== itemId));
    };
    return { cart, setCart, clearCart, addToCart, updateLine, changeQty, removeLine };
  }, [cart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function mergeCarts(left: CartLine[], right: CartLine[]) {
  const map = new Map<string, CartLine>();
  for (const line of left) map.set(line.itemId, line);
  for (const line of right) {
    const existing = map.get(line.itemId);
    map.set(
      line.itemId,
      existing
        ? {
            ...existing,
            qty: existing.qty + line.qty,
            notes: existing.notes || line.notes,
            summary: existing.summary || line.summary,
          }
        : line,
    );
  }
  return Array.from(map.values());
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider.");
  }
  return ctx;
}

