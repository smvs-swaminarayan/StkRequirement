"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
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
      toast.success("Request deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AppShell title="Special Requests">
      <div className="space-y-4">
        {/* TABS */}
        <div className="flex gap-2 p-1 bg-[var(--paper)] rounded-lg border border-[var(--border)] w-fit">
          <button
            onClick={() => setActiveTab("OUT_OF_STOCK")}
            className={cn(
              "px-4 py-2 text-sm font-bold rounded-md transition",
              activeTab === "OUT_OF_STOCK"
                ? "bg-[var(--primary)] text-white shadow"
                : "text-[var(--ink-soft)] hover:bg-[var(--background)]"
            )}
          >
            Unavailable Stock Items
          </button>
          <button
            onClick={() => setActiveTab("NEW_ITEM")}
            className={cn(
              "px-4 py-2 text-sm font-bold rounded-md transition",
              activeTab === "NEW_ITEM"
                ? "bg-[var(--primary)] text-white shadow"
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map(req => (
              <Panel key={req.id} className="p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${req.type === 'NEW_ITEM' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                      {req.type === 'NEW_ITEM' ? "New Item Request" : "Out of Stock"}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-[var(--ink)]">
                    {req.type === 'NEW_ITEM' ? req.newItemName : req.itemName}
                  </h3>
                  
                  <div className="mt-2 text-sm text-[var(--ink-soft)] space-y-1">
                    <p><span className="font-semibold">Requested By:</span> {req.requestedByName}</p>
                    <p><span className="font-semibold">Qty Requested:</span> {req.qty}</p>
                    {req.type === 'OUT_OF_STOCK' && req.categoryName && (
                      <p><span className="font-semibold">Category:</span> {req.categoryName}</p>
                    )}
                    {req.type === 'NEW_ITEM' && (
                      <>
                        <p><span className="font-semibold">Category Guess:</span> {req.newItemCategoryGuess}</p>
                        <p><span className="font-semibold">Desc:</span> {req.newItemDescription}</p>
                        {req.newItemImageUrl && <div className="mt-2"><img src={req.newItemImageUrl} alt="New Item" className="h-32 w-auto object-contain rounded border border-[var(--border)]" /></div>}
                      </>
                    )}
                    {req.notes && <p><span className="font-semibold">Notes:</span> {req.notes}</p>}
                    <p className="text-xs text-[var(--ink-light)] mt-2">Requested on {formatDate(req.createdAt)}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <button 
                    disabled={processingId === req.id}
                    className="btn-secondary w-full border-red-200 text-red-600 hover:bg-red-50 font-bold"
                    onClick={() => handleDelete(req)}
                  >
                    <Trash2 className="w-4 h-4 mr-1 inline" /> Delete
                  </button>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
