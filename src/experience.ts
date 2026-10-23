// The WebGL branch: one GSAP timeline scrubbed by scroll produces a single progress value (0 to 1);
// mapProgress turns it into scene state. Loaded lazily so the static version stays tiny.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { chapters } from './content';
import type { DeviceProfile } from './device';
import type { EditionStore } from './editionStore';
import type { Nav } from './nav';
import { createScene } from './scene';
import { CHAPTER_COUNT, chapterProgress, mapProgress, type SceneState } from './scrollMap';
import type { PartId } from './bottleMesh';

const hex = (n: number): string => `#${n.toString(16).padStart(6, '0')}`;
const LEFT: PartId[] = ['neck', 'liquid'];
const PART_RADIUS: Record<PartId, number> = {
  cap: 0.7,
  neck: 0.45,
  glass: 1.33,
  liquid: 1.18,
  base: 1.2,
};

export interface ExperienceOptions {
  profile: DeviceProfile;
  store: EditionStore;
  nav: Nav;
  /** render a single chapter without scrolling (used to capture stills) */
  still?: number;
}

export function startExperience({ profile, store, nav, still }: ExperienceOptions): () => void {
  const canvas = document.querySelector<HTMLCanvasElement>('#stage');
  const main = document.querySelector<HTMLElement>('#main');
  if (!canvas || !main) throw new Error('Stage markup is missing');

  const scene = createScene(canvas, profile);
  const rootStyle = document.documentElement.style;
  const labels = [...document.querySelectorAll<HTMLElement>('.part-label')];
  const offStore = store.subscribe((e) => scene.setLiquid(e.liquid));
  scene.setLiquid(store.current().liquid);

  const paint = (state: SceneState, progress: number): void => {
    scene.apply(state);
    rootStyle.setProperty('--bg', hex(state.background));
    rootStyle.setProperty('--ink', hex(state.ink));
    nav.setProgress(progress);
    nav.setActive(state.chapter);
    const show = state.explode > 0.02;
    if (show) {
      const pos = scene.labelPositions();
      for (const el of labels) {
        const id = el.dataset.part as PartId;
        const p = pos[id];
        const left = LEFT.includes(id);
        el.dataset.side = left ? 'left' : 'right';
        el.style.transform = `translate3d(${p.x + (left ? -1 : 1) * (p.r * PART_RADIUS[id] + (profile.mobile ? 8 : 28))}px, ${p.y}px, 0)`;
        el.style.opacity = String(Math.max(0, (state.explode - 0.5) * 2));
      }
    } else {
      for (const el of labels) el.style.opacity = '0';
    }
  };

  if (still !== undefined) {
    const state = { ...mapProgress(chapterProgress(still)), idle: 0 };
    paint(state, chapterProgress(still));
    scene.renderNow();
    return () => scene.dispose();
  }

  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 3) });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number): void => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  const proxy = { p: 0 };
  const timeline = gsap.timeline({
    scrollTrigger: { trigger: main, start: 'top top', end: 'bottom bottom', scrub: true },
  });
  timeline.to(proxy, {
    p: 1,
    ease: 'none',
    duration: 1,
    onUpdate: () => paint(mapProgress(proxy.p), proxy.p),
  });
  paint(mapProgress(0), 0);
  window.addEventListener('resize', () => paint(mapProgress(proxy.p), proxy.p));

  const goTo = (index: number): void => {
    const target = document.getElementById(chapters[index]?.id ?? '');
    if (!target) return;
    lenis.scrollTo(target, {
      duration: 1.8,
      onComplete: () => target.focus({ preventScroll: true }),
    });
  };
  window.__veyraGoTo = goTo;

  return () => {
    offStore();
    timeline.scrollTrigger?.kill();
    timeline.kill();
    gsap.ticker.remove(tick);
    lenis.destroy();
    scene.dispose();
  };
}

export { CHAPTER_COUNT };

declare global {
  interface Window {
    __veyraGoTo?: (index: number) => void;
  }
}
