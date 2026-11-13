/**
 * « Partage le gâteau » (dès 3 ans) : partager équitablement, reconnaître des parts égales,
 * la moitié et le quart, puis le tiers, les deux tiers, les trois quarts, et des découpes en
 * 6 et 8 parts. Logique pure, sans navigateur : niveaux, manches, découpes.
 * Les angles sont en degrés ; une part est un secteur [début, fin[ du gâteau rond.
 */
import type { Rng } from './models';

export const CAKE_LEVELS = 20;

export type Fraction = 'half' | 'third' | 'quarter' | 'twoThirds' | 'threeQuarters';

/** Part du gâteau de chaque fraction, en degrés. */
export const FRACTION_DEGREES: Record<Fraction, number> = { half: 180, third: 120, quarter: 90, twoThirds: 240, threeQuarters: 270 };

export type CakeRound =
  /** Le gâteau est déjà coupé (une part par ami) : donner une part à chacun. */
  | { kind: 'give'; level: number; friends: number }
  /** Des amis ont une part ; toucher celui qui a la plus petite. */
  | { kind: 'smallest'; level: number; slices: number[]; answer: number }
  /**
   * Couper le gâteau en `parts` parts égales. Traits droits par le milieu (2, 4, 6, 8 parts :
   * un trait, une croix, trois ou quatre traits) ; `radial` (3 parts) : trois traits du milieu
   * jusqu'au bord, en étoile.
   */
  | { kind: 'cut'; level: number; parts: 2 | 3 | 4 | 6 | 8; radial?: boolean }
  /** Trois gâteaux coupés ; toucher celui dont les parts sont toutes pareilles. */
  | { kind: 'equalPick'; level: number; cakes: number[][]; answer: number }
  /** Le gâteau est coupé en `parts` ; donner une fraction du gâteau à un ami (`need` parts). */
  | { kind: 'fraction'; level: number; target: Fraction; parts: number; need: number }
  /** Partager des cookies : chaque ami doit en avoir autant. */
  | { kind: 'cookies'; level: number; friends: number; total: number }
  /** Trois gâteaux entamés ; toucher celui dont on a mangé la moitié (le tiers, le quart). */
  | { kind: 'findFraction'; level: number; target: Fraction; taken: number[]; answer: number };

const pick = <T>(list: readonly T[], rng: Rng): T => list[Math.floor(rng() * list.length)];
const shuffle = <T>(list: T[], rng: Rng): T[] => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Parts inégales de `n` parts (en degrés, total 360) : jamais toutes pareilles. `subtle` :
 * un écart plus petit (plus difficile à voir).
 */
function unequal(n: number, rng: Rng, subtle = false): number[] {
  const base = 360 / n;
  const sizes = Array.from({ length: n }, () => base);
  // On prend à une part pour donner à une autre.
  const from = Math.floor(rng() * n);
  const to = (from + 1 + Math.floor(rng() * (n - 1))) % n;
  const moved = Math.round(base * (subtle ? 0.25 + rng() * 0.1 : 0.3 + rng() * 0.2));
  sizes[from] -= moved;
  sizes[to] += moved;
  return sizes;
}

/** Une fraction donnée avec un gâteau coupé en `parts` parts. */
const fraction = (level: number, target: Fraction, parts: number): CakeRound =>
  ({ kind: 'fraction', level, target, parts, need: Math.round((FRACTION_DEGREES[target] / 360) * parts) });

/** Trois gâteaux pareils (`n` parts), un seul coupé juste. */
function equalPick(level: number, ns: number[], rng: Rng, subtle = false): CakeRound {
  const n = pick(ns, rng);
  const answer = Math.floor(rng() * 3);
  const cakes = [0, 1, 2].map((i) => (i === answer ? Array.from({ length: n }, () => 360 / n) : unequal(n, rng, subtle)));
  return { kind: 'equalPick', level, cakes, answer };
}

/** Trois gâteaux entamés : la bonne fraction et deux autres. */
function findFraction(level: number, targets: Fraction[], others: Fraction[], rng: Rng): CakeRound {
  const target = pick(targets, rng);
  const distractors = shuffle(others.filter((f) => f !== target), rng).slice(0, 2);
  const taken = shuffle([target, ...distractors].map((f) => FRACTION_DEGREES[f]), rng);
  return { kind: 'findFraction', level, target, taken, answer: taken.indexOf(FRACTION_DEGREES[target]) };
}

