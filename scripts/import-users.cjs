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
    description: "Imported category",
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

async function deleteAllUsers(auth, db) {
  console.log("Deleting all Auth users...");
  const listUsersResult = await auth.listUsers(1000);
  const uids = listUsersResult.users.map((userRecord) => userRecord.uid);
  if (uids.length > 0) {
    await auth.deleteUsers(uids);
    console.log(`Deleted ${uids.length} users from Auth.`);
  }

  console.log("Deleting all Firestore users...");
  const usersSnap = await db.collection("users").get();
  const batch1 = db.batch();
  usersSnap.forEach((doc) => batch1.delete(doc.ref));
  await batch1.commit();

  console.log("Deleting all Firestore usernames...");
  const usernamesSnap = await db.collection("usernames").get();
  const batch2 = db.batch();
  usernamesSnap.forEach((doc) => batch2.delete(doc.ref));
  await batch2.commit();
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

  await deleteAllUsers(auth, db);

  console.log("Ensuring categories...");
  const catGeneral = await ensureCategory(db, "General Store");
  const catStationary = await ensureCategory(db, "Stationary");
  const catElectric = await ensureCategory(db, "Electric");
  const leaderCats = [catGeneral.id, catStationary.id, catElectric.id];

  const rawUsers = [
    { id: "64", name: "પૂ. ગુણનિધિસ્વામી", role: "SUPER_ADMIN", cat: "All" },
    { id: "107", name: "પૂ. રાજેશ્વરસ્વામી", role: "SUPER_ADMIN", cat: "All" },
    { id: "s-4", name: "સંયમ મહારાજ", role: "USER", cat: "-" },
    { id: "87", name: "જીગર મહારાજ", role: "USER", cat: "-" },
    { id: "69", name: "સુખમ મહારાજ", role: "USER", cat: "-" },
    { id: "106", name: "કેતુલ મહારાજ", role: "USER", cat: "-" },
    { id: "108", name: "ચિંતન મહારાજ", role: "USER", cat: "-" },
    { id: "109", name: "સહદેવ મહારાજ", role: "USER", cat: "-" },
    { id: "111", name: "સહજ મહારાજ(1)", role: "USER", cat: "-" },
    { id: "112", name: "ખુશ મહારાજ", role: "USER", cat: "-" },
    { id: "113", name: "ઘનશ્યામ મહારાજ", role: "USER", cat: "-" },
    { id: "114", name: "દર્શન મહારાજ", role: "USER", cat: "-" },
    { id: "115", name: "સહજ મહારાજ(2)", role: "LEADER", cat: "Leader" },
    { id: "116", name: "અભિષેક મહારાજ", role: "USER", cat: "-" }
  ];

  const usersToSeed = rawUsers.map(u => ({
    username: u.id,
    displayName: u.name,
    password: "123456",
    role: u.role,
    roles: [u.role],
    primaryRole: u.role,
    categoryIds: u.role === "LEADER" ? leaderCats : [],
    assignedCategoryIds: u.role === "LEADER" ? leaderCats : [],
    defaultLeaderCategoryId: u.role === "LEADER" ? leaderCats[0] : null,
  }));

  for (const u of usersToSeed) {
    const usernameLower = String(u.username).trim().toLowerCase().replace(/\s+/g, "");
    const email = authEmailFromUsername(usernameLower);
    console.log(`Creating auth user for @${u.username} (${email}) ...`);
    const uid = await ensureAuthUser(auth, email, u.password, u.displayName);
    await upsertUserDocs(db, uid, {
      ...u,
      usernameLower,
    });
  }

  console.log("Import completed!");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
