import { expect, test, type Page } from "@playwright/test";

import { registerViaUi, uniqueTestUser, waitForServerAction } from "./helpers";

/**
 * Routes with a `loading.tsx` can briefly leave a second, hidden copy of the
 * page in the DOM (a Next.js streaming/reveal artifact — a `<div hidden>`
 * outside `<main>`, invisible to real users). `getByText`/plain element
 * locators don't filter out `hidden` elements the way accessible-role
 * queries do, so every lookup here is scoped to `main` to avoid matching
 * that invisible duplicate.
 */
function mainOf(page: Page) {
  return page.locator("main");
}

/** Quick-adds a fixture result straight from Discover's search results grid. */
async function quickAdd(
  page: Page,
  mediaType: "movie" | "tv" | "game",
  query: string,
) {
  await page.goto(`/discover?type=${mediaType}`);
  const main = mainOf(page);
  await main.getByLabel("Search").fill(query);
  await waitForServerAction(page, () =>
    main.getByRole("button", { name: "Add" }).click(),
  );
}

async function rate(page: Page, title: string, stars: number) {
  await page.goto("/library");
  const href = await mainOf(page)
    .locator('a[href^="/media/"]')
    .filter({ hasText: title })
    .first()
    .getAttribute("href");
  await page.goto(href!);
  await waitForServerAction(page, () =>
    mainOf(page)
      .getByRole("radio", { name: `Rate ${stars} stars` })
      .click(),
  );
}

test("search, sort, and switch between grid and list views in Library", async ({
  page,
}) => {
  await registerViaUi(page, uniqueTestUser());

  await quickAdd(page, "game", "baldur");
  await quickAdd(page, "movie", "part two");
  await quickAdd(page, "tv", "severance");

  await page.goto("/library");
  const main = mainOf(page);
  await expect(
    main.getByText("Baldur's Gate 3", { exact: true }),
  ).toBeVisible();
  await expect(main.getByText("Dune: Part Two", { exact: true })).toBeVisible();
  await expect(main.getByText("Severance", { exact: true })).toBeVisible();

  // Search narrows to titles matching the query, and clearing it restores
  // the full list.
  await main.getByPlaceholder("Search your library…").fill("dune");
  await expect(main.getByText("Dune: Part Two", { exact: true })).toBeVisible();
  await expect(
    main.getByText("Baldur's Gate 3", { exact: true }),
  ).not.toBeVisible();
  await expect(main.getByText("Severance", { exact: true })).not.toBeVisible();

  await main.getByPlaceholder("Search your library…").fill("");
  await expect(
    main.getByText("Baldur's Gate 3", { exact: true }),
  ).toBeVisible();
  await expect(main.getByText("Severance", { exact: true })).toBeVisible();

  // Sorting by title orders items alphabetically regardless of media type.
  await main.getByRole("combobox", { name: "Sort" }).click();
  await page.getByRole("option", { name: "Title A–Z" }).click();
  await expect(main.locator('a[href^="/media/"]')).toContainText([
    "Baldur's Gate 3",
    "Dune: Part Two",
    "Severance",
  ]);

  // Sorting by rating orders highest-rated first, with unrated items last.
  await rate(page, "Severance", 5);
  await rate(page, "Baldur's Gate 3", 2);

  await page.goto("/library?sort=rating");
  await expect(main.locator('a[href^="/media/"]')).toContainText([
    "Severance",
    "Baldur's Gate 3",
    "Dune: Part Two",
  ]);

  // Grid is the default view; toggling to list swaps the layout and back.
  await expect(main.getByRole("button", { name: "Grid view" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(main.getByText("Game · 2023")).not.toBeVisible();

  await main.getByRole("button", { name: "List view" }).click();
  await expect(main.getByRole("button", { name: "List view" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(main.getByText("Game · 2023")).toBeVisible();

  await main.getByRole("button", { name: "Grid view" }).click();
  await expect(main.getByRole("button", { name: "Grid view" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(main.getByText("Game · 2023")).not.toBeVisible();
});
