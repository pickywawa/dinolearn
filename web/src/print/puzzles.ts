import { Rng, pick } from '../domain/models';
import { dinoAt, propAt } from './dino';
import { footerOf, guide } from './common';
import { GREY, INK, LIGHT, PAGE_W, image, n, page, text } from './svg';
import { PrintKind } from './types';

// ---- Labyrinthe ----

/** Passages ouverts de chaque case : 1 = haut, 2 = droite, 4 = bas, 8 = gauche. */
export interface Maze {
  cols: number;
  rows: number;
  open: number[][];
}

const DIRS = [
  { bit: 1, dr: -1, dc: 0, back: 4 },
  { bit: 2, dr: 0, dc: 1, back: 8 },
  { bit: 4, dr: 1, dc: 0, back: 1 },
  { bit: 8, dr: 0, dc: -1, back: 2 },
];

/** Labyrinthe parfait (un seul chemin entre deux cases), creusé en profondeur. */
export function generateMaze(cols: number, rows: number, rng: Rng): Maze {
  const open = Array.from({ length: rows }, () => Array<number>(cols).fill(0));
  const seen = Array.from({ length: rows }, () => Array<boolean>(cols).fill(false));
  const stack: [number, number][] = [[0, 0]];
  seen[0][0] = true;
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const next = DIRS.filter((d) => {
      const [nr, nc] = [r + d.dr, c + d.dc];
      return nr >= 0 && nr < rows && nc >= 0 && nc < cols && !seen[nr][nc];
    });
    if (next.length === 0) {
      stack.pop();
      continue;
    }
    const d = next[Math.floor(rng() * next.length)];
    const [nr, nc] = [r + d.dr, c + d.dc];
    open[r][c] |= d.bit;
    open[nr][nc] |= d.back;
    seen[nr][nc] = true;
    stack.push([nr, nc]);
  }
  return { cols, rows, open };
}

/** Chemin de la case en haut à gauche à la case en bas à droite. */
export function solveMaze(m: Maze): [number, number][] {
  const prev = new Map<string, string>();
  const key = (r: number, c: number) => `${r},${c}`;
  const queue: [number, number][] = [[0, 0]];
  prev.set(key(0, 0), '');
  while (queue.length) {
    const [r, c] = queue.shift()!;
    if (r === m.rows - 1 && c === m.cols - 1) break;
    for (const d of DIRS) {
      if (!(m.open[r][c] & d.bit)) continue;
      const [nr, nc] = [r + d.dr, c + d.dc];
      if (prev.has(key(nr, nc))) continue;
      prev.set(key(nr, nc), key(r, c));
      queue.push([nr, nc]);
    }
  }
  const path: [number, number][] = [];
  let k = key(m.rows - 1, m.cols - 1);
  while (k) {
    const [r, c] = k.split(',').map(Number);
    path.unshift([r, c]);
    k = prev.get(k) ?? '';
  }
  return path;
}

/** Taille du labyrinthe selon l'âge : 4 × 5 cases à 3 ans, 14 × 18 à 7 ans. */
export const mazeSize = (age: number): [number, number] =>
  ([[4, 5], [6, 8], [8, 10], [11, 14], [14, 18]] as [number, number][])[Math.max(0, Math.min(4, age - 3))];

