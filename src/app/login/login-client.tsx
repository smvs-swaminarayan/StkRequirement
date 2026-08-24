"use client";

import { useSearchParams } from "next/navigation";
import { LoginScreen } from "@/components/auth/login-screen";

export function LoginClient() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? undefined;
  return <LoginScreen nextPath={nextPath} />;
}
