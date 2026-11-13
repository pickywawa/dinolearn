/**
 * Sudoku des fruits (dès 5 ans) : une grille où chaque fruit n'apparaît qu'une fois
 * par ligne, par colonne et (dès la grille 4×4) par carré. Logique pure, sans
 * navigateur : niveaux, génération d'une grille à solution unique, vérifications.
 */
import type { Rng } from './models';

export interface SudokuSpec {
  level: number;
  /** Côté de la grille (3, 4, 6 ou 9). */
  size: number;
  /** Taille d'un carré (lignes × colonnes) ; 3×3 : pas de carrés, seulement lignes et colonnes. */
  box?: { rows: number; cols: number };
  /** Nombre de cases à remplir par l'enfant. */
  holes: number;
}

export const SUDOKU_LEVELS = 20;

/** Niveaux : 3×3 (1-5), 4×4 (6-10), 6×6 (11-15), 9×9 (16-20), de plus en plus de cases vides. */
export function sudokuSpec(level: number): SudokuSpec {
  const l = Math.max(1, Math.min(SUDOKU_LEVELS, Math.round(level)));
  const table: [number, number][] = [
    [3, 2], [3, 3], [3, 4], [3, 5], [3, 6],
    [4, 4], [4, 6], [4, 8], [4, 10], [4, 11],
    [6, 8], [6, 12], [6, 16], [6, 20], [6, 24],
    [9, 20], [9, 28], [9, 36], [9, 44], [9, 52],
  ];
  const [size, holes] = table[l - 1];
  const box = size === 4 ? { rows: 2, cols: 2 } : size === 6 ? { rows: 2, cols: 3 } : size === 9 ? { rows: 3, cols: 3 } : undefined;
  return { level: l, size, box, holes };
}

/** Grille : `grid[ligne][colonne]` = numéro du fruit (0 à size-1), ou -1 si la case est vide. */
export type Grid = number[][];

export interface Sudoku {
  spec: SudokuSpec;
  solution: Grid;
  /** La grille de départ (cases vides à -1). */
  puzzle: Grid;
}

export type Conflict = { kind: 'row' | 'col' | 'box'; at: { r: number; c: number } };

const shuffle = <T>(list: T[], rng: Rng): T[] => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Même carré ? (toujours faux sans carrés.) */
export function sameBox(spec: SudokuSpec, r1: number, c1: number, r2: number, c2: number): boolean {
  if (!spec.box) return false;
  return Math.floor(r1 / spec.box.rows) === Math.floor(r2 / spec.box.rows) && Math.floor(c1 / spec.box.cols) === Math.floor(c2 / spec.box.cols);
}

/** Où ce fruit gêne-t-il dans la case (r, c) ? La ligne d'abord, puis la colonne, puis le carré. */
export function conflictOf(spec: SudokuSpec, grid: Grid, r: number, c: number, fruit: number): Conflict | undefined {
  const n = spec.size;
  for (let k = 0; k < n; k++) if (k !== c && grid[r][k] === fruit) return { kind: 'row', at: { r, c: k } };
  for (let k = 0; k < n; k++) if (k !== r && grid[k][c] === fruit) return { kind: 'col', at: { r: k, c } };
  if (spec.box) {
    const r0 = Math.floor(r / spec.box.rows) * spec.box.rows, c0 = Math.floor(c / spec.box.cols) * spec.box.cols;
    for (let i = r0; i < r0 + spec.box.rows; i++) {
      for (let j = c0; j < c0 + spec.box.cols; j++) if ((i !== r || j !== c) && grid[i][j] === fruit) return { kind: 'box', at: { r: i, c: j } };
    }
  }
  return undefined;
}

/** Fruits encore possibles dans une case vide. */
export function candidates(spec: SudokuSpec, grid: Grid, r: number, c: number): number[] {
  return range(spec.size).filter((f) => !conflictOf(spec, grid, r, c, f));
}

