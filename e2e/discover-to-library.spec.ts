import { expect, test } from "@playwright/test";

import { registerViaUi, uniqueTestUser, waitForServerAction } from "./helpers";

test("search, quick-add to library, and see it reflected on Library, Dashboard, and Activity", async ({
  page,
}) => {
  await registerViaUi(page, uniqueTestUser());

  await page.goto("/discover?type=tv");
  await page.getByLabel("Search").fill("severance");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page.getByText("Severance", { exact: true })).toBeVisible();

  await page
    .getByRole("combobox", { name: "Status" })
    .selectOption("in_progress");
  await waitForServerAction(page, () =>
    page.getByRole("button", { name: "Add" }).click(),
  );

  await page.goto("/library");
  await expect(page.getByText("Severance", { exact: true })).toBeVisible();
  await expect(page.getByText("Watching")).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Continue" })).toBeVisible();
  await expect(page.getByText("Severance", { exact: true })).toBeVisible();

  await page.goto("/activity");
  await expect(page.getByText("Started watching Severance")).toBeVisible();
  await expect(page.getByText("Added Severance to your library")).toBeVisible();
});
