export function getAuth() {
  return {
    verifyIdToken: async (token: string) => {
       return { uid: "admin-mock-uid", email: "admin@mock" };
    }
  };
}
