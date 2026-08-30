"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Trash2, Eye, ExternalLink, Calendar, User, Layers, Hash, FileText } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/components/providers/auth-provider";
import { db } from "@/lib/firebase/client";
import type { SpecialRequestRecord, RequestType } from "@/lib/firebase/types";
import { formatDate, cn } from "@/lib/utils";

export function RequestsView() {
  const { workspaceProfile: profile } = useAuth();
  const [requests, setRequests] = useState<SpecialRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs: "OUT_OF_STOCK" | "NEW_ITEM"
  const [activeTab, setActiveTab] = useState<RequestType>("OUT_OF_STOCK");
  const [processingId, setProcessingId] = useState<string | number | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SpecialRequestRecord | null>(null);

  useEffect(() => {
    const q = query(collection(db, "specialRequests"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as SpecialRequestRecord));
      setRequests(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load requests");
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = requests.filter(r => {
    const isDeleted = Boolean(r.is_deleted === 1 || r.is_deleted === true || r.is_deleted === "1" || r.deletedAt);
    return !isDeleted && r.type === activeTab;
  });

  const handleDelete = async (req: SpecialRequestRecord) => {
    if (!profile) return;
    if (!confirm("Are you sure you want to delete this request?")) return;
    
    setProcessingId(req.id);
    try {
      await updateDoc(doc(db, "specialRequests", String(req.id)), {
        is_deleted: 1,
        deletedAt: serverTimestamp(),
        deletedById: profile.uid,
        deletedByName: profile.displayName
      });
      setRequests((current) => current.filter((r) => String(r.id) !== String(req.id)));
      if (selectedRequest?.id === req.id) {
        setSelectedRequest(null);
      }
      toast.success("Request deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setProcessingId(null);
    }
  };

  const isUrl = (str?: string) => {
    if (!str) return false;
    return str.startsWith("http://") || str.startsWith("https://");
  };

  return (
    <AppShell title="Special Requests">
      <div className="space-y-4">
        {/* TABS */}
        <div className="flex gap-2 p-1 bg-[var(--paper)] rounded-xl border border-[var(--border)] w-fit shadow-2xs">
          <button
            onClick={() => setActiveTab("OUT_OF_STOCK")}
            className={cn(
              "px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition",
              activeTab === "OUT_OF_STOCK"
                ? "bg-[var(--primary)] text-white shadow-xs"
                : "text-[var(--ink-soft)] hover:bg-[var(--background)]"
            )}
          >
            Unavailable Stock Items
          </button>
          <button
            onClick={() => setActiveTab("NEW_ITEM")}
            className={cn(
              "px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition",
              activeTab === "NEW_ITEM"
                ? "bg-[var(--primary)] text-white shadow-xs"
                : "text-[var(--ink-soft)] hover:bg-[var(--background)]"
            )}
          >
            New Items
          </button>
        </div>

        {loading ? (
          <Panel className="p-8">
            <div className="stk-loading h-12 w-full rounded" />
          </Panel>
        ) : filtered.length === 0 ? (
          <Panel className="p-8 text-center">
            <EmptyState 
              title={activeTab === "OUT_OF_STOCK" ? "No items out of stock" : "No new item requests"} 
              description={activeTab === "OUT_OF_STOCK" ? "All items have sufficient stock or no requests have been made." : "There are no pending new item requests."} 
            />
          </Panel>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
            {filtered.map(req => {
              const itemName = req.type === 'NEW_ITEM' ? req.newItemName : req.itemName;
              const desc = req.type === 'NEW_ITEM' ? req.newItemDescription : req.notes;

              return (
                <Panel key={req.id} className="p-4 flex flex-col justify-between h-full hover:shadow-md transition border border-[var(--border)] rounded-2xl bg-white">
                  <div>
                    <div className="flex justify-between items-center mb-2.5">
                      <span className={cn(
                        "text-[11px] font-bold px-2.5 py-1 rounded-full",
                        req.type === 'NEW_ITEM' ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-orange-100 text-orange-700 border border-orange-200"
                      )}>
                        {req.type === 'NEW_ITEM' ? "New Item Request" : "Out of Stock"}
                      </span>
                      <span className="text-[11px] text-[var(--ink-light)] font-medium">
                        {formatDate(req.createdAt)}
                      </span>
                    </div>
                    
                    {/* Fixed Height Uniform Title */}
                    <h3 
                      className="text-base font-bold text-[var(--ink)] line-clamp-1 cursor-pointer hover:text-amber-600 transition" 
                      title={itemName}
                      onClick={() => setSelectedRequest(req)}
                    >
                      {itemName}
                    </h3>
                    
                    {/* Fixed Compact Info Rows */}
                    <div className="mt-3 text-xs text-[var(--ink-soft)] space-y-1.5">
                      <p className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-gray-700 shrink-0">By:</span>
                        <span className="truncate">{req.requestedByName}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-700">Qty:</span>
                        <span className="font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{req.qty}</span>
                      </p>

                      {req.type === 'OUT_OF_STOCK' && req.categoryName && (
                        <p className="truncate">
                          <span className="font-semibold text-gray-700">Category:</span> {req.categoryName}
                        </p>
                      )}

                      {req.type === 'NEW_ITEM' && req.newItemCategoryGuess && (
                        <p className="truncate">
                          <span className="font-semibold text-gray-700">Category Guess:</span> {req.newItemCategoryGuess}
                        </p>
                      )}

                      {/* Truncated Description to preserve identical card size */}
                      {desc ? (
                        <div className="pt-1">
                          <p className="font-semibold text-gray-700 text-[11px]">Desc / Link:</p>
                          <p className="text-[11px] text-gray-500 line-clamp-2 break-all bg-gray-50 p-1.5 rounded border border-gray-100 mt-0.5">
                            {desc}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-[var(--border)] flex gap-2">
                    <button 
                      type="button"
                      className="flex-1 py-1.5 px-2 text-xs font-bold rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 transition flex items-center justify-center gap-1 cursor-pointer"
                      onClick={() => setSelectedRequest(req)}
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                    <button 
                      type="button"
                      disabled={processingId === req.id}
                      className="py-1.5 px-2.5 text-xs font-bold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition flex items-center justify-center cursor-pointer"
                      onClick={() => handleDelete(req)}
                      title="Delete request"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Panel>
              );
            })}
          </div>
        )}

        {/* DETAILS POPUP MODAL */}
        {selectedRequest && (
          <Modal
            open={Boolean(selectedRequest)}
            onClose={() => setSelectedRequest(null)}
            title={selectedRequest.type === 'NEW_ITEM' ? (selectedRequest.newItemName || "New Item Request") : (selectedRequest.itemName || "Out of Stock Request")}
            description="Complete special request details"
          >
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Badge & Date */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className={cn(
                  "text-xs font-bold px-3 py-1 rounded-full",
                  selectedRequest.type === 'NEW_ITEM' ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-orange-100 text-orange-700 border border-orange-200"
                )}>
                  {selectedRequest.type === 'NEW_ITEM' ? "New Item Request" : "Out of Stock"}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Requested on {formatDate(selectedRequest.createdAt)}</span>
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl border border-gray-200/80 bg-white">
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold mb-1">
                    <User className="w-3.5 h-3.5" /> Requested By
                  </div>
                  <div className="font-bold text-gray-900">{selectedRequest.requestedByName || "Unknown"}</div>
                </div>

                <div className="p-3 rounded-xl border border-gray-200/80 bg-white">
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold mb-1">
                    <Hash className="w-3.5 h-3.5" /> Quantity Requested
                  </div>
                  <div className="font-bold text-amber-700 text-base">{selectedRequest.qty}</div>
                </div>

                {(selectedRequest.categoryName || selectedRequest.newItemCategoryGuess) && (
                  <div className="sm:col-span-2 p-3 rounded-xl border border-gray-200/80 bg-white">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold mb-1">
                      <Layers className="w-3.5 h-3.5" /> Category
                    </div>
                    <div className="font-bold text-gray-900">
                      {selectedRequest.categoryName || selectedRequest.newItemCategoryGuess}
                    </div>
                  </div>
                )}
              </div>

              {/* Full Description / Link Section */}
              {(selectedRequest.newItemDescription || selectedRequest.notes) && (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <FileText className="w-4 h-4 text-amber-600" /> Full Description & Notes:
                  </div>
                  <div className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap break-words leading-relaxed bg-white p-3 rounded-lg border border-amber-200/60 shadow-2xs">
                    {selectedRequest.newItemDescription || selectedRequest.notes}
                  </div>

                  {/* If URL detected, offer direct clickable link */}
                  {isUrl(selectedRequest.newItemDescription) && (
                    <div className="pt-2">
                      <a
                        href={selectedRequest.newItemDescription}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Link in New Tab
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Image Preview (if available) */}
              {selectedRequest.newItemImageUrl && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-gray-700">Attached Image:</span>
                  <div className="p-2 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center">
                    <img 
                      src={selectedRequest.newItemImageUrl} 
                      alt="Requested Item" 
                      className="max-h-64 w-auto object-contain rounded-lg shadow-2xs" 
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedRequest)}
                  disabled={processingId === selectedRequest.id}
                  className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Delete Request
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-5 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
