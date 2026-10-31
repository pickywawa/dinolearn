import { FRUITS, Rng, pick, shuffle } from '../domain/models';
import { DinoLook, dinoAt, propAt, propHeight } from './dino';
import { INK, n } from './svg';

/**
 * Paysage préhistorique dessiné dans une boîte (mm) : volcan, fougères,
 * ptérodactyle, œuf, fleurs, cailloux… et le dino de l'enfant au milieu.
 * Chaque élément a un identifiant, et parfois une variante : le jeu des
 * différences enlève ou change quelques éléments dans la seconde image.
 */

export interface SceneElement {
  id: string;
  /** Ce qui change, dit aux parents (solution du jeu des différences). */
  label: string;
  svg: string;
  /** Variante (sinon l'élément disparaît). */
  alt?: string;
  altLabel?: string;
  /** Peut être enlevé ou changé pour le jeu des différences. */
  changeable: boolean;
}

export interface SceneOptions {
  look: DinoLook;
  /** 1 (peu de détails, 3 ans) à 3 (beaucoup de détails, 7 ans). */
  detail: number;
}

const sun = (x: number, y: number, r: number, rays = true) => {
  let out = `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="#ffd23f" stroke="${INK}" stroke-width="0.9"/>`;
  if (rays) {
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      out += `<path d="M${n(x + Math.cos(a) * r * 1.35)} ${n(y + Math.sin(a) * r * 1.35)} L${n(x + Math.cos(a) * r * 1.85)} ${n(y + Math.sin(a) * r * 1.85)}" stroke="#ff9f43" stroke-width="1.4" stroke-linecap="round"/>`;
    }
  }
  return out + `<path d="M${n(x - r * 0.4)} ${n(y + r * 0.25)} Q${n(x)} ${n(y + r * 0.6)} ${n(x + r * 0.4)} ${n(y + r * 0.25)}" fill="none" stroke="${INK}" stroke-width="0.8" stroke-linecap="round"/>`
    + `<circle cx="${n(x - r * 0.3)}" cy="${n(y - r * 0.15)}" r="${n(r * 0.09)}" fill="${INK}"/><circle cx="${n(x + r * 0.3)}" cy="${n(y - r * 0.15)}" r="${n(r * 0.09)}" fill="${INK}"/>`;
};

const cloud = (x: number, y: number, w: number) => {
  const k = w / 40;
  return `<path transform="translate(${n(x)} ${n(y)}) scale(${n(k)})" d="M6 18 C0 18 0 10 6 10 C6 3 16 1 19 7 C22 1 33 2 33 10 C40 10 40 18 34 18 Z" fill="#fff" stroke="${INK}" stroke-width="${n(0.8 / k)}" stroke-linejoin="round"/>`;
};

const flower = (x: number, y: number, r: number, petal: string) => {
  let out = `<path d="M${n(x)} ${n(y)} L${n(x)} ${n(y + r * 3)}" stroke="#43b649" stroke-width="0.9"/>`;
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    out += `<circle cx="${n(x + Math.cos(a) * r)}" cy="${n(y + Math.sin(a) * r)}" r="${n(r * 0.7)}" fill="${petal}" stroke="${INK}" stroke-width="0.6"/>`;
  }
  return out + `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r * 0.55)}" fill="#ffd23f" stroke="${INK}" stroke-width="0.6"/>`;
};

const stone = (x: number, y: number, w: number) =>
  `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(w / 2)}" ry="${n(w / 3.2)}" fill="#c3c8d4" stroke="${INK}" stroke-width="0.8"/>`
  + `<path d="M${n(x - w * 0.25)} ${n(y - w * 0.08)} q${n(w * 0.12)} ${n(-w * 0.1)} ${n(w * 0.25)} 0" fill="none" stroke="#fff" stroke-width="0.6"/>`;

const grass = (x: number, y: number, h: number) =>
  `<path d="M${n(x - h * 0.4)} ${n(y)} L${n(x - h * 0.2)} ${n(y - h)} L${n(x)} ${n(y)} L${n(x + h * 0.15)} ${n(y - h * 0.8)} L${n(x + h * 0.35)} ${n(y)}" fill="none" stroke="#3f8f2f" stroke-width="0.8" stroke-linejoin="round"/>`;

const smoke = (x: number, y: number, r: number) =>
  [0, 1, 2].map((i) => `<circle cx="${n(x + i * r * 0.8)}" cy="${n(y - i * r * 1.4)}" r="${n(r * (1 + i * 0.35))}" fill="#eef0f6" stroke="${INK}" stroke-width="0.7"/>`).join('');

