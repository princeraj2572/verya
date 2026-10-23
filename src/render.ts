import { stillPicture } from './assets';
import { brand, chapters, craftParts, editions, footer, form, type Chapter } from './content';

const esc = (s: string): string =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);

const lines = (headline: string[]): string =>
  headline
    .map((l) => `<span class="line"><span class="line__inner">${esc(l)}</span></span>`)
    .join('');

const notes = (c: Chapter): string =>
  c.notes
    ? `<ul class="notes">${c.notes
        .map(
          (n) =>
            `<li><span class="notes__name"><span class="line"><span class="line__inner">${esc(n.name)}</span></span></span><span class="notes__detail" data-split>${esc(n.detail)}</span></li>`,
        )
        .join('')}</ul>`
    : '';

const parts = `<ul class="parts">${craftParts
  .map((p) => `<li><strong>${esc(p.label)}</strong> ${esc(p.detail)}</li>`)
  .join('')}</ul>`;

const picker = `<fieldset class="editions"><legend class="visually-hidden">Choose an edition colour</legend>${editions
  .map(
    (e, i) =>
      `<label class="edition"><input type="radio" name="edition" value="${e.id}"${i === 0 ? ' checked' : ''}><span class="edition__swatch" style="--swatch:#${e.liquid.toString(16).padStart(6, '0')}"></span><span class="edition__name">${esc(e.name)}</span><span class="edition__desc">${esc(e.description)}</span></label>`,
  )
  .join('')}</fieldset>`;

const notify = `<form class="notify" novalidate>
  <label class="label" for="email">${esc(form.label)}</label>
  <div class="notify__row">
    <input id="email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="${esc(form.placeholder)}" aria-describedby="email-msg" required>
    <button type="submit" class="button">${esc(form.button)}</button>
  </div>
  <p id="email-msg" class="notify__msg" role="status" aria-live="polite"></p>
</form>`;

function chapter(c: Chapter, i: number): string {
  const first = i === 0;
  const Heading = first ? 'h1' : 'h2';
  const extra =
    c.id === 'craft' ? parts : c.id === 'editions' ? picker : c.id === 'finale' ? notify : '';
  const cue = first
    ? `<a class="cue" href="#${chapters[1]?.id ?? ''}"><span class="cue__line" aria-hidden="true"></span><span class="label">Scroll</span></a>`
    : '';
  return `<section class="chapter chapter--${c.id}" id="${c.id}" data-index="${i}" aria-labelledby="${c.id}-title">
    <div class="chapter__inner">
      <p class="label"><span class="line"><span class="line__inner">${esc(c.kicker)}</span></span></p>
      <${Heading} class="title" id="${c.id}-title">${lines(c.headline)}</${Heading}>
      <p class="body" data-split>${esc(c.body)}</p>
      ${notes(c)}${extra}${cue}
    </div>
    ${stillPicture(i)}
  </section>`;
}

const nav = `<nav class="chapter-nav" aria-label="Chapters"><ol>${chapters
  .map(
    (c, i) =>
      `<li><a href="#${c.id}" data-index="${i}"><span class="chapter-nav__label">${esc(c.label)}</span><span class="chapter-nav__dot" aria-hidden="true"></span></a></li>`,
  )
  .join(
    '',
  )}</ol><span class="chapter-nav__track" aria-hidden="true"><span class="chapter-nav__fill"></span></span></nav>`;

export function render(root: HTMLElement): void {
  root.innerHTML = `
    <a class="skip" href="#main">Skip to content</a>
    <div class="stage" aria-hidden="true"><canvas id="stage"></canvas></div>
    <div class="part-labels" aria-hidden="true">${craftParts
      .map((p) => `<span class="part-label" data-part="${p.id}">${esc(p.label)}</span>`)
      .join('')}</div>
    <div class="grain" aria-hidden="true"></div>
    <header class="wordmark"><a href="#hero" aria-label="${esc(brand.name)}, back to the start">${esc(brand.name)}</a></header>
    ${nav}
    <main id="main">${chapters.map(chapter).join('')}</main>
    <footer class="site-footer"><p>${esc(brand.placeholderNote)} ${esc(footer.line)}</p></footer>`;
}
