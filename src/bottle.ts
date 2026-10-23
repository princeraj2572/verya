// Bottle profile data: [radius, height] control points, bottom to top.
// Edit these to change the silhouette. mesh code lives in bottleMesh.ts.

export type Profile = ReadonlyArray<readonly [number, number]>;

/** Outer glass flask: a squat pebble body with a soft shoulder and a short neck. */
export const glassProfile: Profile = [
  [0, 0],
  [1.05, 0],
  [1.25, 0.08],
  [1.33, 0.32],
  [1.31, 1.2],
  [1.22, 1.88],
  [1.0, 2.34],
  [0.56, 2.62],
  [0.4, 2.72],
  [0.37, 2.95],
  [0.37, 3.12],
];

/** Liquid sits inside the glass, inset so the glass reads as thick. */
export const liquidProfile: Profile = [
  [0, 0.3],
  [0.98, 0.3],
  [1.12, 0.4],
  [1.18, 0.65],
  [1.17, 1.2],
  [1.1, 1.7],
  [0.86, 2.2],
  [0.5, 2.3],
  [0, 2.34],
];

/** Weighted foot, a separate part so it can drop away in the exploded view. */
export const baseProfile: Profile = [
  [0, -0.18],
  [1.1, -0.18],
  [1.18, -0.14],
  [1.18, -0.03],
  [1.1, 0],
  [0, 0],
];

/** Cap body (the gold collar and neck ring are built in bottleMesh.ts). */
export const capProfile: Profile = [
  [0, 0],
  [0.62, 0],
  [0.67, 0.06],
  [0.67, 0.92],
  [0.6, 1.02],
  [0, 1.04],
];

export const dims = {
  /** where the cap sits when closed */
  capY: 3.1,
  /** neck ring height */
  neckY: 3.02,
  neckRadius: 0.4,
  neckTube: 0.05,
  collarRadius: 0.5,
  collarHeight: 0.14,
  /** vertical centre of the whole bottle, used to centre it on screen */
  centreY: 1.65,
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
  glass: 1.2,
  liquid: 1.0,
  base: -0.1,
} as const;
