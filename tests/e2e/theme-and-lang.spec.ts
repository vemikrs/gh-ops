import { test, expect } from '@playwright/test';

const goto = async ({ page }: any, path = '/') => {
  await page.goto(path);
  await page.waitForLoadState('domcontentloaded');
};

test.describe('Header controls', () => {
  test('theme toggle cycles and persists', async ({ page }) => {
    await goto({ page });
    // header right controls: first theme button exists
    const themeBtn = page.locator('starlight-theme-select .theme-toggle');
    await expect(themeBtn).toBeVisible();
    // remember current and click to change
    const before = await themeBtn.getAttribute('data-theme');
    await themeBtn.click();
    const after = await themeBtn.getAttribute('data-theme');
    expect(after).not.toBe(before);
    // reload -> persistence check
    await page.reload();
    const persisted = await themeBtn.getAttribute('data-theme');
    expect(persisted).toBe(after);
  });

  test('language menu opens within viewport and closes with ESC', async ({ page }) => {
    await goto({ page });
    const langBtn = page.locator('starlight-lang-select .icon-only');
    await expect(langBtn).toBeVisible();
    await langBtn.click();
    const menu = page.locator('starlight-lang-select .menu');
    await expect(menu).toBeVisible();
    // menu should be within viewport (top or bottom set)
    const box = await menu.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual((await page.viewportSize())!.height + 2);
    }
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
  });
});

// Mobile viewport behavior
test.describe('Mobile menu behavior', () => {
  test.use({ viewport: { width: 390, height: 700 } });

  test('controls work in mobile menu', async ({ page }) => {
    await goto({ page });
    // open mobile nav (hamburger)
    const openBtn = page.locator('button[aria-label*="メニュー"], button[aria-label*="menu"], button[aria-label*="open"]');
    await openBtn.first().click().catch(() => {});

    // theme toggle inside header group should be clickable
    const themeBtn = page.locator('starlight-theme-select .theme-toggle');
    await expect(themeBtn).toBeVisible();
    const tBefore = await themeBtn.getAttribute('data-theme');
    await themeBtn.click();
    const tAfter = await themeBtn.getAttribute('data-theme');
    expect(tAfter).not.toBe(tBefore);

    // language menu opens and items are reachable
    const langBtn = page.locator('starlight-lang-select .icon-only');
    await langBtn.click();
    const menu = page.locator('starlight-lang-select .menu');
    await expect(menu).toBeVisible();
    // at least one item visible
    const firstItem = menu.locator('a').first();
    await expect(firstItem).toBeVisible();
  });
});
