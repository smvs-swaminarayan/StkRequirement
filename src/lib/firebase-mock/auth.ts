export function getAuth(app: any) {
  return {};
}

export function setPersistence(auth: any, persistence: any) {
  return Promise.resolve();
}

export const inMemoryPersistence = "inMemory";

export function createUserWithEmailAndPassword(auth: any, email: string, pass: string) {
  return Promise.resolve({ user: { uid: email } });
}

export function signInWithEmailAndPassword(auth: any, email: string, pass: string) {
  if (typeof window !== "undefined") {
     localStorage.setItem("mock_user_email", email);
  }
  return Promise.resolve({ user: { uid: email, email } });
}

export function signOut(auth: any) {
  if (typeof window !== "undefined") {
     localStorage.removeItem("mock_user_email");
  }
  return Promise.resolve();
}

export function onAuthStateChanged(auth: any, cb: any) {
  if (typeof window !== "undefined") {
     const email = localStorage.getItem("mock_user_email");
     if (email) {
        cb({ uid: email, email });
     } else {
        cb(null);
     }
  } else {
     cb(null);
  }
  return () => {};
}
