import { expect, test } from "@playwright/test";

import { registerViaUi, uniqueTestUser, waitForServerAction } from "./helpers";

test("changing status on the media detail page is reflected in library and dashboard", async ({
  page,
}) => {
  await registerViaUi(page, uniqueTestUser());

  await page.goto("/discover?type=tv");
  await page.getByLabel("Search").fill("severance");
  await page.getByRole("button", { name: /Severance/ }).click();
  await page.waitForURL(/\/media\/[0-9a-f-]+/);
  const mediaUrl = page.url();

  await page.getByRole("button", { name: "Add to Library" }).click();
  await expect(
    page
      .getByRole("combobox", { name: "Status" })
      .locator('[data-slot="select-value"]'),
  ).toHaveText("Want to Watch");

  await page.goto("/library");
  await expect(page.getByText("Want to Watch")).toBeVisible();

  await page.goto(mediaUrl);
  await page.getByRole("combobox", { name: "Status" }).click();
  await waitForServerAction(page, () =>
    page.getByRole("option", { name: "Watching" }).click(),
  );
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Continue" })).toBeVisible();

  await page.goto(mediaUrl);
  await page.getByRole("combobox", { name: "Status" }).click();
  await waitForServerAction(page, () =>
    page.getByRole("option", { name: "Watched" }).click(),
  );

  await page.goto("/library");
  await expect(
    page.getByRole("link", { name: /Severance/ }).getByText("Watched"),
  ).toBeVisible();

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Recently completed" }),
  ).toBeVisible();
});

test("removing an item from the library clears it from Library and Dashboard", async ({
  page,
}) => {
  await registerViaUi(page, uniqueTestUser());

  await page.goto("/discover?type=tv");
  await page.getByLabel("Search").fill("severance");
  await page.getByRole("button", { name: /Severance/ }).click();
  await page.waitForURL(/\/media\/[0-9a-f-]+/);

  await page.getByRole("button", { name: "Add to Library" }).click();
  await expect(page.getByRole("combobox", { name: "Status" })).toBeVisible();

  await page.getByRole("button", { name: "Manage" }).click();
  await page.getByRole("menuitem", { name: "Remove from Library" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remove" })
    .click();
  await expect(
    page.getByRole("button", { name: "Add to Library" }),
  ).toBeVisible();

  await page.goto("/library");
  await expect(page.getByText("Nothing here yet")).toBeVisible();

  // Activity history persists after removal, so the dashboard isn't fully
  // empty — just check the removed item no longer shows up anywhere on it.
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Continue" }),
  ).not.toBeVisible();
  await expect(page.getByText("Severance", { exact: true })).not.toBeVisible();
});
