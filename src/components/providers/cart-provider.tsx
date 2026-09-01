"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartLine = {
  itemId: string;
  variant?: string;
  qty: number;
  summary: string;
  notes: string;
};

type CartContextValue = {
  cart: CartLine[];
  setCart: React.Dispatch<React.SetStateAction<CartLine[]>>;
  clearCart: () => void;
  addToCart: (itemId: string | number, options?: { qty?: number; notes?: string; variant?: string }) => void;
  updateLine: (itemId: string | number, values: Partial<CartLine>, variant?: string) => void;
  changeQty: (itemId: string | number, delta: number, variant?: string) => void;
  removeLine: (itemId: string | number, variant?: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "stk-cart:storage_v3";

function safeParseCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((line) => {
        if (!line || typeof line !== "object") return null;
        const rawItemId = (line as { itemId?: unknown }).itemId;
        if (rawItemId === undefined || rawItemId === null || rawItemId === "") return null;
        const itemId = String(rawItemId);
        const rawVariant = (line as { variant?: unknown }).variant;
        const variant =
          typeof rawVariant === "string" && rawVariant.trim()
            ? rawVariant.trim()
            : typeof rawVariant === "number"
            ? String(rawVariant)
            : undefined;
        const qty = (line as { qty?: unknown }).qty;
        const summary = (line as { summary?: unknown }).summary;
        const notes = (line as { notes?: unknown }).notes;
        return {
          itemId,
          variant,
          qty: typeof qty === "number" && Number.isFinite(qty) ? Math.max(1, qty) : 1,
          summary: typeof summary === "string" ? summary : "",
          notes: typeof notes === "string" ? notes : "",
        };
      })
      .filter((line): line is CartLine => line !== null);
  } catch {
    return [];
  }
}

function loadInitialCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const v3 = localStorage.getItem(STORAGE_KEY);
    const v2 = localStorage.getItem("stk-cart:storage_v2");
    const v1 = localStorage.getItem("stk-cart:pending");
    return safeParseCart(v3 || v2 || v1);
  } catch {
    return [];
  }
}

function persistCart(cart: CartLine[]) {
  if (typeof window === "undefined") return;
  try {
    const json = JSON.stringify(cart);
    localStorage.setItem(STORAGE_KEY, json);
    localStorage.setItem("stk-cart:storage_v2", json);
    localStorage.setItem("stk-cart:pending", json);
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCartState] = useState<CartLine[]>(loadInitialCart);

  useEffect(() => {
    const sync = () => {
      const current = loadInitialCart();
      setCartState(current);
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  const setCart: React.Dispatch<React.SetStateAction<CartLine[]>> = (action) => {
    setCartState((prev) => {
      const next = typeof action === "function" ? (action as (p: CartLine[]) => CartLine[])(prev) : action;
      persistCart(next);
      return next;
    });
  };

  const clearCart = () => {
    persistCart([]);
    setCartState([]);
  };

  const addToCart = (itemId: string | number, options?: { qty?: number; notes?: string; variant?: string }) => {
    const sItemId = String(itemId);
    const qty = options?.qty && Number.isFinite(options.qty) ? Math.max(1, options.qty) : 1;
    const notes = options?.notes?.trim?.() ?? "";
    const variant = options?.variant ? String(options.variant).trim() : undefined;

    setCartState((current) => {
      const existingIndex = current.findIndex(
        (line) => String(line.itemId) === sItemId && (line.variant || "") === (variant || "")
      );
      let next: CartLine[];
      if (existingIndex >= 0) {
        next = current.map((line, idx) =>
          idx === existingIndex
            ? { ...line, qty: line.qty + qty, notes: notes || line.notes }
            : line
        );
      } else {
        next = [...current, { itemId: sItemId, variant, qty, summary: "", notes }];
      }
      persistCart(next);
      return next;
    });
  };

  const updateLine = (itemId: string | number, values: Partial<CartLine>, variant?: string) => {
    const sItemId = String(itemId);
    setCartState((current) => {
      const next = current.map((line) =>
        String(line.itemId) === sItemId && (variant === undefined || (line.variant || "") === (variant || ""))
          ? { ...line, ...values }
          : line
      );
      persistCart(next);
      return next;
    });
  };

  const changeQty = (itemId: string | number, delta: number, variant?: string) => {
    const sItemId = String(itemId);
    setCartState((current) => {
      const next = current.map((line) =>
        String(line.itemId) === sItemId && (variant === undefined || (line.variant || "") === (variant || ""))
          ? { ...line, qty: Math.max(1, line.qty + delta) }
          : line
      );
      persistCart(next);
      return next;
    });
  };

  const removeLine = (itemId: string | number, variant?: string) => {
    const sItemId = String(itemId);
    setCartState((current) => {
      const next = current.filter(
        (line) => !(String(line.itemId) === sItemId && (variant === undefined || (line.variant || "") === (variant || "")))
      );
      persistCart(next);
      return next;
    });
  };

  const value = useMemo<CartContextValue>(() => {
    return { cart, setCart, clearCart, addToCart, updateLine, changeQty, removeLine };
  }, [cart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
