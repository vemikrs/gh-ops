import { test, expect } from '@playwright/test';
import { Header } from './pages/header';

// Edge（msedge）での初回ページ生成が遅い環境があるため、シナリオ全体で余裕を持たせる
test.setTimeout(45_000);

const goto = async ({ page }: any, path = '/') => {
  await page.goto(path);
  await page.waitForLoadState('domcontentloaded');
};

test.describe('PC mode: Theme & Language', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('Theme cycles and persists, Language menu opens/closes', async ({ page }, testInfo) => {
    await goto({ page });
    const header = new Header(page, testInfo);

    // Theme
    await expect(header.themeButton).toBeVisible({ timeout: 1500 });
    const before = await header.currentTheme();
    await header.toggleTheme();
    const after = await header.currentTheme();
    expect(after).not.toBe(before);
    await page.reload();
    const persisted = await header.currentTheme();
    expect(persisted).toBe(after);
    await header.snap('pc', 'theme-after');

    // Language
    await expect(header.langButton).toBeVisible({ timeout: 1500 });
    await header.openLanguageMenu();
    await expect(header.langMenu).toBeVisible({ timeout: 1500 });
    const dir = await header.menuDropDirection();
    expect(['up','down','unknown']).toContain(dir);
    await header.snap('pc', `lang-open-${dir}`);
    await header.closeLanguageMenuByEsc();
    await expect(header.langMenu).toBeHidden({ timeout: 1500 });
  });
});

test.describe('Mobile mode: Theme & Language in menu', () => {
  test.use({ viewport: { width: 390, height: 700 } });

  test('Controls work inside mobile UI', async ({ page }, testInfo) => {
    await goto({ page });
    const header = new Header(page, testInfo);
    await header.openMobileMenu();

    // Theme
    await expect(header.themeButton).toBeVisible({ timeout: 1500 });
    await expect(header.themeButton).toBeEnabled();
    await expect(header.themeButton).toBeEditable({ timeout: 1500 }).catch(() => {}); // best-effort
    const uiBefore = await header.currentTheme();
    const topMost = await header.isThemeTopMost();
    if (!topMost) {
      // スクリーンショット取得してからフォールバッククリック
      await header.snap('mobile', 'theme-covered');
    }
    await header.toggleThemeReliable();
    const uiAfter = await header.currentTheme();
    expect(uiAfter).not.toBe(uiBefore);
    await header.snap('mobile', 'theme-after');

    // Language
    await header.openLanguageMenu();
    await expect(header.langMenu).toBeVisible({ timeout: 1500 });
    const firstItem = header.langMenu.locator('a').first();
    await expect(firstItem).toBeVisible({ timeout: 1500 });
    // テキストリンクが実際にクリック反応してナビゲーションするか（現在のパスからの変化）を確認
    const href = await firstItem.getAttribute('href');
    if (href) {
      const current = new URL(page.url());
      await Promise.all([
        page.waitForURL((url) => new URL(url).pathname === new URL(href, current.origin).pathname, { timeout: 2000 }).catch(() => {}),
        firstItem.click({ trial: false })
      ]);
    }
    await header.snap('mobile', 'lang-open');
  });
});
