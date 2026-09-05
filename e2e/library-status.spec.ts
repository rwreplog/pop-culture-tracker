import { expect, test } from "@playwright/test";

import { registerViaUi, uniqueTestUser, waitForServerAction } from "./helpers";

test("changing status on the media detail page is reflected in library and dashboard", async ({
  page,
}) => {
  await registerViaUi(page, uniqueTestUser());

  await page.goto("/discover?type=tv");
  await page.getByLabel("Search").fill("severance");
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByRole("button", { name: /Severance/ }).click();
  await page.waitForURL(/\/media\/[0-9a-f-]+/);
  const mediaUrl = page.url();

  await page.getByRole("button", { name: "Add to Library" }).click();
  await expect(page.getByRole("combobox", { name: "Status" })).toHaveValue(
    "want",
  );

  await page.goto("/library");
  await expect(page.getByText("Want to Experience")).toBeVisible();

  await page.goto(mediaUrl);
  await waitForServerAction(page, () =>
    page.getByRole("combobox", { name: "Status" }).selectOption("in_progress"),
  );
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Continue" })).toBeVisible();

  await page.goto(mediaUrl);
  await waitForServerAction(page, () =>
    page.getByRole("combobox", { name: "Status" }).selectOption("completed"),
  );

  await page.goto("/library");
  await expect(page.getByText("Completed")).toBeVisible();

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
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByRole("button", { name: /Severance/ }).click();
  await page.waitForURL(/\/media\/[0-9a-f-]+/);

  await page.getByRole("button", { name: "Add to Library" }).click();
  await expect(page.getByRole("combobox", { name: "Status" })).toBeVisible();

  await page.getByRole("button", { name: "Remove from Library" }).click();
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
