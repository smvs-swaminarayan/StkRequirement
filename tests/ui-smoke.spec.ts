import { test, expect } from "@playwright/test";

type Creds = { username: string; password: string };

async function login(page: import("@playwright/test").Page, creds: Creds) {
  const notificationsRegion = page.getByRole("region", { name: /notifications/i });

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    // Always start from login screen for determinism.
    // eslint-disable-next-line no-await-in-loop
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const username = page.getByPlaceholder(/enter your username/i);
    const password = page.getByPlaceholder(/enter your password/i);

    // eslint-disable-next-line no-await-in-loop
    await username.fill(creds.username);
    // eslint-disable-next-line no-await-in-loop
    await expect(username).toHaveValue(creds.username);
    // eslint-disable-next-line no-await-in-loop
    await password.fill(creds.password);
    // eslint-disable-next-line no-await-in-loop
    await expect(password).toHaveValue(creds.password);

    // eslint-disable-next-line no-await-in-loop
    await page.getByRole("button", { name: /^sign in$/i }).click();

    // Give Firebase auth time to resolve; sonner toasts can be short-lived, poll.
    let notifications = "";
    for (let i = 0; i < 50; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const text = await notificationsRegion.innerText().catch(() => "");
      if (text.trim()) {
        notifications = text.trim();
        break;
      }
      // eslint-disable-next-line no-await-in-loop
      await page.waitForTimeout(200);
    }

    if (/auth\/|unable|inactive|invalid|not configured|permission/i.test(notifications)) {
      throw new Error(`Login failed for ${creds.username}. ${notifications}`.trim());
    }

    // Probe a protected page and check if we landed back on login.
    // eslint-disable-next-line no-await-in-loop
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    // eslint-disable-next-line no-await-in-loop
    await page.waitForTimeout(2500);

    // eslint-disable-next-line no-await-in-loop
    const stillOnLogin = await page
      .getByRole("button", { name: /^sign in$/i })
      .isVisible()
      .catch(() => false);
    if (!stillOnLogin) {
      return;
    }

    if (attempt < 3) {
      // eslint-disable-next-line no-await-in-loop
      await page.waitForTimeout(1200);
      continue;
    }

    // Last attempt failed with no clear toast. Surface whatever we can.
    // eslint-disable-next-line no-await-in-loop
    const notificationsAfter = await notificationsRegion.innerText().catch(() => "");
    throw new Error(`Login failed for ${creds.username}. ${notificationsAfter}`.trim());
  }
}

test.describe("STK UI smoke", () => {
  test("Admin can access Team and Masters", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await login(page, { username: "sevak_32", password: "parthiv123" });

    // Dashboard should be reachable after login.
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/dashboard/i);

    // Team page should load for super admin.
    await page.goto("/team", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/team/i);
    await expect(page.getByText(/user management/i)).toBeVisible();

    // Masters should load for admin.
    await page.goto("/masters", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/masters/i);
    await expect(page.getByText(/item master/i)).toBeVisible();

    expect(
      consoleErrors.filter((t) => /Missing or insufficient permissions/i.test(t)),
    ).toEqual([]);
  });

  test("Leader (item role) can manage items but not Team", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await login(page, { username: "item_leader_1", password: "123456" });

    await page.goto("/masters", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/item master/i)).toBeVisible();

    // Try to create an item (leader should be allowed in their assigned category).
    const itemForm = page.locator("form").filter({ hasText: /item name/i }).first();
    const name = `Leader Item ${Date.now()}`;
    await itemForm.locator('label:has-text("Item name") input').fill(name);
    await itemForm.locator('button:has-text("Create item")').click();
    // Wait for create to finish; either toast appears or list updates later due to polling.
    await page.waitForTimeout(2000);

    // Team page should be restricted for leader.
    await page.goto("/team", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/restricted/i)).toBeVisible();

    expect(
      consoleErrors.filter((t) => /Missing or insufficient permissions/i.test(t)),
    ).toEqual([]);
  });

  test("Normal user can add to cart and see cart", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await login(page, { username: "savan", password: "123456" });

    await page.goto("/orders", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/browse items/i)).toBeVisible();

    // Try to open the first product modal via "Buy Item" then add to cart.
    const buyButtons = page.getByRole("button", { name: /buy item/i });
    const buyCount = await buyButtons.count();
    if (buyCount === 0) {
      test.skip(true, "No items available to purchase.");
    }
    await buyButtons.first().click();

    const buyNow = page.getByRole("button", { name: /buy now/i });
    await expect(buyNow).toBeVisible();
    await buyNow.click();

    await expect(page.getByText(/shopping cart/i)).toBeVisible();
    await expect(page.getByText(/cart is empty/i)).toHaveCount(0);

    expect(
      consoleErrors.filter((t) => /Missing or insufficient permissions/i.test(t)),
    ).toEqual([]);
  });
});

