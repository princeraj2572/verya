import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { dims } from './bottle';
import { createBottle, type PartId } from './bottleMesh';
import type { DeviceProfile } from './device';
import { createParticles } from './particles';
import { mapProgress, type SceneState } from './scrollMap';

export interface LabelPoint {
  /** pixels per world unit at this part, so labels can clear the glass */
  r: number;
  x: number;
  y: number;
}

export interface Scene3D {
  apply(state: SceneState): void;
  setLiquid(colour: number): void;
  labelPositions(): Record<PartId, LabelPoint>;
  /** draw one frame immediately (used for stills) */
  renderNow(): void;
  dispose(): void;
}

const PART_IDS: PartId[] = ['cap', 'neck', 'glass', 'liquid', 'base'];

/** Bakes two soft-boxes into the room environment so the glass has long, clean reflections. */
function buildEnvironment(): THREE.Scene {
  const env = new RoomEnvironment();
  const panel = (w: number, h: number, power: number, x: number, y: number, z: number): void => {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(power) });
    mat.toneMapped = false;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(x, y, z);
    mesh.lookAt(0, 1.6, 0);
    env.add(mesh);
  };
  panel(4, 7, 4, -5, 4, 3); // broad soft-box, camera left
  panel(1.2, 8, 6, 6, 3, -3); // thin strip behind right for a crisp rim reflection
  return env;
}

export function createScene(canvas: HTMLCanvasElement, profile: DeviceProfile): Scene3D {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !profile.mobile,
    powerPreference: 'high-performance',
  });
  let pixelRatio = Math.min(window.devicePixelRatio || 1, profile.pixelRatioCap);
  renderer.setPixelRatio(pixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);

  // environment: RoomEnvironment through PMREM
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = buildEnvironment();
  const envTarget = pmrem.fromScene(envScene, 0.04);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.75;

  // lights: warm key, cool-gold rim from behind, and a travelling highlight
  const key = new THREE.DirectionalLight(0xffe2b0, 2.2);
  key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(0xffd9a6, 3);
  rim.position.set(-4, 3, -5);
  const sweepLight = new THREE.PointLight(0xfff0d0, 0, 16, 2);
  scene.add(key, rim, sweepLight, new THREE.HemisphereLight(0xffffff, 0x201510, 0.25));

  const bottle = createBottle(profile.glass, profile.segments);
  bottle.group.position.y = -dims.centreY;
  const pivot = new THREE.Group();
  pivot.position.y = dims.centreY;
  pivot.add(bottle.group);
  const particles = createParticles(profile.density);
  scene.add(pivot, particles.group);

  let state = mapProgress(0);
  let idleAngle = 0;
  let aspect = 1;

  const resize = (): void => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  };

  const pose = (): void => {
    // pull the camera back on tall screens so the bottle always fits
    // chapters that share the screen with text get a little more room on tall screens
    const fit = aspect < 1 ? (1 + (1 - aspect) * 0.85) * (1 + Math.abs(state.shiftY) * 0.7) : 1;
    const dist = state.cameraZ * fit;
    // on tall screens the bottle rides in the upper half, clear of the text below it
    const lift = aspect <= 1 ? state.shiftY * Math.tan((camera.fov * Math.PI) / 360) * dist : 0;
    camera.position.set(0, state.cameraY - lift, dist);
    camera.lookAt(0, state.lookY - lift, 0);
    pivot.rotation.set(state.tiltX, state.rotationY + idleAngle, state.tiltZ);
    // on wide screens the bottle steps aside for the text; on tall screens it stays centred
    const halfWidth = Math.tan((camera.fov * Math.PI) / 360) * state.cameraZ * fit * aspect;
    pivot.position.x = aspect > 1 ? state.shiftX * halfWidth : 0;
    bottle.setExplode(state.explode);
    key.color.setHex(state.keyLight);
    key.intensity = 2.2 * state.keyIntensity;
    rim.intensity = 3 * state.rimIntensity;
    (scene.background as THREE.Color).setHex(state.background);
    const s = Math.sin(Math.PI * state.sweep);
    sweepLight.intensity = 70 * s;
    sweepLight.position.set(-5 + 10 * state.sweep, 3.2, 3.5);
  };

  let liquid = 0xd9822b;
  const paintLiquid = (): void => bottle.setLiquid(liquid, state.warmth, state.glow);

  // --- render loop: paused when the tab is hidden or the canvas is offscreen -----------
  let raf = 0;
  let last = 0;
  let time = 0;
  let onScreen = true;
  let frames = 0;
  let slowFrames = 0;

  const frame = (now: number): void => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    time += dt;
    idleAngle += dt * 0.18 * state.idle;
    idleAngle *= 1 - (1 - state.idle) * Math.min(1, dt * 1.5);
    pose();
    paintLiquid();
    particles.update(dt, time, state, camera);
    renderer.render(scene, camera);

    // adaptive quality: after warm-up, drop to simple glass and 1x pixels if the device struggles
    frames++;
    if (frames > 30 && frames <= 150 && dt > 0.034) slowFrames++;
    if (profile.adaptive && frames === 150 && slowFrames > 60) {
      pixelRatio = 1;
      renderer.setPixelRatio(1);
      resize();
      bottle.setGlassQuality('simple');
    }
  };

  const shouldRun = (): boolean => !document.hidden && onScreen;
  const sync = (): void => {
    if (shouldRun() && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (!shouldRun() && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const observer = new IntersectionObserver((entries) => {
    onScreen = entries.some((e) => e.isIntersecting);
    sync();
  });
  observer.observe(canvas);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('resize', resize);
  resize();
  pose();
  paintLiquid();
  sync();

  const v = new THREE.Vector3();
  const unitX = new THREE.Vector3(1, 0, 0);
  return {
    apply(next) {
      state = next;
    },
    setLiquid(colour) {
      liquid = colour;
    },
    labelPositions() {
      const out = {} as Record<PartId, LabelPoint>;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      for (const id of PART_IDS) {
        bottle.labelPoint(id, v);
        const edge = v.clone().add(unitX).project(camera);
        v.project(camera);
        const x = ((v.x + 1) / 2) * w;
        out[id] = { x, y: ((1 - v.y) / 2) * h, r: Math.abs(((edge.x + 1) / 2) * w - x) };
      }
      return out;
    },
    renderNow() {
      pose();
      paintLiquid();
      particles.update(0.016, time, state, camera);
      renderer.render(scene, camera);
    },
    dispose() {
      cancelAnimationFrame(raf);
      raf = 0;
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('resize', resize);
      bottle.dispose();
      particles.dispose();
      envScene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
      envTarget.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
