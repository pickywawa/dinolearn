import { Rng } from './models';

/**
 * « Programme le dino » : la logique, sans Phaser.
 *
 * Un plateau quadrillé, le dino sur une case, un ou deux fruits à ramasser, des
 * rochers et de l'eau à contourner. Les flèches sont absolues (↑ = vers le haut
 * de l'écran). Deux façons de jouer :
 * - mode direct (petits) : chaque flèche fait avancer le dino tout de suite ;
 * - mode programme : on aligne les flèches, puis on lance ; le dino les exécute
 *   toutes. Au CP, une flèche peut être répétée (×2, ×3) : la boucle.
 */

export type Dir = 'up' | 'right' | 'down' | 'left';
export const DIRS: Dir[] = ['up', 'right', 'down', 'left'];
export const DELTA: Record<Dir, [number, number]> = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };

export interface Cell { x: number; y: number }
const key = (c: Cell) => `${c.x},${c.y}`;
const same = (a: Cell, b: Cell) => a.x === b.x && a.y === b.y;

export interface Puzzle {
  level: number;
  cols: number;
  rows: number;
  start: Cell;
  /** Fruits à ramasser (dans n'importe quel ordre). */
  fruits: Cell[];
  rocks: Cell[];
  water: Cell[];
  mode: 'direct' | 'program';
  /** Répéter une flèche (×2, ×3) est possible. */
  loops: boolean;
  /** Cases de la barre du programme. */
  slots: number;
  /** Nombre de flèches du programme le plus court (en comptant ×2 et ×3 comme une seule flèche s'il y a les boucles). */
  best: number;
}

export interface Command { dir: Dir; times: number }

/** Ce qui change d'un niveau à l'autre (1 à 20). */
export interface LevelSpec {
  cols: number;
  rows: number;
  /** Longueur du chemin le plus court (en cases), du dino au(x) fruit(s). */
  path: [number, number];
  /** Nombre minimal de virages sur ce chemin. */
  turns: number;
  obstacles: number;
  /** Part d'eau parmi les obstacles (le reste : des rochers). */
  water: number;
  fruits: number;
  mode: 'direct' | 'program';
  loops: boolean;
  /** Cases de la barre du programme en plus du programme le plus court. */
  spare: number;
}

export function levelSpec(level: number): LevelSpec {
  const l = Math.max(1, Math.min(20, Math.round(level)));
  const base = { water: 0, fruits: 1, loops: false, spare: 2 };
  if (l === 1) return { ...base, cols: 3, rows: 3, path: [1, 2], turns: 0, obstacles: 0, mode: 'direct' };
  if (l === 2) return { ...base, cols: 3, rows: 3, path: [2, 3], turns: 1, obstacles: 0, mode: 'direct' };
  if (l === 3) return { ...base, cols: 3, rows: 3, path: [3, 4], turns: 1, obstacles: 1, mode: 'direct' };
  if (l <= 6) return { ...base, cols: 4, rows: 4, path: l === 4 ? [3, 5] : [4, 6], turns: 1, obstacles: l === 4 ? 1 : 2, mode: 'direct' };
  if (l === 7) return { ...base, cols: 3, rows: 3, path: [2, 3], turns: 0, obstacles: 0, mode: 'program' };
  if (l === 8) return { ...base, cols: 3, rows: 3, path: [3, 4], turns: 1, obstacles: 1, mode: 'program' };
  if (l <= 10) return { ...base, cols: 4, rows: 4, path: [3, 5], turns: 1, obstacles: 2, mode: 'program' };
  if (l <= 12) return { ...base, cols: 4, rows: 4, path: [5, 6], turns: 2, obstacles: 3, water: 0.34, mode: 'program' };
  if (l <= 14) return { ...base, cols: 5, rows: 4, path: [6, 7], turns: 2, obstacles: 4, water: 0.5, mode: 'program' };
  if (l <= 17) return { ...base, cols: 5, rows: 4, path: [6, 8], turns: 2, obstacles: l === 15 ? 3 : 4, water: 0.5, fruits: 2, mode: 'program' };
  // CP : la boucle. De longues lignes droites, et pas assez de cases pour tout écrire flèche par flèche.
  return { ...base, cols: 5, rows: 5, path: [7, 10], turns: 1, obstacles: l === 18 ? 3 : 4, water: 0.5, loops: true, spare: l === 20 ? 0 : 1, mode: 'program' };
}

