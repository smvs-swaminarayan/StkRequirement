"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

type LoadingContextValue = {
  isLoading: boolean;
  pulse: number;
  start: () => void;
  stop: () => void;
  beginNavigation: () => void;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const [pulse, setPulse] = useState(0);
  const pendingNav = useRef(0);
  const pathname = usePathname();

  const start = useCallback(() => {
    startTransition(() => setCount((c) => c + 1));
    startTransition(() => setPulse((p) => p + 1));
  }, []);

  const stop = useCallback(() => {
    startTransition(() =>
      setCount((c) => {
        const next = c - 1;
        return next < 0 ? 0 : next;
      }),
    );
  }, []);

  const beginNavigation = useCallback(() => {
    pendingNav.current += 1;
    start();
  }, [start]);

  useEffect(() => {
    while (pendingNav.current > 0) {
      pendingNav.current -= 1;
      stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const value = useMemo<LoadingContextValue>(
    () => ({
      isLoading: count > 0,
      pulse,
      start,
      stop,
      beginNavigation,
    }),
    [count, pulse, start, stop, beginNavigation],
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

export function useAppLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error("useAppLoading must be used within LoadingProvider.");
  }
  return ctx;
}
