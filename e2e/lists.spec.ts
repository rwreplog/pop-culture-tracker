import { expect, test } from "@playwright/test";

import { registerViaUi, uniqueTestUser } from "./helpers";

async function resolveSearchResult(
  page: import("@playwright/test").Page,
  type: string,
  query: string,
) {
  await page.goto(`/discover?type=${type}`);
  await page.getByLabel("Search").fill(query);
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByRole("button", { name: new RegExp(query, "i") }).click();
  await page.waitForURL(/\/media\/[0-9a-f-]+/);
}

test("create a list, add items, reorder, remove, and delete", async ({
  page,
}) => {
  await registerViaUi(page, uniqueTestUser());

  // The "Add to List" picker only appears once at least one list exists,
  // so create the list first, from the Lists screen.
  await page.goto("/lists");
  await page.getByRole("button", { name: "Create list" }).click();
  await page.getByLabel("Name").fill("My List");
  await page.getByRole("button", { name: "Create" }).click();
  await page.waitForURL(/\/lists\/[0-9a-f-]+/);
  const listUrl = page.url();

  await resolveSearchResult(page, "tv", "severance");
  await page.getByRole("button", { name: "Add to List" }).click();

  await resolveSearchResult(page, "book", "project hail mary");
  await page.getByRole("button", { name: "Add to List" }).click();

  await page.goto(listUrl);
  await expect(page.getByText("Severance", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Project Hail Mary", { exact: true }),
  ).toBeVisible();

  // Project Hail Mary was added second, so it starts below Severance.
  // Move it up and confirm the order actually persisted.
  const rows = page.locator("li");
  await expect(rows.nth(0)).toContainText("Severance");
  await expect(rows.nth(1)).toContainText("Project Hail Mary");

  await rows.nth(1).getByRole("button", { name: "Move up" }).click();
  await page.reload();
  await expect(rows.nth(0)).toContainText("Project Hail Mary");
  await expect(rows.nth(1)).toContainText("Severance");

  await rows
    .filter({ hasText: "Severance" })
    .getByRole("button", { name: "Remove from list" })
    .click();
  await expect(page.getByText("Severance", { exact: true })).not.toBeVisible();
  await expect(
    page.getByText("Project Hail Mary", { exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Delete list" }).click();
  await page.waitForURL("/lists");
  await expect(page.getByText("My List")).not.toBeVisible();
});
