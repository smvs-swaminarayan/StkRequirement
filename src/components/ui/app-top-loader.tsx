"use client";

import { useEffect, useRef, useState } from "react";
import { useAppLoading } from "@/components/providers/loading-provider";

export function AppTopLoader() {
  const { pulse } = useAppLoading();
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    // Always show briefly for instant feedback, then auto-hide.
    // This avoids "stuck loader" and keeps UI feeling fast.
    const VISIBLE_MS = 900;

    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }

    setVisible(true);
    hideTimer.current = window.setTimeout(() => setVisible(false), VISIBLE_MS);

    return () => {
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
    };
  }, [pulse]);

  if (!visible) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-[70]">
      <div className="h-[3px] w-full overflow-hidden bg-transparent">
        <div className="stk-top-loader h-full w-[30%] bg-[var(--primary)]" />
      </div>
    </div>
  );
}