/** Des amis avec une part chacun ; une seule est plus petite (de `gap` degrés). */
function smallest(level: number, friends: number, gaps: number[], rng: Rng): CakeRound {
  const base = 360 / friends;
  const gap = pick(gaps, rng);
  const answer = Math.floor(rng() * friends);
  const big = (360 - (base - gap)) / (friends - 1);
  return { kind: 'smallest', level, slices: Array.from({ length: friends }, (_, i) => (i === answer ? base - gap : big)), answer };
}

/**
 * Une manche du niveau (1 à 20) :
 * 1 donner une part à chacun · 2 la plus petite part · 3 couper en 2 · 4 couper en 4 ·
 * 5 le gâteau coupé juste · 6 la moitié · 7 le quart · 8 les cookies · 9 trouver la moitié, le quart ·
 * 10 couper en 3 (en étoile) · 11 le gâteau coupé juste (tiers, sixièmes) · 12 le tiers ·
 * 13 trouver la moitié, le tiers, le quart · 14 couper en 6 · 15 les cookies, à 3 ou 4 amis ·
 * 16 les deux tiers, les trois quarts · 17 couper en 8 · 18 la plus petite part, à 4 amis, écart fin ·
 * 19 le gâteau coupé juste (6 ou 8 parts, écart fin) · 20 toutes les fractions, gâteau coupé en 6, 8 ou 12.
 */
export function cakeRound(level: number, rng: Rng): CakeRound {
  const l = Math.max(1, Math.min(CAKE_LEVELS, Math.round(level)));
  switch (l) {
    case 1:
      return { kind: 'give', level: l, friends: pick([2, 3, 3, 4], rng) };
    case 2:
      return smallest(l, 3, [40, 50, 60], rng);
    case 3:
      return { kind: 'cut', level: l, parts: 2 };
    case 4:
      return { kind: 'cut', level: l, parts: 4 };
    case 5:
      return equalPick(l, [2, 3, 4], rng);
    case 6:
      return fraction(l, 'half', pick([2, 4], rng));
    case 7:
      return pick([fraction(l, 'quarter', 4), fraction(l, 'quarter', 8), fraction(l, 'half', 8)], rng);
    case 8: {
      const friends = pick([2, 3], rng);
      const each = pick(friends === 2 ? [2, 3, 4] : [2, 3], rng);
      return { kind: 'cookies', level: l, friends, total: friends * each };
    }
    case 9:
      return findFraction(l, ['half', 'quarter'], ['half', 'quarter', pick(['third', 'threeQuarters'] as Fraction[], rng)], rng);
    case 10:
      return { kind: 'cut', level: l, parts: 3, radial: true };
    case 11:
      return equalPick(l, [3, 6], rng);
    case 12:
      return fraction(l, 'third', pick([3, 6], rng));
    case 13:
      return findFraction(l, ['half', 'third', 'quarter'], ['half', 'third', 'quarter'], rng);
    case 14:
      return { kind: 'cut', level: l, parts: 6 };
    case 15: {
      const friends = pick([3, 4], rng);
      const each = pick(friends === 3 ? [3, 4, 5] : [3, 4], rng);
      return { kind: 'cookies', level: l, friends, total: friends * each };
    }
    case 16:
      return pick([fraction(l, 'twoThirds', 3), fraction(l, 'twoThirds', 6), fraction(l, 'threeQuarters', 4), fraction(l, 'threeQuarters', 8)], rng);
    case 17:
      return { kind: 'cut', level: l, parts: 8 };
    case 18:
      return smallest(l, 4, [20, 25, 30], rng);
    case 19:
      return equalPick(l, [6, 8], rng, true);
    default: {
      const target = pick(['half', 'third', 'quarter', 'twoThirds', 'threeQuarters'] as Fraction[], rng);
      const parts = target === 'third' || target === 'twoThirds' ? pick([6, 12], rng) : pick([8, 12], rng);
      return fraction(l, target, parts);
    }
  }
}

/** Parts égales (à `tolerance` degrés près) ? */
export function allEqual(sizes: number[], tolerance = 4): boolean {
  return sizes.every((s) => Math.abs(s - sizes[0]) <= tolerance);
}

/** Angle ramené dans [0, 360[. */
export const norm = (a: number) => ((a % 360) + 360) % 360;

/** Parts du gâteau coupé le long de ces rayons (angles des traits du milieu vers le bord). */
export function sectorsFromBounds(angles: number[]): { start: number; size: number }[] {
  const bounds = [...new Set(angles.map((a) => Math.round(norm(a) * 10) / 10))].sort((a, b) => a - b);
  if (bounds.length < 2) return [{ start: bounds[0] ?? -90, size: 360 }];
  return bounds.map((start, i) => ({ start, size: (i + 1 < bounds.length ? bounds[i + 1] : bounds[0] + 360) - start }));
}

