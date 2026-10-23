// Captures one still per chapter from the live 3D scene (?still=N), writes responsive WebP files
// to public/assets/stills, and builds the Open Graph image. Run `npm run build` first.
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { preview } from 'vite';
import { brand, chapters } from '../src/content.ts';

const WIDTHS = [640, 1280, 1920];
const out = 'public/assets/stills';
mkdirSync(out, { recursive: true });

const server = await preview({ preview: { port: 4174, strictPort: true } });
const url = server.resolvedUrls?.local[0]?.replace(/\/$/, '') ?? 'http://localhost:4174';
const browser = await chromium.launch({
  args: [
    '--use-angle=swiftshader',
    '--use-gl=angle',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
  ],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1200 } });

let hero: Buffer | undefined;
for (const [i] of chapters.entries()) {
  await page.goto(`${url}/?still=${i}&quality=high`);
  await page.waitForSelector('html[data-ready="1"]', { state: 'attached' });
  await page.waitForTimeout(800);
  const png = await page.screenshot({ type: 'png' });
  if (i === 0) hero = png;
  for (const w of WIDTHS) {
    await sharp(png)
      .resize({ width: w })
      .webp({ quality: 78, effort: 5 })
      .toFile(`${out}/chapter-${i + 1}-${w}.webp`);
  }
  console.log(`still ${i + 1}/${chapters.length}`);
}

if (hero) {
  const text = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
      <rect width="1200" height="630" fill="#15120f" fill-opacity="0.35"/>
      <text x="64" y="96" fill="#f1e7d6" font-family="Georgia, serif" font-size="30" letter-spacing="12">${brand.name.toUpperCase()}</text>
      <text x="64" y="560" fill="#f1e7d6" font-family="Georgia, serif" font-size="108">${brand.product.replace('&', '&amp;')}</text>
    </svg>`,
  );
  await sharp(hero)
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .composite([{ input: text }])
    .png({ compressionLevel: 9 })
    .toFile('public/og.png');
  console.log('og image');
}

await browser.close();
server.httpServer.close();
