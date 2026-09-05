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
