import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { registerViaUi, uniqueTestUser } from "./helpers";

async function expectNoSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const serious = results.violations.filter(
    (violation) =>
      violation.impact === "critical" || violation.impact === "serious",
  );

  expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
}

test("login page has no serious accessibility violations", async ({ page }) => {
  await page.goto("/login");
  await expectNoSeriousViolations(page);
});

test("register page has no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/register");
  await expectNoSeriousViolations(page);
});

test("signed-in app screens have no serious accessibility violations", async ({
  page,
}) => {
  await registerViaUi(page, uniqueTestUser());

  await page.goto("/");
  await expectNoSeriousViolations(page);

  await page.goto("/library");
  await expectNoSeriousViolations(page);

  await page.goto("/lists");
  await expectNoSeriousViolations(page);

  await page.goto("/activity");
  await expectNoSeriousViolations(page);

  await page.goto("/discover?type=tv");
  await page.getByLabel("Search").fill("severance");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText("Severance", { exact: true })).toBeVisible();
  await expectNoSeriousViolations(page);

  await page.getByRole("button", { name: /Severance/ }).click();
  await page.waitForURL(/\/media\/[0-9a-f-]+/);
  await expectNoSeriousViolations(page);
});
