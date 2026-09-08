import { expect, test } from "@playwright/test";

import {
  registerViaUi,
  selectComboboxOption,
  uniqueTestUser,
  waitForServerAction,
} from "./helpers";

test("dashboard shows a welcome empty state, then populated sections after adding an item", async ({
  page,
}) => {
  await registerViaUi(page, uniqueTestUser());

  await expect(
    page.getByRole("heading", { name: "Welcome to Geekery" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Go to Discover" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Go to Discover" }).click();
  await page.waitForURL(/\/discover/);

  await page.getByRole("link", { name: "TV" }).click();
  await page.getByLabel("Search").fill("severance");
  await selectComboboxOption(page, "Status", "Watching");
  await waitForServerAction(page, () =>
    page.getByRole("button", { name: "Add" }).click(),
  );

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Continue" })).toBeVisible();
  await expect(page.getByText("Severance", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Recent activity" }),
  ).toBeVisible();
});
