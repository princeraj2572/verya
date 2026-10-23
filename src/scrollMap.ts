// Pure mapping from one scroll progress value (0 to 1) to the whole scene state.
// Keyframes sit at chapter centres (progress = index / 7); between them values ease
// with smoothstep, so the bottle comes gently to rest at every chapter.
import { palette } from './content';

export interface SceneState {
  rotationY: number;
  tiltX: number;
  tiltZ: number;
  cameraZ: number;
  cameraY: number;
  lookY: number;
  /** horizontal offset of the bottle as a fraction of half the screen width (clear of the text) */
  shiftX: number;
  /** same idea vertically, used on tall (portrait) screens only; positive lifts the bottle */
  shiftY: number;
  background: number;
  ink: number;
  keyLight: number;
  keyIntensity: number;
  rimIntensity: number;
  /** travelling highlight: 0 left, 1 right; its light fades in and out as sin(pi * sweep) */
  sweep: number;
  /** 0 to 1: how far the liquid warms toward amber */
  warmth: number;
  glow: number;
  /** 0 closed, 1 fully exploded */
  explode: number;
  dust: number;
  dustSpeed: number;
  petals: number;
  sparkles: number;
  /** weight of the slow idle spin */
  idle: number;
  chapter: number;
}

type Key = Omit<SceneState, 'chapter'>;

export const CHAPTER_COUNT = 8;

const base: Key = {
  rotationY: 0,
  tiltX: 0,
  tiltZ: 0,
  cameraZ: 12,
  cameraY: 1.7,
  lookY: 1.65,
  shiftX: 0,
  shiftY: 0,
  background: palette.charcoal,
  ink: palette.ink,
  keyLight: 0xffe2b0,
  keyIntensity: 1,
  rimIntensity: 1.2,
  sweep: 1,
  warmth: 0.1,
  glow: 0.15,
  explode: 0,
  dust: 0.4,
  dustSpeed: 0.3,
  petals: 0,
  sparkles: 0.2,
  idle: 0,
};

const keys: Key[] = [
  { ...base, idle: 1, sweep: 0 },
  {
    ...base,
    rotationY: 1.2,
    shiftX: 0.5,
    shiftY: 0.42,
    cameraZ: 7.4,
    cameraY: 2.3,
    lookY: 2.2,
    sweep: 0.5,
    keyIntensity: 1.2,
    sparkles: 0.5,
  },
  {
    ...base,
    rotationY: 2.4,
    shiftX: -0.5,
    shiftY: 0.42,
    tiltZ: 0.2,
    tiltX: 0.06,
    cameraZ: 10,
    background: palette.amber,
    keyLight: 0xffe9a8,
    keyIntensity: 1.4,
    dust: 0.9,
    dustSpeed: 0.9,
    sparkles: 0.6,
  },
  {
    ...base,
    rotationY: 3.5,
    shiftX: 0.5,
    shiftY: 0.42,
    tiltZ: -0.1,
    cameraZ: 10,
    background: palette.plum,
    keyLight: 0xffc8d8,
    warmth: 0.7,
    glow: 0.4,
    dust: 0.3,
    petals: 1,
  },
  {
    ...base,
    rotationY: 4.4,
    shiftX: -0.5,
    shiftY: 0.42,
    cameraZ: 10.5,
    background: palette.deepAmber,
    keyLight: 0xff9a3c,
    keyIntensity: 1.1,
    warmth: 1,
    glow: 0.95,
    dust: 0.5,
    dustSpeed: 0.12,
    sparkles: 0.3,
  },
  {
    ...base,
    rotationY: 5.2,
    shiftY: -0.45,
    cameraZ: 15.5,
    cameraY: 2.2,
    lookY: 1.8,
    warmth: 0.6,
    glow: 0.5,
    explode: 1,
    dust: 0.2,
  },
  {
    ...base,
    rotationY: 5.9,
    shiftX: 0.5,
    shiftY: 0.42,
    cameraZ: 10.5,
    background: 0x1c0f1b,
    keyLight: 0xffd9b0,
    warmth: 0.4,
    glow: 0.5,
    sparkles: 0.5,
  },
  {
    ...base,
    rotationY: Math.PI * 2,
    shiftX: -0.5,
    shiftY: 0.42,
    cameraZ: 9.5,
    background: palette.cream,
    ink: palette.inkDark,
    keyLight: 0xfff3dc,
    keyIntensity: 1.1,
    warmth: 0.4,
    glow: 0.35,
    sparkles: 0.7,
  },
];

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));
const smooth = (t: number): number => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export function mixHex(a: number, b: number, t: number): number {
  const ch = (shift: number): number =>
    Math.round(lerp((a >> shift) & 255, (b >> shift) & 255, t)) & 255;
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}

const colourKeys = new Set<keyof Key>(['background', 'ink', 'keyLight']);

/** Perceived brightness of a hex colour, 0 to 1 (sRGB, no gamma conversion). */
export function luma(hex: number): number {
  return (0.2126 * ((hex >> 16) & 255) + 0.7152 * ((hex >> 8) & 255) + 0.0722 * (hex & 255)) / 255;
}

/** Ink follows the background brightness so text never crosses it at mid-grey. */
function inkFor(background: number): number {
  const t = smooth(clamp01((luma(background) - 0.44) / 0.06));
  return mixHex(palette.ink, palette.inkDark, t);
}

export function chapterProgress(index: number): number {
  return index / (CHAPTER_COUNT - 1);
}

export function chapterAt(progress: number): number {
  return Math.round(clamp01(progress) * (CHAPTER_COUNT - 1));
}

export function mapProgress(progress: number): SceneState {
  const x = clamp01(progress) * (CHAPTER_COUNT - 1);
  const i = Math.min(CHAPTER_COUNT - 2, Math.floor(x));
  const t = smooth(x - i);
  const from = keys[i] as Key;
  const to = keys[i + 1] as Key;
  const out = { ...from } as Record<keyof Key, number>;
  for (const k of Object.keys(from) as (keyof Key)[]) {
    out[k] = colourKeys.has(k) ? mixHex(from[k], to[k], t) : lerp(from[k], to[k], t);
  }
  const state = out as Key;
  return { ...state, ink: inkFor(state.background), chapter: chapterAt(progress) };
}
