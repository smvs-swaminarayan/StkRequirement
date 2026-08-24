import { executeDbQuery } from "../sqlite-action";

export function collection(dbOrPath: any, path?: string) {
  const colPath = typeof dbOrPath === "string" ? dbOrPath : (path || dbOrPath?.path || "");
  return { path: colPath };
}

export function doc(...args: any[]) {
  let colPath = "";
  let docId = "";

  const validArgs = args.filter(
    (a) => typeof a === "string" || typeof a === "number" || (a && typeof a === "object" && a.path),
  );

  if (validArgs.length === 1) {
    const arg = validArgs[0];
    if (typeof arg === "string") {
      colPath = arg;
    } else if (typeof arg === "number") {
      colPath = String(arg);
    } else if (arg && arg.path) {
      colPath = typeof arg.path === "string" ? arg.path : arg.path.path || "";
    }
  } else if (validArgs.length >= 2) {
    const arg0 = validArgs[0];
    const arg1 = validArgs[1];

    if (typeof arg0 === "string" || typeof arg0 === "number") {
      colPath = String(arg0);
      docId = (typeof arg1 === "string" || typeof arg1 === "number") ? String(arg1) : "";
    } else if (arg0 && arg0.path) {
      colPath = typeof arg0.path === "string" ? arg0.path : arg0.path.path || "";
      docId = (typeof arg1 === "string" || typeof arg1 === "number") ? String(arg1) : "";
    }
  }

  if (colPath.includes("/") && !docId) {
    const parts = colPath.split("/");
    colPath = parts[0];
    docId = parts[1];
  }

  if (!docId) {
    docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  return { path: colPath, id: docId };
}

export async function getDocs(queryObj: any) {
  const constraints = queryObj.constraints || [];
  const colPath = typeof queryObj.path === 'string' ? queryObj.path : (queryObj.path?.path || "");
  const results = await executeDbQuery({
    action: "getDocs",
    collection: colPath,
    constraints
  });
  return {
    empty: results.length === 0,
    docs: results.map((r: any) => ({
      id: r.id,
      exists: () => true,
      data: () => r,
      ref: { path: colPath, id: r.id }
    })),
    forEach: (cb: any) => {
      results.forEach((r: any) => cb({
         id: r.id,
         exists: () => true,
         data: () => r,
         ref: { path: colPath, id: r.id }
      }));
    }
  };
}

export async function getDoc(docRef: any) {
  const colPath = typeof docRef.path === 'string' ? docRef.path : (docRef.path?.path || "");
  const result = await executeDbQuery({
    action: "getDoc",
    collection: colPath,
    id: docRef.id
  });
  return {
    id: docRef.id,
    exists: () => !!result,
    data: () => result
  };
}

export async function addDoc(collectionRef: any, data: any) {
  const colPath = typeof collectionRef.path === 'string' ? collectionRef.path : (collectionRef.path?.path || "");
  const id = await executeDbQuery({
    action: "addDoc",
    collection: colPath,
    data
  });
  return { id };
}

export async function setDoc(docRef: any, data: any, options?: any) {
  const colPath = typeof docRef.path === 'string' ? docRef.path : (docRef.path?.path || "");
  const action = options?.merge ? "updateDoc" : "setDoc";
  await executeDbQuery({
    action,
    collection: colPath,
    id: docRef.id,
    data
  });
}

export async function updateDoc(docRef: any, data: any) {
  const colPath = typeof docRef.path === 'string' ? docRef.path : (docRef.path?.path || "");
  await executeDbQuery({
    action: "updateDoc",
    collection: colPath,
    id: docRef.id,
    data
  });
}

export async function deleteDoc(docRef: any) {
  const colPath = typeof docRef.path === 'string' ? docRef.path : (docRef.path?.path || "");
  await executeDbQuery({
    action: "deleteDoc",
    collection: colPath,
    id: docRef.id
  });
}

export function query(baseRef: any, ...constraints: any[]) {
  const colPath = typeof baseRef.path === 'string' ? baseRef.path : (baseRef.path?.path || "");
  return {
    path: colPath,
    constraints: constraints.filter(c => c)
  };
}

export function where(field: string, op: string, value: any) {
  return { field, op, value };
}

export function orderBy(field: string, direction?: string) {
  return null; 
}

export function serverTimestamp() {
  return new Date().toISOString();
}

export async function runTransaction(db: any, updateFunction: any) {
  const transaction = {
    get: async (ref: any) => getDoc(ref),
    set: async (ref: any, data: any, options: any) => {
        await setDoc(ref, data, options);
    },
    update: async (ref: any, data: any) => {
        await updateDoc(ref, data);
    },
    delete: async (ref: any) => {
        await deleteDoc(ref);
    }
  };
  return await updateFunction(transaction);
}

export function writeBatch(db: any) {
  const operations: any[] = [];
  return {
    set: (ref: any, data: any, options: any) => operations.push({ type: options?.merge ? 'update' : 'set', ref, data }),
    update: (ref: any, data: any) => operations.push({ type: 'update', ref, data }),
    delete: (ref: any) => operations.push({ type: 'delete', ref }),
    commit: async () => {
       for (const op of operations) {
          if (op.type === 'set') await setDoc(op.ref, op.data);
          if (op.type === 'update') await updateDoc(op.ref, op.data);
          if (op.type === 'delete') await deleteDoc(op.ref);
       }
    }
  };
}

export function onSnapshot(queryObj: any, callback: any) {
  let disposed = false;
  
  const fetchIt = async () => {
    if (disposed) return;
    try {
      const snap = await getDocs(queryObj);
      callback(snap);
    } catch (e) { }
  };
  
  fetchIt();
  const iv = setInterval(fetchIt, 15000); // 15s poll to mimic realtime
  
  return () => {
    disposed = true;
    clearInterval(iv);
  };
}

export class Timestamp {
  seconds: number;
  nanoseconds: number;
  constructor(seconds: number, nanoseconds: number) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }
  static now() {
    return new Timestamp(Math.floor(Date.now() / 1000), 0);
  }
  static fromDate(date: Date) {
    return new Timestamp(Math.floor(date.getTime() / 1000), 0);
  }
  static fromMillis(millis: number) {
    return new Timestamp(Math.floor(millis / 1000), 0);
  }
  toDate() {
    return new Date(this.seconds * 1000);
  }
  toMillis() {
    return this.seconds * 1000;
  }
  isEqual(other: Timestamp) {
    return this.seconds === other.seconds && this.nanoseconds === other.nanoseconds;
  }
}

export function getFirestore() {
  return {};
}

export function enableMultiTabIndexedDbPersistence() {
  return Promise.resolve();
}

export type DocumentData = any;
export type QueryConstraint = any;

