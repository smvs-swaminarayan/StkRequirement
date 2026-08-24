"use client";

import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { AppTopLoader } from "@/components/ui/app-top-loader";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
      <AuthProvider>
        <LoadingProvider>
          <CartProvider>{children}</CartProvider>
          <AppTopLoader />
        <Toaster
          position="top-right"
          richColors
          duration={2000}
          toastOptions={{
            style: {
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "#ffffff",
              color: "var(--ink)",
              boxShadow: "0 8px 24px rgba(15,17,17,0.15)",
              fontSize: "0.875rem",
            },
          }}
        />
      </LoadingProvider>
      </AuthProvider>
  );
}
