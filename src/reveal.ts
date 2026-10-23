// Line-by-line text reveals: words are measured, grouped into lines, and each line is wrapped
// in a mask (overflow hidden) whose inner span slides up. CSS does the animation.

function splitLines(el: HTMLElement): void {
  const text = el.dataset.text ?? el.textContent ?? '';
  el.dataset.text = text;
  el.textContent = '';
  const words = text.trim().split(/\s+/);
  const spans = words.map((w) => {
    const s = document.createElement('span');
    s.textContent = w;
    s.style.display = 'inline-block';
    el.append(s, ' ');
    return s;
  });
  const lines: string[][] = [];
  let top = -1;
  spans.forEach((s, i) => {
    if (s.offsetTop !== top) {
      lines.push([]);
      top = s.offsetTop;
    }
    lines[lines.length - 1]?.push(words[i] ?? '');
  });
  el.textContent = '';
  for (const line of lines) {
    const mask = document.createElement('span');
    mask.className = 'line';
    const inner = document.createElement('span');
    inner.className = 'line__inner';
    inner.textContent = line.join(' ');
    mask.append(inner, ' ');
    el.append(mask);
  }
}

/** Number every line in a section so CSS can stagger them. */
function stagger(section: Element): void {
  section.querySelectorAll<HTMLElement>('.line__inner').forEach((l, i) => {
    l.style.setProperty('--i', String(i));
  });
}

export function prepareReveals(root: ParentNode, split: boolean): void {
  const run = (): void => {
    if (split) root.querySelectorAll<HTMLElement>('[data-split]').forEach(splitLines);
    root.querySelectorAll('.chapter').forEach(stagger);
  };
  run();
  if (!split) return;
  // fonts change line breaks, so re-split once they load and whenever the width changes
  void document.fonts.ready.then(run);
  let width = window.innerWidth;
  let timer = 0;
  window.addEventListener('resize', () => {
    if (window.innerWidth === width) return;
    width = window.innerWidth;
    window.clearTimeout(timer);
    timer = window.setTimeout(run, 200);
  });
}

/** Toggle .is-in as each chapter enters and leaves, so reveals replay. */
export function observeReveals(root: ParentNode, onActive?: (index: number) => void): void {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        e.target.classList.toggle('is-in', e.isIntersecting);
        if (e.isIntersecting && onActive) onActive(Number((e.target as HTMLElement).dataset.index));
      }
    },
    { threshold: 0.4 },
  );
  root.querySelectorAll('.chapter').forEach((s) => io.observe(s));
}
