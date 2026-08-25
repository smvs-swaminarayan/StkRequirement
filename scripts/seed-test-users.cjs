/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

function normalizePrivateKey(value) {
  return value ? value.replace(/\\n/g, "\n") : value;
}

function initAdmin() {
  if (getApps().length) return;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin env vars. Ensure .env.local has FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY.",
    );
  }

  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

function authEmailFromUsername(username) {
  const key = String(username).trim().toLowerCase().replace(/\s+/g, "");
  return `${key}@stk-stock.invalid`;
}

async function ensureCategory(db, name) {
  const snap = await db.collection("categories").where("name", "==", name).limit(1).get();
  if (!snap.empty) {
    return { id: snap.docs[0].id, data: snap.docs[0].data() };
  }
  const ref = await db.collection("categories").add({
    name,
    description: "Seed category",
    active: true,
    deletedAt: null,
    deletedById: null,
    deletedByName: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  const created = await ref.get();
  return { id: created.id, data: created.data() };
}

async function ensureItem(db, category, name) {
  const snap = await db
    .collection("items")
    .where("name", "==", name)
    .where("categoryId", "==", category.id)
    .limit(1)
    .get();
  if (!snap.empty) {
    return { id: snap.docs[0].id, data: snap.docs[0].data() };
  }
  const ref = await db.collection("items").add({
    name,
    description: "Seed item",
    categoryId: category.id,
    categoryName: category.data.name || "Seed",
    unit: "piece",
    imageUrl: null,
    imagePath: null,
    imageCrop: null,
    images: [],
    createdById: null,
    createdByName: null,
    createdByRole: null,
    active: true,
    deletedAt: null,
    deletedById: null,
    deletedByName: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  const created = await ref.get();
  return { id: created.id, data: created.data() };
}

async function ensureAuthUser(auth, email, password, displayName) {
  try {
    const existing = await auth.getUserByEmail(email);
    await auth.updateUser(existing.uid, { password, displayName });
    return existing.uid;
  } catch (err) {
    if (err && err.code === "auth/user-not-found") {
      const created = await auth.createUser({ email, password, displayName });
      return created.uid;
    }
    throw err;
  }
}

async function upsertUserDocs(db, uid, values) {
  const userRef = db.collection("users").doc(uid);
  const usernameKey = String(values.usernameLower);
  const usernamesRef = db.collection("usernames").doc(usernameKey);

  await db.runTransaction(async (tx) => {
    tx.set(
      userRef,
      {
        uid,
        username: values.username,
        usernameLower: values.usernameLower,
        displayName: values.displayName,
        role: values.role,
        roles: values.roles,
        primaryRole: values.primaryRole,
        categoryIds: values.categoryIds,
        assignedCategoryIds: values.assignedCategoryIds,
        defaultLeaderCategoryId: values.defaultLeaderCategoryId ?? null,
        active: true,
        deletedAt: null,
        deletedById: null,
        deletedByName: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        lastLoginAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    tx.set(
      usernamesRef,
      {
        uid,
        username: values.username,
        usernameLower: values.usernameLower,
        displayName: values.displayName,
        role: values.role,
        roles: values.roles,
        primaryRole: values.primaryRole,
        active: true,
        deletedAt: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    tx.set(
      db.collection("meta").doc("bootstrap"),
      {
        initialized: true,
        initializedAt: FieldValue.serverTimestamp(),
        initializedBy: uid,
      },
      { merge: true },
    );
  });
}

async function main() {
  initAdmin();
  const auth = getAuth();
  const db = getFirestore();

  console.log("Seeding base data...");
  const category = await ensureCategory(db, "General");
  await ensureItem(db, category, "Sample Item");

  const usersToSeed = [
    {
      username: "sevak_32",
      displayName: "Sevak Admin",
      password: "parthiv123",
      role: "SUPER_ADMIN",
      roles: ["SUPER_ADMIN"],
      primaryRole: "SUPER_ADMIN",
      categoryIds: [],
      assignedCategoryIds: [],
      defaultLeaderCategoryId: null,
    },
    {
      username: "savan",
      displayName: "Savan User",
      password: "123456",
      role: "USER",
      roles: ["USER"],
      primaryRole: "USER",
      categoryIds: [category.id],
      assignedCategoryIds: [category.id],
      defaultLeaderCategoryId: null,
    },
    {
      username: "item_leader_1",
      displayName: "Item Leader",
      password: "123456",
      role: "LEADER",
      roles: ["LEADER"],
      primaryRole: "LEADER",
      categoryIds: [category.id],
      assignedCategoryIds: [category.id],
      defaultLeaderCategoryId: category.id,
    },
  ];

  for (const u of usersToSeed) {
    const usernameLower = String(u.username).trim().toLowerCase().replace(/\s+/g, "");
    const email = authEmailFromUsername(usernameLower);
    console.log(`Ensuring auth user for @${u.username} (${email}) ...`);
    const uid = await ensureAuthUser(auth, email, u.password, u.displayName);
    console.log(` -> uid=${uid}`);
    await upsertUserDocs(db, uid, {
      ...u,
      usernameLower,
    });
  }

  console.log("Done.");
  console.log("You can now login with:");
  console.log("- Admin: sevak_32 / parthiv123");
  console.log("- Normal: savan / 123456");
  console.log("- Item Leader: item_leader_1 / 123456");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