const inside = (p: Pick<Puzzle, 'cols' | 'rows'>, c: Cell) => c.x >= 0 && c.y >= 0 && c.x < p.cols && c.y < p.rows;
const blocked = (p: Pick<Puzzle, 'rocks' | 'water'>, c: Cell) => [...p.rocks, ...p.water].some((o) => same(o, c));

/** Plus court chemin (cases, départ exclu), ou undefined s'il n'y en a pas. */
export function shortestPath(p: Pick<Puzzle, 'cols' | 'rows' | 'rocks' | 'water'>, from: Cell, to: Cell): Cell[] | undefined {
  const prev = new Map<string, Cell | null>([[key(from), null]]);
  const queue: Cell[] = [from];
  while (queue.length) {
    const c = queue.shift()!;
    if (same(c, to)) {
      const path: Cell[] = [];
      for (let k: Cell | null = c; k && !same(k, from); k = prev.get(key(k)) ?? null) path.unshift(k);
      return path;
    }
    for (const d of DIRS) {
      const n = { x: c.x + DELTA[d][0], y: c.y + DELTA[d][1] };
      if (!inside(p, n) || blocked(p, n) || prev.has(key(n))) continue;
      prev.set(key(n), c);
      queue.push(n);
    }
  }
  return undefined;
}

/** Chemin le plus court qui passe par tous les fruits (dans le meilleur ordre). */
export function bestRoute(p: Puzzle, from = p.start, fruits = p.fruits): Cell[] | undefined {
  if (!fruits.length) return [];
  let best: Cell[] | undefined;
  for (const [i, f] of fruits.entries()) {
    const leg = shortestPath(p, from, f);
    if (!leg) continue;
    const rest = bestRoute(p, f, fruits.filter((_, j) => j !== i));
    if (!rest) continue;
    const route = [...leg, ...rest];
    if (!best || route.length < best.length) best = route;
  }
  return best;
}

/** Direction d'une case à sa voisine. */
export const dirBetween = (a: Cell, b: Cell): Dir =>
  b.x > a.x ? 'right' : b.x < a.x ? 'left' : b.y > a.y ? 'down' : 'up';

/** Le programme d'un chemin : une flèche par case, ou regroupées (×2, ×3) avec les boucles. */
export function programOf(route: Cell[], from: Cell, loops: boolean): Command[] {
  const out: Command[] = [];
  let at = from;
  for (const c of route) {
    const dir = dirBetween(at, c);
    const last = out[out.length - 1];
    if (loops && last?.dir === dir && last.times < 3) last.times++;
    else out.push({ dir, times: 1 });
    at = c;
  }
  return out;
}

const turnsOf = (route: Cell[], from: Cell) => {
  let turns = 0;
  let at = from;
  let dir: Dir | undefined;
  for (const c of route) {
    const d = dirBetween(at, c);
    if (dir && d !== dir) turns++;
    dir = d;
    at = c;
  }
  return turns;
};

