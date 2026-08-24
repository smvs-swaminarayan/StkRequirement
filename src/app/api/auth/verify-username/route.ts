import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

/**
 * Verify a username for the forgot-password flow.
 * Tries:
 *   1. Direct lookup in `usernames/{username}`
 *   2. If not found OR inactive, search `users` collection by displayName
 *   3. Then search `usernames` collection by displayName
 * This ensures users who enter their display name (e.g. "Sahaj")
 * can still find their account even if the actual username is "sahaj123".
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { username?: string }
      | null;
    const input = body?.username?.trim().toLowerCase();

    if (!input) {
      return NextResponse.json(
        { error: "Username is required." },
        { status: 400 },
      );
    }

    const adminDb = getAdminDb();

    // ── 1) Direct lookup by username key ──
    const usernameSnapshot = await adminDb.collection("usernames").doc(input).get();

    if (usernameSnapshot.exists) {
      const data = usernameSnapshot.data() as {
        uid: string;
        username: string;
        displayName?: string;
        active?: boolean;
        deletedAt?: unknown;
      };

      if (data.active !== false && !data.deletedAt) {
        return NextResponse.json({
          found: true,
          username: data.username,
          displayName: data.displayName ?? data.username,
        });
      }
      // If the direct match is inactive, fall through to search by displayName
    }

    // ── 2) Search `users` collection by displayName (case-insensitive) ──
    const usersSnap = await adminDb.collection("users").get();
    const inputLower = input.toLowerCase();
    
    for (const doc of usersSnap.docs) {
      const userData = doc.data() as {
        uid: string;
        username: string;
        displayName?: string;
        active?: boolean;
        deletedAt?: unknown;
      };

      const nameMatch =
        userData.displayName?.toLowerCase() === inputLower ||
        userData.username?.toLowerCase() === inputLower;

      if (nameMatch && userData.active !== false && !userData.deletedAt) {
        return NextResponse.json({
          found: true,
          username: userData.username,
          displayName: userData.displayName ?? userData.username,
        });
      }
    }

    // ── 3) Search `usernames` collection by displayName ──
    const usernamesSnap = await adminDb.collection("usernames").get();

    for (const doc of usernamesSnap.docs) {
      const data = doc.data() as {
        uid: string;
        username: string;
        displayName?: string;
        active?: boolean;
        deletedAt?: unknown;
      };

      const nameMatch =
        data.displayName?.toLowerCase() === inputLower ||
        data.username?.toLowerCase() === inputLower;

      if (nameMatch && data.active !== false && !data.deletedAt) {
        return NextResponse.json({
          found: true,
          username: data.username,
          displayName: data.displayName ?? data.username,
        });
      }
    }

    return NextResponse.json(
      { found: false, error: "User not found. Please enter your exact username (e.g. @sahaj123)." },
      { status: 404 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify username.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