/** Dessin des murs, en mm, coin haut-gauche en (x, y). */
function mazeWalls(m: Maze, x: number, y: number, cell: number, width: number, color = INK) {
  let d = '';
  // Bord du haut (avec l'entrée sur la première case) et bord gauche.
  d += `M${n(x + cell)} ${n(y)} L${n(x + m.cols * cell)} ${n(y)} M${n(x)} ${n(y)} L${n(x)} ${n(y + m.rows * cell)} `;
  for (let r = 0; r < m.rows; r++) {
    for (let c = 0; c < m.cols; c++) {
      const [cx, cy] = [x + c * cell, y + r * cell];
      if (!(m.open[r][c] & 2)) d += `M${n(cx + cell)} ${n(cy)} L${n(cx + cell)} ${n(cy + cell)} `;
      // La sortie : pas de mur en bas de la dernière case.
      const exit = r === m.rows - 1 && c === m.cols - 1;
      if (!(m.open[r][c] & 4) && !exit) d += `M${n(cx)} ${n(cy + cell)} L${n(cx + cell)} ${n(cy + cell)} `;
    }
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${n(width)}" stroke-linecap="round"/>`;
}

const GOALS = [
  { said: 'Aide-moi à retrouver mon œuf !', draw: (x: number, y: number, s: number, _friend: number) => propAt('egg', x - s * 0.4, y, s * 0.8) },
  { said: 'Aide-moi à aller jusqu\'aux fruits !', draw: (x: number, y: number, s: number, _friend: number) => image('ui-basket', x - s / 2, y, s) },
  { said: 'Aide-moi à rejoindre mon copain !', draw: (x: number, y: number, s: number, friend: number) => dinoAt({ color: friend }, x, y + s, s, true) },
];

export const MAZE: PrintKind = {
  id: 'maze',
  family: 'puzzle',
  title: 'Labyrinthe',
  said: 'un labyrinthe',
  icon: 'pr-maze',
  minAge: 3,
  envelope: true,
  build(ctx, rng) {
    const [cols, rows] = mazeSize(ctx.age);
    const m = generateMaze(cols, rows, rng);
    const cell = Math.min(170 / cols, 196 / rows);
    const x = (PAGE_W - cols * cell) / 2;
    const y = 56;
    const goal = pick(GOALS, rng);
    const wall = Math.max(0.9, Math.min(2.4, cell * 0.09));
    const bottom = y + rows * cell;
    const s = Math.min(26, Math.max(16, cell * 1.4));
    // L'entrée : le dino de l'enfant au-dessus de la première case, une flèche vers le bas.
    const arrow = (ax: number, ay: number) =>
      `<path d="M${n(ax)} ${n(ay)} l0 6 m-2.5 -2.5 l2.5 2.5 l2.5 -2.5" fill="none" stroke="#43b649" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`;
    const body = guide(ctx, x + cell / 2 - 14, y - 2, 30, [goal.said], 80, 4.2)
      + arrow(x + cell / 2, y - 7)
      + mazeWalls(m, x, y, cell, wall)
      + arrow(x + (cols - 0.5) * cell, bottom + 1)
      + goal.draw(x + (cols - 0.5) * cell, bottom + 8, s, (ctx.color + 3) % 10);
    // Solution (pour les parents, dans l'aperçu seulement).
    const path = solveMaze(m);
    const k = 60 / Math.max(cols, rows);
    const line = path.map(([r, c], i) => `${i ? 'L' : 'M'}${n((c + 0.5) * k)} ${n((r + 0.5) * k)}`).join(' ');
    const solutionSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${n(cols * k + 4)} ${n(rows * k + 4)}">`
      + mazeWalls(m, 0, 0, k, 0.5, GREY)
      + `<path d="M${n(0.5 * k)} -2 L${line.slice(1)} L${n((cols - 0.5) * k)} ${n(rows * k + 2)}" fill="none" stroke="#e5484d" stroke-width="${n(k * 0.25)}" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
    return {
      title: 'Labyrinthe',
      pages: [page(body, { footer: footerOf(ctx) })],
      advice: {
        skills: ['Repérage dans l\'espace et anticipation', 'Motricité fine : tracer sans toucher les murs', 'Persévérance (revenir en arrière quand ça bloque)'],
        talk: ctx.age <= 4
          ? 'Faites d\'abord le chemin avec le doigt, puis au crayon. S\'il touche un mur, ce n\'est pas grave : on continue.'
          : 'Encouragez-le à regarder loin devant avant de tracer. Les impasses font partie du jeu : il peut revenir en arrière.',
        further: 'Dessinez un labyrinthe à la craie dans la cour, ou faites un parcours avec des coussins à la maison.',
        material: 'Un crayon (ou un feutre effaçable sous une pochette plastique, pour recommencer).',
        solutionSvg,
      },
    };
  },
};

// ---- Points à relier ----

type P = [number, number];

/** Formes à relier (contours fermés, dans un carré 0–1) et quelques détails dessinés en plus. */
const SHAPES: Record<string, { name: string; points: P[]; details?: string; min: number; max: number }> = {
  star: {
    name: 'une étoile', min: 8, max: 20,
    points: Array.from({ length: 10 }, (_, i): P => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? 0.48 : 0.2;
      return [0.5 + r * Math.cos(a), 0.53 + r * Math.sin(a)];
    }),
  },
  house: {
    name: 'une maison', min: 5, max: 16,
    points: [[0.15, 0.95], [0.15, 0.45], [0.5, 0.08], [0.85, 0.45], [0.85, 0.95]],
    details: '<rect x="0.42" y="0.68" width="0.16" height="0.27"/><rect x="0.22" y="0.52" width="0.13" height="0.12"/><rect x="0.65" y="0.52" width="0.13" height="0.12"/>',
  },
  fish: {
    name: 'un poisson', min: 11, max: 24,
    points: [[0.04, 0.26], [0.24, 0.46], [0.4, 0.28], [0.6, 0.2], [0.8, 0.28], [0.96, 0.5], [0.8, 0.72], [0.6, 0.8], [0.4, 0.72], [0.24, 0.54], [0.04, 0.74]],
    details: '<circle cx="0.8" cy="0.43" r="0.025"/><path d="M0.55 0.35 q0.06 0.15 0 0.3" fill="none"/>',
  },
  heart: {
    name: 'un cœur', min: 12, max: 30,
    points: Array.from({ length: 12 }, (_, i): P => {
      const t = (i / 12) * Math.PI * 2;
      const x = 16 * Math.sin(t) ** 3;
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      return [0.5 + x / 36, 0.45 + y / 36];
    }),
  },
  dino: {
    name: 'un dinosaure', min: 20, max: 60,
    points: [
      [0.02, 0.62], [0.12, 0.57], [0.22, 0.5], [0.32, 0.44], [0.42, 0.38], [0.52, 0.36], [0.6, 0.38], [0.66, 0.33],
      [0.7, 0.24], [0.72, 0.15], [0.75, 0.09], [0.8, 0.06], [0.86, 0.07], [0.91, 0.1], [0.94, 0.14], [0.91, 0.18],
      [0.84, 0.18], [0.8, 0.2], [0.78, 0.28], [0.76, 0.37], [0.75, 0.47], [0.73, 0.56], [0.73, 0.7], [0.74, 0.84],
      [0.66, 0.84], [0.66, 0.7], [0.6, 0.66], [0.5, 0.67], [0.43, 0.7], [0.43, 0.84], [0.34, 0.84], [0.33, 0.7],
      [0.25, 0.66], [0.14, 0.65],
    ],
    details: '<circle cx="0.84" cy="0.115" r="0.012"/><path d="M0.86 0.155 q0.03 0.01 0.06 -0.01" fill="none"/><path d="M0 0.85 L1 0.85" fill="none"/>',
  },
};

/** `count` points le long du contour : tous les sommets, puis des points en plus sur les côtés les plus longs. */
export function dotsAlong(points: P[], count: number): P[] {
  if (count <= points.length) {
    return Array.from({ length: count }, (_, i) => points[Math.round((i * points.length) / count) % points.length]);
  }
  const edges = points.map((p, i) => {
    const q = points[(i + 1) % points.length];
    return { p, q, len: Math.hypot(q[0] - p[0], q[1] - p[1]) };
  });
  const total = edges.reduce((s, e) => s + e.len, 0);
  const extra = count - points.length;
  // Répartition au plus fort reste.
  const raw = edges.map((e) => (e.len / total) * extra);
  const share = raw.map(Math.floor);
  let left = extra - share.reduce((s, x) => s + x, 0);
  raw.map((x, i) => [x - Math.floor(x), i] as const).sort((a, b) => b[0] - a[0]).forEach(([, i]) => {
    if (left-- > 0) share[i]++;
  });
  const out: P[] = [];
  edges.forEach((e, i) => {
    for (let k = 0; k <= share[i]; k++) {
      const t = k / (share[i] + 1);
      out.push([e.p[0] + (e.q[0] - e.p[0]) * t, e.p[1] + (e.q[1] - e.p[1]) * t]);
    }
  });
  return out;
}

/** Nombre de points selon l'âge et le niveau atteint dans « Les nombres ». */
export function dotCount(age: number, numbersLevel: number) {
  const base = [10, 15, 20, 30, 40][Math.max(0, Math.min(4, age - 3))];
  return Math.min(60, base + (numbersLevel >= 14 && age >= 5 ? 10 : 0));
}

export const DOTS: PrintKind = {
  id: 'dots',
  family: 'puzzle',
  title: 'Points à relier',
  said: 'des points à relier',
  icon: 'pr-dots',
  minAge: 3,
  envelope: true,
  build(ctx, rng) {
    const count = dotCount(ctx.age, ctx.gameLevel('LO-6'));
    const shapes = Object.entries(SHAPES).filter(([, s]) => count >= s.min && count <= s.max);
    const [shapeId, shape] = pick(shapes, rng);
    const dots = dotsAlong(shape.points, count);
    const [bx, by, size] = [28, 50, 158];
    const cx = dots.reduce((s, p) => s + p[0], 0) / dots.length;
    const cy = dots.reduce((s, p) => s + p[1], 0) / dots.length;
    const font = count <= 10 ? 6 : count <= 20 ? 4.8 : count <= 30 ? 4 : 3.4;
    let out = `<g transform="translate(${bx} ${by}) scale(${size})" stroke="${LIGHT}" stroke-width="${n(0.8 / size)}" fill="${LIGHT}">${shape.details ?? ''}</g>`;
    dots.forEach(([px, py], i) => {
      const x = bx + px * size;
      const y = by + py * size;
      const dx = px - cx;
      const dy = py - cy;
      const len = Math.hypot(dx, dy) || 1;
      const off = font * 0.95;
      const first = i === 0;
      out += `<circle cx="${n(x)}" cy="${n(y)}" r="${first ? 1.6 : 1.1}" fill="${first ? '#43b649' : INK}"/>`;
      out += text(x + (dx / len) * off, y + (dy / len) * off + font * 0.35, font, String(i + 1), { fill: first ? '#2f8a34' : INK });
    });
    const body = text(PAGE_W / 2, 27, 6.5, `Relie les points de 1 à ${count} !`)
      + out
      + guide(ctx, 30, 272, 30, ['Qu\'est-ce qui va apparaître ?'], 72, 3.8);
    return {
      title: `Points à relier : ${shape.name}`,
      pages: [page(body, { footer: footerOf(ctx) })],
      advice: {
        skills: [`La suite des nombres de 1 à ${count}`, 'Reconnaître les nombres écrits', 'Tracer des traits droits d\'un point à un autre'],
        talk: 'Avant de commencer, faites-le compter à voix haute en montrant les points du doigt. '
          + (count > 20 ? 'Après 20, il peut s\'aider des dizaines : « vingt et un, vingt-deux… ».' : 'Le point vert, c\'est le départ.'),
        further: 'Comptez ensemble les marches de l\'escalier, ou les voitures rouges en promenade.',
        material: 'Un crayon à papier, puis des crayons de couleur pour colorier le dessin.',
        solution: `On obtient ${shape.name}${shapeId === 'dino' ? ' (un diplodocus)' : ''}.`,
      },
    };
  },
};
