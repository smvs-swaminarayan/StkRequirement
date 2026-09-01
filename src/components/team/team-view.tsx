"use client";

import { matchesSearch } from "@/lib/gujarati-search";

import { useDeferredValue, useState, useMemo } from "react";
import { Plus, Search, UserCheck, Shield, Users, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { SearchableMultiSelect } from "@/components/ui/searchable-multi-select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useAuth } from "@/components/providers/auth-provider";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import { createUserAccount, updateUserAccount } from "@/lib/firebase/firestore";
import { getFirebaseErrorMessage } from "@/lib/firebase/error-message";
import {
  canManageTeam,
  getAssignedCategoryIds,
  getAvailableRoles,
  getRoleLabel,
  hasRole,
} from "@/lib/permissions";
import type { Role, AppUserProfile } from "@/lib/firebase/types";
import { normalizeUsername } from "@/lib/utils";

const roleOptions: Array<{ value: Role; label: string }> = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "LEADER", label: "Leader" },
  { value: "USER", label: "User" },
];

function createEmptyForm() {
  return {
    username: "",
    displayName: "",
    password: "",
    roles: ["USER"] as Role[],
    primaryRole: "USER" as Role,
    categoryIds: [] as string[],
    defaultLeaderCategoryId: "",
    active: true,
    previousUsername: "",
  };
}

function normalizeRoles(values: string[]) {
  const ordered = roleOptions
    .map((option) => option.value)
    .filter((role) => values.includes(role));

  return ordered.length ? ordered : (["USER"] as Role[]);
}

