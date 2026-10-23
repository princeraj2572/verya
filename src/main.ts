import '@fontsource/cormorant-garamond/latin-300.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import './tokens.css';
import './styles.css';
import { bindImageFallbacks, chapterColours } from './assets';
import { chapters, editions } from './content';
import { detectProfile, hasWebGL, prefersReducedMotion } from './device';
import { createEditionStore } from './editionStore';
import { bindEditions } from './editionsUi';
import { bindForm } from './form';
import { bindNav } from './nav';
import { render } from './render';
import { observeReveals, prepareReveals } from './reveal';

const root = document.documentElement;
const found = document.querySelector<HTMLElement>('#app');
if (!found) throw new Error('#app is missing');
const app: HTMLElement = found;

const params = new URLSearchParams(location.search);
const still = params.has('still') ? Number(params.get('still')) : undefined;
const wantsStatic = params.has('static') || (prefersReducedMotion() && still === undefined);

render(app);
bindImageFallbacks(app);
const store = createEditionStore(editions, params.get('edition') ?? undefined);
bindEditions(app, store);
document
  .querySelectorAll<HTMLInputElement>('input[name="edition"]')
  .forEach((r) => (r.checked = r.value === store.current().id));
const form = app.querySelector<HTMLFormElement>('form.notify');
if (form) bindForm(form);

function enterStatic(): void {
  root.classList.add('static');
  app.querySelector('.stage')?.remove();
  const sections = [...app.querySelectorAll<HTMLElement>('.chapter')];
  sections.forEach((s, i) => {
    const c = chapterColours(i);
    s.style.setProperty('--bg', c.background);
    s.style.setProperty('--ink', c.ink);
  });
  const nav = bindNav((i) => {
    const el = document.getElementById(chapters[i]?.id ?? '');
    el?.scrollIntoView({ behavior: 'auto' });
    el?.focus({ preventScroll: true });
  });
  prepareReveals(app, false);
  observeReveals(app, (i) => nav.setActive(i));
}

async function enterExperience(): Promise<void> {
  const nav = bindNav((i) => window.__veyraGoTo?.(i));
  prepareReveals(app, true);
  observeReveals(app);
  const { startExperience } = await import('./experience');
  try {
    const stop = startExperience({ profile: detectProfile(), store, nav, still });
    window.addEventListener('pagehide', stop);
    root.dataset.ready = '1';
  } catch (error) {
    console.warn('WebGL scene failed, showing the static version.', error);
    enterStatic();
    root.dataset.ready = '1';
  }
}

if (still !== undefined) root.classList.add('capture');
if (wantsStatic || !hasWebGL()) {
  enterStatic();
  root.dataset.ready = '1';
} else {
  void enterExperience();
}
