"use client";

import { useDeferredValue, useState, useMemo } from "react";
import { PencilLine, Trash2 } from "lucide-react";
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
import type { Role } from "@/lib/firebase/types";
import { normalizeUsername } from "@/lib/utils";

const roleOptions: Array<{ value: Role; label: string }> = [
  { value: "SUPER_ADMIN", label: "STK Department" },
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
  const { loading, categories, users } = useWorkspaceData();
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [form, setForm] = useState(createEmptyForm);
  const [userPage, setUserPage] = useState(1);
  const filteredUsers = users.filter((user) => {
    const haystack = `${user.displayName} ${user.username} ${getAvailableRoles(user).join(" ")}`.toLowerCase();
    return deferredSearch ? haystack.includes(deferredSearch.trim().toLowerCase()) : true;
  });
  const USERS_PER_PAGE = 10;
  const paginatedUsers = filteredUsers.slice((userPage - 1) * USERS_PER_PAGE, userPage * USERS_PER_PAGE);
  const totalUserPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;
  const leaderSelected = form.roles.includes("LEADER");
  const roleSelectOptions = roleOptions.map((role) => ({
    value: role.value,
    label: role.label,
  }));
  const selectedRoleOptions = roleOptions.filter((role) => form.roles.includes(role.value));
  const selectedPrimaryRoleOptions = roleOptions.filter((role) => form.roles.includes(role.value));
  const selectedCategoryOptions = categories
    .filter((category) => form.categoryIds.map(String).includes(String(category.id)))
    .map((category) => ({
      value: String(category.id),
      label: category.name,
    }));

  const defaultLeaderCategoryOptions = useMemo(() => {
    return [
      { value: "", label: "Select default category" },
      ...selectedCategoryOptions
    ];
  }, [selectedCategoryOptions]);

  if (!canManageTeam(baseProfile)) {
    return (
      <AppShell title="Team">
        <Panel className="p-8">
          <EmptyState title="Restricted" description="Not allowed." />
        </Panel>
      </AppShell>
    );
  }

  const resetForm = () => {
    setEditingUserId(null);
    setForm(createEmptyForm());
  };

  const setRoles = (nextValues: string[]) => {
    setForm((current) => {
      const roles = normalizeRoles(nextValues);
      const primaryRole = roles.includes(current.primaryRole) ? current.primaryRole : roles[0];
      const defaultLeaderCategoryId = roles.includes("LEADER")
        ? current.categoryIds.length === 1
          ? current.categoryIds[0]
          : current.categoryIds.includes(current.defaultLeaderCategoryId)
            ? current.defaultLeaderCategoryId
            : ""
        : "";

      return {
        ...current,
        roles,
        primaryRole,
        defaultLeaderCategoryId,
      };
    });
  };

  const setCategories = (nextValues: string[]) => {
    setForm((current) => {
      const categoryIds = categories
        .filter((category) => nextValues.includes(String(category.id)))
        .map((category) => String(category.id));
      const defaultLeaderCategoryId = current.roles.includes("LEADER")
        ? categoryIds.length === 1
          ? categoryIds[0]
          : categoryIds.includes(current.defaultLeaderCategoryId)
            ? current.defaultLeaderCategoryId
            : ""
        : "";

      return {
        ...current,
        categoryIds,
        defaultLeaderCategoryId,
      };
    });
  };

  const submitUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const roles = normalizeRoles(form.roles);
      const primaryRole = roles.includes(form.primaryRole) ? form.primaryRole : roles[0];
      const defaultLeaderCategoryId = roles.includes("LEADER")
        ? form.categoryIds.length === 1
          ? form.categoryIds[0]
          : form.defaultLeaderCategoryId || null
        : null;

      if (roles.includes("LEADER") && !form.categoryIds.length) {
        throw new Error("Assign at least one category for Leader role.");
      }

      if (roles.includes("LEADER") && form.categoryIds.length > 1 && !defaultLeaderCategoryId) {
        throw new Error("Select a default leader category.");
      }

      if (!editingUserId) {
        const passLen = form.password.trim().length;
        if (passLen < 3 || passLen > 16) {
          throw new Error("Password must be between 3 and 16 characters.");
        }
      }

      if (editingUserId) {
        await updateUserAccount(
          editingUserId,
          {
            previousUsername: form.previousUsername,
            username: form.username,
            displayName: form.displayName,
            role: primaryRole,
            roles,
            primaryRole,
            categoryIds: form.categoryIds.map(Number),
            defaultLeaderCategoryId: defaultLeaderCategoryId ? String(defaultLeaderCategoryId) : null,
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
        
        toast.success("User updated.");
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
        toast.success("User created.");
      }

      resetForm();
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error, "Unable to save user."));
    } finally {
      setSubmitting(false);
    }
  };

  const deactivateUser = async (userId: number, username: string, displayName: string) => {
    if (!baseProfile) {
      return;
    }

    if (!confirm(`Deactivate @${username}? This user will not be able to sign in.`)) {
      return;
    }

    setSubmitting(true);
    try {
      await updateUserAccount(
        userId,
        {
          previousUsername: username,
          username,
          displayName,
          role: form.primaryRole,
          roles: getAvailableRoles(form.roles),
          primaryRole: form.primaryRole,
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

  return (
    <AppShell title="Team">
      {loading ? (
        <Panel className="p-8 text-sm text-[var(--ink-soft)]">Loading...</Panel>
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-[0.98fr_1.02fr]">
            {(() => {
              const userFormContent = (
                <form className="mt-4 space-y-3" onSubmit={submitUser}>
                <label className="block text-sm font-semibold text-[var(--ink)]">
                  Full name
                  <input
                    value={form.displayName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, displayName: event.target.value }))
                    }
                    className="mt-2 w-full rounded-[18px] border border-[var(--border)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--primary)]"
                    required
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm text-[var(--ink-soft)]">
                    Username
                    <input
                      value={form.username}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          username: normalizeUsername(event.target.value),
                        }))
                      }
                      className="mt-2 w-full rounded-[18px] border border-[var(--border)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--primary)]"
                      required
                    />
                  </label>

                  {!editingUserId && (
                    <label className="text-sm text-[var(--ink-soft)]">
                      Password
                      <input
                        type="password"
                        value={form.password}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, password: event.target.value }))
                        }
                        placeholder="Enter password (minimum 6 characters)"
                        className="stk-input mt-1.5"
                        required
                      />
                    </label>
                  )}
                </div>

                <SearchableMultiSelect
                  label="Roles"
                  options={roleSelectOptions}
                  selected={form.roles}
                  onChange={setRoles}
                  placeholder="Search role"
                  emptyLabel="No matching roles."
                />

                <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                        Selected roles
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedRoleOptions.map((role) => (
                          <span
                            key={role.value}
                            className="rounded-full bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--primary)]"
                          >
                            {role.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <label className="text-sm text-[var(--ink-soft)]">
                      Primary role
                      <select
                        value={form.primaryRole}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            primaryRole: event.target.value as Role,
                          }))
                        }
                        className="mt-2 w-full rounded-[18px] border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--primary)]"
                      >
                        {selectedPrimaryRoleOptions.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                <SearchableMultiSelect
                  label="Assigned categories"
                  options={categories.map((category) => ({
                    value: String(category.id),
                    label: category.name,
                  }))}
                  selected={form.categoryIds}
                  onChange={setCategories}
                  placeholder="Search category"
                  emptyLabel="No matching categories."
                />

                {leaderSelected ? (
                  <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--paper)] p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                      Leader control
                    </p>
                    {form.categoryIds.length > 1 ? (
                      <label className="mt-3 block text-sm font-semibold text-[var(--ink)]">
                        Default leader category
                        <SearchableSelect
                          className="mt-1.5"
                          value={String(form.defaultLeaderCategoryId)}
                          onChange={(val) =>
                            setForm((current) => ({
                              ...current,
                              defaultLeaderCategoryId: val,
                            }))
                          }
                          options={defaultLeaderCategoryOptions}
                          placeholder="Select default category"
                        />
                      </label>
                    ) : form.categoryIds.length === 1 ? (
                      <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
                        Default leader category will auto-lock to{" "}
                        <span className="font-semibold text-[var(--ink)]">
                          {selectedCategoryOptions[0]?.label}
                        </span>
                        .
                      </p>
                    ) : (
                      <p className="mt-4 text-sm leading-6 text-[var(--danger)]">
                        Leader role mate at least one category assign karo.
                      </p>
                    )}
                  </div>
                ) : null}

                {editingUserId ? (
                  <label className="inline-flex items-center gap-3 text-sm text-[var(--ink-soft)]">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          active: event.target.checked,
                        }))
                      }
                    />
                    Active
                  </label>
                ) : null}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-action"
                  >
                    {editingUserId ? "Update" : "Create"}
                  </button>
                  {editingUserId ? (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
                </form>
              );

              return (
                <>
                  <Panel className="p-4">
                    <p className="section-kicker">User Management</p>
                    <h3 className="mt-1 text-lg font-bold text-[var(--ink)]">
                      {editingUserId ? "Edit account" : "Create account"}
                    </h3>
                    
                    {!editingUserId ? userFormContent : (
                      <div className="mt-6 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] p-8 text-center bg-[var(--paper)]">
                        <p className="text-sm font-semibold text-[var(--ink)]">Editing account in popup</p>
                        <button type="button" onClick={resetForm} className="mt-3 btn-secondary">
                          Cancel edit and create new
                        </button>
                      </div>
                    )}
                  </Panel>

                  <Modal
                    open={!!editingUserId}
                    onClose={resetForm}
                    title="Edit account"
                    description="Update the details of this user account."
                  >
                    {editingUserId && userFormContent}
                  </Modal>
                </>
              );
            })()}

            <Panel className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h3 className="text-lg font-bold text-[var(--ink)]">
                  User list
                </h3>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search users..."
                  className="stk-input sm:w-[240px]"
                />
              </div>

              {filteredUsers.length ? (
                <>
                  <div className="hide-scrollbar mt-4 overflow-auto">
                  <table className="stk-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Roles</th>
                        <th>Categories</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((user) => {
                        const canEdit =
                          profile?.role === "SUPER_ADMIN" ||
                          hasRole(user, "USER") ||
                          user.uid === profile?.uid;
                        const assignedCategoryIds = getAssignedCategoryIds(user);
                        const visibleRoles = getAvailableRoles(user);

                        return (
                          <tr key={user.uid ?? user.id ?? user.username} className="border-b border-[var(--border)]/60 align-top">
                            <td className="py-3 pr-4 font-medium text-[var(--ink)]">
                              {user.displayName}
                            </td>
                            <td className="py-3 pr-4">@{user.username}</td>
                            <td className="py-3 pr-4">
                              <div className="flex min-w-[180px] flex-wrap gap-2">
                                {visibleRoles.map((role) => (
                                  <span
                                    key={`${user.uid ?? user.id ?? user.username}-${role}`}
                                    className="rounded-[var(--radius-sm)] bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-bold text-[var(--primary-dark)]"
                                  >
                                    {getRoleLabel(role)}
                                  </span>
                                ))}
                              </div>
                              <p className="mt-2 text-xs text-[var(--ink-soft)]">
                                Primary: {getRoleLabel(user.primaryRole ?? user.role)}
                              </p>
                            </td>
                            <td className="py-3 pr-4 text-[var(--ink-soft)]">
                              {assignedCategoryIds.length ? (
                                <>
                                  {assignedCategoryIds
                                    .map(
                                      (id) =>
                                        categories.find((category) => category.id === id)?.name ?? id,
                                    )
                                    .join(", ")}
                                  {user.defaultLeaderCategoryId ? (
                                    <p className="mt-2 text-xs">
                                      Default leader category:{" "}
                                      <span className="font-semibold text-[var(--ink)]">
                                        {categories.find(
                                          (category) => category.id === user.defaultLeaderCategoryId,
                                        )?.name ?? user.defaultLeaderCategoryId}
                                      </span>
                                    </p>
                                  ) : null}
                                </>
                              ) : hasRole(user, "SUPER_ADMIN") ? (
                                "System wide"
                              ) : (
                                "None assigned"
                              )}
                            </td>
                            <td className="py-3 pr-4">{user.active ? "Active" : "Inactive"}</td>
                            <td className="py-3">
                              {canEdit ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const roles = getAvailableRoles(user);
                                      const nextRoles: Role[] = roles.length ? roles : ["USER"];
                                      const targetId = Number(user.uid ?? user.id);

                                      setEditingUserId(targetId);
                                      setForm({
                                        username: user.username,
                                        displayName: user.displayName,
                                        password: "",
                                        roles: nextRoles,
                                        primaryRole: user.primaryRole ?? user.role,
                                        categoryIds: assignedCategoryIds.map(String),
                                        defaultLeaderCategoryId: user.defaultLeaderCategoryId ? String(user.defaultLeaderCategoryId) : "",
                                        active: user.active,
                                        previousUsername: user.username,
                                      });
                                    }}
                                    className="rounded-[var(--radius-sm)] border border-[var(--border)] p-1.5 text-[var(--ink-soft)] hover:bg-[var(--paper)] transition"
                                    title="Edit user"
                                  >
                                    <PencilLine className="h-4 w-4" />
                                  </button>
                                  {user.uid !== baseProfile?.uid ? (
                                    <button
                                      type="button"
                                      onClick={() => deactivateUser(user.id, user.username, user.displayName)}
                                      className="rounded-[var(--radius-sm)] border border-[var(--danger)] p-1.5 text-[var(--danger)] hover:bg-[var(--danger-soft)] transition"
                                      title="Deactivate user"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  ) : null}
                                </div>
                              ) : (
                                <span className="text-xs text-[var(--ink-soft)]">Restricted</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <Pagination
    currentPage={userPage}
    totalItems={filteredUsers.length}
    pageSize={USERS_PER_PAGE}
    onPageChange={setUserPage}
  />
              </>
              ) : (
                <div className="mt-6">
                  <EmptyState title="No users" description="No data." />
                </div>
              )}
            </Panel>
          </section>

        </>
      )}
    </AppShell>
  );
}
