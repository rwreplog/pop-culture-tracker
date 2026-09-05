import { expect, test } from "@playwright/test";

import { registerViaUi, uniqueTestUser } from "./helpers";

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

  await page.getByLabel("Search").fill("severance");
  await page.getByRole("button", { name: "Search" }).click();
  await page
    .getByRole("combobox", { name: "Status" })
    .selectOption("in_progress");
  await page.getByRole("button", { name: "Add" }).click();

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Continue" })).toBeVisible();
  await expect(page.getByText("Severance", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Recent activity" }),
  ).toBeVisible();
});
