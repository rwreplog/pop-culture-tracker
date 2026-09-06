import type { Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

export function uniqueTestUser() {
  const id = randomUUID();
  return {
    name: "E2E Test User",
    email: `e2e-${id}@example.com`,
    password: `Test-password-${id}`,
  };
}

/** Registers a new user through the real UI and waits for the app shell to load. */
export async function registerViaUi(
  page: Page,
  user: ReturnType<typeof uniqueTestUser>,
) {
  await page.goto("/register");
  await page.getByLabel("Name").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("/");
}

/**
 * Server Actions submit in the background (React intercepts the form
 * submit), so a plain `.click()`/`.selectOption()` returns before the
 * mutation lands. Navigating away immediately after can abort the
 * in-flight request. Wrap the trigger so the test waits for the
 * Server Action's response before moving on.
 */
export async function waitForServerAction(
  page: Page,
  trigger: () => Promise<unknown>,
) {
  await Promise.all([
    page.waitForResponse(
      (response) => response.request().headers()["next-action"] !== undefined,
    ),
    trigger(),
  ]);
}

/**
 * Our `Select` components are Base UI comboboxes, not native `<select>`
 * elements, so `.selectOption()` doesn't apply. Open the trigger and click
 * the option by its visible label instead.
 */
export async function selectComboboxOption(
  page: Page,
  comboboxName: string,
  optionName: string | RegExp,
) {
  await page.getByRole("combobox", { name: comboboxName }).click();
  await page.getByRole("option", { name: optionName }).click();
}
