import { expect, type Page } from "@playwright/test";

export type TestUser = {
  email: string;
  name: string;
  password: string;
};

export function createTestUser(prefix = "playwright"): TestUser {
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    email: `${prefix}-${runId}@example.com`,
    name: "Playwright User",
    password: "password123",
  };
}

export async function registerAndOpenDashboard(page: Page, user = createTestUser()) {
  await page.goto("/register");

  await page.getByLabel("Name").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Create your account" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText(`Sign in as ${user.name}`)).toBeVisible();

  return user;
}
