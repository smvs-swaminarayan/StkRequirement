export function getStorage(app: any) {
  return {};
}

export function ref(storage: any, path: string) {
  return { path };
}

export async function uploadString(ref: any, dataString: string, format?: string) {
  return { ref };
}

export async function getDownloadURL(ref: any) {
  return "https://mock-storage-url";
}
