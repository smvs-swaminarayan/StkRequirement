/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const readline = require("readline");
const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

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

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(String(answer ?? "").trim());
    });
  });
}

async function deleteCollectionDocs(db, collectionName, batchSize = 450) {
  const colRef = db.collection(collectionName);
  let deleted = 0;

  // Firestore batch limit is 500 writes; keep safe margin.
  // We page by document name to avoid loading everything at once.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const snap = await colRef.orderBy("__name__").limit(batchSize).get();
    if (snap.empty) break;

    const batch = db.batch();
    for (const doc of snap.docs) {
      batch.delete(doc.ref);
    }
    await batch.commit();

    deleted += snap.size;
    console.log(`Deleted ${deleted} docs from "${collectionName}"...`);
  }

  return deleted;
}

async function main() {
  initAdmin();
  const db = getFirestore();

  const collectionName = "orders";

  console.log(`This will PERMANENTLY delete ALL documents in Firestore collection "${collectionName}".`);
  console.log("Recommended: run this only on DEV/TEST project.");
  const confirm = await ask('Type DELETE to confirm: ');
  if (confirm !== "DELETE") {
    console.log("Cancelled.");
    return;
  }

  const total = await deleteCollectionDocs(db, collectionName);
  console.log(`Done. Deleted ${total} docs from "${collectionName}".`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

