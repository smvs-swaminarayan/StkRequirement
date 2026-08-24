"use client";

const FIRESTORE_REFRESH_EVENT = "stk-firestore-refresh";

type RefreshDetail = {
  paths?: string[];
};

export function emitFirestoreRefresh(paths?: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<RefreshDetail>(FIRESTORE_REFRESH_EVENT, {
      detail: { paths },
    }),
  );
}

export function subscribeFirestoreRefresh(
  callback: (detail: RefreshDetail) => void,
) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = (event: Event) => {
    callback(((event as CustomEvent<RefreshDetail>).detail ?? {}) as RefreshDetail);
  };

  window.addEventListener(FIRESTORE_REFRESH_EVENT, listener);
  return () => window.removeEventListener(FIRESTORE_REFRESH_EVENT, listener);
}
