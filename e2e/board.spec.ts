import { expect, test } from "@playwright/test";
import { dismissTour, login } from "./helpers";

// Navigate to the Workshop project's board before each test
test.describe("Board", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto("/projects");
    await page.waitForSelector('[class*=font-extrabold]:has-text("Projects")');
    await dismissTour(page);

    // Open the Workshop project board
    const workshopCard = page.locator("[class*=rounded]").filter({ hasText: "Workshop" }).first();
    await workshopCard.getByRole("button", { name: "Board" }).click();
    await expect(page).toHaveURL(/\/board/);
    // Wait for the board to load
    await page.waitForSelector("text=Quick add");
  });

  test("displays the three columns", async ({ page }) => {
    // Column titles from BoardPage: 'To do', 'Doing', 'Done'
    await expect(page.getByText("To do", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Doing", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Done", { exact: true }).first()).toBeVisible();
  });

  test("creates a card via Quick Add button", async ({ page }) => {
    const title = `Card ${Date.now()}`;
    await page.locator("#quick-add").fill(title);
    await page.locator("#quick-add-submit").click();

    await expect(page.getByText(title)).toBeVisible({ timeout: 5000 });
    // Input should be cleared after submit
    await expect(page.locator("#quick-add")).toHaveValue("");
  });

  test("creates a card via Ctrl+Enter shortcut", async ({ page }) => {
    const title = `ShortcutCard ${Date.now()}`;
    await page.locator("#quick-add").fill(title);
    // On macOS headless Chromium navigator.platform = MacIntel → metaKey needed
    await page.locator("#quick-add").press("Meta+Enter");

    await expect(page.getByText(title)).toBeVisible({ timeout: 5000 });
  });

  test("shows validation error when title is empty", async ({ page }) => {
    // Clear the input to be sure it's empty
    await page.locator("#quick-add").fill("");
    await page.locator("#quick-add-submit").click();
    // Card count should remain the same — no new empty card
    await expect(page.getByText("Title is too short").or(page.locator("#quick-add"))).toBeTruthy();
  });

  test("keyboard shortcut 'n' focuses quick-add input", async ({ page }) => {
    // Click the 'Quick add' heading (exact=true avoids matching 'focus quick add' hint)
    await page.getByText("Quick add", { exact: true }).click();

    // Press "n" — should focus the quick-add input
    await page.keyboard.press("n");
    await expect(page.locator("#quick-add")).toBeFocused();
  });

  test("moves a card right using the → button", async ({ page }) => {
    // Create a card so we always have one to move
    const title = `Moveable ${Date.now()}`;
    await page.locator("#quick-add").fill(title);
    await page.locator("#quick-add-submit").click();
    await expect(page.getByText(title)).toBeVisible({ timeout: 5000 });

    // Find the card and click its → button (.first() since it may resolve both ← and → in strict mode)
    const cardEl = page.locator("[class*=rounded]").filter({ hasText: title }).first();
    await cardEl.getByRole("button", { name: "→" }).first().click();

    // Verify the card now appears in the #doing column section
    await expect(page.locator("#doing").getByText(title)).toBeVisible({ timeout: 5000 });
  });

  test("back arrow navigates to projects list", async ({ page }) => {
    await page.goBack();
    await expect(page).toHaveURL(/\/projects/);
  });
});
