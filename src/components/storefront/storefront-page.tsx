"use client";
/* eslint-disable @next/next/no-img-element */

import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Minus,
  PackageOpen,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  X,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Panel } from "@/components/ui/panel";
import { StorefrontShell } from "@/components/shell/storefront-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { useFirestoreCollection } from "@/hooks/use-firestore-collection";
import { usePublicCatalog } from "@/hooks/use-public-catalog";
import { getItemImageCropStyle } from "@/lib/item-image";
import { cn } from "@/lib/utils";
import type { ItemRecord, AppUserProfile } from "@/lib/firebase/types";
import { SearchableSelect } from "@/components/ui/searchable-select";

type WithId<T> = T & { id: number };

export function StorefrontPage() {
  const { firebaseUser, profile, loading: authLoading } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
  const { categories, items, getAvailableStock, loading: catalogLoading } = usePublicCatalog(selectedCategoryId || undefined);
  const isAuthenticated = !authLoading && !!firebaseUser;
  const canOrderForOthers = profile?.roles?.some(r => ["SUPER_ADMIN", "ADMIN", "LEADER", "PROXY"].includes(r)) ?? false;


  const { cart, addToCart: addToCartBase } = useCart();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [requestItem, setRequestItem] = useState<{ id: number, name: string, categoryId: number, categoryName: string } | null>(null);
  const [requestQty, setRequestQty] = useState(1);
  const [requestNotes, setRequestNotes] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemCategoryGuess, setNewItemCategoryGuess] = useState('');
  const [newItemImageUrl, setNewItemImageUrl] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestUserId, setRequestUserId] = useState<number | "">("");
  
  const { items: allUsers, loading: usersLoading } = useFirestoreCollection<AppUserProfile>("users");
  const selectableUsers = useMemo(() => allUsers
    .filter(u => !u.deletedAt && !u.is_deleted && !(u.roles?.length === 1 && (u.roles[0] === "SUPER_ADMIN" || u.roles[0] === "ADMIN")))
    .sort((a,b) => (a.displayName || a.username || "").localeCompare(b.displayName || b.username || "", undefined, {numeric: true})), [allUsers]);

  const userOptions = useMemo(() => {
    const list = selectableUsers.map(u => ({
      value: String(u.uid || u.id),
      label: `${u.displayName || u.username} (@${u.username})`
    }));
    return [
      { value: "", label: isAuthenticated ? '-- Requesting for Myself --' : '-- Select a User --' },
      ...list
    ];
  }, [selectableUsers, isAuthenticated]);

  const categoryOptions = useMemo(() => {
    return [
      { value: "", label: "Select a Category..." },
      ...categories.map(c => ({ value: String(c.id), label: c.name }))
    ];
  }, [categories]);

  const deferredSearch = useDeferredValue(search);
  
  const [selectedItem, setSelectedItem] = useState<WithId<ItemRecord> | null>(null);
  const [detailQty, setDetailQty] = useState(1);
  const [detailActiveImage, setDetailActiveImage] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, active: false });



  const cartQtyFor = useCallback(
    (itemId: number) => cart.find((l) => l.itemId === itemId)?.qty ?? 0,
    [cart],
  );

  useEffect(() => {
    if (!selectedItem) return;
    const available = getAvailableStock(selectedItem.id);
    const already = cartQtyFor(selectedItem.id);
    const cap = Math.max(0, available - already);
    startTransition(() => {
      setDetailQty((q) => {
        if (cap <= 0) return 1;
        return Math.min(Math.max(1, q), cap);
      });
    });
  }, [selectedItem, cartQtyFor, getAvailableStock]);

  const filteredItems = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = selectedCategoryId === "ALL" ? true : String(item.categoryId) === String(selectedCategoryId);
      const haystack = `${item.name} ${item.categoryName} ${item.unit}`.toLowerCase();
      return matchesCategory && (query ? haystack.includes(query) : true);
    });
  }, [deferredSearch, items, selectedCategoryId]);

  const searchSuggestions = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return [];
    return items
      .filter((item) => {
        const haystack = `${item.name} ${item.categoryName} ${item.unit}`.toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 6);
  }, [deferredSearch, items]);

  
  const submitSpecialRequest = async (type: 'OUT_OF_STOCK' | 'NEW_ITEM') => {
    if (type === 'OUT_OF_STOCK' && !requestItem) return;
    if (type === 'NEW_ITEM' && !newItemName.trim()) {
      toast.error('Please enter the item name.');
      return;
    }
    setRequestSubmitting(true);
    try {
      let submitUid = firebaseUser?.uid || 'anonymous';
      let submitName = firebaseUser ? (firebaseUser.displayName || firebaseUser.email || 'Anonymous User') : 'Anonymous User';
      
      if (requestUserId) {
        const u = selectableUsers.find(u => u.uid === requestUserId);
        if (u) {
          submitUid = u.uid;
          submitName = u.displayName || u.username;
        }
      }

      const payload: any = {
        type,
        requestedById: submitUid,
        requestedByName: submitName,
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
        
        const cat = categories.find(c => c.id === newItemCategoryGuess);
        if (cat) {
          payload.categoryId = cat.id;
          payload.categoryName = cat.name;
        } else {
          payload.newItemCategoryGuess = newItemCategoryGuess.trim();
        }
        
        payload.newItemImageUrl = newItemImageUrl.trim();
      }
      
      const { createSpecialRequest } = await import('@/lib/firebase/firestore');
      await createSpecialRequest(payload, { uid: firebaseUser?.uid || 'anonymous', username: 'anonymous', displayName: 'Anonymous', role: 'USER' });
      toast.success(type === 'OUT_OF_STOCK' ? 'Restock request submitted!' : 'New item request submitted!');
      
      setRequestItem(null);
      setNewRequestOpen(false);
      setRequestQty(1);
      setRequestNotes('');
      setNewItemName('');
      setNewItemDesc('');
      setNewItemCategoryGuess('');
      setNewItemImageUrl('');
      setRequestUserId("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const addToCart = (itemId: number, openCart = false, qty = 1) => {
    const stock = getAvailableStock(itemId);
    const alreadyInCart = cartQtyFor(itemId);
    if (alreadyInCart + qty > stock) {
      toast.error(
        stock <= 0
          ? "This item is out of stock."
          : `Only ${stock} units available (${alreadyInCart} already in cart, max ${Math.max(0, stock - alreadyInCart)} more).`,
      );
      return;
    }
    addToCartBase(itemId, { qty });
    if (openCart) {
      if (isAuthenticated) {
        router.push("/orders/cart");
      } else {
        router.push("/cart");
      }
    }
    toast.success("Added to cart.");
  };

  const handleBuyNow = (item: WithId<ItemRecord>, qty: number, notes: string) => {
    const stock = getAvailableStock(item.id);
    const alreadyInCart = cartQtyFor(item.id);
    if (alreadyInCart + qty > stock) {
      toast.error(
        stock <= 0
          ? `"${item.name}" is out of stock.`
          : `Only ${stock} units of "${item.name}" available (${alreadyInCart} already in cart).`,
      );
      return;
    }
    addToCartBase(item.id, { qty, notes });
    toast.success(`Added ${qty} × ${item.name} to cart!`);
    setSelectedItem(null);

    if (isAuthenticated) {
      router.push("/orders/cart");
    } else {
      router.push("/cart");
    }
  };

  return (
    <StorefrontShell
      search={search}
      onSearchChange={setSearch}
      searchSuggestions={searchSuggestions}
      onSuggestionClick={(item) => {
        setSelectedCategoryId((item as WithId<ItemRecord>).categoryId ?? "");
        setSearch(item.name);
      }}
    >


      {/* ─── Category Filters ─────────────────────────── */}
      <Panel className="p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div>
            <p className="section-kicker">Categories</p>
            <h3 className="mt-1 text-base font-bold text-[var(--ink)] sm:text-lg">
              Browse by category
            </h3>
          </div>
          <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--paper)] px-2.5 py-1 text-xs font-bold text-[var(--ink-soft)] sm:px-3 sm:py-1.5 sm:text-sm">
            <ShoppingCart className="h-3.5 w-3.5 text-[var(--primary)] sm:h-4 sm:w-4" />
            {cart.length} items in cart
          </div>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategoryId("ALL")}
            className={cn(
              "shrink-0 rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-semibold transition sm:text-sm",
              selectedCategoryId === "ALL"
                ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--header-bg)]"
                : "border-[var(--border)] bg-white text-[var(--ink)] hover:bg-[var(--paper)]",
            )}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategoryId(String(category.id))}
              className={cn(
                "shrink-0 rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-semibold transition sm:text-sm",
                String(selectedCategoryId) === String(category.id)
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--header-bg)]"
                  : "border-[var(--border)] bg-white text-[var(--ink)] hover:bg-[var(--paper)]",
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </Panel>

      {/* ─── Product Grid ─────────────────────────────── */}
      {catalogLoading ? (
        <Panel className="p-8">
          <div className="flex items-center justify-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
            <span className="text-sm text-[var(--ink-soft)]">Loading catalog...</span>
          </div>
        </Panel>
      ) : filteredItems.length ? (
        <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 stagger-children">
          {filteredItems.map((item) => {
            const inCart = cart.some((line) => line.itemId === item.id);
            const stock = getAvailableStock(item.id);
            const inCartQty = cartQtyFor(item.id);
            const remainingToAdd = Math.max(0, stock - inCartQty);
            const isOutOfStock = stock <= 0;

            return (
              <article
                key={item.id}
                className={cn("stk-card-hover cursor-pointer overflow-hidden group flex flex-col h-full animate-fade-up", isOutOfStock && "opacity-60")}
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
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      style={getItemImageCropStyle(item.imageCrop)}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--ink-light)] transition-transform duration-500 group-hover:scale-110">
                      <ShoppingCart className="h-12 w-12 opacity-30" />
                    </div>
                  )}
                  {/* Overlay Gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  
                  <div className="absolute left-3 top-3 flex items-center gap-1.5">
                    <div className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--ink)] shadow-md backdrop-blur-md">
                      {item.categoryName}
                    </div>
                    {item.is_permission === "YES" || String(item.is_permission).toUpperCase() === "YES" ? (
                      <div 
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-md ring-2 ring-white transition hover:scale-110 cursor-help"
                        title="P. Santo ni Permission Farjiyat"
                      >
                        <span className="text-[11px] font-black leading-none">★</span>
                      </div>
                    ) : null}
                  </div>
                  {isOutOfStock ? (
                    <div className="absolute right-3 top-3 rounded-full bg-[var(--danger)] px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                      Out of Stock
                    </div>
                  ) : inCart ? (
                    <div
                      className={cn(
                        "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow-md",
                        remainingToAdd > 0 ? "bg-[var(--success)]" : "bg-amber-600",
                      )}
                    >
                      {remainingToAdd > 0 ? `${remainingToAdd} left` : "Cart max"}
                    </div>
                  ) : (
                    <div className="absolute right-3 top-3 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                      {stock} left
                    </div>
                  )}
                  {(item.images?.length ?? 0) > 0 ? (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <ZoomIn className="h-3 w-3" />
                      {1 + (item.images?.length ?? 0)} photos
                    </div>
                  ) : null}
                  {isOutOfStock ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <PackageOpen className="h-12 w-12 text-white/80" />
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col justify-between p-4 bg-[var(--surface)]">
                  <div>
                    <div className="flex items-start justify-between gap-1.5">
                      <h4 className="text-sm font-extrabold leading-tight text-[var(--ink)] group-hover:text-[var(--primary-dark)] transition-colors">
                        {item.name}
                      </h4>
                      {item.is_permission === "YES" || String(item.is_permission).toUpperCase() === "YES" ? (
                        <span 
                          className="inline-flex shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 px-1.5 py-0.5 text-[10px] font-bold" 
                          title="P. Santo ni Permission Farjiyat"
                        >
                          ★ Perm
                        </span>
                      ) : null}
                    </div>
                    {item.productId ? (
                      <p className="mt-1 text-[10px] font-bold tracking-widest text-[var(--ink-light)] uppercase">
                        ID: {item.productId}
                      </p>
                    ) : null}
                    {item.description ? (
                      <p className="mt-1.5 line-clamp-2 text-xs text-[var(--ink-soft)] leading-relaxed">
                        {item.description}
                      </p>
                    ) : null}
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="rounded-full bg-[var(--canvas-strong)] px-2 py-0.5 text-[10px] font-semibold text-[var(--ink-soft)]">Unit: {item.unit}</span>
                      {stock > 0 ? (
                        <span className="rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--success)]">
                          Stock: {stock}
                        </span>
                      ) : isOutOfStock ? (
                        <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--danger)]">Out of Stock</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isOutOfStock) {
                          setRequestItem({
                            id: item.id,
                            name: item.name,
                            categoryId: item.categoryId,
                            categoryName: item.categoryName
                          });
                        } else {
                          setSelectedItem(item);
                          setDetailQty(1);
                          setDetailActiveImage(0);
                        }
                      }}
                      className="flex h-10 w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)] px-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-[var(--primary-dark)] active:scale-[0.98]"
                    >
                      {isOutOfStock ? "Request Item" : "Buy Item"}
                    </button>
                    <button
                      type="button"
                      disabled={isOutOfStock || remainingToAdd <= 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item.id);
                      }}
                      className={cn(
                        "flex h-10 w-full items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3 text-xs font-bold text-[var(--ink)] transition-all shadow-sm hover:border-[var(--primary)] hover:bg-[var(--paper)] active:scale-[0.98]",
                        (isOutOfStock || remainingToAdd <= 0) && "opacity-50 cursor-not-allowed hover:border-[var(--border)] hover:bg-white",
                      )}
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
          <div className="flex flex-col items-center w-full">
            <EmptyState title="No items found" description="Change search or category filter." />
            <div className="mt-6 flex flex-col items-center">
              <p className="text-[var(--ink-soft)] text-sm mb-3 font-semibold">Can't find what you're looking for?</p>
              <button onClick={() => setNewRequestOpen(true)} className="btn-secondary">
                Request New Item
              </button>
            </div>
          </div>
        </Panel>
      )}

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
          <div className="fixed inset-0 z-50 flex items-end justify-center px-0 py-0 sm:items-center sm:px-4 sm:py-8">
            <button type="button" onClick={() => setSelectedItem(null)} className="absolute inset-0 cursor-default bg-slate-900/40 backdrop-blur-md transition-opacity" />
            <div className="hide-scrollbar relative max-h-[100dvh] w-full max-w-4xl animate-fade-up overflow-auto rounded-t-[var(--radius-xl)] border border-white/20 bg-white/95 shadow-2xl sm:max-h-[92vh] sm:rounded-[var(--radius-xl)]">
              {/* Close */}
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-[var(--ink-soft)] shadow-md backdrop-blur-md hover:bg-white hover:text-[var(--danger)] transition hover:scale-110"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid gap-4 p-4 sm:gap-6 sm:p-6 md:grid-cols-[1.2fr_1fr]">
                {/* ─── Image Gallery ───────────── */}
                <div>
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
                      <div className="flex h-full items-center justify-center text-[var(--ink-light)]">
                        <ShoppingCart className="h-12 w-12 opacity-30" />
                      </div>
                    )}
                    {zoomPos.active && activeImgUrl ? (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[10px] text-white">
                        Move mouse to zoom
                      </div>
                    ) : null}
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
                <div className="flex flex-col py-2">
                  <div className="rounded-full bg-gradient-to-r from-[var(--primary-soft)] to-[var(--primary)]/20 px-3 py-1.5 text-xs font-extrabold tracking-widest uppercase text-[var(--primary-dark)] w-fit shadow-sm">
                    {selectedItem.categoryName}
                  </div>
                  <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[var(--ink)] sm:text-3xl">
                    {selectedItem.name}
                  </h2>
                  {selectedItem.is_permission === "YES" || String(selectedItem.is_permission).toUpperCase() === "YES" ? (
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-sm font-bold text-amber-700">
                      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                      <span>P. Santo ni permission farjiyat che</span>
                    </div>
                  ) : null}
                  {selectedItem.productId ? (
                    <p className="mt-1.5 text-sm font-bold tracking-widest text-[var(--ink-light)] uppercase">
                      ID: {selectedItem.productId}
                    </p>
                  ) : null}
                  {selectedItem.description ? (
                    <p className="mt-4 text-base leading-relaxed text-[var(--ink-soft)]">
                      {selectedItem.description}
                    </p>
                  ) : null}
                  <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--ink-soft)]">
                    <span className="rounded-full border border-[var(--border-strong)] bg-white px-3 py-1.5 text-xs font-bold shadow-sm">
                      Unit: {selectedItem.unit}
                    </span>
                    {(() => {
                      const detailStock = getAvailableStock(selectedItem.id);
                      const already = cartQtyFor(selectedItem.id);
                      const cap = Math.max(0, detailStock - already);
                      const detailOutOfStock = detailStock <= 0;
                      return detailOutOfStock ? (
                        <span className="flex items-center gap-1.5 rounded-full border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-3 py-1.5 text-xs font-bold text-[var(--danger)] shadow-sm">
                          <AlertTriangle className="h-4 w-4" /> Out of Stock
                        </span>
                      ) : (
                        <span className="flex flex-wrap items-center gap-1.5 rounded-full border border-[var(--success)]/30 bg-[var(--success-soft)] px-3 py-1.5 text-xs font-bold text-[var(--success)] shadow-sm">
                          <PackageOpen className="h-4 w-4" /> {detailStock} in stock
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
                                toast.error(`You can add at most ${cap} more (stock ${detailStock}, ${already} in cart).`);
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
                      </div>
                    );
                  })()}

                  {/* Notes */}
                  <label className="mt-4 block text-sm font-semibold text-[var(--ink)]">
                    Note (optional)
                    <textarea
                      id="storefront-detail-notes"
                      rows={2}
                      className="stk-input mt-1.5"
                      placeholder="Any special instructions..."
                    />
                  </label>

                  {/* Buy Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const notesEl = document.getElementById("storefront-detail-notes") as HTMLTextAreaElement | null;
                      const notes = notesEl?.value?.trim() ?? "";
                      handleBuyNow(selectedItem, detailQty, notes);
                    }}
                    disabled={
                      getAvailableStock(selectedItem.id) <= 0 ||
                      Math.max(0, getAvailableStock(selectedItem.id) - cartQtyFor(selectedItem.id)) <= 0
                    }
                    className="btn-action mt-4 w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {`Buy Now — ${detailQty} ${selectedItem.unit}`}
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
      {/* ─── OUT OF STOCK REQUEST MODAL ──────────────────────── */}
      <Modal
        open={!!requestItem}
        onClose={() => setRequestItem(null)}
        title="Request Item"
        description={`Request restock for "${requestItem?.name}"`}
      >
        <div className="space-y-4">
          {(!isAuthenticated || canOrderForOthers) ? (
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)]">
                Order For (User ID)
                {usersLoading ? (
                  <span className="text-xs text-[var(--ink-soft)] ml-2">Loading...</span>
                ) : null}
              </label>
              <SearchableSelect
                className="mt-1"
                value={String(requestUserId)}
                onChange={(val) => setRequestUserId(val ? Number(val) : "")}
                options={userOptions}
                placeholder={isAuthenticated ? '-- Requesting for Myself --' : '-- Select a User --'}
              />
            </div>
          ) : null}
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)]">
              Quantity Needed <span className="text-[var(--danger)]">*</span>
              <input 
                type="number"
                min="1"
                className="stk-input mt-1.5 w-full" 
                value={requestQty}
                onChange={(e) => setRequestQty(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)]">
              Note (Optional)
              <textarea 
                className="stk-input mt-1.5 w-full" 
                rows={3}
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                placeholder="Any special instructions or urgency..."
              />
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button 
              type="button"
              onClick={() => setRequestItem(null)}
              className="btn-secondary px-4 py-2"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={() => submitSpecialRequest('OUT_OF_STOCK')}
              disabled={requestSubmitting}
              className="btn-action px-6 py-2 bg-[var(--danger)] text-white hover:bg-[var(--danger-dark)] border-[var(--danger)] hover:border-[var(--danger-dark)]"
            >
              {requestSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── NEW ITEM REQUEST MODAL ──────────────────────── */}
      <Modal
        open={newRequestOpen}
        onClose={() => {
          setNewRequestOpen(false);
          setRequestUserId("");
        }}
        title="Request New Item"
        description="Can't find an item in our catalog? Request it here."
      >
        <div className="space-y-4">
          {(!isAuthenticated || canOrderForOthers) ? (
            <div>
              <label className="block text-sm font-semibold text-[var(--ink)]">
                Order For (User ID)
                {usersLoading ? (
                  <span className="text-xs text-[var(--ink-soft)] ml-2">Loading...</span>
                ) : null}
              </label>
              <SearchableSelect
                className="mt-1"
                value={String(requestUserId)}
                onChange={(val) => setRequestUserId(val ? Number(val) : "")}
                options={userOptions}
                placeholder={isAuthenticated ? '-- Requesting for Myself --' : '-- Select a User --'}
              />
            </div>
          ) : null}
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)]">
              Item Name <span className="text-[var(--danger)]">*</span>
              <input 
                type="text"
                className="stk-input mt-1.5 w-full" 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g., Ergonomic Keyboard"
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)]">
              Category <span className="text-[var(--danger)]">*</span>
              <SearchableSelect
                className="mt-1.5"
                value={newItemCategoryGuess}
                onChange={(val) => setNewItemCategoryGuess(val)}
                options={categoryOptions}
                placeholder="Select a Category..."
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)]">
              Description (Optional)
              <textarea 
                className="stk-input mt-1.5 w-full" 
                rows={3}
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                placeholder="Describe the item, why it's needed, preferred brand, etc."
              />
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button 
              type="button"
              onClick={() => setNewRequestOpen(false)}
              className="btn-secondary px-4 py-2"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={() => submitSpecialRequest('NEW_ITEM')}
              disabled={requestSubmitting}
              className="btn-action px-6 py-2"
            >
              {requestSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </Modal>

    </StorefrontShell>
  );
}
