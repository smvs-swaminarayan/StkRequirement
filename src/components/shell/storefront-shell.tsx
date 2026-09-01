"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ClipboardList,
  History,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  Search,
  Shield,
  ShoppingCart,
  User,
  X,
  Boxes,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/components/providers/auth-provider";
import { useAppLoading } from "@/components/providers/loading-provider";
import { useCart } from "@/components/providers/cart-provider";
import { getFirebaseErrorMessage } from "@/lib/firebase/error-message";
import { getPrimaryRole, getRoleLabel } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/firebase/types";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
};

const publicNav: NavItem[] = [];

/** Storefront nav follows the active workspace role (not primary), so post-login “shop as USER” shows the member nav. */
function getAuthenticatedNav(role: Role | null): NavItem[] {
  if (role === "SUPER_ADMIN") {
    return [
      { href: "/", label: "Shop", icon: Boxes },
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, requiresAuth: true },
      { href: "/orders", label: "Orders", icon: ClipboardList, requiresAuth: true },
      { href: "/masters", label: "Masters", icon: Boxes, requiresAuth: true },
      { href: "/team", label: "Users", icon: Users, requiresAuth: true },
      { href: "/reports", label: "Reports", icon: Shield, requiresAuth: true },
    ];
  }
  if (role === "LEADER") {
    return [
      { href: "/", label: "Shop", icon: Boxes },
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, requiresAuth: true },
      { href: "/orders", label: "Orders", icon: ClipboardList, requiresAuth: true },
      { href: "/masters", label: "Items & Stock", icon: Boxes, requiresAuth: true },
      { href: "/reports", label: "Reports", icon: Shield, requiresAuth: true },
    ];
  }
  return [
    { href: "/", label: "Shop", icon: Boxes },
    { href: "/orders/history", label: "My Orders", icon: History, requiresAuth: true },
    { href: "/reports", label: "My Reports", icon: Shield, requiresAuth: true },
  ];
}

