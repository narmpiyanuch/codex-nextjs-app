import { expect, test } from "@playwright/test";
import { registerAndOpenDashboard } from "./helpers/auth";

test("creates, views, edits, and cancels a booking from the list", async ({ page }) => {
  await registerAndOpenDashboard(page);

  const runId = Date.now();
  const bookingTitle = `Playwright Planning ${runId}`;
  const editedTitle = `${bookingTitle} Updated`;
  const bookingMonth = (Math.floor(runId / 10) % 12) + 1;
  const bookingDay = (Math.floor(runId / 100) % 20) + 1;
  const bookingHour = (Math.floor(runId / 1000) % 8) + 8;
  const bookingDate = `2027-${String(bookingMonth).padStart(2, "0")}-${String(bookingDay).padStart(2, "0")}`;
  const startTime = `${String(bookingHour).padStart(2, "0")}:00`;
  const endTime = `${String(bookingHour + 1).padStart(2, "0")}:00`;
  const editedStartTime = `${String(bookingHour).padStart(2, "0")}:30`;
  const editedEndTime = `${String(bookingHour + 1).padStart(2, "0")}:30`;
  const displayedCreatedTime = `${formatDisplayTime(bookingDate, startTime)} - ${formatDisplayTime(bookingDate, endTime)}`;

  await page.getByRole("button", { name: "Book a Room" }).click();

  const createDialog = page.getByRole("dialog").filter({ hasText: "Create Booking" });
  await expect(createDialog).toBeVisible();
  await createDialog.getByLabel("Meeting Title").fill(bookingTitle);
  await createDialog.getByLabel("Select Room").selectOption({ label: "The Glass Pavilion (Capacity: 12)" });
  await createDialog.getByLabel("Date").fill(bookingDate);
  await createDialog.getByLabel("Start Time").fill(startTime);
  await createDialog.getByLabel("End Time").fill(endTime);

  await createDialog.locator("button").filter({ hasText: "Choose" }).click();
  await createDialog.locator("button").filter({ hasText: "aria.patel@example.com" }).click();
  await createDialog.locator("button").filter({ hasText: "sara.nguyen@example.com" }).click();
  await expect(createDialog.getByText("4 invitees selected")).toBeVisible();
  await expect(createDialog.getByText("Aria Patel").last()).toBeVisible();
  await expect(createDialog.getByText("Sara Nguyen").last()).toBeVisible();

  await createDialog.getByRole("button", { name: "Create Booking" }).click();

  await expect(page.getByText("Booking created successfully.")).toBeVisible();
  await expect(page.getByText(bookingTitle)).toBeVisible();

  const bookingRow = page.getByRole("row").filter({ hasText: bookingTitle });
  await bookingRow.getByRole("button", { name: "View" }).click();

  const infoDialog = page.getByRole("dialog").filter({ hasText: bookingTitle });
  await expect(infoDialog).toBeVisible();
  await expect(infoDialog.getByText(`The Glass Pavilion - ${formatDisplayDate(bookingDate)} - ${displayedCreatedTime}`)).toBeVisible();

  await infoDialog.getByRole("button", { name: "Edit Booking" }).click();

  const editDialog = page.getByRole("dialog").filter({ hasText: "Edit Booking" });
  await expect(editDialog).toBeVisible();
  await editDialog.getByLabel("Meeting Title").fill(editedTitle);
  await editDialog.getByLabel("Start Time").fill(editedStartTime);
  await editDialog.getByLabel("End Time").fill(editedEndTime);
  await editDialog.getByRole("button", { name: "Save Changes" }).click();

  await expect(page.getByText("Booking updated successfully.")).toBeVisible();
  await expect(page.getByText(editedTitle)).toBeVisible();

  const editedRow = page.getByRole("row").filter({ hasText: editedTitle });
  await editedRow.getByRole("button", { name: "Cancel" }).click();

  const cancelDialog = page.getByRole("dialog").filter({ hasText: "Cancel this booking?" });
  await expect(cancelDialog).toBeVisible();
  await expect(cancelDialog.getByText(editedTitle, { exact: true })).toBeVisible();
  await cancelDialog.getByRole("button", { name: "Confirm Cancel" }).click();

  await expect(page.getByText("Booking cancelled successfully.")).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: editedTitle })).toHaveCount(0);
});

test("opens booking information from the calendar and keeps month navigation anchored", async ({ page }) => {
  await registerAndOpenDashboard(page);

  await page.getByRole("button", { name: "Calendar" }).click();
  await page.locator("#schedule").scrollIntoViewIfNeeded();

  await page.locator("#schedule").getByRole("button", { name: "Product Roadmap" }).click();

  const infoDialog = page.getByRole("dialog").filter({ hasText: "Product Roadmap" });
  await expect(infoDialog).toBeVisible();
  await expect(infoDialog.getByText("Sky Lounge - May 12, 2026 - 10:00 AM - 11:30 AM")).toBeVisible();
  await infoDialog.getByRole("button", { exact: true, name: "Close" }).click();

  await page.locator("#schedule").getByRole("link", { name: "Next month" }).click();

  await expect(page).toHaveURL(/month=2026-06#schedule$/);
  await expect(page.locator("#schedule")).toBeInViewport();
});

function formatDisplayDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

function formatDisplayTime(date: string, time: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(`${date}T${time}:00.000Z`));
}
