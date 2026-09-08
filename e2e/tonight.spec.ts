import { expect, test, type Page } from "@playwright/test";

import { registerViaUi, uniqueTestUser } from "./helpers";

async function addToBacklog(
  page: Page,
  title: string,
  mediaType: "movie" | "tv" = "movie",
) {
  await page.goto(`/discover?type=${mediaType}`);
  await page.getByLabel("Search").fill(title);
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

  // The skip action re-renders /tonight in place (no navigation), so there's
  // no URL change to wait on — poll the pick title until the server action's
  // update lands instead of racing a single read against it.
  await page.getByRole("button", { name: "Show me something else" }).click();
  await expect.poll(() => currentPickTitle(page)).not.toEqual(firstPick);
  await expect(
    page.getByRole("button", { name: "Start tonight" }),
  ).toBeVisible();

  // Skipping the only remaining unskipped item falls back to showing the
  // full candidate list again rather than an empty state.
  const secondPick = await currentPickTitle(page);
  await page.getByRole("button", { name: "Show me something else" }).click();
  await expect.poll(() => currentPickTitle(page)).not.toEqual(secondPick);
  await expect(
    page.getByRole("button", { name: "Start tonight" }),
  ).toBeVisible();
});

test("picking a mood filters and explains the pick, and resets via Any mood", async ({
  page,
}) => {
  await registerViaUi(page, uniqueTestUser());

  await addToBacklog(page, "Dune", "movie");
  await addToBacklog(page, "Severance", "tv");

  await page.goto("/tonight");
  await expect(
    page.getByRole("button", { name: "Start tonight" }),
  ).toBeVisible();
  // No `mood` param yet, so a time-of-day guess is applied automatically.
  await expect(
    page.getByText(/Based on the time, we're leaning/),
  ).toBeVisible();

  await page.getByRole("link", { name: "Something thoughtful" }).click();
  await page.waitForURL(/mood=thoughtful/);
  await expect(
    page.getByRole("button", { name: "Start tonight" }),
  ).toBeVisible();
  await expect(page.getByText('Fits "Something thoughtful"')).toBeVisible();
  // An explicit mood choice replaces the time-of-day hint.
  await expect(
    page.getByText(/Based on the time, we're leaning/),
  ).not.toBeVisible();

  await page.getByRole("link", { name: "Any mood" }).click();
  await page.waitForURL(/mood=none/);
  await expect(
    page.getByRole("button", { name: "Start tonight" }),
  ).toBeVisible();
  await expect(
    page.getByText(/Based on the time, we're leaning/),
  ).not.toBeVisible();
});
