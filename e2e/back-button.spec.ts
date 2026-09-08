import { expect, test } from "@playwright/test";

import { registerViaUi, uniqueTestUser } from "./helpers";

test.beforeEach(async ({ page }) => {
  await registerViaUi(page, uniqueTestUser());
});

test("back button returns to the previous in-app page", async ({ page }) => {
  await page.goto("/lists");
  await page.getByRole("button", { name: "Create list" }).click();
  await page.getByLabel("Name").fill("My List");
  await page.getByRole("button", { name: "Create" }).click();
  await page.waitForURL(/\/lists\/[0-9a-f-]+/);

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page).toHaveURL("/lists");
});

test("back button falls back to a fixed destination on a direct visit", async ({
  page,
}) => {
  // A fresh goto() carries no referrer, simulating a bookmarked/typed URL
  // with no in-app history to go back to.
  await page.goto("/settings");

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page).toHaveURL("/profile");
});

test("icon-only back button on media detail returns to the previous page", async ({
  page,
}) => {
  await page.goto("/discover?type=tv");
  await page.getByLabel("Search").fill("severance");
  await page.getByRole("button", { name: /severance/i }).click();
  await page.waitForURL(/\/media\/[0-9a-f-]+/);

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page).toHaveURL(/\/discover/);
});
