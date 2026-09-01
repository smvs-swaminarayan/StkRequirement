"use client";

import { matchesSearch } from "@/lib/gujarati-search";

import { useState, useMemo } from "react";
import { Plus, PencilLine, Trash2, Tags, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/shell/app-shell";
import { Panel } from "@/components/ui/panel";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { useAuth } from "@/components/providers/auth-provider";
import { useWorkspaceData } from "@/hooks/use-workspace-data";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/firebase/firestore";
import { canManageCategory } from "@/lib/permissions";
import type { CategoryRecord } from "@/lib/firebase/types";

export function CategoriesMasterView() {
  const { workspaceProfile: profile } = useAuth();
  const { loading, categories } = useWorkspaceData({
    fetchItems: false,
    fetchOrders: false,
    fetchStockEntries: false,
    fetchUsers: false,
  });

  const [formModalOpen, setFormModalOpen] = useState(false);
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
    setFormModalOpen(false);
  };

  const openCreateModal = () => {
    resetCategoryForm();
    setFormModalOpen(true);
  };

  const handleEditCategory = (cat: CategoryRecord) => {
    setCategoryEditId(String(cat.id));
    setCategoryForm({
      name: cat.name,
      description: cat.description || "",
      active: cat.active !== false,
    });
    setFormModalOpen(true);
  };

  const submitCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    setSubmitting(true);
    try {
      if (categoryEditId) {
        await updateCategory(Number(categoryEditId), categoryForm, actor);
        toast.success("Category updated successfully.");
      } else {
        await createCategory(categoryForm, actor);
        toast.success("Category created successfully.");
      }
      resetCategoryForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save category.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = useMemo(() => {
    const q = search.trim();
    return categories.filter((c) =>
      matchesSearch(c.name, q) || matchesSearch(c.description, q)
    );
  }, [categories, search]);

  const paginatedCategories = useMemo(() => {
    return filteredCategories.slice((categoryPage - 1) * ITEMS_PER_PAGE, categoryPage * ITEMS_PER_PAGE);
  }, [filteredCategories, categoryPage]);

  const canManage = canManageCategory(profile);

  return (
    <AppShell title="Categories Master">
      <div className="space-y-4">
        {/* Top Header Controls Panel */}
        <Panel className="p-4 border border-gray-200 bg-white shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-2xs">
                <Tags className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900">Categories Master</h2>
                <p className="text-xs text-gray-500">Manage item classifications and categories</p>
              </div>
              <span className="ml-2 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                {filteredCategories.length} Categories
              </span>
            </div>

            {canManage && (
              <button
                type="button"
                onClick={openCreateModal}
                className="rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-black text-white shadow-sm transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" /> + Create New Category
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCategoryPage(1);
              }}
              placeholder="Search categories..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/80 pl-9 pr-3 py-2 text-xs outline-none focus:border-amber-500 focus:bg-white transition"
            />
          </div>
        </Panel>

        {/* Data Table */}
        <Panel className="p-0 border border-gray-200 bg-white shadow-xs overflow-hidden rounded-2xl">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500">Loading categories...</div>
          ) : filteredCategories.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-200 bg-gray-50/80 font-bold text-gray-700">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Category Name</th>
                    <th className="p-3.5">Description</th>
                    {canManage ? <th className="p-3.5 text-right">Actions</th> : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedCategories.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/70 transition">
                      <td className="p-3.5 font-bold text-gray-500">#{c.id}</td>
                      <td className="p-3.5 font-bold text-gray-900 text-sm">{c.name}</td>
                      <td className="p-3.5 text-gray-600">{c.description || "-"}</td>
                      {canManage ? (
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditCategory(c)}
                              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition cursor-pointer"
                              title="Edit Category"
                            >
                              <PencilLine className="h-4 w-4 text-amber-600" />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`Delete category ${c.name}?`)) {
                                  await deleteCategory(Number(c.id), actor);
                                  toast.success("Category deleted.");
                                }
                              }}
                              className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                              title="Delete Category"
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
          ) : (
            <div className="p-12 text-center text-xs text-gray-500 font-bold">No categories found.</div>
          )}

          {filteredCategories.length > ITEMS_PER_PAGE ? (
            <div className="p-4 border-t border-gray-100">
              <Pagination
                page={categoryPage}
                total={filteredCategories.length}
                pageSize={ITEMS_PER_PAGE}
                onChange={setCategoryPage}
              />
            </div>
          ) : null}
        </Panel>
      </div>

      {/* Category Create & Edit Modal Popup */}
      <Modal
        open={formModalOpen}
        onClose={resetCategoryForm}
        title={categoryEditId ? "✏️ Edit Category" : "✨ Create New Category"}
        description="Configure category name and description"
      >
        <form onSubmit={submitCategory} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700">Category Name *</label>
            <input
              value={categoryForm.name}
              onChange={(e) => setCategoryForm((c) => ({ ...c, name: e.target.value }))}
              required
              placeholder="e.g. Clothing, Electrical, Stationary..."
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700">Description</label>
            <textarea
              value={categoryForm.description}
              onChange={(e) => setCategoryForm((c) => ({ ...c, description: e.target.value }))}
              rows={3}
              placeholder="Optional description or details..."
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs outline-none focus:border-amber-500 focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={resetCategoryForm}
              className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-black text-white shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Saving..." : categoryEditId ? "Update Category" : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
