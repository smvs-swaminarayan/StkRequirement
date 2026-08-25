"use server";

import { cookies } from "next/headers";
import { executeDbQuery } from "@/lib/sqlite-action";
import { normalizeUsername } from "@/lib/utils";

export async function loginAction(username: string, passwordString: string) {
  const usernameKey = normalizeUsername(username);
  
  const users = await executeDbQuery({
    action: "getDocs",
    collection: "users",
    constraints: [{ field: "usernameLower", op: "==", value: usernameKey }]
  });
  
  const user = users && users[0];
  if (!user) {
    throw new Error("Username does not exist.");
  }
  
  if (user.is_deleted === 1 || user.deletedAt) {
    throw new Error("This account is deactivated.");
  }
  
  if (user.password !== passwordString) {
    throw new Error("Password is wrong.");
  }
  
  const cookieStore = await cookies();
  cookieStore.set("auth_session", user.uid.toString(), {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });
  
  await executeDbQuery({
    action: "updateDoc",
    collection: "users",
    id: user.uid,
    data: { lastLoginAt: new Date().toISOString() }
  });
  
  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_session");
  return { success: true };
}

export async function getMeAction() {
  const cookieStore = await cookies();
  const uid = cookieStore.get("auth_session")?.value;
  
  if (!uid) return null;
  
  const user = await executeDbQuery({
    action: "getDoc",
    collection: "users",
    id: isNaN(Number(uid)) ? uid : Number(uid)
  });
  
  if (!user || user.is_deleted === 1 || user.deletedAt) return null;
  
  return {
    ...user,
    roles: typeof user.roles === "string" ? JSON.parse(user.roles) : user.roles,
    assignedCategoryIds: typeof user.assignedCategoryIds === "string" ? JSON.parse(user.assignedCategoryIds) : user.assignedCategoryIds,
    active: user.is_deleted === 0
  };
}

export async function checkBootstrapAction() {
  const users = await executeDbQuery({
    action: "getDocs",
    collection: "users",
    constraints: [{ field: "is_deleted", op: "==", value: 0 }]
  });
  return users && users.length > 0;
}

export async function verifyUsernameAction(username: string) {
  const usernameKey = normalizeUsername(username);
  const users = await executeDbQuery({
    action: "getDocs",
    collection: "users",
    constraints: [{ field: "usernameLower", op: "==", value: usernameKey }]
  });
  const user = users && users[0];
  if (!user || user.is_deleted === 1 || user.deletedAt) {
    return { found: false, error: "Account not found or inactive." };
  }
  return { found: true, username: user.username, displayName: user.displayName };
}

export async function resetPasswordAction(username: string, nextPassword: string) {
  const usernameKey = normalizeUsername(username);
  const passLen = nextPassword.trim().length;
  if (passLen < 3 || passLen > 16) {
    throw new Error("Password must be between 3 and 16 characters.");
  }
  
  const users = await executeDbQuery({
    action: "getDocs",
    collection: "users",
    constraints: [{ field: "usernameLower", op: "==", value: usernameKey }]
  });
  const user = users && users[0];
  if (!user || user.is_deleted === 1 || user.deletedAt) {
    throw new Error("Target user account not found or inactive.");
  }

  // Update user password in users table so new password works for login
  await executeDbQuery({
    action: "updateDoc",
    collection: "users",
    id: user.uid,
    data: {
      password: nextPassword.trim(),
      updatedAt: new Date().toISOString()
    }
  });

  await executeDbQuery({
    action: "addDoc",
    collection: "resetRequests",
    data: {
      username: user.username,
      status: "RESOLVED",
      temporaryPasswordIssued: 1,
      createdAt: new Date().toISOString()
    }
  });

  return { success: true, displayName: user.displayName };
}
