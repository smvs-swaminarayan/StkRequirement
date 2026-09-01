"use client";

import { Suspense } from "react";
import { StockMasterView } from "@/components/masters/stock-master-view";

export default function MastersStockPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center p-8 text-center text-sm font-bold text-gray-500">
          Loading Stock Entries...
        </div>
      }
    >
      <StockMasterView />
    </Suspense>
  );
}
