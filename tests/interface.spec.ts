import { expect, test, type Locator } from "@playwright/test";

async function expectHighlightOn(item: Locator) {
  await expect.poll(() => item.evaluate((element) => {
    const highlight = element.closest(".glide")!.querySelector(".glide-highlight")!;
    const target = element.getBoundingClientRect();
    const actual = highlight.getBoundingClientRect();
    return Math.max(
      Math.abs(actual.x - target.x), Math.abs(actual.y - target.y),
      Math.abs(actual.width - target.width), Math.abs(actual.height - target.height),
    );
  })).toBeLessThan(1);
}

test("guide traps keyboard focus, expands criteria and restores its trigger", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "How we choose" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  const close = dialog.getByRole("button", { name: "Close guide" });
  await expect(dialog).toBeVisible();
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("link", { name: "Suggest a tool" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const score = dialog.getByRole("button", { name: "A score you can inspect" });
  await expect(score).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(score).toHaveAttribute("aria-expanded", "true");
  await expect(dialog.getByRole("link", { name: "Read the formula" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("one glide follows the exact hovered item and keyboard focus", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main", exact: true });
  const items = nav.locator("[data-glide-item]");
  const highlight = nav.locator(".glide-highlight");
  await expect(highlight).toHaveCount(1);
  await items.first().hover();
  await expect(highlight).toHaveCSS("opacity", "1");
  await expectHighlightOn(items.first());
  await items.last().hover();
  await expectHighlightOn(items.last());
  await page.mouse.move(0, 200);
  await expect(highlight).toHaveCSS("opacity", "0");
  await items.first().focus();
  await page.keyboard.press("Tab");
  await expect(items.nth(1)).toBeFocused();
  await expect(highlight).toHaveAttribute("data-instant", "true");
  await expectHighlightOn(items.nth(1));
});

test("touch does not leave a hover highlight, but keyboard focus still works", async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 1024, height: 768 } });
  const page = await context.newPage();
  try {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main", exact: true });
    const links = nav.getByRole("link");
    // Keep the page in place so the tap's focus state can be inspected.
    await links.first().evaluate((link) => link.addEventListener("click", (event) => event.preventDefault()));
    await links.first().tap();
    await expect(links.first()).toBeFocused();
    await expect(nav.locator(".glide-highlight")).toHaveCSS("opacity", "0");
    await page.keyboard.press("Tab");
    await expect(links.nth(1)).toBeFocused();
    await expect(nav.locator(".glide-highlight")).toHaveCSS("opacity", "1");
  } finally {
    await context.close();
  }
});

test("reduced motion removes glide, dialog and accordion transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main", exact: true });
  await nav.getByRole("link").first().focus();
  await expect(nav.locator(".glide-highlight")).toHaveCSS("transition-duration", "0s");
  await page.getByRole("button", { name: "How we choose" }).click();
  await expect(page.getByRole("dialog")).toHaveCSS("transition-duration", "0s");
  await expect(page.locator(".accordion-panel").first()).toHaveCSS("transition-duration", "0s");
});

test("sound opt-in persists and muting is synchronized across open tabs", async ({ page, context }) => {
  await page.goto("/");
  const other = await context.newPage();
  await other.goto("/");
  await page.getByRole("button", { name: "Preferences", exact: true }).click();
  await other.getByRole("button", { name: "Preferences", exact: true }).click();
  const sounds = page.getByRole("menuitemcheckbox", { name: "Interface sounds" });
  const otherSounds = other.getByRole("menuitemcheckbox", { name: "Interface sounds" });
  await expect(sounds).not.toBeChecked();
  await expect(otherSounds).not.toBeChecked();
  await sounds.click();
  await expect(sounds).toBeChecked();
  await expect(otherSounds).toBeChecked();
  await otherSounds.click();
  await expect(otherSounds).not.toBeChecked();
  await expect(sounds).not.toBeChecked();
  await sounds.click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Preferences", exact: true })).toBeFocused();
  await page.reload();
  await page.getByRole("button", { name: "Preferences", exact: true }).click();
  await expect(sounds).toBeChecked();
});

for (const width of [320, 390]) {
  test(`hero, footer and guide fit a ${width}px viewport in both themes`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    for (const theme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: theme });
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("contentinfo").getByRole("link", { name: /Know a good tool/ })).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
      await page.getByRole("button", { name: "How we choose" }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      const bounds = await dialog.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      await dialog.getByRole("button", { name: "Close guide" }).click();
    }
  });
}
