import { expect, test, type Page } from "@playwright/test";

import { registerViaUi, uniqueTestUser } from "./helpers";

async function addToBacklog(
  page: Page,
  title: string,
  mediaType: "movie" | "tv" = "movie",
) {
  await page.goto(`/discover?type=${mediaType}`);
  await page.getByLabel("Search").fill(title);
  await page.getByRole("button", { name: "Search" }).click();
  await page
    .getByRole("button", { name: new RegExp(title) })
    .first()
    .click();
  await page.waitForURL(/\/media\/[0-9a-f-]+/);
  await page.getByRole("button", { name: "Add to Library" }).click();
  await expect(page.getByRole("combobox", { name: "Status" })).toBeVisible();
}

function currentPickTitle(page: Page) {
  return page.locator('a[href^="/media/"]').first().textContent();
}

test("skipping a tonight pick remembers it and shows a different one", async ({
  page,
}) => {
  await registerViaUi(page, uniqueTestUser());

  await addToBacklog(page, "Dune", "movie");
  await addToBacklog(page, "Severance", "tv");

  await page.goto("/library");
  console.log("LIBRARY:", await page.locator("main").innerText());

  await page.goto("/tonight");
  await expect(
    page.getByRole("button", { name: "Start tonight" }),
  ).toBeVisible();
  const firstPick = await currentPickTitle(page);
  expect(firstPick).toBeTruthy();

  await page.getByRole("button", { name: "Show me something else" }).click();
  await page.waitForURL("/tonight");
  await expect(
    page.getByRole("button", { name: "Start tonight" }),
  ).toBeVisible();

  const secondPick = await currentPickTitle(page);
  expect(secondPick).not.toEqual(firstPick);

  // Skipping the only remaining unskipped item falls back to showing the
  // full candidate list again rather than an empty state.
  await page.getByRole("button", { name: "Show me something else" }).click();
  await page.waitForURL("/tonight");
  await expect(
    page.getByRole("button", { name: "Start tonight" }),
  ).toBeVisible();
});
