import { describe, expect, it, vi } from 'vitest';
import { editions } from './content';
import { createEditionStore } from './editionStore';

describe('edition store (colour picker state)', () => {
  it('starts on the first edition', () => {
    expect(createEditionStore(editions).current().id).toBe(editions[0]?.id);
  });

  it('updates the liquid and accent when another edition is picked', () => {
    const store = createEditionStore(editions);
    const seen = vi.fn();
    store.subscribe(seen);
    expect(store.select('fig')).toBe(true);
    const fig = editions.find((e) => e.id === 'fig');
    expect(store.current().liquid).toBe(fig?.liquid);
    expect(store.current().accent).toBe(fig?.accent);
    expect(seen).toHaveBeenCalledTimes(1);
  });

  it('ignores unknown ids and repeat picks, and can unsubscribe', () => {
    const store = createEditionStore(editions);
    const seen = vi.fn();
    const off = store.subscribe(seen);
    expect(store.select('nope')).toBe(false);
    store.select(editions[0]?.id ?? '');
    expect(seen).not.toHaveBeenCalled();
    off();
    store.select('sage');
    expect(seen).not.toHaveBeenCalled();
  });
});
