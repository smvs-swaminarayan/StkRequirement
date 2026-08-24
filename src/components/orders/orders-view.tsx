"use client";

import { AppShell } from "@/components/shell/app-shell";
import { Panel } from "@/components/ui/panel";
import { useAuth } from "@/components/providers/auth-provider";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import { isUser } from "@/lib/permissions";
import { ManagerOrdersWorkspace } from "@/components/orders/manager-orders-workspace";
import { UserOrdersWorkspace } from "@/components/orders/user-orders-workspace";

export function OrdersView({
  userView = "catalog",
}: {
  userView?: "catalog" | "history" | "cart";
}) {
  const { workspaceProfile: profile } = useAuth();
  const { loading } = useWorkspaceData();
  const userMode = isUser(profile);

  return (
    <AppShell title={userMode ? "My Orders" : "Orders"} hidePageHeader={userMode}>
      {loading ? (
        <Panel className="p-8 text-sm text-[var(--ink-soft)]">Loading orders...</Panel>
      ) : userMode ? (
        <UserOrdersWorkspace activeView={userView} />
      ) : (
        <ManagerOrdersWorkspace />
      )}
    </AppShell>
  );
}
