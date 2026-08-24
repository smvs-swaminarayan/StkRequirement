export class FirebaseError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

export function initializeApp(config: any, name?: string) {
  return {};
}

export function getApp() {
  return {};
}

export function getApps() {
  return [];
}
