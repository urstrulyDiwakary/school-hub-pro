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

// -------------------------------------------------------------------------
// PDF content assertions — verify the exported PDF includes the student
// name and the date range header for both admin and teacher routes.
// -------------------------------------------------------------------------

import { promises as fs } from "node:fs";
import { PDFParse } from "pdf-parse";

async function downloadAndParsePdf(page: import("@playwright/test").Page, role: "admin" | "teacher") {
  const route = role === "admin" ? "/students?e2e=studentDetail" : "/teacher/dashboard?e2e=studentDetail";
  await page.goto(route);

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  await dialog.getByRole("button", { name: /export/i }).click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    menu.getByRole("menuitem", { name: /download pdf/i }).click(),
  ]);

  const filename = download.suggestedFilename();
  const path = await download.path();
  if (!path) throw new Error("Download did not complete");
  const data = await fs.readFile(path);
  const parser = new PDFParse({ data: new Uint8Array(data) });
  const result = await parser.getText();
  return { filename, text: result.text };
}

test.describe("Student Detail PDF — content for admin vs teacher", () => {
  test("admin PDF includes student name and date range", async ({ page }) => {
    const { filename, text } = await downloadAndParsePdf(page, "admin");

    expect(filename).toMatch(/E2E_Test_Student_report\.pdf$/);
    expect(text).toContain("E2E Test Student");
    // The fixture seeds a deterministic 30-day window; the PDF header includes
    // a "Range: YYYY-MM-DD to YYYY-MM-DD" line.
    expect(text).toMatch(/Range:\s+\d{4}-\d{2}-\d{2}\s+to\s+\d{4}-\d{2}-\d{2}/);
    expect(text).toContain("Attendance Summary");
  });

  test("teacher PDF includes student name and date range", async ({ page }) => {
    const { filename, text } = await downloadAndParsePdf(page, "teacher");

    expect(filename).toMatch(/E2E_Test_Student_report\.pdf$/);
    expect(text).toContain("E2E Test Student");
    expect(text).toMatch(/Range:\s+\d{4}-\d{2}-\d{2}\s+to\s+\d{4}-\d{2}-\d{2}/);
    // Sanity: same content shape regardless of role
    expect(text).toContain("Attendance Summary");
  });
});
