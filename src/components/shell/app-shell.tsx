"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  ChevronDown,
  ClipboardList,
  History,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  MessageSquare,
  Menu,
  Search,
  Shield,
  ShoppingCart,
  Users,
  X,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/components/providers/auth-provider";
import { useAppLoading } from "@/components/providers/loading-provider";
import { getFirebaseErrorMessage } from "@/lib/firebase/error-message";
import { getRoleLabel } from "@/lib/permissions";
import type { Role } from "@/lib/firebase/types";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
};

type NavSection = {
  title: string;
  items: NavItem[];
};

function buildNavSections(activeRole: Role | null) {
  if (activeRole === "SUPER_ADMIN") {
    return [
      {
        title: "Workspace",
        items: [
          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/orders", label: "Orders", icon: ClipboardList },
          { href: "/requests", label: "Requests", icon: MessageSquare },
        ],
      },
      {
        title: "Management",
        items: [
          { href: "/masters", label: "Masters", icon: Boxes },
          { href: "/team", label: "Users Manage", icon: Users },
          { href: "/reports", label: "Reports Admin", icon: Shield },
        ],
      },
    ] satisfies NavSection[];
  }

  if (activeRole === "LEADER") {
    return [
      {
        title: "Workspace",
        items: [
          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
          { href: "/orders", label: "Orders", icon: ClipboardList },
          { href: "/masters", label: "Items & Stock", icon: Boxes },
          { href: "/requests", label: "Requests", icon: MessageSquare },
        ],
      },
      {
        title: "Insight",
        items: [{ href: "/reports", label: "Reports Leader", icon: Shield }],
      },
    ] satisfies NavSection[];
  }

  return [
    {
      title: "Workspace",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        {
          href: "/orders/cart",
          label: "My Orders",
          icon: ClipboardList,
          children: [
            { href: "/orders/cart", label: "My Cart", icon: ShoppingCart },
            { href: "/orders/history", label: "Order History", icon: History },
          ],
        },
      ],
    },
    {
      title: "Insight",
      items: [{ href: "/reports", label: "Reports User", icon: Shield }],
    },
  ] satisfies NavSection[];
}

