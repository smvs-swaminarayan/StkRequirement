"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useFirestoreCollection } from "@/hooks/use-firestore-collection";
import {
  getAssignedCategoryIds,
  isLeader,
  isSuperAdmin,
  isUser,
  resolveAccessibleCategoryIds,
} from "@/lib/permissions";
import type {
  AppUserProfile,
  CategoryRecord,
  ItemRecord,
  OrderRecord,
  StockEntryRecord,
} from "@/lib/firebase/types";
import { where } from "firebase/firestore";

export function useWorkspaceData(options?: { fetchItems?: boolean, categoryId?: string }) {
  const { profile, workspaceProfile } = useAuth();
  const canReadTeamData = isSuperAdmin(profile);
  const canReadStockData = isSuperAdmin(workspaceProfile) || isLeader(workspaceProfile);
  const categoriesState = useFirestoreCollection<CategoryRecord>("categories");
  const itemsState = useFirestoreCollection<ItemRecord>("items", options?.categoryId && options.categoryId !== "ALL" ? [where("categoryId", "==", options.categoryId)] : undefined, { disabled: options?.fetchItems === false });
  const ordersState = useFirestoreCollection<OrderRecord>("orders");
  const stockState = useFirestoreCollection<StockEntryRecord>("stockEntries", undefined, {
    disabled: !canReadStockData,
  });
  const usersState = useFirestoreCollection<AppUserProfile>("users", undefined, {
    disabled: !canReadTeamData,
  });

  const categories = categoriesState.items
    .filter((category) => category.active !== false && !category.deletedAt)
    .sort((a, b) => {
      const categoryOrder = ["Stationary", "General Store Clothes", "Electric", "General Store Others"];
      const indexA = categoryOrder.indexOf(a.name);
      const indexB = categoryOrder.indexOf(b.name);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

  const accessibleCategoryIds = resolveAccessibleCategoryIds(workspaceProfile, categories);
  const activeCategoryIds = new Set(categories.map((c) => String(c.id)));

  const scopedCategories =
    isSuperAdmin(workspaceProfile)
      ? categories
      : categories.filter((category) => accessibleCategoryIds.includes(category.id));

  const scopedItems = itemsState.items
    .filter((item) => {
      if (item.deletedAt) return false;
      if (!activeCategoryIds.has(String(item.categoryId))) return false;
      if (item.active === false && !isSuperAdmin(workspaceProfile) && !isLeader(workspaceProfile)) {
        return false;
      }
      return true;
    })
    .filter((item) =>
      isSuperAdmin(workspaceProfile)
        ? true
        : accessibleCategoryIds.length
          ? accessibleCategoryIds.includes(item.categoryId)
          : false,
    )
    .sort((left, right) => left.name.localeCompare(right.name));

  const scopedOrders = ordersState.items.filter((order) => {
    if (!workspaceProfile) {
      return false;
    }

    if (isSuperAdmin(workspaceProfile)) {
      return true;
    }

    if (isUser(workspaceProfile)) {
      return order.requestedById === workspaceProfile.uid;
    }

    return accessibleCategoryIds.length
      ? accessibleCategoryIds.includes(order.categoryId)
      : false;
  });

  const scopedStockEntries = stockState.items.filter((entry) =>
    entry.active === false || entry.deletedAt
      ? false
      : isSuperAdmin(workspaceProfile)
      ? true
      : accessibleCategoryIds.length
        ? accessibleCategoryIds.includes(entry.categoryId)
        : false,
  );

  const scopedUsers = usersState.items.filter((user) => {
    if (!workspaceProfile) {
      return false;
    }

    if (user.active === false || user.deletedAt) {
      return false;
    }

    if (user.uid === workspaceProfile.uid) {
      return true;
    }

    if (isSuperAdmin(workspaceProfile)) {
      return true;
    }

    const userCategoryIds = getAssignedCategoryIds(user);
    return isUser(user) && userCategoryIds.some((id) => accessibleCategoryIds.includes(id));
  });

  return {
    profile: workspaceProfile,
    baseProfile: profile,
    accessibleCategoryIds,
    categories: scopedCategories,
    items: scopedItems,
    orders: scopedOrders,
    stockEntries: scopedStockEntries,
    users: scopedUsers,
    loading:
      categoriesState.loading ||
      itemsState.loading ||
      ordersState.loading ||
      stockState.loading ||
      usersState.loading,
  };
}
