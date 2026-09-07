import { expect, test } from "@playwright/test";

import { registerViaUi, uniqueTestUser, waitForServerAction } from "./helpers";

test("media detail: add, rate, favorite, add notes, and set progress", async ({
  page,
}) => {
  await registerViaUi(page, uniqueTestUser());

  await page.goto("/discover?type=tv");
  await page.getByLabel("Search").fill("severance");
  await page.getByRole("button", { name: "Search" }).click();

  // Clicking the card itself (not "Add") resolves the result and navigates
  // to its detail page.
  await page.getByRole("button", { name: /Severance/ }).click();
  await page.waitForURL(/\/media\/[0-9a-f-]+/);

  await expect(page.getByRole("heading", { name: "Severance" })).toBeVisible();

  await waitForServerAction(page, () =>
    page.getByRole("button", { name: "Add to Library" }).click(),
  );
  await expect(page.getByRole("combobox", { name: "Status" })).toBeVisible();

  await waitForServerAction(page, () =>
    page.getByRole("radio", { name: "Rate 4 stars" }).click(),
  );
  await waitForServerAction(page, () =>
    page.getByRole("button", { name: "Add to favorites" }).click(),
  );

  await page.getByLabel("Notes").fill("Great show.");
  await waitForServerAction(page, () =>
    page.getByRole("button", { name: "Save notes" }).click(),
  );

  await page.getByLabel("Season").fill("1");
  await page.getByLabel("Episode").fill("3");
  await waitForServerAction(page, () =>
    page.getByRole("button", { name: "Save progress" }).click(),
  );

  // Reload to confirm the changes were actually persisted, not just
  // reflected optimistically in the client.
  await page.reload();

  await expect(
    page.getByRole("radio", { name: "Rate 4 stars" }),
  ).toHaveAttribute("aria-checked", "true");
  await expect(
    page.getByRole("button", { name: "Remove from favorites" }),
  ).toBeVisible();
  await expect(page.getByLabel("Notes")).toHaveValue("Great show.");
  await expect(page.getByLabel("Season")).toHaveValue("1");
  await expect(page.getByLabel("Episode")).toHaveValue("3");
});