export function TeamView() {
  const { profile: baseProfile, workspaceProfile: profile } = useAuth();
  const { loading, categories, users } = useWorkspaceData({
    fetchItems: false,
    fetchOrders: false,
    fetchStockEntries: false,
  });

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [form, setForm] = useState(createEmptyForm);
  const [userPage, setUserPage] = useState(1);

  const filteredUsers = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return users.filter((user) => {
      const haystack = `${user.displayName} ${user.username} ${getAvailableRoles(user).join(" ")}`.toLowerCase();
      return q ? haystack.includes(q) : true;
    });
  }, [users, deferredSearch]);

  const USERS_PER_PAGE = 10;
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice((userPage - 1) * USERS_PER_PAGE, userPage * USERS_PER_PAGE);
  }, [filteredUsers, userPage]);

  const leaderSelected = form.roles.includes("LEADER");
  const roleSelectOptions = roleOptions.map((role) => ({
    value: role.value,
    label: role.label,
  }));

  const selectedRoleOptions = roleOptions.filter((role) => form.roles.includes(role.value));
  const selectedPrimaryRoleOptions = roleOptions.filter((role) => form.roles.includes(role.value));
  
  const selectedCategoryOptions = useMemo(() => {
    return categories
      .filter((category) => form.categoryIds.map(String).includes(String(category.id)))
      .map((category) => ({
        value: String(category.id),
        label: category.name,
      }));
  }, [categories, form.categoryIds]);

  const defaultLeaderCategoryOptions = useMemo(() => {
    return [
      { value: "", label: "Select default category" },
      ...selectedCategoryOptions
    ];
  }, [selectedCategoryOptions]);

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingUserId(null);
    setFormModalOpen(false);
  };

  const openCreateModal = () => {
    resetForm();
    setFormModalOpen(true);
  };

  const openEditModal = (user: AppUserProfile) => {
    const roles = getAvailableRoles(user);
    const primaryRole = user.primaryRole || user.role || "USER";
    const categoryIds = getAssignedCategoryIds(user).map(String);
    const defaultLeaderCategoryId = user.defaultLeaderCategoryId ? String(user.defaultLeaderCategoryId) : "";

    setEditingUserId(user.uid);
    setForm({
      username: user.username,
      displayName: user.displayName,
      password: "",
      roles: normalizeRoles(roles),
      primaryRole,
      categoryIds,
      defaultLeaderCategoryId,
      active: user.active !== false,
      previousUsername: user.username,
    });
    setFormModalOpen(true);
  };

  const setRoles = (values: string[]) => {
    const roles = normalizeRoles(values);
    setForm((current) => ({
      ...current,
      roles,
      primaryRole: roles.includes(current.primaryRole) ? current.primaryRole : roles[0] ?? "USER",
    }));
  };

  const setCategoryIds = (values: string[]) => {
    setForm((current) => ({
      ...current,
      categoryIds: values,
      defaultLeaderCategoryId: values.includes(current.defaultLeaderCategoryId)
        ? current.defaultLeaderCategoryId
        : "",
    }));
  };

  const submitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.displayName.trim()) {
      toast.error("Username and full name are required.");
      return;
    }

    if (!editingUserId && (!form.password || form.password.length < 6)) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    const roles = form.roles.length ? form.roles : (["USER"] as Role[]);
    const primaryRole = roles.includes(form.primaryRole) ? form.primaryRole : roles[0];
    const defaultLeaderCategoryId =
      roles.includes("LEADER") && form.defaultLeaderCategoryId
        ? form.defaultLeaderCategoryId
        : null;

    setSubmitting(true);
    try {
      if (editingUserId) {
        await updateUserAccount(
          editingUserId,
          {
            previousUsername: form.previousUsername,
            username: form.username,
            displayName: form.displayName,
            password: form.password || undefined,
            role: primaryRole,
            roles,
            primaryRole,
            categoryIds: form.categoryIds.map(Number),
            defaultLeaderCategoryId: defaultLeaderCategoryId ? Number(defaultLeaderCategoryId) : null,
            active: form.active,
          },
          {
            actorId: String(baseProfile?.uid ?? profile?.uid ?? ""),
            actorName: baseProfile?.displayName ?? profile?.displayName ?? "Unknown",
            actorRole: baseProfile?.role ?? profile?.role,
          },
        );

        if (form.previousUsername && form.previousUsername !== form.username) {
          await fetch("/api/admin/update-auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uid: editingUserId,
              username: form.username,
              previousUsername: form.previousUsername,
              callerUid: baseProfile?.uid ?? profile?.uid,
            }),
          });
        }

        toast.success("User updated successfully.");
      } else {
        await createUserAccount(
          {
            username: form.username,
            displayName: form.displayName,
            password: form.password,
            role: primaryRole,
            roles,
            primaryRole,
            categoryIds: form.categoryIds.map(Number),
            defaultLeaderCategoryId: defaultLeaderCategoryId ? Number(defaultLeaderCategoryId) : null,
          },
          {
            actor: {
              actorId: String(baseProfile?.uid ?? profile?.uid ?? ""),
              actorName: baseProfile?.displayName ?? profile?.displayName ?? "Unknown",
              actorRole: baseProfile?.role ?? profile?.role,
            },
          },
        );
        toast.success("User created successfully.");
      }

      resetForm();
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error, "Unable to save user."));
    } finally {
      setSubmitting(false);
    }
  };

  const deactivateUser = async (userId: number, username: string, displayName: string) => {
    if (!baseProfile) return;
    if (!confirm(`Deactivate @${username}? This user will not be able to sign in.`)) return;

    setSubmitting(true);
    try {
      await updateUserAccount(
        userId,
        {
          previousUsername: username,
          username,
          displayName,
          categoryIds: [],
          defaultLeaderCategoryId: null,
          active: false,
        },
        {
          actorId: String(baseProfile.uid),
          actorName: baseProfile.displayName,
          actorRole: baseProfile.role,
        },
      );
      toast.success("User deactivated.");
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error, "Unable to deactivate user."));
    } finally {
      setSubmitting(false);
    }
  };

  if (!canManageTeam(baseProfile)) {
    return (
      <AppShell title="Users Management">
        <Panel className="p-8">
          <EmptyState title="Restricted" description="You do not have permission to manage users." />
        </Panel>
      </AppShell>
    );
  }

  return (
    <AppShell title="Users Management">
      <div className="space-y-4">
        {/* Top Header Controls Panel */}
        <Panel className="p-4 border border-gray-200 bg-white shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-2xs">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900">Users Directory</h2>
                <p className="text-xs text-gray-500">Manage user accounts, roles and assigned categories</p>
              </div>
              <span className="ml-2 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-700 border border-orange-200">
                {filteredUsers.length} Users
              </span>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-black text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> + Add User
            </button>
          </div>

          {/* Search bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setUserPage(1);
              }}
              placeholder="Search users..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/80 pl-9 pr-3 py-2 text-xs outline-none focus:border-amber-500 focus:bg-white transition"
            />
          </div>
        </Panel>

        {/* Users Table Panel */}
        <Panel className="border border-gray-200 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400">Loading users...</div>
          ) : !paginatedUsers.length ? (
            <div className="p-8 text-center">
              <EmptyState title="No users found" description="Try adjusting your search query." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Roles</th>
                    <th className="px-4 py-3">Assigned Categories</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedUsers.map((user) => {
                    const userRoles = getAvailableRoles(user);
                    const assignedCatNames = categories
                      .filter((c) => getAssignedCategoryIds(user).map(String).includes(String(c.id)))
                      .map((c) => c.name);

                    return (
                      <tr key={user.uid} className="hover:bg-gray-50/60 transition group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-xs font-black text-white shadow-2xs">
                              {(user.displayName || user.username || "U").trim().charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 leading-tight flex items-center gap-1.5">
                                {user.displayName}
                                {user.uid === baseProfile?.uid ? (
                                  <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-black text-amber-800">
                                    You
                                  </span>
                                ) : null}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {userRoles.map((role) => (
                              <span
                                key={role}
                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                                  role === "SUPER_ADMIN"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : role === "LEADER"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-gray-100 text-gray-700 border-gray-200"
                                }`}
                              >
                                {getRoleLabel(role)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {assignedCatNames.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {assignedCatNames.map((name) => (
                                <span key={name} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-700 font-medium truncate">
                                  {name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">All / None</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              user.active !== false
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${user.active !== false ? "bg-emerald-500" : "bg-rose-500"}`} />
                            {user.active !== false ? "Active" : "Deactivated"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(user)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-700 transition cursor-pointer"
                              title="Edit user"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            {user.uid !== baseProfile?.uid && user.active !== false ? (
                              <button
                                type="button"
                                onClick={() => deactivateUser(user.uid, user.username, user.displayName)}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                                title="Deactivate user"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filteredUsers.length > USERS_PER_PAGE && (
            <div className="p-3 border-t border-gray-100">
              <Pagination
                currentPage={userPage}
                totalPages={Math.ceil(filteredUsers.length / USERS_PER_PAGE)}
                totalItems={filteredUsers.length}
                pageSize={USERS_PER_PAGE}
                onPageChange={setUserPage}
              />
            </div>
          )}
        </Panel>
      </div>

      {/* User Create / Edit Modal Popup */}
      <Modal
        open={formModalOpen}
        onClose={resetForm}
        title={editingUserId ? "Edit User Account" : "Create New User"}
        description={editingUserId ? `Update @${form.username}'s roles, permissions and details.` : "Add a new member to the STK Requirement platform."}
      >
        <form onSubmit={submitUser} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-gray-700">Full Name *</label>
              <input
                value={form.displayName}
                onChange={(e) => setForm((c) => ({ ...c, displayName: e.target.value }))}
                placeholder="e.g. Rahul Sharma"
                required
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700">Username *</label>
              <input
                value={form.username}
                onChange={(e) => setForm((c) => ({ ...c, username: normalizeUsername(e.target.value) }))}
                placeholder="e.g. rahul"
                required
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700">
              {editingUserId ? "New Password (leave blank to keep unchanged)" : "Password *"}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
              placeholder={editingUserId ? "Enter new password..." : "Minimum 6 characters"}
              required={!editingUserId}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Assigned Roles *</label>
            <SearchableMultiSelect
              label=""
              options={roleSelectOptions}
              selected={form.roles}
              onChange={setRoles}
              placeholder="Select roles..."
              emptyLabel="No matching roles."
            />
          </div>

          {leaderSelected && (
            <div className="space-y-3 rounded-2xl border border-blue-200 bg-blue-50/50 p-3.5">
              <label className="text-xs font-bold text-blue-950 block">
                Leader Category Permissions
              </label>
              <SearchableMultiSelect
                label="Accessible Categories"
                options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
                selected={form.categoryIds}
                onChange={setCategoryIds}
                placeholder="Select accessible categories..."
                emptyLabel="No matching categories."
              />

              {form.categoryIds.length > 1 && (
                <div>
                  <label className="text-[11px] font-bold text-blue-900 block mb-1">
                    Default Leader Category
                  </label>
                  <SearchableSelect
                    options={defaultLeaderCategoryOptions}
                    value={form.defaultLeaderCategoryId}
                    onChange={(val) => setForm((c) => ({ ...c, defaultLeaderCategoryId: val }))}
                    placeholder="Select default category"
                  />
                </div>
              )}
            </div>
          )}

          {editingUserId && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="userActive"
                checked={form.active}
                onChange={(e) => setForm((c) => ({ ...c, active: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="userActive" className="text-xs font-bold text-gray-700 cursor-pointer">
                Account Active (uncheck to deactivate user)
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Saving..." : editingUserId ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
