import { expect, test } from "@playwright/test";

import { registerViaUi, uniqueTestUser } from "./helpers";

test("unauthenticated visitors are redirected to sign in", async ({ page }) => {
  await page.goto("/library");
  await page.waitForURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("a visitor can register, land signed in, and sign out", async ({
  page,
}) => {
  const user = uniqueTestUser();

  await registerViaUi(page, user);

  await expect(
    page.getByRole("heading", { name: "Welcome to Geekery" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Account menu" }).click();
  await expect(page.getByText(user.email)).toBeVisible();
  await page.getByRole("menuitem", { name: "Sign out" }).click();

  await page.waitForURL(/\/login/);
});

test("a registered user can sign back in with the same credentials", async ({
  page,
}) => {
  const user = uniqueTestUser();
  await registerViaUi(page, user);

  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await page.waitForURL(/\/login/);

  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL("/");
  await expect(
    page.getByRole("heading", { name: "Welcome to Geekery" }),
  ).toBeVisible();
});

test("an invalid password is rejected with a clear error", async ({ page }) => {
  const user = uniqueTestUser();
  await registerViaUi(page, user);

  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await page.waitForURL(/\/login/);

  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill("the-wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("alert")).toHaveText(
    "Invalid email or password.",
  );
});