export function AppShell({
  title,
  children,
  hidePageHeader = false,
}: {
  title: string;
  children: React.ReactNode;
  hidePageHeader?: boolean;
}) {
  const {
    activeRole,
    availableRoles,
    profile,
    verifyUsername,
    forgotPassword,
    setActiveRole,
    signOutCurrentUser,
    workspaceProfile,
  } = useAuth();
  const { beginNavigation, start, stop } = useAppLoading();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [optimisticRole, setOptimisticRole] = useState<Role | null>(activeRole);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<"username" | "password" | "done">("username");
  const [resetForm, setResetForm] = useState({
    username: profile?.username ?? "",
    nextPassword: "",
    confirmPassword: "",
  });
  const [resetVerifiedName, setResetVerifiedName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setOptimisticRole(activeRole);
  }, [activeRole]);

  const navSections = useMemo(() => buildNavSections(optimisticRole), [optimisticRole]);
  const allNavItems = useMemo(
    () => navSections.flatMap((section) => section.items),
    [navSections],
  );

  useEffect(() => {
    setMobileNavOpen(false);
    setAccountMenuOpen(false);
  }, [pathname]);

  const onSignOut = async () => {
    // Navigate to home FIRST so ProtectedLayout doesn't redirect to /login
    setAccountMenuOpen(false);
    setMobileNavOpen(false);
    beginNavigation();
    router.replace("/");
    // Small delay to let navigation start before auth state changes
    await new Promise((r) => setTimeout(r, 150));
    start();
    await signOutCurrentUser();
    stop();
    toast.success("Session closed.");
  };

  const onVerifyUsername = async () => {
    if (!resetForm.username.trim()) {
      toast.error("Enter your username.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await verifyUsername(resetForm.username.trim());
      if (result.found) {
        setResetVerifiedName(result.displayName || result.username || resetForm.username.trim());
        setResetStep("password");
        toast.success(`Account verified: ${result.displayName || result.username}`);
      } else {
        toast.error(result.error || "User not found.");
      }
    } catch {
      toast.error("Unable to verify username.");
    } finally {
      setSubmitting(false);
    }
  };

  const onResetPassword = async () => {
    const passLen = resetForm.nextPassword.trim().length;
    if (passLen < 3 || passLen > 16) {
      toast.error("Password must be between 3 and 16 characters.");
      return;
    }

    if (resetForm.nextPassword !== resetForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await forgotPassword(resetForm.username, resetForm.nextPassword);
      setResetStep("done");
      toast.success("Your password has been updated successfully!");
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error, "Unable to reset password."));
    } finally {
      setSubmitting(false);
    }
  };

  const openForgotModal = () => {
    setAccountMenuOpen(false);
    setResetForm({
      username: profile?.username ?? "",
      nextPassword: "",
      confirmPassword: "",
    });
    setResetStep("username");
    setResetVerifiedName("");
    setForgotModalOpen(true);
  };

  const closeForgotModal = () => {
    setForgotModalOpen(false);
    setResetStep("username");
    setResetVerifiedName("");
  };

  return (
    <div className="page-shell min-h-screen">
      {/* ─── Top Header Bar ────────────────────────────── */}
      <header className="stk-header sticky top-0 z-30">
        {/* Primary header */}
        <div className="mx-auto flex max-w-[1480px] items-center gap-4 px-4 py-2.5">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-lg p-2 text-white hover:bg-white/10 lg:hidden transition"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2 no-underline">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-xs font-extrabold text-white shadow-sm">
              STK
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              StkRequirement
            </span>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Role badge */}
          <div className="hidden items-center gap-2 text-xs text-white/70 md:flex">
            <span className="rounded-md bg-[var(--primary)]/20 px-2.5 py-1 font-semibold text-[var(--primary)]">
              {getRoleLabel(optimisticRole ?? workspaceProfile)}
            </span>
          </div>

          {/* Date */}
          <div className="hidden text-xs text-white/60 lg:block">
            {new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>

          {/* Account & Role Switcher dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-sm text-white transition hover:bg-white/20"
            >
              <User className="h-4 w-4 text-amber-400" />
              <span className="hidden font-semibold max-w-[120px] truncate sm:block">
                {profile?.displayName ?? "Account"}
              </span>
              <span className="rounded bg-amber-400/20 px-2 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/40">
                {getRoleLabel(optimisticRole ?? workspaceProfile)} ▾
              </span>
            </button>

            {accountMenuOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setAccountMenuOpen(false)}
                />
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-72 animate-slide-down rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-[var(--shadow-xl)]">
                  {/* Account info */}
                  <div className="border-b border-[var(--border)] px-4 py-3">
                    <p className="text-sm font-bold text-[var(--ink)]">
                      {profile?.displayName}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                      @{profile?.username} · {getRoleLabel(optimisticRole ?? workspaceProfile)}
                    </p>
                  </div>

                  {/* Role switcher */}
                  {availableRoles.length > 1 ? (
                    <div className="border-b border-[var(--border)] px-4 py-3">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                        Switch Role
                      </p>
                      <div className="grid gap-1.5">
                        {availableRoles.map((role) => {
                          const selected = role === optimisticRole;

                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => {
                                // Role switching is instant UI state (no navigation).
                                // Using beginNavigation() here caused loader to spin forever.
                                setOptimisticRole(role);
                                setActiveRole(role);
                                setAccountMenuOpen(false);
                                // Ensure Orders experience switches instantly when role changes.
                                if (role === "USER" && pathname.startsWith("/orders")) {
                                  beginNavigation();
                                  router.push("/orders", { scroll: false });
                                }
                              }}
                              className={cn(
                                "rounded-[var(--radius-sm)] border px-3 py-2 text-left text-sm font-semibold transition",
                                selected
                                  ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-dark)]"
                                  : "border-[var(--border)] bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--canvas)]",
                              )}
                            >
                              {getRoleLabel(role)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {/* Actions */}
                  <div className="py-1.5">
                    <button
                      type="button"
                      onClick={openForgotModal}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[var(--ink)] hover:bg-[var(--paper)] transition"
                    >
                      <LockKeyhole className="h-4 w-4 text-[var(--ink-soft)]" />
                      Forgot password
                    </button>
                    <hr className="my-1 border-[var(--border)]" />
                    <button
                      type="button"
                      onClick={onSignOut}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[var(--danger)] hover:bg-[var(--danger-soft)] transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* ─── Secondary Nav Bar ───────────────────────── */}
        <nav className="stk-header-sub hidden lg:block">
          <div className="mx-auto flex max-w-[1480px] items-center gap-1 px-4">
            {allNavItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    onClick={() => beginNavigation()}
                    className={cn(
                      "flex items-center gap-1.5 rounded-t-[var(--radius-sm)] px-3 py-2 text-sm font-semibold no-underline transition",
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/75 hover:text-white",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.children?.length ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : null}
                  </Link>

                  {/* Desktop dropdown for sub-nav */}
                  {item.children?.length ? (
                    <div className="invisible absolute left-0 top-full z-40 min-w-[200px] rounded-b-[var(--radius-lg)] border border-[var(--border)] bg-white opacity-0 shadow-[var(--shadow-lg)] group-hover:visible group-hover:opacity-100 transition-all duration-150">
                      {item.children.map((child) => {
                        const childActive = pathname === child.href;

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                                    onClick={() => beginNavigation()}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2.5 text-sm no-underline transition first:rounded-t-[var(--radius-lg)] last:rounded-b-[var(--radius-lg)]",
                              childActive
                                ? "bg-[var(--primary-soft)] font-semibold text-[var(--primary-dark)]"
                                : "text-[var(--ink)] hover:bg-[var(--paper)]",
                            )}
                          >
                            <child.icon className="h-4 w-4 text-[var(--ink-soft)]" />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}

                  {/* Active indicator */}
                  {active ? (
                    <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-[var(--primary)]" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </nav>
      </header>

      {/* ─── Page Content ──────────────────────────────── */}
      <div className="mx-auto max-w-[1480px] px-3 py-4 sm:px-4">
        {!hidePageHeader ? (
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-[var(--ink)] sm:text-2xl">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)]">
                {getRoleLabel(optimisticRole ?? workspaceProfile)}
              </span>
              <span className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 py-1.5 text-xs text-[var(--ink-soft)]">
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        ) : null}

        <div className="space-y-4">{children}</div>
      </div>

      {/* ─── Mobile Navigation Drawer ──────────────────── */}
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-full max-w-[300px]">
            <div className="hide-scrollbar flex h-full flex-col overflow-auto bg-white">
              {/* Mobile header */}
              <div className="stk-header flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-xs font-extrabold text-white">
                    STK
                  </div>
                  <span className="text-base font-bold text-white">STK Requirement</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded p-1 text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile account */}
              <div className="border-b border-[var(--border)] bg-[var(--paper)] px-4 py-3">
                <p className="text-sm font-bold text-[var(--ink)]">{profile?.displayName}</p>
                <p className="text-xs text-[var(--ink-soft)]">
                  @{profile?.username} · {getRoleLabel(workspaceProfile)}
                </p>
              </div>

              {/* Mobile nav */}
              <nav className="flex-1 px-2 py-3">
                {navSections.map((section) => (
                  <div key={section.title} className="mb-4">
                    <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                      {section.title}
                    </p>
                    {section.items.map((item) => {
                      const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                      return (
                        <div key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => beginNavigation()}
                            className={cn(
                              "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-semibold no-underline transition",
                              active
                                ? "bg-[var(--primary-soft)] text-[var(--primary-dark)]"
                                : "text-[var(--ink)] hover:bg-[var(--paper)]",
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>

                          {item.children?.length && active ? (
                            <div className="ml-6 mt-1 space-y-1 border-l-2 border-[var(--border)] pl-3">
                              {item.children.map((child) => {
                                const childActive = pathname === child.href;

                                return (
                                  <Link
                                    key={child.href}
                                    href={child.href}
                                    onClick={() => beginNavigation()}
                                    className={cn(
                                      "flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm no-underline transition",
                                      childActive
                                        ? "font-semibold text-[var(--primary-dark)]"
                                        : "text-[var(--ink-soft)] hover:text-[var(--ink)]",
                                    )}
                                  >
                                    <child.icon className="h-3.5 w-3.5" />
                                    {child.label}
                                  </Link>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </nav>

              {/* Mobile footer actions */}
              <div className="border-t border-[var(--border)] px-3 py-3">
                {availableRoles.length > 1 ? (
                  <div className="mb-3">
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                      Switch Role
                    </p>
                    <div className="grid gap-1.5">
                      {availableRoles.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setActiveRole(role)}
                          className={cn(
                            "rounded-[var(--radius-sm)] border px-3 py-2 text-left text-sm font-semibold transition",
                            role === activeRole
                              ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-dark)]"
                              : "border-[var(--border)] bg-white text-[var(--ink)] hover:bg-[var(--paper)]",
                          )}
                        >
                          {getRoleLabel(role)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => { setMobileNavOpen(false); openForgotModal(); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--ink)] hover:bg-[var(--paper)] transition"
                >
                  <LockKeyhole className="h-4 w-4 text-[var(--ink-soft)]" />
                  Forgot password
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold text-[var(--danger)]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ─── Forgot Password Modal (3-step, DB-verified) ── */}
      <Modal
        open={forgotModalOpen}
        onClose={closeForgotModal}
        title={
          resetStep === "username"
            ? "Forgot password"
            : resetStep === "password"
              ? "Set new password"
              : "Password updated"
        }
        description={
          resetStep === "username"
            ? "Enter your username to verify your account."
            : resetStep === "password"
              ? `Account verified: ${resetVerifiedName}`
              : undefined
        }
      >
        <div className="space-y-4">
          {resetStep === "username" ? (
            <>
              <label className="block text-sm font-semibold text-[var(--ink)]">
                Username
                <input
                  value={resetForm.username}
                  onChange={(event) =>
                    setResetForm((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                  className="stk-input mt-1.5 py-2.5"
                  placeholder="Enter username"
                  autoFocus
                />
              </label>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForgotModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onVerifyUsername}
                  disabled={submitting || !resetForm.username.trim()}
                  className="btn-action"
                >
                  {submitting ? "Checking..." : "Next →"}
                </button>
              </div>
            </>
          ) : resetStep === "password" ? (
            <>
              <div className="rounded-[var(--radius-md)] border border-[var(--success)]/30 bg-[var(--success-soft)] p-3">
                <p className="text-sm font-semibold text-[var(--success)]">
                  ✓ Account verified: {resetVerifiedName}
                </p>
              </div>
              <label className="block text-sm font-semibold text-[var(--ink)]">
                New password
                <input
                  type="password"
                  value={resetForm.nextPassword}
                  onChange={(event) =>
                    setResetForm((current) => ({
                      ...current,
                      nextPassword: event.target.value,
                    }))
                  }
                  className="stk-input mt-1.5 py-2.5"
                  placeholder="Min 6 characters"
                  autoFocus
                />
              </label>
              <label className="block text-sm font-semibold text-[var(--ink)]">
                Re-enter password
                <input
                  type="password"
                  value={resetForm.confirmPassword}
                  onChange={(event) =>
                    setResetForm((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                  className="stk-input mt-1.5 py-2.5"
                  placeholder="Confirm new password"
                />
              </label>
              <div className="flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setResetStep("username")}
                  className="btn-secondary"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={onResetPassword}
                  disabled={
                    submitting ||
                    !resetForm.nextPassword.trim() ||
                    !resetForm.confirmPassword.trim()
                  }
                  className="btn-action"
                >
                  {submitting ? "Saving..." : "Change Password"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-[var(--radius-lg)] border border-[var(--success)]/30 bg-[var(--success-soft)] p-6 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success)]/10">
                  <svg className="h-7 w-7 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-[var(--success)]">Password Updated!</h4>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  Your password has been updated successfully.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForgotModal}
                className="btn-action w-full py-2.5"
              >
                Done
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
