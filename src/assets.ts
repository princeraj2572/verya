// Every image on the page is referenced from here. Each has a procedural CSS fallback,
// so a missing file never breaks the layout (the figure keeps its gradient and size).
import { chapters } from './content';
import { chapterProgress, mapProgress } from './scrollMap';

export const STILL_WIDTHS = [640, 1280, 1920] as const;
export const STILL_SIZE = { width: 1920, height: 1200 } as const;

const base = import.meta.env.BASE_URL;
const hex = (n: number): string => `#${n.toString(16).padStart(6, '0')}`;

export const stillSrc = (index: number, width: number): string =>
  `${base}assets/stills/chapter-${index + 1}-${width}.webp`;

export const ogImage = `${base}og.png`;

/** CSS fallback for a chapter still, built from the same colours the 3D scene uses. */
export function stillFallback(index: number): string {
  const s = mapProgress(chapterProgress(index));
  return `radial-gradient(ellipse at 50% 55%, ${hex(s.keyLight)}33 0%, transparent 55%), ${hex(s.background)}`;
}

/** Chapter background and ink for static mode (reduced motion or no WebGL). */
export function chapterColours(index: number): { background: string; ink: string } {
  const s = mapProgress(chapterProgress(index));
  return { background: hex(s.background), ink: hex(s.ink) };
}

export function stillPicture(index: number): string {
  const chapter = chapters[index];
  if (!chapter) return '';
  const srcset = STILL_WIDTHS.map((w) => `${stillSrc(index, w)} ${w}w`).join(', ');
  const sizes = '(max-width: 768px) 100vw, 60vw';
  return `<figure class="still" style="--still-fallback:${stillFallback(index)}">
    <picture>
      <source type="image/webp" srcset="${srcset}" sizes="${sizes}">
      <img src="${stillSrc(index, 1280)}" width="${STILL_SIZE.width}" height="${STILL_SIZE.height}" loading="lazy" decoding="async" alt="${chapter.stillAlt}">
    </picture>
  </figure>`;
}

/** Hide a broken image so the gradient fallback shows instead. */
export function bindImageFallbacks(root: ParentNode): void {
  root.querySelectorAll<HTMLImageElement>('.still img').forEach((img) => {
    const miss = (): void => img.closest('.still')?.classList.add('is-missing');
    img.addEventListener('error', miss);
    if (img.complete && img.naturalWidth === 0) miss();
  });
}