export function StorefrontShell({
  children,
  search,
  onSearchChange,
  searchSuggestions,
  onSuggestionClick,
}: {
  children: React.ReactNode;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchSuggestions?: Array<{ id: string; name: string; categoryName: string; unit: string }>;
  onSuggestionClick?: (item: { id: string; name: string; categoryName: string; categoryId: string }) => void;
}) {
  const {
    firebaseUser,
    activeRole,
    availableRoles,
    profile,
    workspaceProfile,
    verifyUsername,
    forgotPassword,
    setActiveRole,
    signOutCurrentUser,
    loading: authLoading,
  } = useAuth();
  const { cart } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { beginNavigation, start, stop } = useAppLoading();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [optimisticRole, setOptimisticRole] = useState<Role | null>(activeRole);
  const [searchOpen, setSearchOpen] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<"username" | "password" | "done">("username");
  const [resetForm, setResetForm] = useState({
    username: "",
    nextPassword: "",
    confirmPassword: "",
  });
  const [resetVerifiedName, setResetVerifiedName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setOptimisticRole(activeRole);
  }, [activeRole]);

  const isAuthenticated = !authLoading && !!firebaseUser && !!profile;
  const navRole =
    isAuthenticated ? ((activeRole ?? getPrimaryRole(profile)) as Role | null) : null;
  const navItems = isAuthenticated ? getAuthenticatedNav(navRole) : publicNav;
  const cartCount = cart.reduce((sum, line) => sum + line.qty, 0);
  const signInHref =
    cartCount > 0 ? `/login?next=${encodeURIComponent("/orders/cart")}` : "/login";

  useEffect(() => {
    setMobileNavOpen(false);
    setAccountMenuOpen(false);
  }, [pathname]);

  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      beginNavigation();
      router.push(`/login?next=${encodeURIComponent(item.href)}`);
    }
  };

  const onSignOut = () => {
    signOutCurrentUser();
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
    setResetForm({ username: profile?.username ?? "", nextPassword: "", confirmPassword: "" });
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
      <header className="stk-header sticky top-0 z-30 shadow-sm border-b border-white/10">
        {/* Primary header */}
        <div className="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-x-1.5 gap-y-2 px-2 py-2 sm:flex-nowrap sm:gap-3 sm:px-4">
          
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-1.5 text-white hover:bg-white/10 lg:hidden transition active:scale-95"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2 no-underline transition hover:opacity-90">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-xs font-extrabold text-white shadow-lg shadow-amber-500/20">
                STK
              </div>
              <span className="hidden text-lg font-bold tracking-tight text-white sm:block">
                STK Requirement
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          {onSearchChange ? (
            <div className="order-3 relative w-full sm:order-none sm:mx-2 sm:flex sm:flex-1 sm:items-center lg:mx-8 group">
              <div className="flex w-full items-center overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 focus-within:border-[var(--primary)] focus-within:bg-white focus-within:shadow-[var(--shadow-glow)]">
                <div className="hidden bg-black/20 px-3 py-1.5 text-xs font-bold text-white md:block border-r border-white/10 group-focus-within:bg-[var(--paper)] group-focus-within:text-[var(--ink)] group-focus-within:border-[var(--border)]">
                  All
                </div>
                <Search className="ml-2.5 h-4 w-4 shrink-0 text-white/50 group-focus-within:text-[var(--primary)]" />
                <input
                  value={search ?? ""}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => {
                    window.setTimeout(() => setSearchOpen(false), 150);
                  }}
                  placeholder="Search STK Requirement items..."
                  className="min-w-0 flex-1 bg-transparent px-2.5 py-1.5 text-sm text-white outline-none placeholder:text-white/40 group-focus-within:text-[var(--ink)]"
                />
                <button
                  type="button"
                  className="bg-transparent px-3 py-1.5 text-sm font-bold text-white hover:bg-white/10 transition group-focus-within:bg-[var(--primary)] group-focus-within:text-[var(--header-bg)]"
                  onClick={() => setSearchOpen(false)}
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
              {/* Search suggestions dropdown */}
              {searchOpen && searchSuggestions && searchSuggestions.length > 0 ? (
                <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
                  {searchSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={() => {
                        if (onSuggestionClick) {
                          onSuggestionClick(item as typeof item & { categoryId: string });
                        }
                        setSearchOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-2.5 text-left last:border-b-0 hover:bg-[var(--paper)] transition"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-[var(--ink)]">{item.name}</span>
                        <span className="mt-0.5 block text-xs text-[var(--ink-soft)]">in {item.categoryName}</span>
                      </span>
                      <span className="text-xs font-bold text-[var(--primary-dark)]">Unit: {item.unit}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="hidden sm:block sm:flex-1" />
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Cart button */}
            <Link
              href={isAuthenticated ? "/orders/cart" : "/cart"}
              onClick={() => beginNavigation()}
              className="relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-white no-underline transition hover:bg-white/10"
            >
              <ShoppingCart className="h-4 w-4 text-[var(--primary)]" />
              <span className="hidden sm:inline">Cart</span>
              {mounted && cartCount > 0 ? (
                <span suppressHydrationWarning className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-bold text-[var(--header-bg)]">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </Link>

            {/* Auth section */}
            {isAuthenticated ? (
              /* Account dropdown with hover support */
              <div className="relative group/user py-1">
                <div
                  className="flex items-center justify-center rounded-full cursor-pointer transition hover:scale-105"
                  title={`${profile?.displayName || "Account"} (${getRoleLabel(optimisticRole ?? workspaceProfile)})`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-black text-[#09090b] shadow-md ring-2 ring-white/40 group-hover/user:ring-[var(--primary)] transition">
                    {(profile?.displayName || profile?.username || "U").trim().charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Dropdown menu: Opens smoothly ONLY on hover */}
                <div className="absolute right-0 top-full z-50 w-72 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white/98 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-200 hidden group-hover/user:block">
                      {/* Account info */}
                      <div className="border-b border-[var(--border)] px-4 py-3">
                        <p className="text-sm font-bold text-[var(--ink)]">
                          {profile?.displayName}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                          @{profile?.username} · {getRoleLabel(optimisticRole ?? workspaceProfile)}
                        </p>
                      </div>

                      {/* Quick links */}
                      <div className="border-b border-[var(--border)] py-1.5">
                        <Link
                          href="/dashboard"
                          onClick={() => {
                            beginNavigation();
                            setAccountMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[var(--ink)] no-underline hover:bg-[var(--paper)] transition"
                        >
                          <LayoutDashboard className="h-4 w-4 text-[var(--ink-soft)]" />
                          Dashboard
                        </Link>
                        <Link
                          href="/orders/history"
                          onClick={() => {
                            beginNavigation();
                            setAccountMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[var(--ink)] no-underline hover:bg-[var(--paper)] transition"
                        >
                          <History className="h-4 w-4 text-[var(--ink-soft)]" />
                          My Orders
                        </Link>
                        <Link
                          href="/reports"
                          onClick={() => {
                            beginNavigation();
                            setAccountMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[var(--ink)] no-underline hover:bg-[var(--paper)] transition"
                        >
                          <Shield className="h-4 w-4 text-[var(--ink-soft)]" />
                          Reports
                        </Link>
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
              </div>
            ) : (
              /* Login/Sign up buttons for anonymous users */
              <Link
                href={signInHref}
                onClick={() => beginNavigation()}
                className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white no-underline transition hover:bg-white/20"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* ─── Secondary Nav Bar ───────────────────────── */}
        <nav className="stk-header-sub hidden lg:block">
          <div className="mx-auto flex max-w-[1480px] items-center gap-1 px-4">
            {navItems.map((item) => {
              const isShop = item.href === "/";
              const active = isShop
                ? pathname === "/"
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href + item.label}
                  href={item.requiresAuth && !isAuthenticated ? `/login?next=${encodeURIComponent(item.href)}` : item.href}
                  onClick={(e) => handleNavClick(item, e)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-t-[var(--radius-sm)] px-3 py-2 text-sm font-semibold no-underline transition",
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/75 hover:text-white",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* ─── Page Content ──────────────────────────────── */}
      <div className="mx-auto max-w-[1480px] px-3 py-4 sm:px-4">
        <div className="space-y-4">{children}</div>
      </div>

      {/* ─── Mobile Navigation Drawer ──────────────────── */}
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-full max-w-[320px] animate-slide-right">
            <div className="hide-scrollbar flex h-full flex-col overflow-auto bg-white/95 backdrop-blur-xl shadow-2xl">
              {/* Mobile header */}
              <div className="stk-header flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-sm font-extrabold text-white shadow-md">
                    STK
                  </div>
                  <span className="text-lg font-bold tracking-tight text-white">STK Requirement</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-full p-2 text-white hover:bg-white/20 transition active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile account */}
              <div className="border-b border-[var(--border)] bg-[var(--paper)] px-4 py-3">
                {isAuthenticated ? (
                  <>
                    <p className="text-sm font-bold text-[var(--ink)]">{profile?.displayName}</p>
                    <p className="text-xs text-[var(--ink-soft)]">
                      @{profile?.username} · {getRoleLabel(optimisticRole ?? workspaceProfile)}
                    </p>
                  </>
                ) : (
                  <Link
                    href={signInHref}
                    onClick={() => {
                      beginNavigation();
                      setMobileNavOpen(false);
                    }}
                    className="btn-action inline-flex items-center gap-2 no-underline text-sm"
                  >
                    <User className="h-4 w-4" />
                    Sign In
                  </Link>
                )}
              </div>

              {/* Mobile nav */}
              <nav className="flex-1 px-2 py-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.requiresAuth && !isAuthenticated ? `/login?next=${encodeURIComponent(item.href)}` : item.href}
                    onClick={(e) => {
                      handleNavClick(item, e);
                      if (!e.defaultPrevented) beginNavigation();
                      setMobileNavOpen(false);
                    }}
                    className="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-semibold text-[var(--ink)] no-underline transition hover:bg-[var(--paper)]"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.requiresAuth && !isAuthenticated ? (
                      <span className="ml-auto text-[10px] font-bold uppercase text-[var(--ink-light)]">Login</span>
                    ) : null}
                  </Link>
                ))}
              </nav>

              {/* Mobile footer actions */}
              {isAuthenticated ? (
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
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* ─── Forgot Password Modal ──────────────────────── */}
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
                  onChange={(e) => setResetForm((c) => ({ ...c, username: e.target.value }))}
                  className="stk-input mt-1.5 py-2.5"
                  placeholder="Enter username"
                  autoFocus
                />
              </label>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeForgotModal} className="btn-secondary">Cancel</button>
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
                  onChange={(e) => setResetForm((c) => ({ ...c, nextPassword: e.target.value }))}
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
                  onChange={(e) => setResetForm((c) => ({ ...c, confirmPassword: e.target.value }))}
                  className="stk-input mt-1.5 py-2.5"
                  placeholder="Confirm new password"
                />
              </label>
              <div className="flex justify-between gap-3">
                <button type="button" onClick={() => setResetStep("username")} className="btn-secondary">← Back</button>
                <button
                  type="button"
                  onClick={onResetPassword}
                  disabled={submitting || !resetForm.nextPassword.trim() || !resetForm.confirmPassword.trim()}
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
              <button type="button" onClick={closeForgotModal} className="btn-action w-full py-2.5">
                Done
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
