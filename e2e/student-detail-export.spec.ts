/**
 * Smoke tests for the role-aware export dropdown in StudentDetailModal.
 *
 * Strategy:
 *   - Admin path: visit `/students?e2e=studentDetail` — the route is admin,
 *     so `resolveEffectivePermissions()` should yield CSV + PDF.
 *   - Teacher path: visit `/teacher/dashboard?e2e=studentDetail` — the route
 *     is teacher, so CSV must be hidden, only PDF should appear.
 *
 * The fixture (`E2EStudentDetailFixture`) auto-opens the modal when the
 * `?e2e=studentDetail` param is present. This avoids brittle navigation
 * through tables/rows and keeps the test focused on the guard.
 */

import { test, expect } from "@playwright/test";

test.describe("Student Detail export dropdown — role gating", () => {
  test("admin route shows CSV and PDF", async ({ page }) => {
    await page.goto("/students?e2e=studentDetail");

    // Modal opens automatically via the fixture
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("E2E Test Student");

    // Open the export dropdown
    await dialog.getByRole("button", { name: /export/i }).click();

    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: /download csv/i })).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: /download pdf/i })).toBeVisible();
  });

  test("teacher route hides CSV and shows only PDF", async ({ page }) => {
    await page.goto("/teacher/dashboard?e2e=studentDetail");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("E2E Test Student");

    await dialog.getByRole("button", { name: /export/i }).click();

    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    // Hard guarantee: CSV item must not exist for teacher
    await expect(menu.getByRole("menuitem", { name: /download csv/i })).toHaveCount(0);
    await expect(menu.getByRole("menuitem", { name: /download pdf/i })).toBeVisible();
  });

  test("teacher route still hides CSV after closing and reopening the menu", async ({ page }) => {
    await page.goto("/teacher/dashboard?e2e=studentDetail");
    const dialog = page.getByRole("dialog");
    const exportBtn = dialog.getByRole("button", { name: /export/i });

    await exportBtn.click();
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");

    await exportBtn.click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: /download csv/i })).toHaveCount(0);
  });
});
