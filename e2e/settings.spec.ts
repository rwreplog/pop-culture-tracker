import { expect, test } from "@playwright/test";

import { registerViaUi, uniqueTestUser, waitForServerAction } from "./helpers";

test("an incorrect current password is rejected with a clear error", async ({
  page,
}) => {
  const user = uniqueTestUser();
  await registerViaUi(page, user);

  await page.goto("/settings");
  await page.getByLabel("Current password").fill("the-wrong-password");
  await page.getByLabel("New password").fill("a-brand-new-password");
  await waitForServerAction(page, () =>
    page.getByRole("button", { name: "Update password" }).click(),
  );

  await expect(
    page.getByText("Current password is incorrect."),
  ).toBeVisible();
});

test("a user can change their password and sign in with the new one", async ({
  page,
}) => {
  const user = uniqueTestUser();
  await registerViaUi(page, user);

  const newPassword = "a-brand-new-password";
  await page.goto("/settings");
  await page.getByLabel("Current password").fill(user.password);
  await page.getByLabel("New password").fill(newPassword);
  await waitForServerAction(page, () =>
    page.getByRole("button", { name: "Update password" }).click(),
  );

  await expect(page.getByText("Password updated.")).toBeVisible();

  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await page.waitForURL(/\/login/);

  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(newPassword);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL("/");
  await expect(
    page.getByRole("heading", { name: "Welcome to Geekery" }),
  ).toBeVisible();
});
