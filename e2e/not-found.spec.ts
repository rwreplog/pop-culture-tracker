import { expect, test } from "@playwright/test";

import { registerViaUi, uniqueTestUser } from "./helpers";

test("visiting a nonexistent media id renders the not-found page", async ({
  page,
}) => {
  await registerViaUi(page, uniqueTestUser());

  await page.goto("/media/00000000-0000-0000-0000-000000000000");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Back to dashboard" }),
  ).toBeVisible();
});

test("visiting a nonexistent list id renders the not-found page", async ({
  page,
}) => {
  await registerViaUi(page, uniqueTestUser());

  await page.goto("/lists/00000000-0000-0000-0000-000000000000");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
});

test("visiting an unknown route renders the not-found page", async ({
  page,
}) => {
  await registerViaUi(page, uniqueTestUser());

  await page.goto("/this-route-does-not-exist");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
});
