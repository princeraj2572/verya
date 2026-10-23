import { CHAPTER_COUNT } from './scrollMap';

export interface Nav {
  setActive(index: number): void;
  setProgress(progress: number): void;
}

/** Side chapter indicator: click or keyboard (Enter, Tab) to jump; PageUp/PageDown step through. */
export function bindNav(goTo: (index: number) => void): Nav {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.chapter-nav a')];
  const fill = document.querySelector<HTMLElement>('.chapter-nav__fill');
  let current = 0;

  document
    .querySelectorAll<HTMLElement>('.chapter')
    .forEach((s) => s.setAttribute('tabindex', '-1'));

  for (const link of links) {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      goTo(Number(link.dataset.index));
    });
  }

  window.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, select')) return;
    const step = event.key === 'PageDown' ? 1 : event.key === 'PageUp' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    goTo(Math.min(CHAPTER_COUNT - 1, Math.max(0, current + step)));
  });

  return {
    setActive(index) {
      current = index;
      document.documentElement.dataset.chapter = String(index);
      links.forEach((l, i) => {
        if (i === index) l.setAttribute('aria-current', 'step');
        else l.removeAttribute('aria-current');
      });
    },
    setProgress(progress) {
      fill?.style.setProperty('transform', `scaleY(${progress})`);
    },
  };
}
