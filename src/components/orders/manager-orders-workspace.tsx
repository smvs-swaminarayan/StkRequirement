"use client";
/* eslint-disable @next/next/no-img-element */

import { useDeferredValue, useMemo, useState } from "react";
import { ArrowRight, PackageCheck, Eye, CheckCircle2, XCircle, Truck } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/components/providers/auth-provider";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import type { OrderRecord, OrderStatus } from "@/lib/firebase/types";
import { updateOrderStatus } from "@/lib/firebase/firestore";
import { getItemImageCropStyle } from "@/lib/item-image";
import { canManageOrders, isUser } from "@/lib/permissions";
import { formatDate, formatDateTime, formatQty, toDate } from "@/lib/utils";
import {
  buildStatusMessage,
  EmptyOrderThumb,
  getActionIcon,
  getActionLabel,
  getDecisionTitle,
  OrderDecisionBlock,
} from "@/components/orders/order-status";

const orderStatuses = ["ALL", "PENDING", "APPROVED", "REJECTED", "DELIVERED"] as const;

export function ManagerOrdersWorkspace() {
  const { workspaceProfile: profile } = useAuth();
  const { categories, items, orders } = useWorkspaceData();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState<(typeof orderStatuses)[number]>("ALL");
  const [submitting, setSubmitting] = useState(false);
  const [selectedOrderModal, setSelectedOrderModal] = useState<OrderRecord | null>(null);
  const [decisionState, setDecisionState] = useState<{
    orderId: string;
    itemName: string;
    nextStatus: OrderStatus;
  } | null>(null);
  const [decisionNote, setDecisionNote] = useState("");

  const actor = profile
    ? {
        actorId: profile.uid,
        actorName: profile.displayName,
        actorRole: profile.role,
      }
    : undefined;

  const filteredOrders = useMemo(() => {
    const nextOrders = orders.filter((order) => {
      const matchesStatus = statusFilter === "ALL" ? true : order.status === statusFilter;
      const haystack = [
        order.itemName,
        order.categoryName,
        order.requestedByName,
        order.summary,
        order.notes,
        order.approvedCustomNote,
        order.deliveredCustomNote,
        order.rejectedCustomNote,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = deferredSearch
        ? haystack.includes(deferredSearch.trim().toLowerCase())
        : true;

      return matchesStatus && matchesSearch;
    });

    return nextOrders.sort((left, right) => {
      const rightValue = toDate(right.updatedAt || right.createdAt || right.date)?.getTime() ?? 0;
      const leftValue = toDate(left.updatedAt || left.createdAt || left.date)?.getTime() ?? 0;
      return rightValue - leftValue;
    });
  }, [deferredSearch, orders, statusFilter]);

  const openDecision = (orderId: string, itemName: string, nextStatus: OrderStatus) => {
    setDecisionNote("");
    setDecisionState({ orderId, itemName, nextStatus });
  };

  const confirmDecision = async () => {
    if (!profile || !decisionState) {
      return;
    }

    setSubmitting(true);

    try {
      await updateOrderStatus(
        decisionState.orderId,
        {
          status: decisionState.nextStatus,
          decisionById: profile.uid,
          decisionByName: profile.displayName,
          decisionNote,
        },
        actor,
      );

      toast.success(`Order marked ${decisionState.nextStatus.toLowerCase()}.`);
      setDecisionState(null);
      setDecisionNote("");
      setSelectedOrderModal(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update order.");
    } finally {
      setSubmitting(false);
    }
  };

  const defaultDecisionPreview = decisionState
    ? buildStatusMessage(decisionState.nextStatus, new Date())
    : "";

  return (
    <>
      <section className="space-y-4">
        <Panel className="p-4">
          <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-end">
            <div>
              <p className="section-kicker">StkRequirement Orders</p>
              <h3 className="mt-1 text-lg font-bold text-[var(--ink)]">
                Manage orders
              </h3>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                Review requests, approve/reject, and mark deliveries.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-[200px_160px]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search orders..."
                className="stk-input"
              />
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as (typeof orderStatuses)[number])
                }
                className="stk-select"
              >
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "ALL" ? "All statuses" : status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredOrders.length ? (
            <div className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredOrders.map((order) => {
                const orderItem = items.find((item) => item.id === order.itemId);
                const isDelivered = order.status === "DELIVERED";

                return (
                  <article
                    key={order.id}
                    onClick={() => setSelectedOrderModal(order)}
                    className="relative flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden group"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--paper)]">
                            {orderItem?.imageUrl ? (
                              <img
                                src={orderItem.imageUrl}
                                alt={order.itemName}
                                className="h-full w-full object-cover"
                                style={getItemImageCropStyle(orderItem.imageCrop)}
                              />
                            ) : (
                              <EmptyOrderThumb />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--ink-soft)] truncate">
                              {order.categoryName}
                            </p>
                            <h4 className="text-sm font-bold text-[var(--ink)] truncate group-hover:text-[var(--primary)] transition-colors">
                              {order.itemName}
                            </h4>
                          </div>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>

                      {/* Info Pills */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-[var(--paper)] p-2 border border-[var(--border)]">
                          <span className="text-[10px] uppercase font-bold text-[var(--ink-soft)] block">Qty</span>
                          <span className="font-bold text-[var(--ink)]">{formatQty(order.qty)}</span>
                        </div>
                        <div className="rounded-lg bg-[var(--paper)] p-2 border border-[var(--border)] truncate">
                          <span className="text-[10px] uppercase font-bold text-[var(--ink-soft)] block">Requester</span>
                          <span className="font-bold text-[var(--ink)] truncate block">{order.requestedByName}</span>
                        </div>
                      </div>

                      {/* Requester note snippet */}
                      {order.notes ? (
                        <p className="mt-2 text-xs text-[var(--ink-soft)] line-clamp-1 italic bg-amber-500/10 p-1.5 rounded border border-amber-500/20">
                          "{order.notes}"
                        </p>
                      ) : null}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-[var(--ink-light)]">
                        {formatDate(order.date || order.createdAt)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrderModal(order);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" /> Details
                      </button>
                    </div>

                    {/* FROSTED BLUR OVERLAY FOR DELIVERED ORDERS */}
                    {isDelivered && (
                      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2.5px] rounded-xl flex flex-col items-center justify-center z-10 p-3 text-center transition group-hover:bg-slate-950/55">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow-lg border border-emerald-400">
                          <Truck className="h-3.5 w-3.5" /> DELIVERED
                        </span>
                        <span className="mt-1.5 text-[11px] font-semibold text-emerald-200">
                          {formatDate(order.deliveredAt || order.updatedAt)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrderModal(order);
                          }}
                          className="mt-2.5 text-xs font-bold text-white underline hover:text-emerald-300"
                        >
                          View Full Details
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                title="No orders found"
                description="Change the search and status filters to find orders."
              />
            </div>
          )}
        </Panel>
      </section>

      {/* FULL ORDER DETAILS MODAL */}
      <Modal
        open={selectedOrderModal !== null}
        onClose={() => setSelectedOrderModal(null)}
        title={selectedOrderModal ? `Order #${selectedOrderModal.id} Details` : "Order Details"}
        description={selectedOrderModal ? `${selectedOrderModal.categoryName} • ${selectedOrderModal.itemName}` : ""}
      >
        {selectedOrderModal ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--paper)] border border-[var(--border)]">
              <div>
                <p className="text-sm font-bold text-[var(--ink)]">{selectedOrderModal.itemName}</p>
                <p className="text-xs text-[var(--ink-soft)]">Requested by: <span className="font-semibold text-[var(--ink)]">{selectedOrderModal.requestedByName}</span></p>
              </div>
              <StatusBadge status={selectedOrderModal.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--paper)]">
                <span className="text-[10px] font-bold text-[var(--ink-soft)] uppercase block">Quantity</span>
                <span className="text-sm font-extrabold text-[var(--ink)]">{formatQty(selectedOrderModal.qty)}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--paper)]">
                <span className="text-[10px] font-bold text-[var(--ink-soft)] uppercase block">Requested Date</span>
                <span className="text-xs font-bold text-[var(--ink)]">{formatDate(selectedOrderModal.date || selectedOrderModal.createdAt)}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--paper)] col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-[var(--ink-soft)] uppercase block">Last Updated</span>
                <span className="text-xs font-bold text-[var(--ink)]">{formatDateTime(selectedOrderModal.updatedAt || selectedOrderModal.createdAt)}</span>
              </div>
            </div>

            {selectedOrderModal.notes ? (
              <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/10">
                <p className="text-xs font-bold text-amber-800">Requester Note:</p>
                <p className="mt-1 text-sm text-[var(--ink)]">{selectedOrderModal.notes}</p>
              </div>
            ) : null}

            {/* Workflow Timeline */}
            <div className="space-y-2">
              <OrderDecisionBlock
                title={getDecisionTitle("APPROVED")}
                status="APPROVED"
                timestamp={selectedOrderModal.approvedAt}
                actorName={selectedOrderModal.approvedByName}
                customNote={selectedOrderModal.approvedCustomNote}
              />
              <OrderDecisionBlock
                title={getDecisionTitle("REJECTED")}
                status="REJECTED"
                timestamp={selectedOrderModal.rejectedAt}
                actorName={selectedOrderModal.rejectedByName}
                customNote={selectedOrderModal.rejectedCustomNote}
              />
              <OrderDecisionBlock
                title={getDecisionTitle("DELIVERED")}
                status="DELIVERED"
                timestamp={selectedOrderModal.deliveredAt}
                actorName={selectedOrderModal.deliveredByName}
                customNote={selectedOrderModal.deliveredCustomNote}
              />
            </div>

            {/* Action Buttons */}
            {canManageOrders(profile) && (
              <div className="pt-3 border-t border-[var(--border)] flex flex-wrap justify-end gap-2">
                {selectedOrderModal.status === "PENDING" && (
                  <>
                    <button
                      type="button"
                      onClick={() => openDecision(selectedOrderModal.id, selectedOrderModal.itemName, "APPROVED")}
                      className="btn-action px-4 py-2 text-xs"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1 inline" /> Approve Order
                    </button>
                    <button
                      type="button"
                      onClick={() => openDecision(selectedOrderModal.id, selectedOrderModal.itemName, "REJECTED")}
                      className="btn-danger px-4 py-2 text-xs"
                    >
                      <XCircle className="h-4 w-4 mr-1 inline" /> Reject Order
                    </button>
                  </>
                )}
                {selectedOrderModal.status === "APPROVED" && (
                  <button
                    type="button"
                    onClick={() => openDecision(selectedOrderModal.id, selectedOrderModal.itemName, "DELIVERED")}
                    className="btn-primary bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold"
                  >
                    <Truck className="h-4 w-4 mr-1 inline" /> Mark as Delivered
                  </button>
                )}
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* CONFIRMATION DECISION MODAL */}
      <Modal
        open={decisionState !== null}
        onClose={() => {
          setDecisionState(null);
          setDecisionNote("");
        }}
        title={
          decisionState ? `${getActionLabel(decisionState.nextStatus)} ${decisionState.itemName}` : "Update order"
        }
        description="The default system note and your additional comment are both saved."
      >
        <div className="space-y-4">
          {decisionState ? (
            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--ink)]">
                {(() => {
                  const ActionIcon = getActionIcon(decisionState.nextStatus);
                  return <ActionIcon className="h-4 w-4" />;
                })()}
                Default message
              </div>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">{defaultDecisionPreview}</p>
            </div>
          ) : null}

          <label className="block text-sm font-semibold text-[var(--ink)]">
            Additional note
            <textarea
              rows={3}
              value={decisionNote}
              onChange={(event) => setDecisionNote(event.target.value)}
              className="stk-input mt-1.5"
              placeholder="Example: You can collect the order today at 2 PM."
            />
          </label>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setDecisionState(null);
                setDecisionNote("");
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDecision}
              disabled={submitting}
              className="btn-action inline-flex items-center gap-2"
            >
              {decisionState ? getActionLabel(decisionState.nextStatus) : "Confirm"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
