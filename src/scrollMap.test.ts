import { describe, expect, it } from 'vitest';
import { palette } from './content';
import { chapterAt, chapterProgress, luma, mapProgress, mixHex } from './scrollMap';

describe('mapProgress', () => {
  it('starts at the hero: facing front, far camera, charcoal', () => {
    const s = mapProgress(0);
    expect(s.rotationY).toBe(0);
    expect(s.cameraZ).toBe(12);
    expect(s.background).toBe(palette.charcoal);
    expect(s.explode).toBe(0);
    expect(s.idle).toBe(1);
  });

  it('pushes the camera in at the glass chapter', () => {
    const hero = mapProgress(chapterProgress(0));
    const glass = mapProgress(chapterProgress(1));
    expect(glass.cameraZ).toBeLessThan(hero.cameraZ - 2);
    expect(glass.sweep).toBe(0.5);
  });

  it('tilts at top notes and moves the background to plum by the heart', () => {
    expect(mapProgress(chapterProgress(2)).tiltZ).toBeCloseTo(0.2);
    const heart = mapProgress(chapterProgress(3));
    expect(heart.background).toBe(palette.plum);
    expect(heart.petals).toBe(1);
    expect(heart.warmth).toBeGreaterThan(mapProgress(0).warmth);
  });

  it('is fully exploded only at the craft chapter', () => {
    expect(mapProgress(chapterProgress(5)).explode).toBe(1);
    expect(mapProgress(chapterProgress(4)).explode).toBe(0);
    expect(mapProgress(chapterProgress(6)).explode).toBe(0);
  });

  it('ends facing the camera on cream with dark ink', () => {
    const s = mapProgress(1);
    expect(s.rotationY).toBeCloseTo(Math.PI * 2);
    expect(s.background).toBe(palette.cream);
    expect(s.ink).toBe(palette.inkDark);
  });

  it('never rotates backwards and clamps out-of-range input', () => {
    let last = -Infinity;
    for (let p = 0; p <= 1.0001; p += 0.01) {
      const r = mapProgress(p).rotationY;
      expect(r).toBeGreaterThanOrEqual(last);
      last = r;
    }
    expect(mapProgress(-3)).toEqual(mapProgress(0));
    expect(mapProgress(7)).toEqual(mapProgress(1));
  });

  it('blends colours halfway between two chapters', () => {
    const mid = mapProgress((chapterProgress(6) + chapterProgress(7)) / 2).background;
    expect(mid).toBe(mixHex(0x1c0f1b, palette.cream, 0.5));
  });
});

describe('shiftX', () => {
  it('moves the bottle away from the text column, and centres it for hero and craft', () => {
    expect(mapProgress(chapterProgress(0)).shiftX).toBe(0);
    expect(mapProgress(chapterProgress(1)).shiftX).toBeGreaterThan(0);
    expect(mapProgress(chapterProgress(2)).shiftX).toBeLessThan(0);
    expect(mapProgress(chapterProgress(5)).shiftX).toBe(0);
    expect(mapProgress(chapterProgress(7)).shiftX).toBeLessThan(0);
  });
});

describe('shiftY', () => {
  it('lifts the bottle on portrait screens for text chapters, not for the hero', () => {
    expect(mapProgress(chapterProgress(0)).shiftY).toBe(0);
    expect(mapProgress(chapterProgress(4)).shiftY).toBeGreaterThan(0);
    expect(mapProgress(chapterProgress(5)).shiftY).toBeLessThan(0);
  });
});

describe('ink', () => {
  it('stays light on dark backgrounds and dark on cream, with only a brief mid-grey handover', () => {
    let weak = 0;
    let total = 0;
    for (let p = 0; p <= 1.0001; p += 0.002) {
      const s = mapProgress(p);
      total++;
      if (Math.abs(luma(s.background) - luma(s.ink)) < 0.3) weak++;
    }
    expect(weak / total).toBeLessThan(0.02);
  });
});

describe('chapterAt', () => {
  it('maps progress to the nearest chapter', () => {
    expect(chapterAt(0)).toBe(0);
    expect(chapterAt(chapterProgress(4))).toBe(4);
    expect(chapterAt(1)).toBe(7);
  });
});
