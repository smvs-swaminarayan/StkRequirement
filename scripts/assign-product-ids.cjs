/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const { initializeApp, getApps, cert } = require("firebase-admin/app");
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
    throw new Error("Missing Firebase Admin env vars.");
  }

  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

async function main() {
  initAdmin();
  const db = getFirestore();

  console.log("Fetching items...");
  const itemsSnap = await db.collection("items").get();
  
  // Sort items by category, then by created date
  const items = [];
  itemsSnap.forEach((doc) => {
    items.push({ id: doc.id, ...doc.data() });
  });

  items.sort((a, b) => {
    if (a.categoryName !== b.categoryName) {
      return (a.categoryName || "").localeCompare(b.categoryName || "");
    }
    return (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0);
  });

  console.log(`Found ${items.length} items. Assigning Product IDs...`);

  let currentId = 1;
  const batch = db.batch();
  
  for (const item of items) {
    if (!item.productId) {
      const productId = `PD${String(currentId).padStart(3, "0")}`;
      batch.update(db.collection("items").doc(item.id), { productId });
      console.log(`Assigned ${productId} to ${item.name}`);
      currentId++;
    }
  }

  // Save the counter in meta/counters so future items can use it
  const countersRef = db.collection("meta").doc("counters");
  batch.set(countersRef, { nextProductId: currentId }, { merge: true });

  await batch.commit();
  console.log(`Update complete. Next product ID will be ${currentId}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
