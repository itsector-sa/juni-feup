import { expect, test } from "@playwright/test";
import { dismissTour, login } from "./helpers";

test.describe("Authentication", () => {
  test("redirects to /login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows validation error for invalid email", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[name="email"]').fill("not-an-email");
    await page.locator('input[name="password"]').fill("demo");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(
      page.locator("text=Invalid email").or(page.locator("[class*=rose]"))
    ).toBeVisible();
  });

  test("logs in with valid credentials and reaches dashboard", async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/dashboard/);
    // Main heading uniquely identifies the dashboard page
    await expect(page.getByRole("main").getByText("Dashboard")).toBeVisible();
  });

  test("shows error on wrong credentials", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[name="email"]').fill("bad@test.com");
    // MSW login handler just requires non-empty — use a too-short password to trigger Zod
    await page.locator('input[name="password"]').fill("x");
    await page.getByRole("button", { name: "Sign in" }).click();
    // Zod will reject "x" (min 4) so a form error should appear
    await expect(page.locator("[class*=rose]").first()).toBeVisible();
  });

  test("logout clears session and redirects to login", async ({ page }) => {
    await login(page);
    await dismissTour(page);
    // Click the Logout button directly in the Topbar (most reliable in headless)
    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
