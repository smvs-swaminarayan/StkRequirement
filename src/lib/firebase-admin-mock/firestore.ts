// We can just re-export the client mock since they share a lot, or create a simple admin db mock
import { executeDbQuery } from "../sqlite-action";

export function getFirestore() {
  return {
    collection: (path: string) => {
      return {
        get: async () => {
          const results = await executeDbQuery({ action: "getDocs", collection: path });
          return {
            docs: results.map((r: any) => ({
              id: r.id,
              data: () => r
            }))
          };
        }
      };
    }
  };
}