/** Un plateau du niveau, toujours faisable. */
export function generatePuzzle(level: number, rng: Rng): Puzzle {
  const spec = levelSpec(level);
  const pick = (n: number) => Math.floor(rng() * n);
  for (let attempt = 0; attempt < 400; attempt++) {
    const cells: Cell[] = [];
    for (let y = 0; y < spec.rows; y++) for (let x = 0; x < spec.cols; x++) cells.push({ x, y });
    const take = () => cells.splice(pick(cells.length), 1)[0];
    const start = take();
    const fruits = Array.from({ length: spec.fruits }, take);
    const obstacles = Array.from({ length: spec.obstacles }, take);
    const nWater = Math.round(obstacles.length * spec.water);
    const p: Puzzle = {
      level, cols: spec.cols, rows: spec.rows, start, fruits, rocks: obstacles.slice(nWater), water: obstacles.slice(0, nWater),
      mode: spec.mode, loops: spec.loops, slots: 0, best: 0,
    };
    const route = bestRoute(p);
    if (!route || route.length < spec.path[0] || route.length > spec.path[1]) continue;
    if (turnsOf(route, start) < spec.turns) continue;
    // Les obstacles doivent servir : sans eux, le chemin serait plus court (sinon ils ne sont qu'un décor).
    if (spec.obstacles > 0 && level > 2) {
      const open = bestRoute({ ...p, rocks: [], water: [] });
      if (open && open.length === route.length && rng() < 0.7) continue;
    }
    const best = programOf(route, start, spec.loops);
    // Avec les boucles, il faut au moins une vraie répétition (sinon ce n'est pas un plateau de boucle).
    if (spec.loops && !best.some((c) => c.times >= 3)) continue;
    p.best = best.length;
    p.slots = Math.min(10, best.length + spec.spare);
    return p;
  }
  // Repli (ne devrait pas arriver) : une ligne droite sans obstacle.
  return { level, cols: spec.cols, rows: spec.rows, start: { x: 0, y: 0 }, fruits: [{ x: Math.min(spec.cols - 1, 2), y: 0 }], rocks: [], water: [],
    mode: spec.mode, loops: spec.loops, slots: 4, best: 1 };
}

export type StepKind = 'move' | 'bump';
export interface Step {
  kind: StepKind;
  from: Cell;
  to: Cell;
  /** Index de la commande en cours (pour l'allumer dans la barre). */
  command: number;
  /** Ce qui arrête le dino : le bord, un rocher, l'eau. */
  obstacle?: 'edge' | 'rock' | 'water';
  /** Fruit ramassé sur cette case (index dans `fruits`). */
  fruit?: number;
}

export interface RunResult {
  steps: Step[];
  /** 'win' : tous les fruits ; 'bump' : arrêté par un obstacle ; 'short' : le programme est fini avant. */
  outcome: 'win' | 'bump' | 'short';
  collected: number[];
  end: Cell;
}

/** Ce qu'il se passe quand le dino avance d'une case. */
export function stepFrom(p: Puzzle, at: Cell, dir: Dir, collected: readonly number[], command = 0): Step {
  const to = { x: at.x + DELTA[dir][0], y: at.y + DELTA[dir][1] };
  if (!inside(p, to)) return { kind: 'bump', from: at, to, command, obstacle: 'edge' };
  if (p.rocks.some((r) => same(r, to))) return { kind: 'bump', from: at, to, command, obstacle: 'rock' };
  if (p.water.some((w) => same(w, to))) return { kind: 'bump', from: at, to, command, obstacle: 'water' };
  const fruit = p.fruits.findIndex((f, i) => same(f, to) && !collected.includes(i));
  return { kind: 'move', from: at, to, command, ...(fruit >= 0 ? { fruit } : {}) };
}

/** Exécute un programme depuis le départ ; s'arrête au premier obstacle ou quand tous les fruits sont ramassés. */
export function runProgram(p: Puzzle, program: readonly Command[]): RunResult {
  const steps: Step[] = [];
  const collected: number[] = [];
  let at = p.start;
  for (const [i, c] of program.entries()) {
    for (let k = 0; k < c.times; k++) {
      const step = stepFrom(p, at, c.dir, collected, i);
      steps.push(step);
      if (step.kind === 'bump') return { steps, outcome: 'bump', collected, end: at };
      at = step.to;
      if (step.fruit !== undefined) collected.push(step.fruit);
      if (collected.length === p.fruits.length) return { steps, outcome: 'win', collected, end: at };
    }
  }
  return { steps, outcome: 'short', collected, end: at };
}

/** Prochaine bonne flèche depuis une case (aide), vers le fruit restant le plus proche. */
export function nextDir(p: Puzzle, from: Cell, collected: readonly number[]): Dir | undefined {
  const left = p.fruits.filter((_, i) => !collected.includes(i));
  const route = bestRoute(p, from, left);
  return route?.length ? dirBetween(from, route[0]) : undefined;
}
