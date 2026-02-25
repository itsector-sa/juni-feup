import { expect, test } from "@playwright/test";
import { dismissTour, login } from "./helpers";

test.describe("Projects CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/projects");
    await page.waitForSelector('[class*=font-extrabold]:has-text("Projects")');
    await dismissTour(page);
  });

  test("displays the projects page with at least one project", async ({ page }) => {
    // Use main-scoped locator to avoid strict mode violation with sidebar link
    await expect(page.getByRole("main").getByText("Projects")).toBeVisible();
    // The seeded "Workshop" project should be visible
    await expect(page.getByText("Workshop")).toBeVisible();
  });

  test("creates a new project", async ({ page }) => {
    const projectName = `E2E Project ${Date.now()}`;

    await page.getByRole("button", { name: "New" }).click();
    await expect(page.getByText("New project")).toBeVisible();

    // Fill name field (first empty input in the form)
    await page.locator("input").nth(1).fill(projectName);
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText(projectName)).toBeVisible({ timeout: 5000 });
  });

  test("shows validation error when name is too short", async ({ page }) => {
    await page.getByRole("button", { name: "New" }).click();
    await page.locator("input").nth(1).fill("X");
    await page.getByRole("button", { name: "Save" }).click();

    // Zod rejects single-char name → toast "Validation failed" appears
    await expect(page.getByText("Validation failed").first()).toBeVisible({ timeout: 3000 });
  });

  test("edits an existing project", async ({ page }) => {
    // Click Edit on the Workshop project card
    const workshopCard = page.locator("[class*=rounded]").filter({ hasText: "Workshop" }).first();
    await workshopCard.getByRole("button", { name: "Edit" }).click();
    await expect(page.getByText("Edit project")).toBeVisible();

    const nameInput = page.locator("input").nth(1);
    await nameInput.fill("Workshop Updated");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Workshop Updated")).toBeVisible({ timeout: 5000 });
  });

  test("deletes a project", async ({ page }) => {
    // First create a project to delete so we don't destroy seed data
    const name = `Delete Me ${Date.now()}`;
    await page.getByRole("button", { name: "New" }).click();
    await page.locator("input").nth(1).fill(name);
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(name)).toBeVisible({ timeout: 5000 });

    // Now delete it
    const card = page.locator("[class*=rounded]").filter({ hasText: name }).first();
    await card.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText(name)).not.toBeVisible({ timeout: 5000 });
  });

  test("can open board from project card", async ({ page }) => {
    const workshopCard = page.locator("[class*=rounded]").filter({ hasText: "Workshop" }).first();
    await workshopCard.getByRole("button", { name: "Board" }).click();
    await expect(page).toHaveURL(/\/board/);
    await expect(page.getByText(/todo|doing|done/i).first()).toBeVisible();
  });

  test("search filters projects by name", async ({ page }) => {
    // Create a uniquely-named project
    const name = `Searchable ${Date.now()}`;
    await page.getByRole("button", { name: "New" }).click();
    await page.locator("input").nth(1).fill(name);
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(name)).toBeVisible({ timeout: 5000 });

    // Search for it
    await page.getByPlaceholder("Search...").fill("Searchable");
    await expect(page.getByText(name)).toBeVisible();
    // Workshop card should be hidden in the main content (sidebar has hardcoded 'Workshop base' text)
    await expect(page.getByRole("main").getByText("Workshop", { exact: true })).not.toBeVisible();
  });
});
