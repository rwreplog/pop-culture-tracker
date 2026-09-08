import { expect, test } from "@playwright/test";

import {
  registerViaUi,
  selectComboboxOption,
  uniqueTestUser,
  waitForServerAction,
} from "./helpers";

test("create a goal, track progress as items are completed, then delete it", async ({
  page,
}) => {
  await registerViaUi(page, uniqueTestUser());

  await page.goto("/discover?type=movie");
  await page.getByLabel("Search").fill("Dune");
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByRole("button", { name: /Dune/ }).first().click();
  await page.waitForURL(/\/media\/[0-9a-f-]+/);
  await page.getByRole("button", { name: "Add to Library" }).click();
  await expect(page.getByRole("combobox", { name: "Status" })).toBeVisible();

  await page.goto("/goals");
  await page.getByRole("button", { name: "Add goal" }).click();
  await page.getByLabel("How many").fill("1");
  await selectComboboxOption(page, "Media type", "Movie");
  await page.getByRole("button", { name: "Add goal", exact: true }).click();

  await expect(page.getByText(/1 Movies in \d{4}/)).toBeVisible();
  await expect(page.getByText("0 of 1 completed")).toBeVisible();

  await page.goto("/library");
  await page.getByRole("link", { name: /Dune/ }).first().click();
  await waitForServerAction(page, () =>
    selectComboboxOption(page, "Status", "Watched"),
  );

  await page.goto("/goals");
  await expect(page.getByText("1 of 1 completed — achieved!")).toBeVisible();

  await page.getByRole("button", { name: "Delete goal" }).click();
  await waitForServerAction(page, () =>
    page.getByRole("button", { name: "Delete", exact: true }).click(),
  );
  await expect(page.getByText(/Movies in \d{4}/)).not.toBeVisible();
});
