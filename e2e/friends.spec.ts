import { expect, test } from "@playwright/test";

import { registerViaUi, uniqueTestUser, waitForServerAction } from "./helpers";

test("two users become friends and see each other's public list", async ({
  page,
  browser,
}) => {
  const userA = uniqueTestUser();
  const userB = uniqueTestUser();

  await registerViaUi(page, userA);
  await page.goto("/profile");
  const handleA = await page.getByLabel("Handle").inputValue();

  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await registerViaUi(pageB, userB);
  await pageB.goto("/profile");
  const handleB = await pageB.getByLabel("Handle").inputValue();
  expect(handleA).not.toBe(handleB);

  // A sends B a friend request by handle.
  await page.goto("/friends");
  await page.getByPlaceholder(/Their handle/).fill(handleB);
  await waitForServerAction(page, () =>
    page.getByRole("button", { name: "Add" }).click(),
  );
  await expect(page.getByText("Sent requests")).toBeVisible();

  // B sees it under Requests and accepts.
  await pageB.goto("/friends");
  await expect(pageB.getByText("Requests")).toBeVisible();
  await waitForServerAction(pageB, () =>
    pageB.getByRole("button", { name: "Accept" }).click(),
  );
  await expect(pageB.getByText("Friends (1)")).toBeVisible();

  // A's own view reflects the now-accepted friendship too.
  await page.goto("/friends");
  await expect(page.getByText("Friends (1)")).toBeVisible();

  // B creates a list, keeps it private, then makes a second one public.
  await pageB.goto("/lists");
  await pageB.getByRole("button", { name: "Create list" }).click();
  await pageB.getByLabel("Name").fill("Private List");
  await pageB.getByRole("button", { name: "Create" }).click();
  await pageB.waitForURL(/\/lists\/[0-9a-f-]+/);

  await pageB.goto("/lists");
  await pageB.getByRole("button", { name: "Create list" }).click();
  await pageB.getByLabel("Name").fill("Public List");
  await pageB.getByRole("button", { name: "Create" }).click();
  await pageB.waitForURL(/\/lists\/[0-9a-f-]+/);
  await waitForServerAction(pageB, () =>
    pageB.getByRole("button", { name: "Make public" }).click(),
  );
  await expect(pageB.getByText("Public", { exact: true })).toBeVisible();

  // A visits B's public profile: sees the public list, not the private
  // one, and the friend action reflects the accepted friendship.
  await page.goto(`/u/${handleB}`);
  await expect(page.getByText("Public List", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Private List", { exact: true }),
  ).not.toBeVisible();
  await expect(page.getByText("Remove friend")).toBeVisible();

  await contextB.close();
});