/** Tous les éléments, du fond vers l'avant. */
export function sceneElements(w: number, h: number, opts: SceneOptions, rng: Rng): SceneElement[] {
  const { look, detail } = opts;
  const ground = h * 0.72;
  const els: SceneElement[] = [];
  const add = (e: Omit<SceneElement, 'changeable'> & { changeable?: boolean }) => els.push({ changeable: true, ...e });

  add({ id: 'sun', label: 'le soleil', svg: sun(w * 0.86, h * 0.13, h * 0.06), alt: sun(w * 0.86, h * 0.13, h * 0.06, false), altLabel: 'les rayons du soleil' });
  add({ id: 'cloud1', label: 'un nuage', svg: cloud(w * 0.42, h * 0.05, w * 0.18) });
  if (detail >= 2) add({ id: 'cloud2', label: 'un nuage', svg: cloud(w * 0.22, h * 0.13, w * 0.11) });
  const vw = w * 0.42;
  const vh = propHeight('volcano', vw);
  add({ id: 'volcano', label: 'le volcan', svg: propAt('volcano', -w * 0.04, ground - vh * 0.92, vw), changeable: false });
  add({ id: 'smoke', label: 'la fumée du volcan', svg: smoke(w * 0.15, ground - vh * 0.98, h * 0.025) });
  add({
    id: 'ptero', label: 'le ptérodactyle', svg: propAt('ptero-up', w * 0.58, h * 0.2, w * 0.2),
    alt: propAt('ptero-down', w * 0.58, h * 0.2, w * 0.2), altLabel: 'les ailes du ptérodactyle',
  });
  // Sol : une colline douce.
  add({
    id: 'ground', label: 'le sol', changeable: false,
    svg: `<path d="M0 ${n(ground)} C${n(w * 0.25)} ${n(ground - h * 0.04)} ${n(w * 0.55)} ${n(ground + h * 0.03)} ${n(w)} ${n(ground - h * 0.02)} L${n(w)} ${n(h)} L0 ${n(h)} Z" fill="#9ad66b" stroke="${INK}" stroke-width="0.9"/>`,
  });
  const fw = w * 0.2;
  add({ id: 'fern1', label: 'une fougère', svg: propAt('fern', w * 0.78, ground - propHeight('fern', fw) * 0.92, fw) });
  if (detail >= 2) add({ id: 'fern2', label: 'une fougère', svg: propAt('fern', w * 0.66, ground - propHeight('fern', fw * 0.7) * 0.85, fw * 0.7, false, true) });
  if (detail >= 3) add({ id: 'fern3', label: 'une petite fougère', svg: propAt('fern', -w * 0.02, ground - propHeight('fern', fw * 0.6) * 0.6, fw * 0.6) });
  const ew = w * 0.1;
  add({ id: 'egg', label: 'l\'œuf', svg: propAt('egg', w * 0.08, h * 0.83, ew), alt: propAt('egg', w * 0.08, h * 0.83, ew * 0.75), altLabel: 'la taille de l\'œuf' });
  const petals = shuffle(['#ff8fa3', '#b58cec', '#62aef2', '#ff7070'], rng);
  add({ id: 'flower1', label: 'une fleur', svg: flower(w * 0.92, h * 0.86, h * 0.018, petals[0]), alt: flower(w * 0.92, h * 0.86, h * 0.018, petals[1]), altLabel: 'la couleur d\'une fleur' });
  if (detail >= 2) add({ id: 'flower2', label: 'une fleur', svg: flower(w * 0.27, h * 0.9, h * 0.015, petals[2]) });
  add({ id: 'stone1', label: 'un caillou', svg: stone(w * 0.84, h * 0.95, w * 0.07) });
  if (detail >= 2) add({ id: 'stone2', label: 'un caillou', svg: stone(w * 0.2, h * 0.79, w * 0.05) });
  if (detail >= 3) {
    add({ id: 'grass1', label: 'une touffe d\'herbe', svg: grass(w * 0.62, h * 0.97, h * 0.04) });
    add({ id: 'grass2', label: 'une touffe d\'herbe', svg: grass(w * 0.04, h * 0.98, h * 0.035) });
    add({ id: 'butterfly', label: 'le papillon', svg: `<image href="img/decor-butterfly.svg" x="${n(w * 0.3)}" y="${n(h * 0.3)}" width="${n(w * 0.07)}" height="${n(w * 0.07)}"/>` });
  }
  const [f1, f2] = shuffle([...FRUITS], rng);
  const fs = w * 0.08;
  add({
    id: 'fruit', label: 'le fruit', svg: `<image href="img/food-${f1}.svg" x="${n(w * 0.68)}" y="${n(h * 0.86)}" width="${n(fs)}" height="${n(fs)}"/>`,
    alt: `<image href="img/food-${f2}.svg" x="${n(w * 0.68)}" y="${n(h * 0.86)}" width="${n(fs)}" height="${n(fs)}"/>`, altLabel: 'le fruit',
  });
  // Le dino de l'enfant, au milieu, bien grand.
  const dh = h * 0.56;
  const dx = w * 0.47;
  const dy = h * 0.95;
  const variants: [string, DinoLook][] = [
    ['les yeux du dino', { ...look, eyes: 'happy' }],
    ['la bouche du dino', { ...look, mouth: 'open' }],
  ];
  if ((look.worn ?? []).length > 0) variants.push(['un objet du dino', { ...look, worn: (look.worn ?? []).slice(1) }]);
  const [altLabel, altLook] = pick(variants, rng);
  add({ id: 'dino', label: 'le dino', svg: dinoAt(look, dx, dy, dh), alt: dinoAt(altLook, dx, dy, dh), altLabel });
  return els;
}

/** Assemble les éléments ; `changed` : identifiants enlevés ou remplacés par leur variante. */
export function drawScene(els: SceneElement[], changed: ReadonlySet<string> = new Set()) {
  return els.map((e) => (changed.has(e.id) ? e.alt ?? '' : e.svg)).join('');
}

/** Images en gris très pâle (fiches à colorier). */
export const paleImages = (svg: string) => svg.replace(/<image (?![^>]*filter=)/g, '<image filter="url(#pale)" ');

/** Choisit `count` différences ; l'élément « dino » change toujours (c'est le plus amusant). */
export function pickDifferences(els: SceneElement[], count: number, rng: Rng): SceneElement[] {
  const dino = els.find((e) => e.id === 'dino');
  const others = shuffle(els.filter((e) => e.changeable && e.id !== 'dino'), rng);
  return [...(dino ? [dino] : []), ...others].slice(0, count);
}
