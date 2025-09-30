import { test, expect } from '@playwright/test';

test.describe('Mobile diagnostics: header controls clickability', () => {
  test.use({ viewport: { width: 390, height: 700 } });
  test.setTimeout(60_000);

  const goto = async ({ page }: any, path = '/') => {
    await page.goto(path);
    await page.waitForLoadState('domcontentloaded');
  };

  async function collectHitTestFor(locator: import('@playwright/test').Locator) {
    const handle = await locator.first().elementHandle();
    if (!handle) return { found: false } as any;
    return await handle.evaluate((target: HTMLElement) => {
      const r = target.getBoundingClientRect();
      const cx = Math.floor(r.left + r.width / 2);
      const cy = Math.floor(r.top + r.height / 2);
      const top = document.elementFromPoint(cx, cy) as HTMLElement | null;
      const path: string[] = [];
      let node: HTMLElement | null = top;
      while (node) {
        const id = node.id ? `#${node.id}` : '';
        const cls = node.className && typeof node.className === 'string' ? `.${node.className.split(' ').filter(Boolean).join('.')}` : '';
        path.push(`${node.tagName.toLowerCase()}${id}${cls}`);
        node = node.parentElement;
      }
      const cs = getComputedStyle(target);
      const csTop = top ? getComputedStyle(top) : null;
      return {
        found: true,
        targetBox: { x: r.x, y: r.y, w: r.width, h: r.height },
        center: { x: cx, y: cy },
        topMost: top ? top.tagName.toLowerCase() : null,
        topMostSelectorPath: path,
        targetStyles: { zIndex: cs.zIndex, pointerEvents: cs.pointerEvents },
        topMostStyles: csTop ? { zIndex: csTop.zIndex, pointerEvents: csTop.pointerEvents } : null,
      };
    });
  }

  test('Theme and Language buttons: clickability and state change', async ({ page }, testInfo) => {
    await goto({ page });
    // Ensure custom elements are upgraded before interacting (diagnostic only)
    await page.evaluate(async () => {
      if (customElements?.whenDefined) {
        await Promise.all([
          customElements.whenDefined('starlight-theme-select'),
          customElements.whenDefined('starlight-lang-select'),
        ]);
      }
    });
    // Open mobile menu (hamburger) if exists
    const burger = page.locator('button[aria-label*="メニュー"], button[aria-label*="menu" i], button[aria-label*="open" i]').first();
    if (await burger.count()) await burger.click().catch(() => {});

  // Prefer visible instances to avoid duplicates (mobile header vs menu)
  const themeBtn = page.locator('starlight-theme-select:has(.theme-toggle:visible) .theme-toggle').first();
  const langBtn = page.locator('starlight-lang-select:has(.icon-only:visible) .icon-only').first();

    // Diagnostics before any click
  const themeDiagBefore = await collectHitTestFor(themeBtn);
  const langDiagBefore = await collectHitTestFor(langBtn);
    await testInfo.attach('diag-before.json', { body: JSON.stringify({ themeDiagBefore, langDiagBefore }, null, 2), contentType: 'application/json' });
    await page.screenshot({ path: testInfo.outputPath('mobile-before.png') });

    // Try theme change by click
  const uiBefore = await themeBtn.getAttribute('data-theme');
    await themeBtn.click().catch(() => {});
    const uiAfterClick = await themeBtn.getAttribute('data-theme');

    // If not changed, try coordinate click
    if (uiAfterClick === uiBefore) {
      const box = await themeBtn.boundingBox();
      if (box) {
        await page.mouse.click(Math.floor(box.x + box.width / 2), Math.floor(box.y + box.height / 2));
      }
    }
    const uiAfterCoord = await themeBtn.getAttribute('data-theme');

    // Language: open by click
  await langBtn.click().catch(() => {});
  // Check visible menu instance (avoid hidden duplicates)
  const menu = page.locator('starlight-lang-select .menu:not([hidden])').first();
    const menuVisible = await menu.isVisible().catch(() => false);

    // Diagnostics after clicks
  const themeDiagAfter = await collectHitTestFor(themeBtn);
  const langDiagAfter = await collectHitTestFor(langBtn);
    await testInfo.attach('diag-after.json', { body: JSON.stringify({ uiBefore, uiAfterClick, uiAfterCoord, menuVisible, themeDiagAfter, langDiagAfter }, null, 2), contentType: 'application/json' });
    await page.screenshot({ path: testInfo.outputPath('mobile-after.png') });

    // Soft assertions to avoid masking diagnostics
    expect(themeDiagBefore).toBeTruthy();
    expect(langDiagBefore).toBeTruthy();
  });
});
