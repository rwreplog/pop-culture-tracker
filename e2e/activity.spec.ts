import { expect, test } from "@playwright/test";

import { registerViaUi, uniqueTestUser } from "./helpers";

test("activity shows an empty state, then entries after adding and rating an item", async ({
  page,
}) => {
  await registerViaUi(page, uniqueTestUser());

  await page.goto("/activity");
  await expect(page.getByText("No activity yet")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Go to Discover" }),
  ).toBeVisible();

  await page.goto("/discover?type=tv");
  await page.getByLabel("Search").fill("severance");
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByRole("button", { name: /Severance/ }).click();
  await page.waitForURL(/\/media\/[0-9a-f-]+/);

  await page.getByRole("button", { name: "Add to Library" }).click();
  await page.getByRole("combobox", { name: "Rating" }).selectOption("8");

  await page.goto("/activity");
  await expect(page.getByText("No activity yet")).not.toBeVisible();
  await expect(page.getByText("Added Severance to your library")).toBeVisible();
  await expect(page.getByText("Rated Severance 4 stars")).toBeVisible();
});
