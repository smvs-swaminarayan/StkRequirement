"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

const POST_SIGNOUT_REDIRECT_KEY = "stk:post-signout-redirect";

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !firebaseUser) {
      const didSignOut =
        typeof window !== "undefined" &&
        window.sessionStorage.getItem(POST_SIGNOUT_REDIRECT_KEY) === "1";

      if (didSignOut) {
        window.sessionStorage.removeItem(POST_SIGNOUT_REDIRECT_KEY);
        router.replace("/");
        return;
      }

      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [firebaseUser, loading, pathname, router]);

  if (loading || !firebaseUser) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="surface-card rounded-[24px] px-8 py-7 text-sm text-[var(--ink-soft)]">
          Loading...
        </div>
      </div>
    );
  }

  return children;
}
