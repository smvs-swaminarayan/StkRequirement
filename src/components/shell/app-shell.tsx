"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  ChevronDown,
  ChevronRight,
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
  Package,
  Tags,
  BarChart3,
  FileSpreadsheet,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/components/providers/auth-provider";
import { useAppLoading } from "@/components/providers/loading-provider";
import { getFirebaseErrorMessage } from "@/lib/firebase/error-message";
import { getRoleLabel } from "@/lib/permissions";
import type { Role } from "@/lib/firebase/types";
import { cn } from "@/lib/utils";

type NavSubItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavItem = {
  href: string;
  label: string;
  badgeColor?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavSubItem[];
};

function buildNavSections(activeRole: Role | null): NavItem[] {
  if (activeRole === "SUPER_ADMIN") {
    return [
      {
        href: "/dashboard",
        label: "Dashboard",
        badgeColor: "bg-blue-600",
        icon: LayoutDashboard,
      },
      {
        href: "/orders",
        label: "Orders Management",
        badgeColor: "bg-rose-500",
        icon: ClipboardList,
      },
      {
        href: "/masters",
        label: "Masters & Stock",
        badgeColor: "bg-emerald-600",
        icon: Boxes,
        children: [
          { href: "/masters", label: "Items Master", icon: Package },
          { href: "/masters", label: "Categories Master", icon: Tags },
          { href: "/masters", label: "Stock Entries", icon: BarChart3 },
        ],
      },
      {
        href: "/requests",
        label: "Special Requests",
        badgeColor: "bg-amber-500",
        icon: MessageSquare,
      },
      {
        href: "/team",
        label: "Users Manage",
        badgeColor: "bg-orange-500",
        icon: Users,
      },
      {
        href: "/reports",
        label: "Reports Admin",
        badgeColor: "bg-purple-600",
        icon: Shield,
        children: [
          { href: "/reports", label: "Order Report", icon: FileSpreadsheet },
          { href: "/reports", label: "Stock Master Report", icon: BarChart3 },
          { href: "/reports", label: "Item Usage Report", icon: TrendingUp },
          { href: "/reports", label: "Memberwise Report", icon: UserCheck },
        ],
      },
    ];
  }

  if (activeRole === "LEADER") {
    return [
      {
        href: "/dashboard",
        label: "Dashboard",
        badgeColor: "bg-blue-600",
        icon: LayoutDashboard,
      },
      {
        href: "/orders",
        label: "Orders Management",
        badgeColor: "bg-rose-500",
        icon: ClipboardList,
      },
      {
        href: "/masters",
        label: "Items & Stock",
        badgeColor: "bg-emerald-600",
        icon: Boxes,
        children: [
          { href: "/masters", label: "Items Master", icon: Package },
          { href: "/masters", label: "Stock Entries", icon: BarChart3 },
        ],
      },
      {
        href: "/requests",
        label: "Special Requests",
        badgeColor: "bg-amber-500",
        icon: MessageSquare,
      },
      {
        href: "/reports",
        label: "Reports Leader",
        badgeColor: "bg-purple-600",
        icon: Shield,
        children: [
          { href: "/reports", label: "Assigned Order Report", icon: FileSpreadsheet },
          { href: "/reports", label: "Assigned Stock Report", icon: BarChart3 },
          { href: "/reports", label: "Item Usage Report", icon: TrendingUp },
        ],
      },
    ];
  }

  return [
    {
      href: "/dashboard",
      label: "Dashboard",
      badgeColor: "bg-blue-600",
      icon: LayoutDashboard,
    },
    {
      href: "/orders/history",
      label: "My Orders",
      badgeColor: "bg-rose-500",
      icon: History,
    },
    {
      href: "/reports",
      label: "My Reports",
      badgeColor: "bg-purple-600",
      icon: Shield,
      children: [
        { href: "/reports", label: "My Order Report", icon: FileSpreadsheet },
        { href: "/reports", label: "My Requested Items", icon: TrendingUp },
      ],
    },
  ];
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
    forgotPassword,
    setActiveRole,
    signOutCurrentUser,
    workspaceProfile,
  } = useAuth();
  const { beginNavigation } = useAppLoading();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "/masters": true,
    "/reports": true,
  });
  const [optimisticRole, setOptimisticRole] = useState<Role | null>(activeRole);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<"username" | "password" | "done">("username");
  const [resetForm, setResetForm] = useState({
    username: profile?.username ?? "",
    nextPassword: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setOptimisticRole(activeRole);
  }, [activeRole]);

  const navItems = useMemo(() => buildNavSections(optimisticRole), [optimisticRole]);

  const filteredNavItems = useMemo(() => {
    if (!menuSearch.trim()) return navItems;
    const q = menuSearch.toLowerCase().trim();
    return navItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.children?.some((c) => c.label.toLowerCase().includes(q)),
    );
  }, [navItems, menuSearch]);

  const toggleSection = (href: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setExpandedSections((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  const onSignOut = () => {
    signOutCurrentUser();
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetForm.username.trim()) {
      toast.error("Username is required.");
      return;
    }
    if (resetForm.nextPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
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
      toast.success("Password updated successfully!");
    } catch (err) {
      toast.error(getFirebaseErrorMessage(err, "Unable to reset password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f6f9] text-[#1e293b]">
      {/* ─── Top Header Bar ────────────────────────────── */}
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#2d3748] bg-[#1e222d] px-3 shadow-md lg:px-4">
        {/* Left: Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/10 lg:hidden transition"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white lg:flex transition"
            title="Toggle Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo & Clean Portal Title (Without SMVS Global System text) */}
          <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-xs font-black text-white shadow-sm">
              STK
            </div>
            <span className="text-base font-extrabold tracking-tight text-white leading-tight">
              STK Requirement
            </span>
          </Link>
        </div>

        {/* Center: Active Role Badge */}
        <div className="hidden items-center gap-2 md:flex">
          <span className="rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-300">
            {getRoleLabel(optimisticRole ?? workspaceProfile)}
          </span>
        </div>

        {/* Right: User Avatar Circle with Pure Hover Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative group/user py-1">
            <div
              className="flex items-center justify-center rounded-full cursor-pointer transition hover:scale-105"
              title={`${profile?.displayName || "Account"} (${getRoleLabel(optimisticRole ?? workspaceProfile)})`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-black text-[#0f172a] shadow-md ring-2 ring-white/40 group-hover/user:ring-amber-400 transition">
                {(profile?.displayName || profile?.username || "U").trim().charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full z-50 w-72 rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl transition-all duration-200 hidden group-hover/user:block">
              {/* Account summary */}
              <div className="border-b border-gray-100 px-3 py-2.5">
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {profile?.displayName}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  @{profile?.username} · <span className="font-semibold text-amber-600">{getRoleLabel(optimisticRole ?? workspaceProfile)}</span>
                </p>
              </div>

              {/* Role switcher */}
              {availableRoles.length > 1 ? (
                <div className="border-b border-gray-100 px-3 py-2">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Switch Role
                  </p>
                  <div className="grid gap-1">
                    {availableRoles.map((role) => {
                      const selected = role === optimisticRole;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            setOptimisticRole(role);
                            setActiveRole(role);
                            if (role === "USER" && pathname.startsWith("/orders")) {
                              beginNavigation();
                              router.push("/orders", { scroll: false });
                            }
                          }}
                          className={cn(
                            "rounded-lg px-2.5 py-1.5 text-left text-xs font-bold transition",
                            selected
                              ? "bg-amber-500 text-white shadow-sm"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100",
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
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setResetForm({
                      username: profile?.username ?? "",
                      nextPassword: "",
                      confirmPassword: "",
                    });
                    setResetStep("username");
                    setForgotModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
                >
                  <LockKeyhole className="h-4 w-4 text-gray-400" />
                  Forgot Password
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Portal Layout (Left Sidebar + Content Workspace) ─────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Left Sidebar (Hierarchy Accordion Style) */}
        <aside
          className={cn(
            "hidden flex-col border-r border-[#e2e8f0] bg-white transition-all duration-300 lg:flex",
            sidebarCollapsed ? "w-16" : "w-64",
          )}
        >
          {/* Menu Search Box (when expanded) */}
          {!sidebarCollapsed ? (
            <div className="p-3 border-b border-gray-100">
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 h-3.5 w-3.5 text-gray-400" />
                <input
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder="Search menu..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-2.5 text-xs text-gray-900 outline-none transition focus:border-amber-500 focus:bg-white"
                />
                {menuSearch ? (
                  <button
                    type="button"
                    onClick={() => setMenuSearch("")}
                    className="absolute right-2 text-xs text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Navigation Items List with Nested Hierarchy Submenus */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredNavItems.map((item) => {
              const hasChildren = Boolean(item.children?.length);
              const isExpanded = Boolean(expandedSections[item.href] || menuSearch.trim());
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <div key={item.href} className="space-y-0.5">
                  {/* Parent Item */}
                  <div
                    onClick={() => {
                      if (hasChildren && !sidebarCollapsed) {
                        toggleSection(item.href);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-bold transition cursor-pointer select-none",
                      active
                        ? "bg-amber-50/80 text-amber-900 font-extrabold shadow-2xs border border-amber-200/80"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    <Link
                      href={item.href}
                      onClick={() => beginNavigation()}
                      title={sidebarCollapsed ? item.label : undefined}
                      className="flex flex-1 items-center gap-2.5 no-underline text-inherit"
                    >
                      {/* Color-Coded Icon Badge */}
                      <div
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs",
                          item.badgeColor || "bg-blue-600",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      {!sidebarCollapsed ? (
                        <span className="flex-1 truncate">{item.label}</span>
                      ) : null}
                    </Link>

                    {/* Expand/Collapse Chevron for parents with children */}
                    {hasChildren && !sidebarCollapsed ? (
                      <button
                        type="button"
                        onClick={(e) => toggleSection(item.href, e)}
                        className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition"
                      >
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 transition-transform duration-200",
                            isExpanded ? "rotate-0 text-amber-600" : "-rotate-90 text-gray-400",
                          )}
                        />
                      </button>
                    ) : null}
                  </div>

                  {/* Hierarchical Submenu Items (Hierarchy List) */}
                  {hasChildren && isExpanded && !sidebarCollapsed ? (
                    <div className="ml-5 pl-3 border-l-2 border-amber-200/70 space-y-0.5 py-0.5">
                      {item.children!.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={() => beginNavigation()}
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-semibold no-underline transition",
                              active
                                ? "text-amber-900 hover:bg-amber-100/50"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/70",
                            )}
                          >
                            <ChildIcon className="h-3.5 w-3.5 text-gray-400" />
                            <span className="truncate">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer Info */}
          {!sidebarCollapsed ? (
            <div className="border-t border-gray-100 p-3 text-[11px] font-semibold text-gray-400">
              <span>STK Requirement v2.0</span>
            </div>
          ) : null}
        </aside>

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {!hidePageHeader ? (
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-black text-gray-900 sm:text-2xl tracking-tight">
                  {title}
                </h1>
                <p className="text-xs text-gray-500">
                  Workspace · {getRoleLabel(optimisticRole ?? workspaceProfile)}
                </p>
              </div>
            </div>
          ) : null}

          {/* Page Body */}
          <div className="space-y-4">{children}</div>
        </main>
      </div>

      {/* ─── Mobile Sidebar Drawer ─────────────────────────────────── */}
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col">
            <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-[#1e222d] px-4 text-white">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-500 text-xs font-black">
                  STK
                </div>
                <span className="font-bold text-sm">STK Requirement</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 border-b border-gray-100">
              <input
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Search menu..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 px-3 text-xs text-gray-900 outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredNavItems.map((item) => {
                const hasChildren = Boolean(item.children?.length);
                const isExpanded = Boolean(expandedSections[item.href] || menuSearch.trim());
                const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <div key={item.href} className="space-y-0.5">
                    <div
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold no-underline transition",
                        active ? "bg-amber-50 text-amber-900 border border-amber-200" : "text-gray-600 hover:bg-gray-50",
                      )}
                    >
                      <Link
                        href={item.href}
                        onClick={() => {
                          beginNavigation();
                          setMobileNavOpen(false);
                        }}
                        className="flex flex-1 items-center gap-2.5 text-inherit no-underline"
                      >
                        <div
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs",
                            item.badgeColor || "bg-blue-600",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="flex-1">{item.label}</span>
                      </Link>

                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => toggleSection(item.href)}
                          className="p-1 text-gray-400"
                        >
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isExpanded ? "rotate-0 text-amber-600" : "-rotate-90",
                            )}
                          />
                        </button>
                      ) : null}
                    </div>

                    {hasChildren && isExpanded ? (
                      <div className="ml-6 pl-3 border-l-2 border-amber-200 space-y-0.5 py-0.5">
                        {item.children!.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.label}
                              href={child.href}
                              onClick={() => {
                                beginNavigation();
                                setMobileNavOpen(false);
                              }}
                              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 no-underline"
                            >
                              <ChildIcon className="h-3.5 w-3.5 text-gray-400" />
                              <span>{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* Forgot Password Modal */}
      <Modal
        open={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Password"
      >
        <form onSubmit={handlePasswordReset} className="space-y-4 p-2">
          <div>
            <label className="block text-xs font-bold text-gray-700">Username</label>
            <input
              value={resetForm.username}
              onChange={(e) => setResetForm({ ...resetForm, username: e.target.value })}
              placeholder="Enter username"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700">New Password (min 6 chars)</label>
            <input
              type="password"
              value={resetForm.nextPassword}
              onChange={(e) => setResetForm({ ...resetForm, nextPassword: e.target.value })}
              placeholder="Enter new password"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700">Confirm New Password</label>
            <input
              type="password"
              value={resetForm.confirmPassword}
              onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs outline-none focus:border-amber-500"
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