/** Nombre de solutions (on s'arrête à `limit`). */
export function countSolutions(spec: SudokuSpec, grid: Grid, limit = 2): number {
  const g = grid.map((row) => [...row]);
  let count = 0;
  const solve = (): void => {
    if (count >= limit) return;
    // La case vide qui a le moins de possibilités.
    let best: { r: number; c: number; options: number[] } | undefined;
    for (let r = 0; r < spec.size; r++) {
      for (let c = 0; c < spec.size; c++) {
        if (g[r][c] !== -1) continue;
        const options = candidates(spec, g, r, c);
        if (!best || options.length < best.options.length) best = { r, c, options };
        if (options.length === 0) return;
      }
    }
    if (!best) {
      count++;
      return;
    }
    for (const f of best.options) {
      g[best.r][best.c] = f;
      solve();
      g[best.r][best.c] = -1;
      if (count >= limit) return;
    }
  };
  solve();
  return count;
}

/** Une grille pleine et valide, mélangée (lignes, colonnes, bandes et fruits permutés). */
export function fullGrid(spec: SudokuSpec, rng: Rng): Grid {
  const n = spec.size;
  const br = spec.box?.rows ?? 1, bc = spec.box?.cols ?? 1;
  // Grille de base valide : décalage par ligne.
  const base = (r: number, c: number) => spec.box
    ? ((r % br) * bc + Math.floor(r / br) + c) % n
    : (r + c) % n;
  // Permutations qui gardent la grille valide : lignes dans une bande, bandes, colonnes dans une pile, piles, fruits.
  const rowOrder = shuffle(range(n / br), rng).flatMap((band) => shuffle(range(br), rng).map((k) => band * br + k));
  const colOrder = shuffle(range(n / bc), rng).flatMap((stack) => shuffle(range(bc), rng).map((k) => stack * bc + k));
  const fruits = shuffle(range(n), rng);
  return rowOrder.map((r) => colOrder.map((c) => fruits[base(r, c)]));
}

/** Une grille de ce niveau, à solution unique (on vide des cases tant que la solution reste unique). */
export function generateSudoku(level: number, rng: Rng): Sudoku {
  const spec = sudokuSpec(level);
  const solution = fullGrid(spec, rng);
  const puzzle = solution.map((row) => [...row]);
  let holes = 0;
  const cells = shuffle(range(spec.size * spec.size), rng);
  for (const i of cells) {
    if (holes >= spec.holes) break;
    const r = Math.floor(i / spec.size), c = i % spec.size;
    const keep = puzzle[r][c];
    puzzle[r][c] = -1;
    if (countSolutions(spec, puzzle) === 1) holes++;
    else puzzle[r][c] = keep;
  }
  return { spec, solution, puzzle };
}

/** Vrai si la grille est pleine et valide. */
export function isSolved(spec: SudokuSpec, grid: Grid): boolean {
  for (let r = 0; r < spec.size; r++) {
    for (let c = 0; c < spec.size; c++) {
      if (grid[r][c] === -1 || conflictOf(spec, grid, r, c, grid[r][c])) return false;
    }
  }
  return true;
}

/**
 * Case la plus facile à remplir maintenant (pour l'aide) : celle qui n'a qu'un fruit
 * possible, sinon celle qui en a le moins.
 */
export function easiestCell(sudoku: Sudoku, grid: Grid): { r: number; c: number; fruit: number } | undefined {
  let best: { r: number; c: number; fruit: number; n: number } | undefined;
  for (let r = 0; r < sudoku.spec.size; r++) {
    for (let c = 0; c < sudoku.spec.size; c++) {
      if (grid[r][c] !== -1) continue;
      const n = candidates(sudoku.spec, grid, r, c).length;
      if (!best || n < best.n) best = { r, c, fruit: sudoku.solution[r][c], n };
    }
  }
  return best && { r: best.r, c: best.c, fruit: best.fruit };
}
