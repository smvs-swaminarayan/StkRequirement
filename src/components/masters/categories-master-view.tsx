"use client";

import { useState, useMemo } from "react";
import { PencilLine, Trash2, Tags } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { Pagination } from "@/components/ui/pagination";
import { useAuth } from "@/components/providers/auth-provider";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/firebase/firestore";
import { canManageCategory } from "@/lib/permissions";

export function CategoriesMasterView() {
  const { workspaceProfile: profile } = useAuth();
  const { loading, categories } = useWorkspaceData({
    fetchItems: false,
    fetchOrders: false,
    fetchStockEntries: false,
    fetchUsers: false,
  });
  const [categoryEditId, setCategoryEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", active: true });
  const [categoryPage, setCategoryPage] = useState(1);
  const [search, setSearch] = useState("");
  const ITEMS_PER_PAGE = 10;

  const actor = profile
    ? {
        actorId: profile.uid,
        actorName: profile.displayName,
        actorRole: profile.role,
      }
    : undefined;

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", description: "", active: true });
    setCategoryEditId(null);
  };

  const submitCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (categoryEditId) {
        await updateCategory(Number(categoryEditId), categoryForm, actor);
        toast.success("Category updated.");
      } else {
        await createCategory(categoryForm, actor);
        toast.success("Category created.");
      }
      resetCategoryForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save category.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((c) =>
      search ? c.name.toLowerCase().includes(search.toLowerCase()) || (c.description && c.description.toLowerCase().includes(search.toLowerCase())) : true
    );
  }, [categories, search]);

  const paginatedCategories = useMemo(() => {
    return filteredCategories.slice((categoryPage - 1) * ITEMS_PER_PAGE, categoryPage * ITEMS_PER_PAGE);
  }, [filteredCategories, categoryPage]);

  const canManage = canManageCategory(profile);

  return (
    <AppShell title="Categories Master">
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        {/* Form Panel */}
        {canManage ? (
          <Panel className="p-5 border border-gray-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                  <Tags className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-gray-900">
                  {categoryEditId ? "Edit Category" : "New Category"}
                </h2>
              </div>
              {categoryEditId ? (
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              ) : null}
            </div>

            <form onSubmit={submitCategory} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-700">Category Name *</label>
                <input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((c) => ({ ...c, name: e.target.value }))}
                  required
                  placeholder="e.g. Stationary"
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm((c) => ({ ...c, description: e.target.value }))}
                  rows={3}
                  placeholder="Optional description"
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-extrabold text-white hover:bg-amber-600 shadow-sm transition disabled:opacity-50"
              >
                {submitting ? "Saving..." : categoryEditId ? "Update Category" : "Create Category"}
              </button>
            </form>
          </Panel>
        ) : null}

        {/* Data Table Panel */}
        <Panel className="p-5 border border-gray-200 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900">Categories List</h2>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                {filteredCategories.length} Total
              </span>
            </div>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCategoryPage(1);
              }}
              placeholder="Search category..."
              className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs outline-none focus:border-amber-500"
            />
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-gray-500">Loading categories...</div>
          ) : filteredCategories.length ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-gray-200 bg-gray-50 font-bold text-gray-700">
                    <tr>
                      <th className="p-3">Sr No</th>
                      <th className="p-3">Category Name</th>
                      <th className="p-3">Description</th>
                      {canManage ? <th className="p-3 text-right">Actions</th> : null}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedCategories.map((category, index) => (
                      <tr key={category.id} className="hover:bg-gray-50/80 transition">
                        <td className="p-3 font-semibold text-gray-500">
                          {(categoryPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </td>
                        <td className="p-3 font-bold text-gray-900">{category.name}</td>
                        <td className="p-3 text-gray-600">{category.description || "-"}</td>
                        {canManage ? (
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setCategoryEditId(String(category.id));
                                  setCategoryForm({
                                    name: category.name,
                                    description: category.description || "",
                                    active: category.active !== false,
                                  });
                                }}
                                className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                title="Edit"
                              >
                                <PencilLine className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm(`Delete category ${category.name}? Associated items will also be hidden.`)) {
                                    await deleteCategory(Number(category.id), actor);
                                    toast.success("Category deleted.");
                                  }
                                }}
                                className="rounded p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={categoryPage}
                totalItems={filteredCategories.length}
                pageSize={ITEMS_PER_PAGE}
                onPageChange={setCategoryPage}
              />
            </div>
          ) : (
            <EmptyState title="No categories found" description="Create a category to get started." />
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
