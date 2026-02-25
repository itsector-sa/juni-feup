import type { Page } from "@playwright/test";

export const TEST_EMAIL = "juni-feup@itsector.pt";
export const TEST_PASSWORD = "demo.juni-feup";

/** Marks the onboarding tour as seen so it never blocks E2E interactions. */
export async function skipOnboarding(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("onboarding:v3", JSON.stringify({ state: { seen: true }, version: 0 }));
  });
}

/**
 * Dismiss the onboarding tour overlay if it is currently visible.
 * Clicks the "Skip" button inside the tour dialog, or falls back to Escape.
 * Safe to call even when the tour is not showing.
 */
export async function dismissTour(page: Page) {
  try {
    const skip = page.getByRole("button", { name: "Skip" });
    if (await skip.isVisible({ timeout: 1000 })) {
      await skip.click({ force: true });
      // Wait until the backdrop is gone
      await page
        .waitForSelector('[role="dialog"]', { state: "detached", timeout: 3000 })
        .catch(() => {});
    }
  } catch {
    // Tour not present – nothing to do
  }
}

export async function login(page: Page) {
  await skipOnboarding(page);
  await page.goto("/login");
  // Inputs are registered with react-hook-form name attributes
  await page.locator('input[name="email"]').fill(TEST_EMAIL);
  await page.locator('input[name="password"]').fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  // Wait until redirected off the login page
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15000 });
  // Dismiss onboarding tour that auto-starts on /dashboard
  await dismissTour(page);
}
