import { syncPublicCatalog } from "./catalog-sync";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db, secondaryAuth } from "@/lib/firebase/client";
import { emitFirestoreRefresh } from "@/lib/firestore-refresh";
import type {
  AppUserProfile,
  CreateUserInput,
  ItemImageCrop,
  OrderStatus,
  Role,
  RequestType,
  RequestStatus,
  SpecialRequestRecord,
} from "@/lib/firebase/types";
import { authEmailFromUsername, normalizeUsername } from "@/lib/utils";

type ActorInfo = {
  actorId: string;
  actorName: string;
  actorRole?: Role | null;
};

function normalizeRoleFields(input: {
  role?: Role;
  roles?: Role[];
  primaryRole?: Role;
}) {
  const mergedRoles = Array.from(
    new Set(
      [input.primaryRole, input.role, ...(input.roles ?? [])].filter(Boolean) as Role[],
    ),
  );
  const primaryRole = input.primaryRole ?? input.role ?? mergedRoles[0] ?? "USER";
  const roles = mergedRoles.includes(primaryRole)
    ? mergedRoles
    : [primaryRole, ...mergedRoles];

  return {
    role: primaryRole,
    roles,
    primaryRole,
  };
}

function normalizeCategoryIds(categoryIds?: string[]) {
  return Array.from(new Set((categoryIds ?? []).filter(Boolean)));
}

function resolveLeaderDefaultCategoryId(
  roleFields: { roles: Role[] },
  assignedCategoryIds: string[],
  preferredDefaultCategoryId?: string | null,
) {
  if (!roleFields.roles.includes("LEADER")) {
    return null;
  }

  if (
    preferredDefaultCategoryId &&
    assignedCategoryIds.includes(preferredDefaultCategoryId)
  ) {
    return preferredDefaultCategoryId;
  }

  return assignedCategoryIds.length === 1 ? assignedCategoryIds[0] : null;
}

async function createAuditLog(
  values: {
    action: string;
    targetType: string;
    targetId: string;
    message: string;
  },
  actor?: ActorInfo,
) {
  if (!actor) {
    return;
  }

  try {
    await addDoc(collection(db, "auditLogs"), {
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole ?? null,
      action: values.action,
      targetType: values.targetType,
      targetId: values.targetId,
      message: values.message,
      createdAt: serverTimestamp(),
    });
  } catch {
    // Audit log failure should never block the primary operation
    console.warn(`Audit log write failed for ${values.action}:${values.targetId}`);
  }
}

async function getActiveSuperAdminIds() {
  const ids = new Set<string>();
  const snapshots = await getDocs(query(collection(db, "users"), where("active", "==", true)));

  for (const snapshot of snapshots.docs) {
    const user = snapshot.data() as AppUserProfile;
    const userRoles = normalizeRoleFields(user).roles;

    if (!user.deletedAt && userRoles.includes("SUPER_ADMIN")) {
      ids.add(snapshot.id);
    }
  }

  return ids;
}

async function ensureLastSuperAdminRemains(
  userId: number,
  nextRoles: Role[],
  nextActive: boolean,
) {
  const currentSnapshot = await getDoc(doc(db, "users", userId));

  if (!currentSnapshot.exists()) {
    return;
  }

  const currentProfile = currentSnapshot.data() as AppUserProfile;
  const currentRoles = normalizeRoleFields(currentProfile).roles;
  const currentlySuperAdmin =
    currentProfile.active !== false &&
    !currentProfile.deletedAt &&
    currentRoles.includes("SUPER_ADMIN");
  const willRemainSuperAdmin = nextActive && nextRoles.includes("SUPER_ADMIN");

  if (!currentlySuperAdmin || willRemainSuperAdmin) {
    return;
  }

  const activeSuperAdmins = await getActiveSuperAdminIds();

  if (activeSuperAdmins.size <= 1 && activeSuperAdmins.has(userId)) {
    throw new Error("At least one active Super Admin must remain.");
  }
}

export async function getBootstrapState() {
  const snapshot = await getDoc(doc(db, "meta", "bootstrap"));
  return snapshot.exists() && Boolean(snapshot.data().initialized);
}

