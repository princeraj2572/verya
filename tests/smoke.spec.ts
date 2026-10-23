import { mkdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { chapters } from '../src/content';

const shots = 'screenshots';

test('scrolls through every chapter with no console errors', async ({ page }) => {
  mkdirSync(shots, { recursive: true });
  const problems: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(m.text());
  });
  page.on('pageerror', (e) => problems.push(e.message));

  await page.goto('/');
  await page.waitForSelector('html[data-ready="1"]', { state: 'attached' });
  await expect(page.locator('html.static')).toHaveCount(0);
  await expect(page.locator('canvas#stage')).toBeVisible();

  for (const [i, chapter] of chapters.entries()) {
    await page.locator(`.chapter-nav a[data-index="${i}"]`).click();
    await expect(page.locator(`.chapter-nav a[data-index="${i}"]`)).toHaveAttribute(
      'aria-current',
      'step',
      { timeout: 15_000 },
    );
    // the smooth scroll focuses the chapter when it lands
    await expect(page.locator(`#${chapter.id}`)).toBeFocused({ timeout: 15_000 });
    await expect(page.locator(`#${chapter.id}.is-in`)).toBeVisible();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${shots}/${String(i + 1).padStart(2, '0')}-${chapter.id}.png` });
  }

  expect(problems).toEqual([]);
});

test('edition picker and notify form work', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('html[data-ready="1"]', { state: 'attached' });

  await page.locator('.chapter-nav a[data-index="6"]').click();
  await page.getByRole('radio', { name: /^Fig/ }).check();
  const accent = await page.evaluate(() =>
    document.documentElement.style.getPropertyValue('--accent'),
  );
  expect(accent).toBe('#c57ba3');

  await page.locator('.chapter-nav a[data-index="7"]').click();
  const email = page.getByLabel('Email address');
  await page.getByRole('button', { name: 'Notify me' }).click();
  await expect(page.locator('#email-msg')).toContainText('enter your email');
  await email.fill('not-an-email');
  await page.getByRole('button', { name: 'Notify me' }).click();
  await expect(page.locator('#email-msg')).toContainText('does not look like');
  await email.fill('guest@example.com');
  await page.getByRole('button', { name: 'Notify me' }).click();
  await expect(page.locator('#email-msg')).toContainText('Thank you');
});

test('reduced motion shows the static version', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await page.waitForSelector('html[data-ready="1"]', { state: 'attached' });
  await expect(page.locator('html.static')).toHaveCount(1);
  await expect(page.locator('canvas#stage')).toHaveCount(0);
  await expect(page.locator('.still')).toHaveCount(chapters.length);
  await context.close();
});
