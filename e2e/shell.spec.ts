import { expect, test } from "@playwright/test";

import { registerViaUi, uniqueTestUser } from "./helpers";

test.beforeEach(async ({ page }) => {
  await registerViaUi(page, uniqueTestUser());
});

test("home page renders the app shell and primary navigation", async ({
  page,
}) => {
  await expect(
    page.getByRole("link", { name: "Geekery", exact: true }),
  ).toBeVisible();

  const primaryNav = page.getByRole("navigation", { name: "Primary" }).first();
  await expect(primaryNav.getByRole("link", { name: "Library" })).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Welcome to Geekery" }),
  ).toBeVisible();
});

test("navigating to Library shows the library placeholder", async ({
  page,
}) => {
  const primaryNav = page.getByRole("navigation", { name: "Primary" }).first();
  await primaryNav.getByRole("link", { name: "Library" }).click();

  await expect(page).toHaveURL("/library");
  await expect(
    page.getByRole("heading", { name: "Your library" }),
  ).toBeVisible();
});