export async function createUserAccount(
  input: CreateUserInput,
  options?: { markBootstrap?: boolean; actor?: ActorInfo },
) {
  const username = input.username.trim();
  const usernameLower = normalizeUsername(username);
  const authEmail = authEmailFromUsername(usernameLower);
  const existingUsername = await getDoc(doc(db, "usernames", usernameLower));

  if (existingUsername.exists()) {
    throw new Error("Username is already in use.");
  }

  const roleFields = normalizeRoleFields(input);
  const assignedCategoryIds = normalizeCategoryIds(
    input.assignedCategoryIds ?? input.categoryIds,
  );
  const defaultLeaderCategoryId = resolveLeaderDefaultCategoryId(
    roleFields,
    assignedCategoryIds,
    input.defaultLeaderCategoryId,
  );

  let uid: string;
  try {
    const created = await createUserWithEmailAndPassword(
      secondaryAuth,
      authEmail,
      input.password,
    );
    uid = created.user.uid;
    await signOut(secondaryAuth).catch(() => {});
  } catch (err: any) {
    console.warn("Secondary auth creation fallback to unique uid:", err?.message);
    uid = `u_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  const batch = writeBatch(db);

  batch.set(doc(db, "users", uid), {
    uid,
    username,
    usernameLower,
    password: input.password,
    displayName: input.displayName.trim(),
    role: roleFields.role,
    roles: roleFields.roles,
    primaryRole: roleFields.primaryRole,
    categoryIds: assignedCategoryIds,
    assignedCategoryIds,
    defaultLeaderCategoryId,
    active: true,
    deletedAt: null,
    deletedById: null,
    deletedByName: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });

  batch.set(doc(db, "usernames", usernameLower), {
    uid,
    username,
    usernameLower,
    displayName: input.displayName.trim(),
    role: roleFields.role,
    roles: roleFields.roles,
    primaryRole: roleFields.primaryRole,
    active: true,
    deletedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (options?.markBootstrap) {
    batch.set(
      doc(db, "meta", "bootstrap"),
      {
        initialized: true,
        initializedAt: serverTimestamp(),
        initializedBy: uid,
      },
      { merge: true },
    );
  }

  await batch.commit();
  emitFirestoreRefresh(options?.markBootstrap ? ["users", "usernames", "meta"] : ["users", "usernames"]);

  await createAuditLog(
    {
      action: "USER_CREATED",
      targetType: "user",
      targetId: uid,
      message: `Created account for @${username}.`,
    },
    options?.actor,
  );

  return uid;
}

export async function updateUserAccount(
  userId: number,
  values: {
    previousUsername: string;
    username: string;
    displayName: string;
    role?: Role;
    roles?: Role[];
    primaryRole?: Role;
    categoryIds: number[];
    defaultLeaderCategoryId?: string | null;
    active: boolean;
  },
  actor?: ActorInfo,
) {
  const previousKey = normalizeUsername(values.previousUsername);
  const nextKey = normalizeUsername(values.username);
  const batch = writeBatch(db);
  const userRef = doc(db, "users", userId);
  const roleFields = normalizeRoleFields(values);
  const assignedCategoryIds = normalizeCategoryIds(values.categoryIds);
  const defaultLeaderCategoryId = resolveLeaderDefaultCategoryId(
    roleFields,
    assignedCategoryIds,
    values.defaultLeaderCategoryId,
  );

  await ensureLastSuperAdminRemains(userId, roleFields.roles, values.active);

  const updateFields: any = {
    username: values.username.trim(),
    usernameLower: nextKey,
    displayName: values.displayName.trim(),
    role: roleFields.role,
    roles: roleFields.roles,
    primaryRole: roleFields.primaryRole,
    categoryIds: assignedCategoryIds,
    assignedCategoryIds,
    defaultLeaderCategoryId,
    active: values.active,
    deletedAt: values.active ? null : serverTimestamp(),
    deletedById: values.active ? null : actor?.actorId ?? null,
    deletedByName: values.active ? null : actor?.actorName ?? null,
    updatedAt: serverTimestamp(),
  };

  if ((values as any).password && String((values as any).password).trim()) {
    updateFields.password = String((values as any).password).trim();
  }

  batch.update(userRef, updateFields);

  if (previousKey !== nextKey) {
    const existingNext = await getDoc(doc(db, "usernames", nextKey));

    if (existingNext.exists()) {
      throw new Error("Username is already in use.");
    }

    batch.delete(doc(db, "usernames", previousKey));
  }

  batch.set(
    doc(db, "usernames", nextKey),
    {
      uid: userId,
      username: values.username.trim(),
      usernameLower: nextKey,
      displayName: values.displayName.trim(),
      role: roleFields.role,
      roles: roleFields.roles,
      primaryRole: roleFields.primaryRole,
      active: values.active,
      deletedAt: values.active ? null : serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await batch.commit();
  emitFirestoreRefresh(["users", "usernames"]);

  await createAuditLog(
    {
      action: values.active ? "USER_UPDATED" : "USER_DEACTIVATED",
      targetType: "user",
      targetId: userId,
      message: values.active
        ? `Updated account for @${values.username.trim()}.`
        : `Deactivated account for @${values.username.trim()}.`,
    },
    actor,
  );
  emitFirestoreRefresh(["categories"]);
    void syncPublicCatalog();
}

export async function createCategory(
  values: { name: string; description: string },
  actor?: ActorInfo,
) {
  const created = await addDoc(collection(db, "categories"), {
    name: values.name.trim(),
    description: values.description.trim(),
    active: true,
    deletedAt: null,
    deletedById: null,
    deletedByName: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await createAuditLog(
    {
      action: "CATEGORY_CREATED",
      targetType: "category",
      targetId: created.id,
      message: `Created category ${values.name.trim()}.`,
    },
    actor,
  );
  emitFirestoreRefresh(["categories"]);
    void syncPublicCatalog();
}

export async function updateCategory(
  id: number,
  values: { name: string; description: string; active: boolean },
  actor?: ActorInfo,
) {
  await updateDoc(doc(db, "categories", id), {
    name: values.name.trim(),
    description: values.description.trim(),
    active: values.active,
    deletedAt: values.active ? null : serverTimestamp(),
    deletedById: values.active ? null : actor?.actorId ?? null,
    deletedByName: values.active ? null : actor?.actorName ?? null,
    updatedAt: serverTimestamp(),
  });

  await createAuditLog(
    {
      action: values.active ? "CATEGORY_UPDATED" : "CATEGORY_DEACTIVATED",
      targetType: "category",
      targetId: id,
      message: values.active
        ? `Updated category ${values.name.trim()}.`
        : `Deactivated category ${values.name.trim()}.`,
    },
    actor,
  );
  emitFirestoreRefresh(["categories"]);
    void syncPublicCatalog();
}

export async function deleteCategory(id: number, actor?: ActorInfo) {
  await updateDoc(doc(db, "categories", id), {
    active: false,
    deletedAt: serverTimestamp(),
    deletedById: actor?.actorId ?? null,
    deletedByName: actor?.actorName ?? null,
    updatedAt: serverTimestamp(),
  });

  try {
    const items = await executeDbQuery({ action: "getDocs", collection: "items" });
    const matchingItems = items.filter((i: any) => String(i.categoryId) === String(id));
    for (const item of matchingItems) {
      await updateDoc(doc(db, "items", item.id), {
        active: false,
        deletedAt: serverTimestamp(),
        deletedById: actor?.actorId ?? null,
        deletedByName: actor?.actorName ?? null,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (e) {
    console.error("Failed to soft-delete items for category:", e);
  }

  await createAuditLog(
    {
      action: "CATEGORY_SOFT_DELETED",
      targetType: "category",
      targetId: id,
      message: "Soft deleted category.",
    },
    actor,
  );
  emitFirestoreRefresh(["categories", "items"]);
  void syncPublicCatalog();
}

export async function createItem(
  values: {
    name: string;
    description?: string;
    categoryId: number | string;
    categoryName: string;
    unit: string;
    imageUrl?: string | null;
    imagePath?: string | null;
    imageCrop?: ItemImageCrop | null;
    images?: Array<{ url: string; crop?: ItemImageCrop | null }>;
    is_permission?: string;
    hasVariants?: boolean;
    variants?: string[];
  },
  actor?: ActorInfo,
) {
  const numericCatId = parseInt(String(values.categoryId), 10) || values.categoryId;
  const cleanVariants: string[] = values.hasVariants && Array.isArray(values.variants)
    ? values.variants.map((v) => String(v).trim()).filter(Boolean)
    : [];

  // Generate guaranteed unique next productId by scanning all existing items
  let nextProductIdNum = 1;
  try {
    const allItemsSnap = await getDocs(collection(db, "items"));
    let maxNum = 0;
    for (const d of allItemsSnap.docs) {
      const data = d.data();
      const match = String(data.productId || "").match(/^PD(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    nextProductIdNum = maxNum + 1;
  } catch (e) {
    console.warn("Could not calculate max productId:", e);
  }

  const productIdStr = `PD${String(nextProductIdNum).padStart(3, "0")}`;

  const itemDocRef = await addDoc(collection(db, "items"), {
    name: values.name.trim(),
    productId: productIdStr,
    description: values.description?.trim() ?? "",
    categoryId: numericCatId,
    categoryName: values.categoryName,
    unit: values.unit.trim(),
    imageUrl: values.imageUrl ?? null,
    imagePath: values.imagePath ?? null,
    imageCrop: values.imageCrop ?? null,
    images: values.images ?? [],
    is_permission: values.is_permission === "YES" ? "YES" : "NO",
    hasVariants: Boolean(values.hasVariants && cleanVariants.length > 0),
    variants: cleanVariants,
    createdById: actor?.actorId ?? null,
    createdByName: actor?.actorName ?? null,
    createdByRole: actor?.actorRole ?? null,
    active: true,
    deletedAt: null,
    deletedById: null,
    deletedByName: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const finalItemId = parseInt(String(itemDocRef.id), 10) || itemDocRef.id;

  try {
    await setDoc(doc(db, "meta", "counters"), { nextProductId: nextProductIdNum + 1 }, { merge: true });
  } catch (e) {}

  // Auto create 0-qty stock entries for all custom sizes
  if (cleanVariants.length > 0) {
    for (const v of cleanVariants) {
      await addDoc(collection(db, "stockEntries"), {
        date: new Date().toISOString().slice(0, 10),
        categoryId: numericCatId,
        categoryName: values.categoryName,
        itemId: finalItemId,
        itemName: values.name.trim(),
        variant: v,
        qty: 0,
        unit: values.unit.trim(),
        notes: `Initial size ${v} setup`,
        createdById: actor?.actorId ?? 0,
        createdByName: actor?.actorName ?? "System",
        active: true,
        deletedAt: null,
        deletedById: null,
        deletedByName: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }

  await createAuditLog(
    {
      action: "ITEM_CREATED",
      targetType: "item",
      targetId: String(finalItemId),
      message: `Created item ${values.name.trim()}.`,
    },
    actor,
  );
  emitFirestoreRefresh(["items", "stockEntries"]);
  void syncPublicCatalog();
}

export async function updateItem(
  id: number | string,
  values: {
    name: string;
    description?: string;
    categoryId: number | string;
    categoryName: string;
    unit: string;
    imageUrl?: string | null;
    imagePath?: string | null;
    imageCrop?: ItemImageCrop | null;
    images?: Array<{ url: string; crop?: ItemImageCrop | null }>;
    is_permission?: string;
    hasVariants?: boolean;
    variants?: string[];
    active: boolean;
  },
  actor?: ActorInfo,
) {
  const numericId = parseInt(String(id), 10) || id;
  const numericCatId = parseInt(String(values.categoryId), 10) || values.categoryId;
  const isActive = values.active !== false;

  // Retrieve existing item to detect newly added or deleted size variants
  const existingItemSnap = await getDoc(doc(db, "items", numericId));
  const existingData = existingItemSnap.exists() ? existingItemSnap.data() : null;
  const oldVariants: string[] = existingData?.variants
    ? (Array.isArray(existingData.variants) ? existingData.variants : (() => { try { return JSON.parse(existingData.variants); } catch (e) { return []; } })())
    : [];

  const newVariants: string[] = values.hasVariants && Array.isArray(values.variants)
    ? values.variants.map((v) => String(v).trim()).filter(Boolean)
    : [];

  await updateDoc(doc(db, "items", numericId), {
    name: values.name.trim(),
    description: values.description?.trim() ?? "",
    categoryId: numericCatId,
    categoryName: values.categoryName,
    unit: values.unit.trim(),
    imageUrl: values.imageUrl ?? null,
    imagePath: values.imagePath ?? null,
    imageCrop: values.imageCrop ?? null,
    images: values.images ?? [],
    is_permission: values.is_permission === "YES" ? "YES" : "NO",
    hasVariants: Boolean(values.hasVariants && newVariants.length > 0),
    variants: newVariants,
    active: isActive,
    deletedAt: isActive ? null : serverTimestamp(),
    deletedById: isActive ? null : actor?.actorId ?? null,
    deletedByName: isActive ? null : actor?.actorName ?? null,
    updatedAt: serverTimestamp(),
  });

  // 1. Auto-create 0-qty stock entry for newly added variants
  for (const nv of newVariants) {
    if (!oldVariants.includes(nv)) {
      const existingEntries = await getDocs(
        query(
          collection(db, "stockEntries"),
          where("itemId", "==", numericId),
          where("variant", "==", nv),
          where("deletedAt", "==", null)
        )
      );
      if (existingEntries.empty) {
        await addDoc(collection(db, "stockEntries"), {
          date: new Date().toISOString().slice(0, 10),
          categoryId: numericCatId,
          categoryName: values.categoryName,
          itemId: numericId,
          itemName: values.name.trim(),
          variant: nv,
          qty: 0,
          unit: values.unit.trim(),
          notes: `Initial size ${nv} setup`,
          createdById: actor?.actorId ?? 0,
          createdByName: actor?.actorName ?? "System",
          active: true,
          deletedAt: null,
          deletedById: null,
          deletedByName: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    }
  }

  // 2. Permanently cascade delete stock entries for sizes removed during edit
  const deletedVariants = oldVariants.filter((ov) => !newVariants.includes(ov));
  if (deletedVariants.length > 0) {
    const allStockSnap = await getDocs(
      query(collection(db, "stockEntries"), where("itemId", "==", numericId))
    );
    for (const docSnap of allStockSnap.docs) {
      const data = docSnap.data();
      if (data.variant && deletedVariants.includes(String(data.variant).trim())) {
        await deleteDoc(doc(db, "stockEntries", docSnap.id));
      }
    }
  }

  await createAuditLog(
    {
      action: isActive ? "ITEM_UPDATED" : "ITEM_DEACTIVATED",
      targetType: "item",
      targetId: String(id),
      message: isActive
        ? `Updated item ${values.name.trim()}.`
        : `Deactivated item ${values.name.trim()}.`,
    },
    actor,
  );
  emitFirestoreRefresh(["items", "stockEntries"]);
  void syncPublicCatalog();
}

export async function deleteItem(id: number, actor?: ActorInfo) {
  const numericId = parseInt(String(id), 10) || id;

  await updateDoc(doc(db, "items", numericId), {
    active: false,
    deletedAt: serverTimestamp(),
    deletedById: actor?.actorId ?? null,
    deletedByName: actor?.actorName ?? null,
    updatedAt: serverTimestamp(),
  });

  // Cascade delete all stock entries associated with this item
  const allStockSnap = await getDocs(
    query(collection(db, "stockEntries"), where("itemId", "==", numericId))
  );
  for (const sDoc of allStockSnap.docs) {
    await updateDoc(doc(db, "stockEntries", sDoc.id), {
      active: false,
      deletedAt: serverTimestamp(),
      deletedById: actor?.actorId ?? null,
      deletedByName: actor?.actorName ?? null,
      updatedAt: serverTimestamp(),
    });
  }

  await createAuditLog(
    {
      action: "ITEM_SOFT_DELETED",
      targetType: "item",
      targetId: numericId,
      message: "Soft deleted item and associated stock entries.",
    },
    actor,
  );

  emitFirestoreRefresh(["items", "stockEntries"]);
  void syncPublicCatalog();
}

export async function recoverItem(id: number, actor?: ActorInfo) {
  await updateDoc(doc(db, "items", id), {
    active: true,
    deletedAt: null,
    deletedById: null,
    deletedByName: null,
    updatedAt: serverTimestamp(),
  });

  await createAuditLog(
    {
      action: "ITEM_RECOVERED",
      targetType: "item",
      targetId: id,
      message: "Recovered item (cleared deletedAt and re-activated).",
    },
    actor,
  );
  emitFirestoreRefresh(["items"]);
    void syncPublicCatalog();
}

export async function createStockEntry(
  values: {
    date: string;
    categoryId: number;
    categoryName: string;
    itemId: number;
    itemName: string;
    qty: number;
    unit?: string | null;
    notes: string;
    createdById: number;
    createdByName: string;
  },
  actor?: ActorInfo,
) {
  const created = await addDoc(collection(db, "stockEntries"), {
    ...values,
    qty: Number(values.qty),
    unit: values.unit ?? null,
    active: true,
    deletedAt: null,
    deletedById: null,
    deletedByName: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await createAuditLog(
    {
      action: "STOCK_ENTRY_CREATED",
      targetType: "stockEntry",
      targetId: created.id,
      message: `Added stock entry for ${values.itemName}.`,
    },
    actor,
  );

  // Auto-delete out of stock requests for this item when stock is added
  try {
    const q = query(
      collection(db, 'specialRequests'),
      where('itemId', '==', values.itemId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach((docSnap: any) => {
        batch.update(docSnap.ref, { 
          is_deleted: 1,
          deletedAt: serverTimestamp(),
          deletedById: actor?.actorId ? Number(actor.actorId) : null,
          deletedByName: actor?.actorName || 'system',
          status: 'APPROVED', 
          decidedAt: serverTimestamp(),
          decisionById: actor?.actorId ? Number(actor.actorId) : null,
          decisionNote: 'Auto-deleted: Stock added'
        });
      });
      await batch.commit();
      emitFirestoreRefresh(["specialRequests"]);
    }
  } catch (e) {
    console.error('Failed to auto-delete out of stock requests', e);
  }

  emitFirestoreRefresh(["stockEntries"]);
}

export async function updateStockEntry(
  id: number,
  values: {
    date: string;
    categoryId: number;
    categoryName: string;
    itemId: number;
    itemName: string;
    qty: number;
    unit?: string | null;
    notes: string;
  },
  actor?: ActorInfo,
) {
  await updateDoc(doc(db, "stockEntries", id), {
    ...values,
    qty: Number(values.qty),
    unit: values.unit ?? null,
    active: true,
    deletedAt: null,
    deletedById: null,
    deletedByName: null,
    updatedAt: serverTimestamp(),
  });

  await createAuditLog(
    {
      action: "STOCK_ENTRY_UPDATED",
      targetType: "stockEntry",
      targetId: id,
      message: `Updated stock entry for ${values.itemName}.`,
    },
    actor,
  );

  // Auto-resolve pending OUT_OF_STOCK requests for this item
  try {
    const q = query(
      collection(db, 'specialRequests'),
      where('type', '==', 'OUT_OF_STOCK'),
      where('itemId', '==', values.itemId),
      where('status', '==', 'PENDING')
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const batch = writeBatch(db);
      snap.forEach(docSnap => {
        batch.update(docSnap.ref, { 
          status: 'APPROVED', 
          resolvedAt: serverTimestamp(),
          resolvedByUsername: actor?.actorName || 'system',
          resolvedMessage: 'Auto-resolved: Stock added'
        });
      });
      await batch.commit();
      emitFirestoreRefresh(["specialRequests"]);
    }
  } catch (e) {
    console.error('Failed to auto-resolve out of stock requests', e);
  }

  emitFirestoreRefresh(["stockEntries"]);
}

export async function deleteStockEntry(id: number, actor?: ActorInfo) {
  await updateDoc(doc(db, "stockEntries", id), {
    active: false,
    deletedAt: serverTimestamp(),
    deletedById: actor?.actorId ?? null,
    deletedByName: actor?.actorName ?? null,
    updatedAt: serverTimestamp(),
  });

  await createAuditLog(
    {
      action: "STOCK_ENTRY_SOFT_DELETED",
      targetType: "stockEntry",
      targetId: id,
      message: "Soft deleted stock entry.",
    },
    actor,
  );
  emitFirestoreRefresh(["orders"]);
}

export async function createOrder(
  values: {
    date: string;
    itemId: number;
    itemName: string;
    categoryId: number;
    categoryName: string;
    qty: number;
    summary: string;
    notes: string;
    requestedById: number;
    requestedByName: string;
    requestedByUsername: string;
  },
  actor?: ActorInfo,
) {
  const created = await addDoc(collection(db, "orders"), {
    ...values,
    qty: Number(values.qty),
    status: "PENDING",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await createAuditLog(
    {
      action: "ORDER_CREATED",
      targetType: "order",
      targetId: created.id,
      message: `Created order for ${values.itemName}.`,
    },
    actor,
  );
  emitFirestoreRefresh(["orders"]);
}

export async function updateOrderStatus(
  id: number,
  values: {
    status: OrderStatus;
    decisionById: string;
    decisionByName: string;
    decisionNote: string;
  },
  actor?: ActorInfo,
) {
  const trimmedDecisionNote = values.decisionNote.trim();
  const payload: Record<string, unknown> = {
    status: values.status,
    decisionById: values.decisionById,
    decisionByName: values.decisionByName,
    decisionNote: trimmedDecisionNote,
    decidedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (values.status === "APPROVED") {
    payload.approvedAt = serverTimestamp();
    payload.approvedById = values.decisionById;
    payload.approvedByName = values.decisionByName;
    payload.approvedCustomNote = trimmedDecisionNote;
  }

  if (values.status === "REJECTED") {
    payload.rejectedAt = serverTimestamp();
    payload.rejectedById = values.decisionById;
    payload.rejectedByName = values.decisionByName;
    payload.rejectedCustomNote = trimmedDecisionNote;
  }

  if (values.status === "DELIVERED") {
    payload.deliveredAt = serverTimestamp();
    payload.deliveredById = values.decisionById;
    payload.deliveredByName = values.decisionByName;
    payload.deliveredCustomNote = trimmedDecisionNote;
  }

  await updateDoc(doc(db, "orders", id), payload);
  emitFirestoreRefresh(["orders"]);

  await createAuditLog(
    {
      action: "ORDER_STATUS_UPDATED",
      targetType: "order",
      targetId: id,
      message: `Updated order status to ${values.status}.`,
    },
    actor,
  );
}

export async function createResetRequest(values: {
  username: string;
  usernameLower: string;
  displayName: string;
}) {
  await addDoc(collection(db, "resetRequests"), {
    ...values,
    status: "OPEN",
    createdAt: serverTimestamp(),
  });
  emitFirestoreRefresh(["resetRequests"]);
}

export async function resolveResetRequest(
  id: number,
  values: {
    resolvedById: string;
    resolvedByName: string;
  },
  actor?: ActorInfo,
) {
  await updateDoc(doc(db, "resetRequests", id), {
    status: "RESOLVED",
    resolvedById: values.resolvedById,
    resolvedByName: values.resolvedByName,
    resolvedAt: serverTimestamp(),
  });

  await createAuditLog(
    {
      action: "RESET_REQUEST_RESOLVED",
      targetType: "passwordResetRequest",
      targetId: id,
      message: `Resolved password reset request for ${values.resolvedByName}.`,
    },
    actor,
  );
  emitFirestoreRefresh(["resetRequests"]);
}

export async function touchLastLogin(userId: number) {
  await updateDoc(doc(db, "users", userId), {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}


export async function createSpecialRequest(
  values: Omit<
    SpecialRequestRecord,
    "id" | "status" | "createdAt" | "updatedAt" | "decisionById" | "decisionByName" | "decisionNote" | "decidedAt"
  >,
  actor: { uid: number; username: string; displayName: string; role: Role },
) {
  const created = await addDoc(collection(db, "specialRequests"), {
    ...values,
    status: "PENDING",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await createAuditLog(
    {
      action: "CREATE",
      targetType: "SPECIAL_REQUEST",
      targetId: created.id,
      message: `Special request created for ${values.type === 'NEW_ITEM' ? values.newItemName : values.itemName}`,
    },
    { actorId: actor.uid, actorName: actor.displayName, actorRole: actor.role },
  );

  emitFirestoreRefresh();
  return created.id;
}

export async function approveSpecialRequest(
  requestId: string,
  note: string,
  actor: { uid: number; username: string; displayName: string; role: Role },
) {
  const reqRef = doc(db, "specialRequests", requestId);
  
  await updateDoc(reqRef, {
    status: "APPROVED",
    decisionById: actor.uid,
    decisionByName: actor.displayName,
    decisionNote: note,
    decidedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await createAuditLog(
    {
      action: "APPROVE",
      targetType: "SPECIAL_REQUEST",
      targetId: requestId,
      message: `Special request approved`,
    },
    { actorId: actor.uid, actorName: actor.displayName, actorRole: actor.role },
  );

  emitFirestoreRefresh();
}

export async function rejectSpecialRequest(
  requestId: string,
  note: string,
  actor: { uid: number; username: string; displayName: string; role: Role },
) {
  const reqRef = doc(db, "specialRequests", requestId);
  
  await updateDoc(reqRef, {
    status: "REJECTED",
    decisionById: actor.uid,
    decisionByName: actor.displayName,
    decisionNote: note,
    decidedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await createAuditLog(
    {
      action: "REJECT",
      targetType: "SPECIAL_REQUEST",
      targetId: requestId,
      message: `Special request rejected`,
    },
    { actorId: actor.uid, actorName: actor.displayName, actorRole: actor.role },
  );

  emitFirestoreRefresh();
}
