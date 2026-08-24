"use client";
/* eslint-disable @next/next/no-img-element */
import { where } from "firebase/firestore";

import { useState, useMemo } from "react";
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
  const { categories, items, getAvailableStock } = usePublicCatalog();
  const { cart, updateLine, changeQty, removeLine } = useCart();
  const router = useRouter();

  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { items: allUsers, loading: usersLoading, error: usersError } = useFirestoreCollection<AppUserProfile>("users", USERS_QUERY);
  const selectableUsers = allUsers.filter(u => !u.deletedAt && !(u.roles?.length === 1 && u.roles[0] === "SUPER_ADMIN")).sort((a,b) => a.username.localeCompare(b.username, undefined, {numeric: true}));
  
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
      const item = items.find((entry) => entry.id === line.itemId);
      const category = item ? categories.find((entry) => entry.id === item.categoryId) : null;
      return item && category ? { ...line, item, category } : null;
    })
    .filter(Boolean) as Array<(typeof cart)[number] & { item: (typeof items)[number]; category: (typeof categories)[number] }>;

  const metrics = {
    cartLines: cartRows.length,
    cartUnits: cartRows.reduce((sum, line) => sum + line.qty, 0),
  };

  const hasStockIssue = cartRows.some((line) => line.qty > getAvailableStock(line.itemId));

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
          categoryId: line.item.categoryId,
          categoryName: line.item.categoryName,
          qty: line.qty,
          summary: line.summary,
          notes: line.notes,
          requestedById: su.uid,
          requestedByName: su.displayName,
          requestedByUsername: su.username,
        });
        removeLine(line.itemId);
      }
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
                <div className="flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-4 py-2 text-sm font-bold text-[var(--primary-dark)] shadow-sm">
                  <ShoppingCart className="h-4 w-4" />
                  {metrics.cartUnits} units total
                </div>
              </div>
          {cartRows.length ? (
            <div className="mt-6 space-y-4 stagger-children">
              {cartRows.map((line) => (
                <article key={line.itemId} className="group relative rounded-2xl border border-[var(--border-strong)] bg-white p-4 shadow-sm transition hover:shadow-lg hover:-translate-y-0.5 animate-fade-up">
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
                        <h4 className="mt-1 text-lg font-bold text-[var(--ink)]">{line.item.name}</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-[var(--canvas-strong)] px-2.5 py-0.5 text-xs font-semibold text-[var(--ink-soft)]">Unit: {line.item.unit}</span>
                        {(() => {
                          const avail = getAvailableStock(line.itemId);
                          const over = line.qty > avail;
                          return (
                            <span
                              className={cn(
                                "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold",
                                over ? "bg-[var(--danger-soft)] text-[var(--danger)]" : "bg-[var(--success-soft)] text-[var(--success)]"
                              )}
                            >
                              {over ? (
                                <>
                                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                  Only {avail} available
                                </>
                              ) : (
                                <>Stock: {avail}</>
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
                            onChange={(e) => updateLine(line.itemId, { summary: e.target.value })}
                            placeholder="Optional summary"
                            className="stk-input mt-1.5 w-full bg-[var(--canvas)]"
                          />
                        </label>
                        <label className="text-xs font-semibold text-[var(--ink-soft)]">
                          Note
                          <input
                            value={line.notes}
                            onChange={(e) => updateLine(line.itemId, { notes: e.target.value })}
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
                          onClick={() => changeQty(line.itemId, -1)}
                          className="rounded-lg p-1.5 text-[var(--ink-soft)] transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary-dark)] active:scale-95"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-extrabold text-[var(--ink)]">
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
                          className="rounded-lg p-1.5 text-[var(--ink-soft)] transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary-dark)] active:scale-95"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.itemId)}
                        className="group/btn flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-[var(--danger)] transition hover:bg-[var(--danger-soft)]"
                      >
                        <Trash2 className="h-4 w-4 transition-transform group-hover/btn:scale-110 group-hover/btn:-rotate-12" />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState title="Cart is empty" description="Browse the shop to add items." />
            </div>
          )}
        </Panel>
        </div>

        {/* ─── Checkout Summary (Sticky Sidebar) ─────── */}
        <div>
          <div className="sticky top-[100px]">
            <Panel className="p-6 shadow-2xl border-[var(--border-strong)] bg-white">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="h-6 w-6 text-[var(--success)]" />
                <h3 className="text-xl font-extrabold text-[var(--ink)]">
                  Order Summary
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--canvas)] p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Total Lines</p>
                  <p className="mt-1 text-3xl font-black text-[var(--ink)]">{formatQty(metrics.cartLines)}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--canvas)] p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Total Units</p>
                  <p className="mt-1 text-3xl font-black text-[var(--primary-dark)]">{formatQty(metrics.cartUnits)}</p>
                </div>
              </div>
              
              <div className="mt-8 space-y-4">
                {!isAuthenticated && (
                  <div className="relative z-30 rounded-2xl border-2 border-[var(--primary-soft)] bg-[var(--primary)]/5 p-4 shadow-sm animate-fade-in">
                    <span className="block text-sm font-extrabold text-[var(--ink)] mb-2">
                      Order For (User ID)
                      {usersLoading ? (
                        <span className="text-xs text-[var(--ink-soft)] mt-1 flex items-center gap-2 font-normal">
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" /> Loading users...
                        </span>
                      ) : usersError ? (
                        <span className="text-xs text-red-500 mt-1 block font-normal">Error: {usersError}</span>
                      ) : null}
                    </span>
                    {!usersLoading && !usersError && (
                      <SearchableSelect
                        className="mt-1"
                        value={String(selectedUserId)}
                        onChange={(val) => setSelectedUserId(val ? Number(val) : "")}
                        options={userOptions}
                        placeholder="-- Select a User --"
                      />
                    )}
                    {selectedUserId && (() => {
                      const su = selectableUsers.find(u => u.uid === selectedUserId);
                      return su ? (
                        <div className="mt-4 animate-fade-down">
                          <label className="block text-sm font-extrabold text-[var(--ink)]">
                            Full Name
                            <input
                              type="text"
                              disabled
                              value={su.displayName}
                              className="stk-input mt-2 w-full bg-[var(--canvas-strong)] text-[var(--ink)] font-semibold cursor-not-allowed border-transparent"
                            />
                          </label>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
                
                <hr className="border-[var(--border-strong)]" />
                
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={!cartRows.length || hasStockIssue || isSubmitting || (!isAuthenticated && !selectedUserId)}
                  className="btn-action w-full py-4 text-lg font-black tracking-wide shadow-[var(--shadow-glow)] disabled:opacity-50 disabled:shadow-none hover:-translate-y-1"
                >
                  {isSubmitting ? "Processing..." : (isAuthenticated ? "Continue to Checkout" : "Submit Order")}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="btn-secondary w-full py-3 text-base"
                >
                  Back to store
                </button>
              </div>
              
              <div className="mt-6 rounded-xl bg-slate-900 p-5 text-white shadow-inner">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--primary)]">
                  <CheckCircle2 className="h-4 w-4" />
                  Important Info
                </div>
                <ul className="mt-3 space-y-2 text-xs font-medium text-slate-300 leading-relaxed">
                  <li>• Each cart line will generate a separate order record</li>
                  <li>• Summaries are auto-filled if left blank</li>
                  {!isAuthenticated ? (
                    <li className="text-[var(--primary-soft)] font-bold">• You must select a user ID to place this guest order</li>
                  ) : null}
                </ul>
              </div>
            </Panel>
          </div>
        </div>
        </div>
      </section>
    </StorefrontShell>
  );
}
