import { describe, expect, it } from 'vitest';
import { bestRoute, generatePuzzle, levelSpec, nextDir, programOf, runProgram, shortestPath } from '../src/domain/coding';
import { mulberry32 } from '../src/domain/models';

describe('programme le dino', () => {
  it('chaque niveau donne des plateaux faisables, à la bonne taille, que le programme le plus court résout', () => {
    for (let level = 1; level <= 20; level++) {
      const spec = levelSpec(level);
      for (let seed = 1; seed <= 25; seed++) {
        const p = generatePuzzle(level, mulberry32(seed * 97 + level));
        expect(p.cols).toBe(spec.cols);
        expect(p.rows).toBe(spec.rows);
        expect(p.mode).toBe(spec.mode);
        expect(p.fruits).toHaveLength(spec.fruits);
        // Jamais le plateau de secours (une ligne droite) : les obstacles prévus sont là.
        expect(p.rocks.length + p.water.length).toBe(spec.obstacles);
        const route = bestRoute(p)!;
        expect(route.length).toBeGreaterThanOrEqual(spec.path[0]);
        expect(route.length).toBeLessThanOrEqual(spec.path[1]);
        const program = programOf(route, p.start, p.loops);
        expect(program.length).toBe(p.best);
        expect(p.slots).toBeGreaterThanOrEqual(p.best);
        expect(runProgram(p, program).outcome).toBe('win');
      }
    }
  });

  it('les petits jouent en direct sur une grille 3×3 ; les boucles arrivent au CP', () => {
    expect([1, 2, 3].map((l) => levelSpec(l))).toEqual(expect.arrayContaining([expect.objectContaining({ cols: 3, rows: 3, mode: 'direct' })]));
    expect(levelSpec(6).mode).toBe('direct');
    expect(levelSpec(7).mode).toBe('program');
    expect(levelSpec(17).loops).toBe(false);
    expect(levelSpec(18).loops).toBe(true);
    // Avec les boucles, le programme écrit flèche par flèche ne tient pas dans la barre.
    for (let seed = 1; seed <= 10; seed++) {
      const p = generatePuzzle(20, mulberry32(seed));
      expect(programOf(bestRoute(p)!, p.start, false).length).toBeGreaterThan(p.slots);
    }
  });

  it('le dino s\'arrête sur un rocher, au bord, ou quand le programme est fini', () => {
    const p = { level: 8, cols: 3, rows: 3, start: { x: 0, y: 0 }, fruits: [{ x: 2, y: 0 }], rocks: [{ x: 1, y: 0 }], water: [],
      mode: 'program' as const, loops: false, slots: 6, best: 4 };
    expect(runProgram(p, [{ dir: 'right', times: 1 }])).toMatchObject({ outcome: 'bump', end: { x: 0, y: 0 } });
    expect(runProgram(p, [{ dir: 'left', times: 1 }]).steps[0].obstacle).toBe('edge');
    expect(runProgram(p, [{ dir: 'down', times: 1 }]).outcome).toBe('short');
    const win = runProgram(p, [{ dir: 'down', times: 1 }, { dir: 'right', times: 2 }, { dir: 'up', times: 1 }]);
    expect(win.outcome).toBe('win');
    expect(shortestPath(p, p.start, p.fruits[0])).toHaveLength(4);
    expect(nextDir(p, p.start, [])).toBe('down');
  });
});
