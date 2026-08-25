export function getFirebaseErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : String(error || "");
  
  if (
    message.includes("Password is wrong") ||
    message.includes("auth/wrong-password") ||
    message.includes("auth/invalid-credential") ||
    message.includes("auth/invalid-login-credentials")
  ) {
    return "Password is wrong.";
  }
  if (
    message.includes("Username does not exist") ||
    message.includes("auth/user-not-found") ||
    message.includes("not configured")
  ) {
    return "Username does not exist.";
  }
  if (message.includes("deactivated") || message.includes("inactive")) {
    return "This account is deactivated.";
  }
  if (message.includes("already exists") || message.includes("email-already-in-use")) {
    return "Username already exists.";
  }
  if (message.includes("too short") || message.includes("weak-password")) {
    return "Password must be at least 6 characters.";
  }
  
  return message || fallback;
}
