import * as THREE from 'three';
import type { SceneState } from './scrollMap';

export interface Particles {
  group: THREE.Group;
  update(dt: number, time: number, state: SceneState, camera: THREE.Camera): void;
  dispose(): void;
}

interface Seed {
  x: number;
  y: number;
  z: number;
  speed: number;
  phase: number;
  size: number;
}

const rand = (a: number, b: number): number => a + Math.random() * (b - a);

function seeds(count: number, size: [number, number]): Seed[] {
  return Array.from({ length: count }, () => {
    // keep particles in a ring around the bottle rather than inside it
    const angle = rand(0, Math.PI * 2);
    const radius = rand(1.6, 4.2);
    return {
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius * 0.6,
      y: rand(-1, 5),
      speed: rand(0.4, 1),
      phase: rand(0, Math.PI * 2),
      size: rand(size[0], size[1]),
    };
  });
}

function softDot(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(canvas);
}

/** density: 1 on desktop, lower on phones. */
export function createParticles(density = 1): Particles {
  const group = new THREE.Group();
  const dot = softDot();
  const dummy = new THREE.Object3D();
  const colour = new THREE.Color();
  const white = new THREE.Color(0xffffff);

  const dustSeeds = seeds(Math.round(220 * density), [0.025, 0.06]);
  const sparkSeeds = seeds(Math.round(70 * density), [0.08, 0.18]);
  const petalSeeds = seeds(Math.round(46 * density), [0.16, 0.26]);

  const quad = new THREE.PlaneGeometry(1, 1);
  const petalGeo = new THREE.CircleGeometry(0.5, 12);
  petalGeo.scale(0.55, 1, 1);

  const glowMat = (opacity: number): THREE.MeshBasicMaterial =>
    new THREE.MeshBasicMaterial({
      map: dot,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  const dustMat = glowMat(0.7);
  const sparkMat = glowMat(1);
  const petalMat = new THREE.MeshStandardMaterial({
    color: 0xf0b6c0,
    roughness: 0.7,
    side: THREE.DoubleSide,
    emissive: 0x4a1f2a,
    emissiveIntensity: 0.4,
  });

  const dust = new THREE.InstancedMesh(quad, dustMat, dustSeeds.length);
  const sparks = new THREE.InstancedMesh(quad, sparkMat, sparkSeeds.length);
  const petals = new THREE.InstancedMesh(petalGeo, petalMat, petalSeeds.length);
  for (const m of [dust, sparks, petals]) {
    m.frustumCulled = false;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    group.add(m);
  }

  const wrapY = (y: number): number => ((((y + 1) % 6) + 6) % 6) - 1;

  function drift(
    mesh: THREE.InstancedMesh,
    list: Seed[],
    amount: number,
    dt: number,
    time: number,
    speed: number,
    rise: number,
    billboard: THREE.Quaternion | null,
  ): void {
    mesh.count = Math.floor(list.length * Math.min(1, Math.max(0, amount)));
    for (let i = 0; i < mesh.count; i++) {
      const s = list[i];
      if (!s) continue;
      s.y = wrapY(s.y + rise * s.speed * speed * dt);
      const sway = Math.sin(time * 0.4 * speed + s.phase);
      dummy.position.set(s.x + sway * 0.3, s.y, s.z + Math.cos(time * 0.3 * speed + s.phase) * 0.3);
      if (billboard) dummy.quaternion.copy(billboard);
      else dummy.rotation.set(time * 0.5 * speed + s.phase, time * 0.35 * speed + s.phase, s.phase);
      dummy.scale.setScalar(s.size);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  return {
    group,
    update(dt, time, state, camera) {
      colour.setHex(state.keyLight);
      dustMat.color.copy(colour);
      sparkMat.color.copy(colour).lerp(white, 0.4);
      drift(dust, dustSeeds, state.dust, dt, time, state.dustSpeed, 0.35, camera.quaternion);
      drift(
        sparks,
        sparkSeeds,
        state.sparkles,
        dt,
        time,
        0.5 + state.dustSpeed * 0.5,
        0.15,
        camera.quaternion,
      );
      // petals fall rather than rise
      drift(petals, petalSeeds, state.petals, dt, time, 0.6, -0.5, null);
    },
    dispose() {
      [quad, petalGeo, dustMat, sparkMat, petalMat, dot].forEach((d) => d.dispose());
      group.clear();
      for (const m of [dust, sparks, petals]) m.dispose();
    },
  };
}
