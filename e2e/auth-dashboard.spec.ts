import { expect, test } from "@playwright/test";
import { createTestUser, registerAndOpenDashboard } from "./helpers/auth";

test("registers, opens dashboard, and logs out", async ({ page }) => {
  const user = await registerAndOpenDashboard(page, createTestUser("auth"));

  await expect(page.getByRole("link", { name: "Reserve" })).toBeVisible();
  await expect(page.getByText(`Sign in as ${user.name}`)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Upcoming Bookings" })).toBeVisible();

  await page.getByRole("button", { name: "Log out" }).click();

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Access your dashboard" })).toBeVisible();
});
