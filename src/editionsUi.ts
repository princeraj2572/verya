import type { EditionStore } from './editionStore';

/** Wires the radio group to the store and mirrors the chosen accent into the page. */
export function bindEditions(root: ParentNode, store: EditionStore): void {
  const paint = (): void =>
    document.documentElement.style.setProperty('--accent', store.current().accent);
  root.querySelectorAll<HTMLInputElement>('input[name="edition"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.checked) store.select(radio.value);
    });
  });
  store.subscribe(paint);
  paint();
}
