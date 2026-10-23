import type { GlassQuality } from './bottleMesh';

export interface DeviceProfile {
  mobile: boolean;
  pixelRatioCap: number;
  /** particle density multiplier */
  density: number;
  glass: GlassQuality;
  /** lathe radial segments */
  segments: number;
}

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function detectProfile(): DeviceProfile {
  const mobile = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const slow = (navigator.hardwareConcurrency ?? 8) <= 4 || memory <= 4;
  return {
    mobile,
    // phones render at a lower resolution than desktops
    pixelRatioCap: mobile ? 1.25 : 2,
    density: mobile ? 0.35 : 1,
    glass: mobile && slow ? 'simple' : 'full',
    segments: mobile ? 48 : 96,
  };
}
