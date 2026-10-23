import * as THREE from 'three';
import {
  baseProfile,
  capProfile,
  dims,
  explodeOffsets,
  glassProfile,
  labelAnchors,
  liquidProfile,
  type Profile,
} from './bottle';
import { mixHex } from './scrollMap';

export type GlassQuality = 'full' | 'simple';
export type PartId = keyof typeof explodeOffsets;

export interface Bottle {
  /** local origin is the foot of the glass; the scene re-centres it */
  group: THREE.Group;
  setExplode(amount: number): void;
  setLiquid(colour: number, warmth: number, glow: number): void;
  setGlassQuality(quality: GlassQuality): void;
  /** world-space position of each part's label anchor */
  labelPoint(part: PartId, out: THREE.Vector3): THREE.Vector3;
  dispose(): void;
}

const WARM_TINT = 0xffa040;

/** Smooths the hand-written control points with a spline, keeping the axis point exact. */
function smoothProfile(profile: Profile, divisions: number): THREE.Vector2[] {
  const curve = new THREE.SplineCurve(profile.map(([r, y]) => new THREE.Vector2(r, y)));
  const points = curve.getPoints(divisions).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));
  const last = profile[profile.length - 1];
  if (last) points.push(new THREE.Vector2(last[0], last[1]));
  return points;
}

function lathe(profile: Profile, segments: number, smooth = true): THREE.LatheGeometry {
  const pts = smooth
    ? smoothProfile(profile, 96)
    : profile.map(([r, y]) => new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(pts, segments);
}

export function createBottle(quality: GlassQuality, segments = 96): Bottle {
  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  // --- materials -------------------------------------------------------------
  const glassFull = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 1,
      thickness: 1.6,
      ior: 1.5,
      roughness: 0.05,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      attenuationColor: new THREE.Color(0xffe6c4),
      attenuationDistance: 7,
      specularIntensity: 1,
      envMapIntensity: 1.3,
    }),
  );
  // Cheaper stand-in for slow devices: no transmission pass, just a reflective tinted shell.
  const glassSimple = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xfff1de,
      transparent: true,
      opacity: 0.22,
      roughness: 0.06,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.6,
      depthWrite: false,
    }),
  );
  const liquidMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xd9822b,
      emissive: 0xd9822b,
      emissiveIntensity: 0.15,
      roughness: 0.2,
      clearcoat: 0.6,
      side: THREE.DoubleSide,
    }),
  );
  const gold = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xc9a45c,
      metalness: 1,
      roughness: 0.34,
      anisotropy: 0.8,
      anisotropyRotation: Math.PI / 2,
      envMapIntensity: 1.4,
    }),
  );
  const lacquer = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x1a1410,
      roughness: 0.28,
      metalness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    }),
  );

  // --- parts -----------------------------------------------------------------
  const group = new THREE.Group();

  const glass = new THREE.Mesh(track(lathe(glassProfile, segments)), glassFull);
  const glassPart = new THREE.Group().add(glass);

  const liquid = new THREE.Mesh(track(lathe(liquidProfile, segments)), liquidMat);
  const liquidPart = new THREE.Group().add(liquid);

  const base = new THREE.Mesh(track(lathe(baseProfile, segments, false)), lacquer);
  const basePart = new THREE.Group().add(base);

  const ring = new THREE.Mesh(
    track(new THREE.TorusGeometry(dims.neckRadius, dims.neckTube, 20, segments)),
    gold,
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = dims.neckY;
  const neckPart = new THREE.Group().add(ring);

  const capBody = new THREE.Mesh(track(lathe(capProfile, segments)), lacquer);
  const collar = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.68, 0.68, 0.16, segments, 1, true)),
    gold,
  );
  collar.position.y = 0.08;
  const capPart = new THREE.Group().add(capBody, collar);

  group.add(basePart, glassPart, liquidPart, neckPart, capPart);

  const parts = {
    cap: capPart,
    neck: neckPart,
    glass: glassPart,
    liquid: liquidPart,
    base: basePart,
  } as const;
  const homeY: Record<PartId, number> = { cap: dims.capY, neck: 0, glass: 0, liquid: 0, base: 0 };
  let explode = 0;

  const place = (): void => {
    for (const id of Object.keys(parts) as PartId[]) {
      parts[id].position.y = homeY[id] + explode * explodeOffsets[id];
    }
  };
  place();

  const tint = new THREE.Color();
  const api: Bottle = {
    group,
    setExplode(amount) {
      explode = amount;
      place();
    },
    setLiquid(colour, warmth, glow) {
      tint.setHex(mixHex(colour, WARM_TINT, warmth * 0.4));
      liquidMat.color.copy(tint);
      liquidMat.emissive.copy(tint);
      liquidMat.emissiveIntensity = 0.12 + glow * 0.9;
    },
    setGlassQuality(next) {
      glass.material = next === 'full' ? glassFull : glassSimple;
      glass.renderOrder = next === 'full' ? 0 : 1;
    },
    labelPoint(part, out) {
      out.set(0, labelAnchors[part] + explode * explodeOffsets[part], 0);
      return group.localToWorld(out);
    },
    dispose() {
      disposables.forEach((d) => d.dispose());
    },
  };
  api.setGlassQuality(quality);
  return api;
}
