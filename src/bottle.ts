// Bottle profile data: [radius, height] control points, bottom to top.
// Edit these to change the silhouette. mesh code lives in bottleMesh.ts.

export type Profile = ReadonlyArray<readonly [number, number]>;

/** Outer glass flask: a squat pebble body with a soft shoulder and a short neck. */
export const glassProfile: Profile = [
  [0, 0],
  [0.96, 0],
  [1.09, 0.06],
  [1.13, 0.22],
  [1.12, 0.6],
  [1.08, 1.7],
  [1.0, 2.35],
  [0.82, 2.68],
  [0.52, 2.88],
  [0.4, 2.98],
  [0.37, 3.12],
  [0.37, 3.28],
];

/** Liquid sits inside the glass, inset so the glass reads as thick. */
export const liquidProfile: Profile = [
  [0, 0.58],
  [0.8, 0.58],
  [0.9, 0.66],
  [0.93, 0.95],
  [0.91, 1.7],
  [0.86, 2.15],
  [0.68, 2.5],
  [0, 2.56],
];

/** Weighted foot, a separate part so it can drop away in the exploded view. */
export const baseProfile: Profile = [
  [0, -0.16],
  [1.0, -0.16],
  [1.07, -0.12],
  [1.07, -0.02],
  [1.0, 0],
  [0, 0],
];

/** Brushed-gold cap (the neck ring is built in bottleMesh.ts). */
export const capProfile: Profile = [
  [0, 0],
  [0.5, 0],
  [0.53, 0.05],
  [0.53, 1.05],
  [0.49, 1.14],
  [0.3, 1.19],
  [0, 1.2],
];

export const dims = {
  /** where the cap sits when closed */
  capY: 3.2,
  /** neck ring height */
  neckY: 3.2,
  neckRadius: 0.41,
  neckTube: 0.035,
  collarRadius: 0.5,
  collarHeight: 0.14,
  /** vertical centre of the whole bottle, used to centre it on screen */
  centreY: 2.1,
};

/** How far each part travels (world units) when the exploded view is at 1. */
export const explodeOffsets = {
  cap: 2.4,
  neck: 1.3,
  glass: -0.3,
  liquid: 0.55,
  base: -1.1,
} as const;

/** Local height used to anchor each part's label in the exploded view. */
export const labelAnchors = {
  cap: dims.capY + 0.5,
  neck: dims.neckY,
  glass: 1.4,
  liquid: 1.4,
  base: -0.1,
} as const;
