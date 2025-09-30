import { test, expect } from '@playwright/test';
import { Header } from './pages/header';

test.setTimeout(45_000);
const goto = async ({ page }: any, path = '/') => {
  await page.goto(path);
  await page.waitForLoadState('domcontentloaded');
};

test.describe('Header controls', () => {
  test('theme toggle cycles and persists', async ({ page }, testInfo) => {
    await goto({ page });
    const header = new Header(page, testInfo);
    await expect(header.themeButton).toBeVisible();
    const before = await header.currentTheme();
  await header.toggleThemeReliable();
    const after = await header.currentTheme();
    expect(after).not.toBe(before);
    await page.reload();
    const persisted = await header.currentTheme();
    expect(persisted).toBe(after);
  });

  test('language menu opens within viewport and closes with ESC', async ({ page }, testInfo) => {
    await goto({ page });
    const header = new Header(page, testInfo);
    await expect(header.langButton).toBeVisible();
    await header.openLanguageMenu();
    const menu = header.langMenu;
    await expect(menu).toBeVisible();
    // menu should be within viewport (top or bottom set)
    const box = await menu.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual((await page.viewportSize())!.height + 2);
    }
    await header.closeLanguageMenuByEsc();
  });
});

// Mobile viewport behavior
test.describe('Mobile menu behavior', () => {
  test.use({ viewport: { width: 390, height: 700 } });

  test('controls work in mobile menu', async ({ page }, testInfo) => {
    await goto({ page });
    const header = new Header(page, testInfo);
    await header.openMobileMenu();

  await expect(header.themeButton).toBeVisible();
  const uiBefore = await header.currentTheme();
  const effBefore = await page.locator('html').getAttribute('data-theme');
  await header.toggleThemeReliable();
  const uiAfter = await header.currentTheme();
  const effAfter = await page.locator('html').getAttribute('data-theme');
  expect(uiAfter !== uiBefore || effAfter !== effBefore).toBeTruthy();

    await header.openLanguageMenu();
    const firstItem = header.langMenu.locator('a').first();
    await expect(firstItem).toBeVisible();
  });
});
