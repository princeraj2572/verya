import { defineConfig } from 'vitest/config';
import { brand } from './src/content.ts';

// Injects the brand's title, description and Open Graph tags from content.ts into index.html.
const brandMeta = {
  name: 'brand-meta',
  transformIndexHtml: (html: string): string =>
    html
      .replaceAll('%SITE_TITLE%', brand.siteTitle)
      .replaceAll('%DESCRIPTION%', brand.description)
      .replaceAll('%BRAND%', brand.name)
      .replaceAll('%PRODUCT%', brand.product)
      .replaceAll('%URL%', brand.url)
      .replaceAll('%OG_IMAGE%', new URL('og.png', brand.url).href)
      .replaceAll('%OG_ALT%', `${brand.name} ${brand.product}: a perfume bottle in warm light`),
};

export default defineConfig({
  plugins: [brandMeta],
  build: { target: 'es2022', chunkSizeWarningLimit: 700 },
  test: { include: ['src/**/*.test.ts'], environment: 'jsdom' },
});
