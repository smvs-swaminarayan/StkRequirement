"use client";
/* eslint-disable @next/next/no-img-element */
import { where } from "firebase/firestore";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { StorefrontShell } from "@/components/shell/storefront-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { usePublicCatalog } from "@/hooks/use-public-catalog";
import { getItemImageCropStyle } from "@/lib/item-image";
import { formatQty, cn } from "@/lib/utils";
import { useFirestoreCollection } from "@/hooks/use-firestore-collection";
import type { AppUserProfile } from "@/lib/firebase/types";
import { createOrder } from "@/lib/firebase/firestore";
import { SearchableSelect } from "@/components/ui/searchable-select";

const USERS_QUERY = [where("active", "==", true)];

export function PublicCartPage() {
  const { firebaseUser, loading: authLoading } = useAuth();
  const { categories, items, getAvailableStock, loading: catalogLoading } = usePublicCatalog();
  const { cart, updateLine, changeQty, removeLine, clearCart } = useCart();
  const router = useRouter();

  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { items: allUsers, loading: usersLoading } = useFirestoreCollection<AppUserProfile>("users", USERS_QUERY);
  const selectableUsers = allUsers
    .filter(u => !u.deletedAt && !(u.roles?.length === 1 && u.roles[0] === "SUPER_ADMIN"))
    .sort((a,b) => a.username.localeCompare(b.username, undefined, {numeric: true}));
  
  const userOptions = useMemo(() => {
    return [
      { value: "", label: "-- Select a User --" },
      ...selectableUsers.map(u => ({
        value: String(u.uid),
        label: `${u.displayName} (${u.username})`
      }))
    ];
  }, [selectableUsers]);

  const isAuthenticated = !authLoading && !!firebaseUser;

  const cartRows = cart
    .map((line) => {
      const foundItem = items.find((entry) => String(entry.id) === String(line.itemId));
      const item = foundItem || {
        id: line.itemId,
        name: "Item #" + line.itemId,
        categoryId: 0,
        categoryName: "Store Item",
        unit: "piece",
        imageUrl: null,
        imageCrop: null,
      };
      const category = categories.find((entry) => String(entry.id) === String(item.categoryId)) || {
        id: String(item.categoryId),
        name: item.categoryName || "Category",
      };
      return {
        ...line,
        item,
        category,
        lineKey: `${line.itemId}__${line.variant || "def"}`,
      };
    }) as Array<
      (typeof cart)[number] & {
        item: (typeof items)[number];
        category: { id: string | number; name: string };
        lineKey: string;
      }
    >;

  const metrics = {
    cartLines: cartRows.length,
    cartUnits: cartRows.reduce((sum, line) => sum + line.qty, 0),
  };

  const hasStockIssue = cartRows.some((line) => line.qty > getAvailableStock(line.itemId, line.variant));

  const handleCheckout = async () => {
    if (hasStockIssue) {
      toast.error("Reduce quantities to match available stock before checkout.");
      return;
    }
    if (isAuthenticated) {
      router.push("/orders/cart");
      return;
    }

    if (!selectedUserId) {
      toast.error("Please select a User ID to place the order.");
      return;
    }

    const su = selectableUsers.find(u => u.uid === selectedUserId);
    if (!su) return;

    try {
      setIsSubmitting(true);
      for (const line of cartRows) {
        await createOrder({
          date: new Date().toISOString().split("T")[0],
          itemId: Number(line.itemId),
          itemName: line.item.name,
          variant: line.variant || null,
          categoryId: line.item.categoryId,
          categoryName: line.item.categoryName,
          qty: line.qty,
          summary: line.summary,
          notes: line.notes,
          requestedById: su.uid,
          requestedByName: su.displayName,
          requestedByUsername: su.username,
        });
      }
      clearCart();
      toast.success("Order placed successfully!");
      router.push("/");
    } catch (err: any) {
      toast.error("Failed to place order: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StorefrontShell>
      <section className="mx-auto max-w-[1400px] w-full p-4 lg:p-8">
        <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
          {/* Main Cart Area */}
          <div className="flex flex-col gap-4">
            <Panel className="p-5 sm:p-6 shadow-xl border-white/20 bg-white/60 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                <div>
                  <p className="section-kicker text-[var(--primary-dark)]">Shopping Cart</p>
                  <h3 className="mt-1 text-2xl font-extrabold text-[var(--ink)]">
                    Review your items
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {mounted && cart.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you sure you want to clear your cart?")) {
                          clearCart();
                          toast.success("Cart cleared.");
                        }
                      }}
                      className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                      title="Empty Cart"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Clear Cart
                    </button>
                  ) : null}
                  <div
                    suppressHydrationWarning
                    className="flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-4 py-2 text-sm font-bold text-[var(--primary-dark)] shadow-sm"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {mounted ? metrics.cartUnits : 0} units total
                  </div>
                </div>
              </div>

              {!mounted ? (
                <div className="mt-6 flex items-center justify-center p-12 text-sm text-[var(--ink-soft)]">
                  <div className="h-5 w-5 mr-3 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
                  Loading cart...
                </div>
              ) : catalogLoading && !cartRows.length && cart.length > 0 ? (
                <div className="mt-6 flex items-center justify-center p-12 text-sm text-[var(--ink-soft)]">
                  <div className="h-5 w-5 mr-3 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
                  Loading cart items...
                </div>
              ) : cartRows.length ? (
                <div className="mt-6 space-y-4 stagger-children">
                  {cartRows.map((line) => (
                    <article
                      key={line.lineKey || `${line.itemId}_${line.variant}`}
                      className="group relative rounded-2xl border border-[var(--border-strong)] bg-white p-4 shadow-sm transition hover:shadow-lg hover:-translate-y-0.5 animate-fade-up"
                    >
                      <div className="grid gap-4 lg:grid-cols-[100px_minmax(0,1fr)_auto]">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--paper)] shadow-inner">
                          {line.item.imageUrl ? (
                            <img
                              src={line.item.imageUrl}
                              alt={line.item.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              style={getItemImageCropStyle(line.item.imageCrop)}
                            />
                          ) : (
                            <ShoppingCart className="h-8 w-8 text-[var(--ink-light)] opacity-30 transition-transform duration-500 group-hover:scale-110" />
                          )}
                        </div>
                        <div className="flex flex-col justify-center space-y-2.5">
                          <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--primary-dark)]">
                              {line.category.name}
                            </p>
                            <h4 className="mt-1 text-lg font-bold text-[var(--ink)] flex items-center gap-2 flex-wrap">
                              <span>{line.item.name}</span>
                              {line.variant ? (
                                <span className="inline-flex items-center text-xs font-black px-3 py-1 rounded-xl bg-purple-600 text-white border border-purple-700 shadow-2xs">
                                  👕 Size: {line.variant}
                                </span>
                              ) : null}
                            </h4>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-full bg-[var(--canvas-strong)] px-2.5 py-0.5 text-xs font-semibold text-[var(--ink-soft)]">
                                Unit: {line.item.unit}
                              </span>
                              {(() => {
                                const avail = getAvailableStock(line.itemId, line.variant);
                                const over = line.qty > avail;
                                return (
                                  <span
                                    className={cn(
                                      "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold",
                                      over
                                        ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                                        : "bg-[var(--success-soft)] text-[var(--success)]"
                                    )}
                                  >
                                    {over ? (
                                      <>
                                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                        Only {avail} available {line.variant ? `(Size ${line.variant})` : ""}
                                      </>
                                    ) : (
                                      <>Stock: {avail} {line.variant ? `(Size ${line.variant})` : ""}</>
                                    )}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2 lg:max-w-xl">
                            <label className="text-xs font-semibold text-[var(--ink-soft)]">
                              Summary
                              <input
                                value={line.summary}
                                onChange={(e) => updateLine(line.itemId, { summary: e.target.value }, line.variant)}
                                placeholder="Optional summary"
                                className="stk-input mt-1.5 w-full bg-[var(--canvas)]"
                              />
                            </label>
                            <label className="text-xs font-semibold text-[var(--ink-soft)]">
                              Note
                              <input
                                value={line.notes}
                                onChange={(e) => updateLine(line.itemId, { notes: e.target.value }, line.variant)}
                                placeholder="Optional note"
                                className="stk-input mt-1.5 w-full bg-[var(--canvas)]"
                              />
                            </label>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-between gap-4 border-t border-[var(--border)] pt-4 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
                          <div className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-white p-1 shadow-sm">
                            <button
                              type="button"
                              onClick={() => changeQty(line.itemId, -1, line.variant)}
                              className="rounded-lg p-1.5 text-[var(--ink-soft)] transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary-dark)] active:scale-95 cursor-pointer"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-8 text-center text-sm font-extrabold text-[var(--ink)]">
                              {formatQty(line.qty)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const avail = getAvailableStock(line.itemId, line.variant);
                                if (line.qty + 1 > avail) {
                                  toast.error(
                                    avail <= 0
                                      ? `Size ${line.variant || ""} is out of stock.`
                                      : `Only ${avail} available for Size ${line.variant || ""}.`
                                  );
                                  return;
                                }
                                changeQty(line.itemId, 1, line.variant);
                              }}
                              className="rounded-lg p-1.5 text-[var(--ink-soft)] transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary-dark)] active:scale-95 cursor-pointer"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLine(line.itemId, line.variant)}
                            className="flex items-center gap-1.5 text-xs font-bold text-[var(--danger)] transition hover:text-[var(--danger-dark)] cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-8">
                  <EmptyState
                    icon={ShoppingCart}
                    title="Cart is empty"
                    description="Browse the shop to add items."
                    actionLabel="Back to store"
                    actionHref="/"
                  />
                </div>
              )}
            </Panel>
          </div>

          {/* Sidebar: Order Summary */}
          <div className="flex flex-col gap-6">
            <Panel className="p-5 sm:p-6 shadow-xl border-white/20 bg-white/60 backdrop-blur-xl">
              <h3 className="flex items-center gap-2 text-xl font-extrabold text-[var(--ink)]">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Order Summary
              </h3>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-2xs text-center">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--ink-soft)]">
                    Total Lines
                  </p>
                  <p
                    suppressHydrationWarning
                    className="text-3xl font-extrabold text-[var(--primary-dark)]"
                  >
                    {mounted ? metrics.cartLines : 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-2xs text-center">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--ink-soft)]">
                    Total Units
                  </p>
                  <p
                    suppressHydrationWarning
                    className="text-3xl font-extrabold text-[var(--primary-dark)]"
                  >
                    {mounted ? metrics.cartUnits : 0}
                  </p>
                </div>
              </div>

              {!isAuthenticated ? (
                <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-50/50 p-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                    Order For (User ID)
                    {usersLoading ? (
                      <span className="text-xs text-[var(--ink-soft)] ml-2">Loading...</span>
                    ) : null}
                  </label>
                  <SearchableSelect
                    className="mt-2"
                    value={String(selectedUserId)}
                    onChange={(val) => setSelectedUserId(val ? Number(val) : "")}
                    options={userOptions}
                    placeholder="-- Select a User --"
                  />
                </div>
              ) : null}

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmitting || !cartRows.length || hasStockIssue}
                  className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-sm font-black text-white shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? "Submitting Order..." : "Submit Order"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="w-full py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-800 transition cursor-pointer"
                >
                  Back to store
                </button>
              </div>
            </Panel>

            <div className="rounded-2xl border border-blue-500/20 bg-blue-50/50 p-4 text-xs text-blue-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <span>ℹ️</span> Important Info
              </p>
              <ul className="list-disc list-inside space-y-1 text-blue-800/90 text-[11px] leading-relaxed">
                <li>Each cart line will generate a separate order record</li>
                <li>Summaries are auto-filled if left blank</li>
                <li>You can track order status in the History section once logged in</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </StorefrontShell>
  );
}
