"use client";
/* eslint-disable @next/next/no-img-element */

import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Minus,
  PackageOpen,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  Trash2,
  X,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { usePublicStockAvailability } from "@/hooks/use-public-stock-availability";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import { createOrder, createSpecialRequest } from "@/lib/firebase/firestore";
import { getItemImageCropStyle } from "@/lib/item-image";
import { cn, formatDate, formatDateTime, formatQty, toDate } from "@/lib/utils";
import { EmptyOrderThumb, getDecisionTitle, OrderDecisionBlock } from "@/components/orders/order-status";
import type { AppUserProfile, CategoryRecord, ItemRecord, SpecialRequestRecord } from "@/lib/firebase/types";
import { useFirestoreCollection } from "@/hooks/use-firestore-collection";
import type { CartLine } from "@/components/providers/cart-provider";

type UserOrdersView = "catalog" | "history" | "cart";
const historyStatuses = ["ALL", "PENDING", "APPROVED", "REJECTED", "DELIVERED"] as const;

export function UserOrdersWorkspace({ activeView }: { activeView: UserOrdersView }) {
  const { workspaceProfile: profile } = useAuth();
  const { categories, items, orders } = useWorkspaceData({ fetchItems: false });
  const [requestCategoryId, setRequestCategoryId] = useState("");
  const { items: requestItems, loading: requestItemsLoading } = useFirestoreCollection<ItemRecord>("items", requestCategoryId ? [require("firebase/firestore").where("categoryId", "==", requestCategoryId)] : undefined, { disabled: !requestCategoryId });
  const { getAvailableStock } = usePublicStockAvailability();
  const { cart, setCart, addToCart: addToCartBase, updateLine, changeQty, removeLine, clearCart } =
    useCart();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
  const [historyStatus, setHistoryStatus] =
    useState<(typeof historyStatuses)[number]>("ALL");
  const [submitting, setSubmitting] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [requestItem, setRequestItem] = useState<{ id: string, name: string, categoryId: string, categoryName: string } | null>(null);
  const [requestQty, setRequestQty] = useState(1);
  const [requestNotes, setRequestNotes] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemCategoryGuess, setNewItemCategoryGuess] = useState('');
  const [newItemImageUrl, setNewItemImageUrl] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestUserId, setRequestUserId] = useState("");
  const { items: allUsers, loading: usersLoading } = useFirestoreCollection<AppUserProfile>("users");
  const selectableUsers = useMemo(() => allUsers.filter(u => !u.deletedAt && !(u.roles?.length === 1 && u.roles[0] === "SUPER_ADMIN")).sort((a,b) => a.username.localeCompare(b.username, undefined, {numeric: true})), [allUsers]);
  const requestItemIdSearchOptions = useMemo(() => {
    return items
      .slice()
      .sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true, sensitivity: 'base' }))
      .map((item) => ({
        value: String(item.id),
        label: `${item.id} - ${item.name}`,
      }));
  }, [items]);

  const [selectedItem, setSelectedItem] = useState<ItemRecord | null>(null);
  const [historyOpenOrderId, setHistoryOpenOrderId] = useState<string | null>(null);
  const [detailQty, setDetailQty] = useState(1);
  const [detailActiveImage, setDetailActiveImage] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, active: false });
  const itemIdsKey = items
    .map((item) => item.id)
    .sort((left, right) => left.localeCompare(right))
    .join("|");

  const cartQtyFor = useCallback(
    (itemId: string) => cart.find((line) => line.itemId === itemId)?.qty ?? 0,
    [cart],
  );

  useEffect(() => {
    if (!selectedItem) return;
    const available = getAvailableStock(selectedItem.id);
    const already = cartQtyFor(selectedItem.id);
    const cap = Math.max(0, available - already);
    startTransition(() => {
      setDetailQty((qty) => {
        if (cap <= 0) return 1;
        return Math.min(Math.max(1, qty), cap);
      });
    });
  }, [selectedItem, cartQtyFor, getAvailableStock]);

  useEffect(() => {
    const activeItemIds = itemIdsKey ? new Set(itemIdsKey.split("|")) : new Set<string>();
    setCart((current) => {
      if (!activeItemIds.size) {
        // Items may still be loading; don't wipe cart just because the list is empty.
        return current;
      }

      const nextCart = current.filter((line) => activeItemIds.has(line.itemId));

      if (nextCart.length === current.length) {
        return current;
      }

      return nextCart;
    });
  }, [itemIdsKey, setCart]);

  
  const submitSpecialRequest = async (type: 'OUT_OF_STOCK' | 'NEW_ITEM') => {
    if (!profile) {
      toast.error('You must be logged in to submit a request.');
      return;
    }
    
    if (type === 'OUT_OF_STOCK' && !requestItem) return;
    if (type === 'NEW_ITEM' && !newItemName.trim()) {
      toast.error('Please enter the item name.');
      return;
    }

    setRequestSubmitting(true);
    try {
      const payload: any = {
        type,
        requestedById: profile.uid,
        requestedByName: profile.username,
        qty: requestQty,
        notes: requestNotes.trim(),
      };

      if (type === 'OUT_OF_STOCK' && requestItem) {
        payload.itemId = requestItem.id;
        payload.itemName = requestItem.name;
        payload.categoryId = requestItem.categoryId;
        payload.categoryName = requestItem.categoryName;
      } else if (type === 'NEW_ITEM') {
        payload.newItemName = newItemName.trim();
        payload.newItemDescription = newItemDesc.trim();
        payload.newItemCategoryGuess = newItemCategoryGuess.trim();
        payload.newItemImageUrl = newItemImageUrl.trim();
      }

      await createSpecialRequest(payload, { uid: profile.uid, username: profile.username, displayName: profile.displayName, role: profile.role });
      toast.success(type === 'OUT_OF_STOCK' ? 'Restock request submitted!' : 'New item request submitted!');
      
      setRequestItem(null);
      setNewRequestOpen(false);
      setRequestQty(1);
      setRequestNotes('');
      setNewItemName('');
      setNewItemDesc('');
      setNewItemCategoryGuess('');
      setNewItemImageUrl('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const setView = (view: UserOrdersView) => {
    const target =
      view === "catalog" ? "/orders" : view === "history" ? "/orders/history" : "/orders/cart";
    router.push(target, { scroll: false });
  };

  const itemOrderCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const order of orders) {
      map.set(order.itemId, (map.get(order.itemId) ?? 0) + 1);
    }
    return map;
  }, [orders]);

  const filteredItems = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = selectedCategoryId === "ALL" ? true : item.categoryId === selectedCategoryId;
      const haystack = `${item.name} ${item.categoryName} ${item.unit}`.toLowerCase();
      return matchesCategory && (query ? haystack.includes(query) : true);
    });
  }, [deferredSearch, items, selectedCategoryId]);

  const searchSuggestions = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    if (!query) {
      return [] as typeof items;
    }

    return items
      .filter((item) => {
        const haystack = `${item.name} ${item.categoryName} ${item.unit}`.toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 6);
  }, [deferredSearch, items]);

  const filteredOrders = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return [...orders]
      .filter((order) => {
        const matchesStatus = historyStatus === "ALL" ? true : order.status === historyStatus;
        const haystack = [
          order.itemName,
          order.categoryName,
          order.summary,
          order.notes,
          order.approvedCustomNote,
          order.rejectedCustomNote,
          order.deliveredCustomNote,
        ]
          .join(" ")
          .toLowerCase();
        return matchesStatus && (query ? haystack.includes(query) : true);
      })
      .sort((left, right) => {
        const rightValue = toDate(right.updatedAt || right.createdAt || right.date)?.getTime() ?? 0;
        const leftValue = toDate(left.updatedAt || left.createdAt || left.date)?.getTime() ?? 0;
        return rightValue - leftValue;
      });
  }, [deferredSearch, historyStatus, orders]);

  const selectedHistoryOrder = historyOpenOrderId
    ? filteredOrders.find((order) => order.id === historyOpenOrderId) ??
      orders.find((order) => order.id === historyOpenOrderId) ??
      null
    : null;

  const cartRows = cart
    .map((line) => {
      const item = items.find((entry) => entry.id === line.itemId);
      const category = item ? categories.find((entry) => entry.id === item.categoryId) : null;
      return item && category ? { ...line, item, category } : null;
    })
    .filter(Boolean) as Array<CartLine & { item: (typeof items)[number]; category: (typeof categories)[number] }>;

  const hasStockIssue = cartRows.some((line) => line.qty > getAvailableStock(line.item.id));

  const metrics = {
    total: orders.length,
    pending: orders.filter((order) => order.status === "PENDING").length,
    approved: orders.filter((order) => order.status === "APPROVED").length,
    delivered: orders.filter((order) => order.status === "DELIVERED").length,
    cartLines: cartRows.length,
    cartUnits: cartRows.reduce((sum, line) => sum + line.qty, 0),
  };

  const addToCart = (itemId: string, openCart = false, qty = 1) => {
    const stock = getAvailableStock(itemId);
    const alreadyInCart = cartQtyFor(itemId);
    if (alreadyInCart + qty > stock) {
      toast.error(
        stock <= 0
          ? "This item is out of stock."
          : `Only ${stock} units available (${alreadyInCart} already in cart).`,
      );
      return;
    }
    addToCartBase(itemId, { qty });
    if (openCart) {
      setView("cart");
    }
    toast.success("Added to cart.");
  };

  const submitCart = async () => {
    if (!profile || !cartRows.length) {
      return;
    }
    for (const line of cartRows) {
      const avail = getAvailableStock(line.item.id);
      if (line.qty > avail) {
        toast.error(
          avail <= 0
            ? `"${line.item.name}" is out of stock.`
            : `"${line.item.name}" exceeds available stock (${avail} left).`,
        );
        return;
      }
    }
    setSubmitting(true);
    try {
      const actor = { actorId: profile.uid, actorName: profile.displayName, actorRole: profile.role };
      await Promise.all(
        cartRows.map((line) =>
          createOrder(
            {
              date: new Date().toISOString().slice(0, 10),
              categoryId: line.category.id,
              categoryName: line.category.name,
              itemId: line.item.id,
              itemName: line.item.name,
              qty: Number(line.qty),
              summary:
                line.summary.trim() ||
                `${line.qty} ${line.item.unit || "qty"} ${line.item.name} requested for ${line.category.name}`,
              notes: line.notes.trim(),
              requestedById: profile.uid,
              requestedByName: profile.displayName,
              requestedByUsername: profile.username,
            },
            actor,
          ),
        ),
      );
      clearCart();
      toast.success("Bulk order submitted.");
      setView("history");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to place order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-4">
      {/* ─── Amazon-style Search Header ────────────────── */}
      <div className="stk-header rounded-[var(--radius-lg)] overflow-hidden">
        <div className="px-4 py-3 sm:px-6">
          <div className="grid gap-3 xl:grid-cols-[180px_minmax(0,1fr)_220px] xl:items-center">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4 text-[var(--primary)]" />
              <span className="text-sm font-bold">STK Requirement</span>
            </div>
            <div className="relative flex items-center overflow-visible">
              <div className="flex w-full items-center overflow-hidden rounded-[var(--radius-sm)] border-2 border-[var(--primary)] bg-white">
                <div className="hidden bg-[var(--paper)] px-3 py-2.5 text-xs font-bold text-[var(--ink)] sm:block">
                  All
                </div>
                <Search className="ml-3 h-4 w-4 shrink-0 text-[var(--ink-soft)]" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setSearchOpen(true);
                    if (activeView !== "catalog") {
                      setView("catalog");
                    }
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => {
                    window.setTimeout(() => setSearchOpen(false), 120);
                  }}
                  placeholder="Search STK Requirement items..."
                  className="min-w-0 flex-1 px-3 py-2.5 text-sm text-[var(--ink)] outline-none"
                />
                <button
                  type="button"
                  className="bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-[var(--header-bg)] hover:bg-[var(--primary-dark)] transition"
                  onClick={() => {
                    setSearchOpen(Boolean(search.trim()));
                    if (activeView !== "catalog") {
                      setView("catalog");
                    }
                  }}
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
              {searchOpen && searchSuggestions.length ? (
                <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
                  {searchSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={() => {
                        setSelectedCategoryId(item.categoryId);
                        setSearch(item.name);
                        setSearchOpen(false);
                        if (activeView !== "catalog") {
                          setView("catalog");
                        }
                      }}
                      className="flex w-full items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-2.5 text-left last:border-b-0 hover:bg-[var(--paper)] transition"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-[var(--ink)]">{item.name}</span>
                        <span className="mt-0.5 block text-xs text-[var(--ink-soft)]">
                          in {item.categoryName}
                        </span>
                      </span>
                      <span className="text-xs font-bold text-[var(--primary-dark)]">Unit: {item.unit}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center justify-start gap-2 text-xs text-white/70 xl:justify-end">
              <span>{metrics.pending} pending</span>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <button
                type="button"
                onClick={() => setView("cart")}
                className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
              >
                <ShoppingCart className="h-3.5 w-3.5 text-[var(--primary)]" />
                {metrics.cartUnits} in cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CATALOG VIEW ──────────────────────────────── */}
      {activeView === "catalog" ? (
        <section className="space-y-4">
          <Panel className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="section-kicker">Shop</p>
                <h3 className="mt-1 text-lg font-bold text-[var(--ink)]">
                  Browse items
                </h3>
              </div>
              <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper)] px-3 py-1.5 text-sm font-bold text-[var(--ink-soft)]">
                <ShoppingCart className="h-4 w-4 text-[var(--primary)]" />
                {metrics.cartLines} items in cart
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategoryId("ALL")}
                className={cn(
                  "rounded-[var(--radius-sm)] border px-3 py-1.5 text-sm font-semibold transition",
                  selectedCategoryId === "ALL"
                    ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--header-bg)]"
                    : "border-[var(--border)] bg-white text-[var(--ink)] hover:bg-[var(--paper)]",
                )}
              >
                All categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={cn(
                    "rounded-[var(--radius-sm)] border px-3 py-1.5 text-sm font-semibold transition",
                    selectedCategoryId === category.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--header-bg)]"
                      : "border-[var(--border)] bg-white text-[var(--ink)] hover:bg-[var(--paper)]",
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </Panel>
          {filteredItems.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredItems.map((item) => {
                const inCart = cart.some((line) => line.itemId === item.id);
                const stock = getAvailableStock(item.id);
                const inCartQty = cartQtyFor(item.id);
                const remainingToAdd = Math.max(0, stock - inCartQty);
                const isOutOfStock = stock <= 0;

                return (
                  <article
                    key={item.id}
                    className={cn(
                      "stk-card-hover cursor-pointer overflow-hidden",
                      isOutOfStock && "opacity-70",
                    )}
                    onClick={() => {
                      setSelectedItem(item);
                      setDetailQty(1);
                      setDetailActiveImage(0);
                    }}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--paper)]">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          style={getItemImageCropStyle(item.imageCrop)}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <EmptyOrderThumb />
                        </div>
                      )}
                      <div className="absolute left-3 top-3 rounded-md bg-[var(--header-bg)]/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                        {item.categoryName}
                      </div>
                      {isOutOfStock ? (
                        <div className="absolute right-3 top-3 rounded-md bg-[var(--danger)] px-2 py-1 text-[10px] font-bold text-white">
                          Out of Stock
                        </div>
                      ) : inCart ? (
                        <div
                          className={cn(
                            "absolute right-3 top-3 rounded-md px-2 py-1 text-[10px] font-bold text-white",
                            remainingToAdd > 0 ? "bg-[var(--success)]" : "bg-amber-600",
                          )}
                        >
                          {remainingToAdd > 0 ? `${remainingToAdd} left` : "Cart max"}
                        </div>
                      ) : (
                        <div className="absolute right-3 top-3 rounded-md bg-[var(--accent)]/90 px-2 py-1 text-[10px] font-bold text-white">
                          {stock} left
                        </div>
                      )}
                      {isOutOfStock ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <PackageOpen className="h-10 w-10 text-white/60" />
                        </div>
                      ) : null}
                      {(item.images?.length ?? 0) > 0 ? (
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm">
                          <ZoomIn className="h-3 w-3" />
                          {1 + (item.images?.length ?? 0)} photos
                        </div>
                      ) : null}
                    </div>
                    <div className="space-y-2 p-3">
                      <div>
                        <h4 className="text-sm font-bold leading-snug text-[var(--ink)]">
                          {item.name}
                        </h4>
                        {item.is_permission === "YES" || String(item.is_permission).toUpperCase() === "YES" ? (
                          <div className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                            <span>⚠️ P. Santo ni permission farjiyat che</span>
                          </div>
                        ) : null}
                        {item.description ? (
                          <p className="mt-1 line-clamp-2 text-xs text-[var(--ink-soft)]">
                            {item.description}
                          </p>
                        ) : null}
                        <p className="mt-1.5 text-xs text-[var(--ink-light)]">
                          Unit: {item.unit} · {itemOrderCount.get(item.id) ?? 0} orders
                        </p>
                        {stock > 0 ? (
                          <p className="mt-1 text-xs font-semibold text-[var(--success)]">
                            Stock: {stock}
                            {inCartQty > 0
                              ? ` · In cart: ${inCartQty} · Can add: ${remainingToAdd}`
                              : ""}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs font-semibold text-[var(--danger)]">Out of Stock</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setDetailQty(1);
                            setDetailActiveImage(0);
                          }}
                          className={cn("btn-action w-full py-2 text-sm", isOutOfStock && "opacity-50 cursor-not-allowed")}
                          disabled={isOutOfStock}
                        >
                          {isOutOfStock ? "Unavailable" : "Buy Item"}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item.id);
                          }}
                          className={cn(
                            "btn-secondary w-full py-2 text-sm",
                            (isOutOfStock || remainingToAdd <= 0) && "opacity-50 cursor-not-allowed",
                          )}
                          disabled={isOutOfStock || remainingToAdd <= 0}
                        >
                          {remainingToAdd <= 0 && !isOutOfStock ? "Cart limit" : "Add to cart"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <Panel className="p-8">
              <EmptyState title="No items found" description="Change search or category filter." />
            </Panel>
          )}
        </section>
      ) : null}

      {/* ─── HISTORY VIEW ──────────────────────────────── */}
      {activeView === "history" ? (
        <section className="space-y-4">
          <Panel className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="section-kicker">Order History</p>
                <h3 className="mt-1 text-lg font-bold text-[var(--ink)]">
                  Track your orders
                </h3>
              </div>
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-soft)]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search orders..."
                    className="stk-input pl-9"
                  />
                </label>
                <select
                  value={historyStatus}
                  onChange={(event) =>
                    setHistoryStatus(event.target.value as (typeof historyStatuses)[number])
                  }
                  className="stk-select"
                >
                  {historyStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status === "ALL" ? "All statuses" : status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Panel>
          {filteredOrders.length ? (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const orderItem = items.find((item) => item.id === order.itemId);
                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setHistoryOpenOrderId(order.id)}
                    className="stk-card w-full overflow-hidden text-left transition hover:shadow-[var(--shadow-hover)]"
                  >
                    <div className="grid gap-4 p-4 xl:grid-cols-[180px_minmax(0,1fr)]">
                      <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)]">
                        <div className="aspect-[4/3] overflow-hidden">
                          {orderItem?.imageUrl ? (
                            <img
                              src={orderItem.imageUrl}
                              alt={order.itemName}
                              className="h-full w-full object-cover"
                              style={getItemImageCropStyle(orderItem.imageCrop)}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <EmptyOrderThumb />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary-dark)]">
                              {order.categoryName}
                            </p>
                            <h4 className="mt-1 text-lg font-bold text-[var(--ink)]">
                              {order.itemName}
                            </h4>
                          </div>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-[var(--ink)]">{order.summary}</p>
                        <div className="grid gap-2 sm:grid-cols-3">
                          <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                              Ordered
                            </p>
                            <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                              {formatDate(order.date || order.createdAt)}
                            </p>
                          </div>
                          <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                              Quantity
                            </p>
                            <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                              {formatQty(order.qty)}
                            </p>
                          </div>
                          <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper)] px-3 py-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                              Updated
                            </p>
                            <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                              {formatDateTime(order.updatedAt || order.createdAt)}
                            </p>
                          </div>
                        </div>
                        {order.notes ? (
                          <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper)] p-3">
                            <p className="text-xs font-bold text-[var(--ink)]">My note</p>
                            <p className="mt-1 text-sm text-[var(--ink-soft)]">
                              {order.notes}
                            </p>
                          </div>
                        ) : null}
                        <p className="text-xs font-semibold text-[var(--ink-soft)]">
                          Click to view full status timeline & notes.
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <Panel className="p-8">
              <EmptyState title="No orders found" description="Place a new order or change filters." />
            </Panel>
          )}
        </section>
      ) : null}

      {/* ─── HISTORY DETAILS MODAL ─────────────────────── */}
      <Modal
        open={historyOpenOrderId !== null}
        onClose={() => setHistoryOpenOrderId(null)}
        title={selectedHistoryOrder ? selectedHistoryOrder.itemName : "Order details"}
        description={selectedHistoryOrder ? `Category: ${selectedHistoryOrder.categoryName}` : undefined}
      >
        {selectedHistoryOrder ? (
          <div className="space-y-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--paper)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                    Current status
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={selectedHistoryOrder.status} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                    Quantity
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-[var(--ink)]">
                    {formatQty(selectedHistoryOrder.qty)}
                  </p>
                </div>
              </div>

              {/* Timeline (ordered -> approved/rejected -> delivered) */}
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                  Timeline
                </p>
                <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs">
                      <p className="font-extrabold text-[var(--ink)]">Ordered</p>
                      <p className="mt-1 text-[var(--ink-soft)]">
                        {formatDateTime(selectedHistoryOrder.createdAt || selectedHistoryOrder.date)}
                      </p>
                    </div>
                    <div className="flex-1 px-4">
                      <div className="h-2 w-full rounded-full bg-[var(--border)]">
                        <div
                          className={cn(
                            "h-2 rounded-full",
                            selectedHistoryOrder.status === "PENDING"
                              ? "w-1/3 bg-[var(--primary)]"
                              : selectedHistoryOrder.status === "APPROVED" || selectedHistoryOrder.status === "REJECTED"
                                ? "w-2/3 bg-[var(--primary)]"
                                : "w-full bg-[var(--success)]",
                          )}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-[var(--ink-soft)]">
                        <span>Ordered</span>
                        <span>{selectedHistoryOrder.status === "REJECTED" ? "Rejected" : "Approved"}</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                    <div className="text-xs text-right">
                      <p className="font-extrabold text-[var(--ink)]">
                        {selectedHistoryOrder.status === "DELIVERED"
                          ? "Delivered"
                          : selectedHistoryOrder.status === "REJECTED"
                            ? "Rejected"
                            : selectedHistoryOrder.status === "APPROVED"
                              ? "Approved"
                              : "Pending"}
                      </p>
                      <p className="mt-1 text-[var(--ink-soft)]">
                        {selectedHistoryOrder.deliveredAt
                          ? formatDateTime(selectedHistoryOrder.deliveredAt)
                          : selectedHistoryOrder.rejectedAt
                            ? formatDateTime(selectedHistoryOrder.rejectedAt)
                            : selectedHistoryOrder.approvedAt
                              ? formatDateTime(selectedHistoryOrder.approvedAt)
                              : formatDateTime(selectedHistoryOrder.updatedAt || selectedHistoryOrder.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                  Summary
                </p>
                <p className="mt-2 text-sm text-[var(--ink)]">{selectedHistoryOrder.summary}</p>
                {selectedHistoryOrder.notes ? (
                  <>
                    <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                      My note
                    </p>
                    <p className="mt-2 text-sm text-[var(--ink-soft)]">{selectedHistoryOrder.notes}</p>
                  </>
                ) : null}
              </div>
              <div className="space-y-2">
                <OrderDecisionBlock
                  title={getDecisionTitle("APPROVED")}
                  status="APPROVED"
                  timestamp={selectedHistoryOrder.approvedAt}
                  actorName={selectedHistoryOrder.approvedByName}
                  customNote={selectedHistoryOrder.approvedCustomNote}
                  tone="commerce"
                />
                <OrderDecisionBlock
                  title={getDecisionTitle("REJECTED")}
                  status="REJECTED"
                  timestamp={selectedHistoryOrder.rejectedAt}
                  actorName={selectedHistoryOrder.rejectedByName}
                  customNote={selectedHistoryOrder.rejectedCustomNote}
                  tone="commerce"
                />
                <OrderDecisionBlock
                  title={getDecisionTitle("DELIVERED")}
                  status="DELIVERED"
                  timestamp={selectedHistoryOrder.deliveredAt}
                  actorName={selectedHistoryOrder.deliveredByName}
                  customNote={selectedHistoryOrder.deliveredCustomNote}
                  tone="commerce"
                />
              </div>
            </div>
          </div>
        ) : (
          <Panel className="p-6 text-sm text-[var(--ink-soft)]">Loading order...</Panel>
        )}
      </Modal>

      {/* ─── CART VIEW ─────────────────────────────────── */}
      {activeView === "cart" ? (
        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Panel className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="section-kicker">Shopping Cart</p>
                <h3 className="mt-1 text-lg font-bold text-[var(--ink)]">
                  Review items
                </h3>
              </div>
              <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper)] px-3 py-1.5 text-sm font-bold text-[var(--ink-soft)]">
                <ShoppingCart className="h-4 w-4 text-[var(--primary)]" />
                {metrics.cartUnits} units
              </div>
            </div>
            {cartRows.length ? (
              <div className="mt-4 space-y-3">
                {cartRows.map((line) => (
                  <article key={line.itemId} className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] p-3">
                    <div className="grid gap-3 lg:grid-cols-[80px_minmax(0,1fr)_auto]">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-white">
                        {line.item.imageUrl ? (
                          <img
                            src={line.item.imageUrl}
                            alt={line.item.name}
                            className="h-full w-full object-cover"
                            style={getItemImageCropStyle(line.item.imageCrop)}
                          />
                        ) : (
                          <EmptyOrderThumb />
                        )}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-dark)]">
                            {line.category.name}
                          </p>
                          <h4 className="mt-0.5 text-sm font-bold text-[var(--ink)]">{line.item.name}</h4>
                          <p className="text-xs text-[var(--ink-soft)]">Unit: {line.item.unit}</p>
                          {(() => {
                            const avail = getAvailableStock(line.itemId);
                            const over = line.qty > avail;
                            return (
                              <p
                                className={
                                  over
                                    ? "mt-1 flex items-center gap-1 text-xs font-semibold text-[var(--danger)]"
                                    : "mt-1 text-xs text-[var(--ink-light)]"
                                }
                              >
                                {over ? (
                                  <>
                                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                    In cart {line.qty} but only {avail} in stock — reduce quantity.
                                  </>
                                ) : (
                                  <>Available stock: {avail}</>
                                )}
                              </p>
                            );
                          })()}
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                          <label className="text-xs font-semibold text-[var(--ink-soft)]">
                            Summary
                            <input
                              value={line.summary}
                              onChange={(event) =>
                                updateLine(line.itemId, { summary: event.target.value })
                              }
                              placeholder="Optional summary"
                              className="stk-input mt-1"
                            />
                          </label>
                          <label className="text-xs font-semibold text-[var(--ink-soft)]">
                            Note
                            <input
                              value={line.notes}
                              onChange={(event) =>
                                updateLine(line.itemId, { notes: event.target.value })
                              }
                              placeholder="Optional note"
                              className="stk-input mt-1"
                            />
                          </label>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between gap-3">
                        <div className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-2 py-1.5">
                          <button
                            type="button"
                            onClick={() => changeQty(line.itemId, -1)}
                            className="rounded p-1 text-[var(--ink-soft)] transition hover:bg-[var(--primary-soft)] hover:text-[var(--ink)]"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-7 text-center text-sm font-bold text-[var(--ink)]">
                            {formatQty(line.qty)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const avail = getAvailableStock(line.itemId);
                              if (line.qty + 1 > avail) {
                                toast.error(
                                  avail <= 0
                                    ? "This item is out of stock."
                                    : `Only ${avail} units available.`,
                                );
                                return;
                              }
                              changeQty(line.itemId, 1);
                            }}
                            className="rounded p-1 text-[var(--ink-soft)] transition hover:bg-[var(--primary-soft)] hover:text-[var(--ink)]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                        onClick={() => removeLine(line.itemId)}
                          className="btn-danger flex items-center gap-1.5 text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState title="Cart is empty" description="Add items from the catalog first." />
              </div>
            )}
          </Panel>

          {/* ─── Checkout Summary ──────────────────────── */}
          <Panel className="p-4">
            <p className="section-kicker">Checkout</p>
            <h3 className="mt-1 text-lg font-bold text-[var(--ink)]">
              Place bulk order
            </h3>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper)] px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">Cart lines</p>
                <p className="mt-1 text-2xl font-extrabold text-[var(--ink)]">{formatQty(metrics.cartLines)}</p>
              </div>
              <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper)] px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">Total units</p>
                <p className="mt-1 text-2xl font-extrabold text-[var(--ink)]">{formatQty(metrics.cartUnits)}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={submitCart}
                disabled={submitting || !cartRows.length || hasStockIssue}
                className="btn-action w-full py-3 text-base"
              >
                {submitting ? "Placing order..." : "Place bulk order"}
              </button>
              <button
                type="button"
                onClick={() => setView("catalog")}
                className="btn-secondary w-full"
              >
                Continue shopping
              </button>
            </div>
            <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--header-bg)] p-4 text-white">
              <div className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 className="h-4 w-4 text-[var(--primary)]" />
                Order rules
              </div>
              <ul className="mt-2 space-y-1.5 text-xs text-white/65">
                <li>• Each cart line creates a separate order</li>
                <li>• Summary is auto-generated if left empty</li>
                <li>• Cart stays local until you submit</li>
              </ul>
            </div>
          </Panel>
        </section>
      ) : null}

      {/* ─── PRODUCT DETAIL MODAL ────────────────────────── */}
      {selectedItem ? (() => {
        const allImages: string[] = [];
        if (selectedItem.imageUrl) allImages.push(selectedItem.imageUrl);
        if (selectedItem.images?.length) {
          for (const img of selectedItem.images) {
            if (img.url) allImages.push(img.url);
          }
        }
        const activeImgUrl = allImages[detailActiveImage] ?? null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
            <button type="button" onClick={() => setSelectedItem(null)} className="absolute inset-0 cursor-default" />
            <div className="hide-scrollbar relative max-h-[92vh] w-full max-w-4xl animate-fade-up overflow-auto rounded-[var(--radius-xl)] border border-[var(--border)] bg-white shadow-2xl">
              {/* Close */}
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-[var(--ink-soft)] shadow hover:bg-white hover:text-[var(--ink)] transition"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[1.2fr_1fr]">
                {/* ─── Image Gallery ───────────── */}
                <div>
                  {/* Main Image with Zoom */}
                  <div
                    className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--paper)]"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setZoomPos({
                        x: ((e.clientX - rect.left) / rect.width) * 100,
                        y: ((e.clientY - rect.top) / rect.height) * 100,
                        active: true,
                      });
                    }}
                    onMouseLeave={() => setZoomPos((c) => ({ ...c, active: false }))}
                  >
                    {activeImgUrl ? (
                      <img
                        src={activeImgUrl}
                        alt={selectedItem.name}
                        className="h-full w-full object-contain transition-transform duration-200"
                        style={
                          zoomPos.active
                            ? {
                                transform: "scale(2)",
                                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                              }
                            : undefined
                        }
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <EmptyOrderThumb />
                      </div>
                    )}
                    {zoomPos.active && activeImgUrl ? (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[10px] text-white">
                        Move mouse to zoom
                      </div>
                    ) : null}

                    {/* Image nav arrows */}
                    {allImages.length > 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailActiveImage((c) => (c - 1 + allImages.length) % allImages.length);
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow hover:bg-white transition"
                        >
                          <ChevronLeft className="h-4 w-4 text-[var(--ink)]" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailActiveImage((c) => (c + 1) % allImages.length);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow hover:bg-white transition"
                        >
                          <ChevronRight className="h-4 w-4 text-[var(--ink)]" />
                        </button>
                      </>
                    ) : null}
                  </div>

                  {/* Thumbnails */}
                  {allImages.length > 1 ? (
                    <div className="mt-3 flex gap-2 overflow-auto">
                      {allImages.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setDetailActiveImage(idx)}
                          className={cn(
                            "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 transition",
                            idx === detailActiveImage
                              ? "border-[var(--primary)] shadow-sm"
                              : "border-[var(--border)] opacity-60 hover:opacity-100",
                          )}
                        >
                          <img src={url} alt={`Thumb ${idx + 1}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* ─── Product Details ─────────── */}
                <div className="flex flex-col">
                  <div className="rounded-md bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-bold text-[var(--primary-dark)] w-fit">
                    {selectedItem.categoryName}
                  </div>
                  <h2 className="mt-3 text-xl font-bold text-[var(--ink)] sm:text-2xl">
                    {selectedItem.name}
                  </h2>
                  {selectedItem.is_permission === "YES" || String(selectedItem.is_permission).toUpperCase() === "YES" ? (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-sm font-bold text-amber-700">
                      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                      <span>P. Santo ni permission farjiyat che</span>
                    </div>
                  ) : null}
                  {selectedItem.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
                      {selectedItem.description}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--ink-soft)]">
                    <span className="rounded-md border border-[var(--border)] bg-[var(--paper)] px-2.5 py-1 text-xs font-semibold">
                      Unit: {selectedItem.unit}
                    </span>
                    <span>{itemOrderCount.get(selectedItem.id) ?? 0} total orders</span>
                    {(() => {
                      const detailStock = getAvailableStock(selectedItem.id);
                      const already = cartQtyFor(selectedItem.id);
                      const cap = Math.max(0, detailStock - already);
                      const detailOutOfStock = detailStock <= 0;
                      return detailOutOfStock ? (
                        <span className="flex items-center gap-1 rounded-md border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-2.5 py-1 text-xs font-bold text-[var(--danger)]">
                          <AlertTriangle className="h-3.5 w-3.5" /> Out of Stock
                        </span>
                      ) : (
                        <span className="flex flex-wrap items-center gap-1 rounded-md border border-[var(--success)]/30 bg-[var(--success-soft)] px-2.5 py-1 text-xs font-bold text-[var(--success)]">
                          <PackageOpen className="h-3.5 w-3.5" /> {detailStock} in stock
                          {already > 0 ? ` · In cart: ${already} · Can add: ${cap}` : ""}
                        </span>
                      );
                    })()}
                  </div>

                  {(() => {
                    const detailStock = getAvailableStock(selectedItem.id);
                    const already = cartQtyFor(selectedItem.id);
                    const cap = Math.max(0, detailStock - already);
                    if (detailStock > 0 && cap <= 0) {
                      return (
                        <p className="mt-2 text-xs font-semibold text-amber-700">
                          All available units are already in your cart.
                        </p>
                      );
                    }
                    return null;
                  })()}

                  <hr className="my-4 border-[var(--border)]" />

                  {/* Quantity selector */}
                  {(() => {
                    const detailStock = getAvailableStock(selectedItem.id);
                    const already = cartQtyFor(selectedItem.id);
                    const cap = Math.max(0, detailStock - already);
                    const detailOutOfStock = detailStock <= 0;
                    const qtyDisabled = detailOutOfStock || cap <= 0;
                    const maxQty = cap > 0 ? cap : 1;
                    const overStock = cap > 0 && detailQty > maxQty;

                    return (
                      <div>
                        <p className="text-sm font-semibold text-[var(--ink)]">Quantity</p>
                        <div
                          className={cn(
                            "mt-2 inline-flex items-center rounded-[var(--radius-md)] border",
                            overStock ? "border-[var(--danger)]" : "border-[var(--border)]",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => setDetailQty(Math.max(1, detailQty - 1))}
                            disabled={qtyDisabled}
                            className="px-3 py-2 text-[var(--ink-soft)] hover:bg-[var(--paper)] transition disabled:opacity-40"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={maxQty}
                            value={detailQty}
                            onChange={(e) => {
                              const raw = Number(e.target.value) || 1;
                              const val = cap > 0 ? Math.min(Math.max(1, raw), cap) : 1;
                              setDetailQty(val);
                            }}
                            disabled={qtyDisabled}
                            className={cn(
                              "w-14 border-x py-2 text-center text-sm font-bold outline-none",
                              overStock ? "border-[var(--danger)] text-[var(--danger)]" : "border-[var(--border)] text-[var(--ink)]",
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (cap <= 0) {
                                toast.error(
                                  detailOutOfStock
                                    ? "This item is out of stock."
                                    : "No more units available to add.",
                                );
                                return;
                              }
                              if (detailQty + 1 > cap) {
                                toast.error(
                                  `You can add at most ${cap} more (stock ${detailStock}, ${already} in cart).`,
                                );
                                return;
                              }
                              setDetailQty(detailQty + 1);
                            }}
                            disabled={qtyDisabled}
                            className="px-3 py-2 text-[var(--ink-soft)] hover:bg-[var(--paper)] transition disabled:opacity-40"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        {overStock ? (
                          <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-[var(--danger)]">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            You can add at most {cap} (stock {detailStock}, {already} in cart).
                          </p>
                        ) : null}
                        {/* ─── REQUEST ITEM MODAL ──────────────────────────────── */}
      <Modal
        open={newRequestOpen}
        onClose={() => {
          setNewRequestOpen(false);
          setRequestItem(null);
          setRequestQty(1);
          setRequestNotes("");
        }}
        title="Request Out of Stock Item"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)]">Item ID</label>
            <SearchableSelect
              className="mt-1"
              value={requestItem?.id || ""}
              onChange={(val) => {
                const id = val;
                if (!id) {
                  setRequestItem(null);
                  return;
                }
                const found = items.find((i) => String(i.id) === id);
                if (found) {
                  const cat = categories.find((c) => c.id === found.categoryId);
                  setRequestItem({
                    id: String(found.id),
                    name: found.name,
                    categoryId: String(found.categoryId),
                    categoryName: cat?.name || "Unknown",
                  });
                }
              }}
              options={requestItemIdSearchOptions}
              placeholder="Select an Item ID..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)]">Item Name (Auto-filled)</label>
            <input
              type="text"
              readOnly
              value={requestItem?.name || ""}
              className="stk-input mt-1 bg-gray-50"
              placeholder="Select an ID first..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)]">Quantity Needed</label>
            <input
              type="number"
              min="1"
              value={requestQty}
              onChange={(e) => setRequestQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="stk-input mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)]">Additional Notes</label>
            <textarea
              value={requestNotes}
              onChange={(e) => setRequestNotes(e.target.value)}
              className="stk-input mt-1"
              rows={3}
              placeholder="Why do you need this?"
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setNewRequestOpen(false)}
              className="btn-secondary"
              disabled={requestSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => submitSpecialRequest("OUT_OF_STOCK")}
              className="btn-primary"
              disabled={requestSubmitting || !requestItem}
            >
              {requestSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
})()}

                  {/* Notes */}
                  <label className="mt-4 block text-sm font-semibold text-[var(--ink)]">
                    Note (optional)
                    <textarea
                      id="detail-notes"
                      rows={2}
                      className="stk-input mt-1.5"
                      placeholder="Any special instructions..."
                    />
                  </label>

                  {/* Buy Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const notesEl = document.getElementById("detail-notes") as HTMLTextAreaElement | null;
                      const notes = notesEl?.value?.trim() ?? "";
                      const stock = getAvailableStock(selectedItem.id);
                      const alreadyInCart = cartQtyFor(selectedItem.id);
                      if (alreadyInCart + detailQty > stock) {
                        toast.error(
                          stock <= 0
                            ? `"${selectedItem.name}" is out of stock.`
                            : `Only ${stock} units available (${alreadyInCart} already in cart).`,
                        );
                        return;
                      }
                      addToCartBase(selectedItem.id, { qty: detailQty, notes });
                      toast.success(`Added ${detailQty} × ${selectedItem.name} to cart!`);
                      setSelectedItem(null);
                      setView("cart");
                    }}
                    disabled={
                      getAvailableStock(selectedItem.id) <= 0 ||
                      Math.max(0, getAvailableStock(selectedItem.id) - cartQtyFor(selectedItem.id)) <= 0
                    }
                    className="btn-action mt-4 w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingCart className="mr-2 inline h-4 w-4" />
                    Buy Now — {detailQty} {selectedItem.unit}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      addToCart(selectedItem.id, false, detailQty);
                      setSelectedItem(null);
                    }}
                    disabled={
                      getAvailableStock(selectedItem.id) <= 0 ||
                      Math.max(0, getAvailableStock(selectedItem.id) - cartQtyFor(selectedItem.id)) < detailQty
                    }
                    className="btn-secondary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add to cart & continue shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })() : null}
    </section>
  );
}
