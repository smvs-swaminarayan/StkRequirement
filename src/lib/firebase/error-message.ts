import { FirebaseError } from "firebase/app";

export function getFirebaseErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error ? error.message : fallback;
  }

  switch (error.code) {
    case "auth/configuration-not-found":
      return "Enable Email/Password in Firebase Authentication.";
    case "auth/email-already-in-use":
      return "Username already exists.";
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid username or password.";
    case "auth/weak-password":
      return "Password is too short.";
    default:
      return error.message || fallback;
  }
}
