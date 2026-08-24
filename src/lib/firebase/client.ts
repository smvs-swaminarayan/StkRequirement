import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, setPersistence, inMemoryPersistence } from "firebase/auth";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCI_RK6n-TllLj0DULPMJ6HLzxUdLhepBg",
  authDomain: "stk-stock-f2557.firebaseapp.com",
  projectId: "stk-stock-f2557",
  storageBucket: "stk-stock-f2557.firebasestorage.app",
  messagingSenderId: "854678524512",
  appId: "1:854678524512:web:f6701d3085862eed3da905",
};

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
setPersistence(auth, inMemoryPersistence).catch(() => {});
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
try { enableMultiTabIndexedDbPersistence(db).catch(() => {}); } catch(e) {}

const secondaryApp =
  getApps().find((app) => app.name === "secondary-stk") ??
  initializeApp(firebaseConfig, "secondary-stk");

export const secondaryAuth = getAuth(secondaryApp);
