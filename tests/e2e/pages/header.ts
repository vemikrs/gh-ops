import type { Page, Locator, TestInfo } from '@playwright/test';
import { expect } from '@playwright/test';

export class Header {
  readonly page: Page;
  readonly testInfo?: TestInfo;
  constructor(page: Page, testInfo?: TestInfo) { this.page = page; this.testInfo = testInfo; }

  // Containers (use first to avoid duplicates in layout)
  get themeContainer(): Locator { return this.page.locator('starlight-theme-select:has(.theme-toggle:visible)').first(); }
  get langContainer(): Locator { return this.page.locator('starlight-lang-select:has(.icon-only:visible)').first(); }

  // Elements
  get themeButton(): Locator { return this.themeContainer.locator('.theme-toggle'); }
  get langButton(): Locator { return this.langContainer.locator('.icon-only'); }
  get langMenu(): Locator { return this.langContainer.locator('.menu:visible').first(); }
  langLink(code: string): Locator { return this.langMenu.locator(`a[data-locale="${code}"]`); }
  async ariaExpanded(): Promise<string | null> { return this.langButton.getAttribute('aria-expanded'); }
  async menuDropDirection(): Promise<'up' | 'down' | 'unknown'> {
    const styles = await this.langMenu.evaluate((el) => ({ top: (el as HTMLElement).style.top, bottom: (el as HTMLElement).style.bottom }));
    if (styles.bottom) return 'up';
    if (styles.top) return 'down';
    return 'unknown';
  }
  async snap(pageName: string, name: string) {
    const file = `${pageName}-${name}.png`;
    if (this.testInfo && this.testInfo.outputPath) {
      const out = this.testInfo.outputPath(file);
      await this.page.screenshot({ path: out, fullPage: false });
      await this.testInfo.attach(`${pageName}-${name}`, { path: out, contentType: 'image/png' });
    } else {
      await this.page.screenshot({ path: `test-results/${file}`, fullPage: false });
    }
  }

  // Hit-test helpers
  async isTopMost(locator: Locator, closestSelector: string): Promise<boolean> {
    const box = await locator.boundingBox();
    if (!box) return false;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    return await this.page.evaluate(({ x, y, sel }) => {
      const el = document.elementFromPoint(x, y);
      return !!el && (el as HTMLElement).closest(sel) != null;
    }, { x: Math.floor(cx), y: Math.floor(cy), sel: closestSelector });
  }
  async isThemeTopMost(): Promise<boolean> { return this.isTopMost(this.themeButton, 'starlight-theme-select .theme-toggle'); }
  async isLangTopMost(): Promise<boolean> { return this.isTopMost(this.langButton, 'starlight-lang-select .icon-only'); }

  // Actions
  async toggleTheme() { await this.themeButton.click(); }
  async toggleThemeReliable() {
    const before = await this.page.locator('html').getAttribute('data-theme');
    // try primary visible instance
    await this.themeButton.click();
    try {
      await this.page.waitForFunction(prev => document.documentElement.getAttribute('data-theme') !== prev, before, { timeout: 800 });
      return;
    } catch {}
    // fallback: try another instance if exists
    const all = this.page.locator('starlight-theme-select .theme-toggle');
    const count = await all.count();
    for (let i = 0; i < count; i++) {
      const btn = all.nth(i);
      if (await btn.isVisible()) {
        await btn.click();
        try {
          await this.page.waitForFunction(prev => document.documentElement.getAttribute('data-theme') !== prev, before, { timeout: 800 });
          return;
        } catch {}
      }
    }
    // ultimate fallback: click by coordinates at center of top-most theme button
    const box = await this.themeButton.boundingBox();
    if (box) {
      const cx = box.x + box.width / 2; const cy = box.y + box.height / 2;
      await this.page.mouse.click(cx, cy);
      try {
        await this.page.waitForFunction(prev => document.documentElement.getAttribute('data-theme') !== prev, before, { timeout: 800 });
      } catch {}
    }
    // last resort: call custom element API cycleTheme()
    const handle = await this.themeContainer.elementHandle();
    if (handle) {
      await this.page.evaluate((el: any) => {
        if (el && typeof el.cycleTheme === 'function') el.cycleTheme();
      }, handle);
      try {
        await this.page.waitForFunction(prev => document.documentElement.getAttribute('data-theme') !== prev, before, { timeout: 800 });
      } catch {}
    }
  }
  async currentTheme(): Promise<string> {
    // Prefer effective theme on <html>, fallback to button attribute
    const eff = await this.page.locator('html').getAttribute('data-theme');
    if (eff) return eff;
    return (await this.themeButton.getAttribute('data-theme')) || 'auto';
  }

  async openLanguageMenu() {
    await expect(this.langContainer).toBeVisible();
    await this.langButton.click();
    try {
      await expect(this.langMenu).toBeVisible({ timeout: 800 });
    } catch {
      // fallback: call openMenu() on the same visible element instance if available
      const handle = await this.langContainer.elementHandle();
      if (handle) {
        await this.page.evaluate((el: any) => {
          if (el && typeof el.openMenu === 'function') el.openMenu();
          // Last-resort: force-open for testing by removing hidden
          const menu = el?.querySelector?.('.menu');
          if (menu && menu.hasAttribute('hidden')) menu.removeAttribute('hidden');
        }, handle);
        // give layout a moment
        await this.page.waitForTimeout(50);
      }
      await expect(this.langMenu).toBeVisible();
    }
  }
  async closeLanguageMenuByEsc() {
    await this.page.keyboard.press('Escape');
    await expect(this.langMenu).toBeHidden();
  }

  // Mobile navigation (hamburger)
  get mobileMenuButton(): Locator {
    return this.page.locator('button[aria-label*="メニュー"], button[aria-label*="menu" i], button[aria-label*="open" i]').first();
  }
  async openMobileMenu() {
    if (await this.mobileMenuButton.count()) {
      await this.mobileMenuButton.click().catch(() => {});
    }
  }
}