/**
 * Parts du gâteau coupé par des traits qui passent tous par le milieu (un trait d'angle θ
 * coupe en θ et θ + 180°). Renvoie les secteurs [début, taille], dans l'ordre.
 */
export function sectorsFromCuts(cuts: number[]): { start: number; size: number }[] {
  return sectorsFromBounds(cuts.flatMap((a) => [a, a + 180]));
}

/**
 * Le trait tracé par l'enfant, de (x1, y1) à (x2, y2), sur un gâteau de centre (cx, cy) et de
 * rayon r. Il compte s'il traverse le gâteau ; il passe « par le milieu » s'il passe à moins
 * de 18 % du rayon du centre. L'angle est alors arrondi à 5° près (les petits doigts tremblent).
 */
export function readCut(x1: number, y1: number, x2: number, y2: number, cx: number, cy: number, r: number):
  { crosses: boolean; centered: boolean; angle: number } {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < r * 0.6) return { crosses: false, centered: false, angle: 0 };
  // Distance du centre à la droite, et position du point le plus proche sur le segment.
  const t = ((cx - x1) * dx + (cy - y1) * dy) / (len * len);
  const px = x1 + t * dx, py = y1 + t * dy;
  const dist = Math.hypot(px - cx, py - cy);
  const angle = Math.round(norm((Math.atan2(dy, dx) * 180) / Math.PI) / 5) * 5;
  return { crosses: dist < r, centered: dist < r * 0.18 && t > 0.1 && t < 0.9, angle: norm(angle) % 180 };
}

/**
 * Un nouveau trait droit, ramené à un multiple de `step` degrés du premier s'il en est
 * proche (à `tolerance` près) : les traits presque bien placés le deviennent.
 */
export function snapToStep(first: number, angle: number, step: number, tolerance: number): number {
  const diff = norm(angle - first) % 180;
  const k = Math.round(diff / step);
  return Math.abs(diff - k * step) <= tolerance ? norm(first + k * step) % 180 : angle;
}

/** Deux traits en croix : le second est ramené à angle droit s'il en est à moins de 20°. */
export const snapCross = (first: number, second: number) => snapToStep(first, second, 90, 20);

/** Écart entre les traits droits pour `parts` parts égales, et la tolérance de l'aimantation. */
export const cutStep = (parts: number) => ({ step: 360 / parts, tolerance: Math.min(20, 360 / parts / 3) });

/**
 * Le trait tracé du milieu vers le bord (coupe en étoile, pour les tiers). Il compte s'il
 * part du milieu (ou y arrive) et va jusqu'au bord ; l'angle est celui du milieu vers le bord.
 */
export function readRadial(x1: number, y1: number, x2: number, y2: number, cx: number, cy: number, r: number):
  { valid: boolean; fromCenter: boolean; angle: number } {
  const d1 = Math.hypot(x1 - cx, y1 - cy), d2 = Math.hypot(x2 - cx, y2 - cy);
  const [inner, outer] = d1 <= d2 ? [{ x: x1, y: y1, d: d1 }, { x: x2, y: y2, d: d2 }] : [{ x: x2, y: y2, d: d2 }, { x: x1, y: y1, d: d1 }];
  if (outer.d < r * 0.6) return { valid: false, fromCenter: false, angle: 0 };
  const angle = norm(Math.round(((Math.atan2(outer.y - cy, outer.x - cx) * 180) / Math.PI) / 5) * 5);
  return { valid: true, fromCenter: inner.d < r * 0.25, angle };
}

/** Un trait en étoile, ramené à un multiple de 360/`parts` du premier s'il en est proche. */
export function snapRadial(first: number, angle: number, parts: number): number {
  const step = 360 / parts;
  const diff = norm(angle - first);
  const k = Math.round(diff / step);
  return Math.abs(diff - k * step) <= Math.min(25, step / 4) ? norm(first + k * step) : angle;
}

/** Les cookies sont-ils partagés équitablement (tous donnés, autant pour chacun) ? */
export function fairShare(counts: number[], total: number): 'ok' | 'left' | 'uneven' {
  const given = counts.reduce((a, b) => a + b, 0);
  if (given < total) return 'left';
  return allEqual(counts, 0) ? 'ok' : 'uneven';
}
