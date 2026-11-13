import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../src/domain/models';
import { SUDOKU_LEVELS, candidates, conflictOf, countSolutions, easiestCell, fullGrid, generateSudoku, isSolved, sudokuSpec } from '../src/domain/sudoku';

describe('sudoku des fruits', () => {
  it('donne des grilles pleines valides à toutes les tailles', () => {
    for (const level of [1, 6, 11, 16]) {
      const spec = sudokuSpec(level);
      for (let seed = 1; seed <= 20; seed++) expect(isSolved(spec, fullGrid(spec, mulberry32(seed)))).toBe(true);
    }
  });

  it('génère à chaque niveau une grille à solution unique, avec le bon nombre de cases vides', () => {
    for (let level = 1; level <= SUDOKU_LEVELS; level++) {
      for (let seed = 1; seed <= 4; seed++) {
        const s = generateSudoku(level, mulberry32(level * 100 + seed));
        const holes = s.puzzle.flat().filter((v) => v === -1).length;
        expect(countSolutions(s.spec, s.puzzle)).toBe(1);
        expect(holes).toBe(s.spec.holes);
        // La grille de départ est compatible avec la solution.
        s.puzzle.forEach((row, r) => row.forEach((v, c) => { if (v !== -1) expect(v).toBe(s.solution[r][c]); }));
      }
    }
  });

  it('fait grandir la grille avec le niveau', () => {
    expect(sudokuSpec(1).size).toBe(3);
    expect(sudokuSpec(1).box).toBeUndefined();
    expect(sudokuSpec(6).size).toBe(4);
    expect(sudokuSpec(11).size).toBe(6);
    expect(sudokuSpec(20).size).toBe(9);
  });

  it('repère le fruit qui gêne, et propose la case la plus facile', () => {
    const spec = sudokuSpec(6);
    const grid = [[0, 1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1]];
    expect(conflictOf(spec, grid, 0, 2, 0)?.kind).toBe('row');
    expect(conflictOf(spec, grid, 2, 0, 0)?.kind).toBe('col');
    expect(conflictOf(spec, grid, 1, 0, 1)?.kind).toBe('box');
    expect(candidates(spec, grid, 0, 2)).toEqual([2, 3]);
    const s = generateSudoku(8, mulberry32(3));
    const easy = easiestCell(s, s.puzzle)!;
    expect(s.puzzle[easy.r][easy.c]).toBe(-1);
    expect(candidates(s.spec, s.puzzle, easy.r, easy.c)).toContain(easy.fruit);
  });
});
