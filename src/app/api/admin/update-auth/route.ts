import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { authEmailFromUsername, normalizeUsername } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, username, previousUsername, callerUid } = body;

    if (!uid || !username || !callerUid) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const nextKey = normalizeUsername(username);
    const previousKey = normalizeUsername(previousUsername || "");

    // Avoid unnecessary updates if the normalized username hasn't changed
    if (nextKey === previousKey) {
      return NextResponse.json({ success: true, message: "No email update needed." });
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    // Verify caller is SUPER_ADMIN
    const callerDoc = await adminDb.collection("users").doc(callerUid).get();
    const callerRole = callerDoc.data()?.role;
    
    if (callerRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const newEmail = authEmailFromUsername(nextKey);
    await adminAuth.updateUser(uid, { email: newEmail });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update auth email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
