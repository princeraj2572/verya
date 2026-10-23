import type { Edition } from './content';

export interface EditionStore {
  current(): Edition;
  select(id: string): boolean;
  subscribe(fn: (edition: Edition) => void): () => void;
}

export function createEditionStore(editions: readonly Edition[], initialId?: string): EditionStore {
  const first = editions[0];
  if (!first) throw new Error('At least one edition is required');
  let active = editions.find((e) => e.id === initialId) ?? first;
  const listeners = new Set<(edition: Edition) => void>();
  return {
    current: () => active,
    select(id) {
      const next = editions.find((e) => e.id === id);
      if (!next) return false;
      if (next !== active) {
        active = next;
        listeners.forEach((fn) => fn(active));
      }
      return true;
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
