# STK Stock

Light-theme stock and order management app built with `Next.js 16` and `Firebase`.

## Current scope

- Username + password sign-in backed by Firebase Auth
- One-time first Super Admin setup
- Roles foundation for `SUPER_ADMIN`, `LEADER`, `USER`
- Strict category scoping foundation
- Category, item, and stock-in masters
- Order lifecycle: `PENDING -> APPROVED -> DELIVERED`, or `REJECTED`
- Current-month dashboard, reports, and charts
- Password reset request flow from login and inside the app
- Self-service password change inside the app
- Super Admin temporary password reset route

## Firebase collections

- `users`
- `usernames`
- `categories`
- `items`
- `stockEntries`
- `orders`
- `resetRequests`
- `auditLogs`
- `meta/bootstrap`

Collections are created automatically when records are added.

## Local run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Firebase setup

1. Enable `Authentication -> Email/Password`
2. Create `Firestore Database`
3. Deploy Firestore rules

```bash
firebase deploy --only firestore:rules
```

## Admin SDK setup for Phase 2

Password reset APIs now require Firebase Admin SDK credentials.

1. Copy `.env.example` to `.env.local`
2. Fill these values from your Firebase service account:

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

`FIREBASE_ADMIN_PRIVATE_KEY` must keep `\\n` line breaks exactly as shown in `.env.example`.

## First use flow

1. Open `/`
2. If no Super Admin exists, create the first `Super Admin`
3. Create categories
4. Create items
5. Create leaders and users
6. Add stock entries
7. Start placing and approving orders

## Verification

```bash
npm run lint
npm run build
```
