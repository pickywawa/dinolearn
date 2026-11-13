import { describe, expect, it } from 'vitest';
import { CAKE_LEVELS, FRACTION_DEGREES, allEqual, cakeRound, cutStep, fairShare, readCut, readRadial, sectorsFromBounds, sectorsFromCuts, snapCross, snapRadial, snapToStep } from '../src/domain/cake';
import { mulberry32 } from '../src/domain/models';

describe('partage le gâteau', () => {
  it('donne à chaque niveau des manches cohérentes', () => {
    for (let level = 1; level <= CAKE_LEVELS; level++) {
      for (let seed = 1; seed <= 30; seed++) {
        const r = cakeRound(level, mulberry32(level * 1000 + seed));
        if (r.kind === 'smallest') {
          expect(r.slices.reduce((a, b) => a + b, 0)).toBeCloseTo(360);
          expect(Math.min(...r.slices)).toBe(r.slices[r.answer]);
          expect(r.slices.filter((s) => s === r.slices[r.answer])).toHaveLength(1);
        }
        if (r.kind === 'equalPick') {
          r.cakes.forEach((sizes, i) => {
            expect(sizes.reduce((a, b) => a + b, 0)).toBeCloseTo(360);
            expect(allEqual(sizes)).toBe(i === r.answer);
          });
        }
        if (r.kind === 'fraction') {
          expect(Number.isInteger(r.need)).toBe(true);
          expect((r.need / r.parts) * 360).toBeCloseTo(FRACTION_DEGREES[r.target]);
        }
        if (r.kind === 'cookies') expect(r.total % r.friends).toBe(0);
        if (r.kind === 'findFraction') {
          expect(r.taken[r.answer]).toBe(FRACTION_DEGREES[r.target]);
          expect(new Set(r.taken).size).toBe(3);
        }
        if (r.kind === 'cut') expect(r.parts === 3).toBe(!!r.radial);
      }
    }
  });

  it('coupe par le milieu en parts égales', () => {
    expect(sectorsFromCuts([0]).map((s) => s.size)).toEqual([180, 180]);
    expect(sectorsFromCuts([0, 90]).map((s) => s.size)).toEqual([90, 90, 90, 90]);
    expect(allEqual(sectorsFromCuts([0, 60]).map((s) => s.size))).toBe(false);
    expect(snapCross(10, 95)).toBe(100);
    expect(snapCross(10, 40)).toBe(40);
  });

  it('passe au tiers puis à des découpes de plus en plus fines', () => {
    const kinds = Array.from({ length: CAKE_LEVELS }, (_, i) => cakeRound(i + 1, mulberry32(7)));
    expect(kinds[9]).toMatchObject({ kind: 'cut', parts: 3, radial: true });
    expect(kinds[13]).toMatchObject({ kind: 'cut', parts: 6 });
    expect(kinds[16]).toMatchObject({ kind: 'cut', parts: 8 });
    expect(kinds[11]).toMatchObject({ kind: 'fraction', target: 'third' });
  });

  it('coupe en étoile et aimante les traits presque bien placés', () => {
    expect(sectorsFromBounds([270, 30, 150]).map((s) => s.size)).toEqual([120, 120, 120]);
    expect(snapRadial(270, 25, 3)).toBe(30);
    expect(snapRadial(270, 60, 3)).toBe(60);
    const r = readRadial(100, 100, 100, 20, 100, 100, 80);
    expect(r).toMatchObject({ valid: true, fromCenter: true, angle: 270 });
    expect(readRadial(100, 20, 100, 100, 100, 100, 80).angle).toBe(270);
    expect(readRadial(150, 100, 175, 100, 100, 100, 80).fromCenter).toBe(false);
    const { step, tolerance } = cutStep(6);
    expect(snapToStep(0, 55, step, tolerance)).toBe(60);
    expect(allEqual(sectorsFromCuts([0, 60, 120]).map((s) => s.size))).toBe(true);
    expect(sectorsFromCuts([0, 45, 90, 135])).toHaveLength(8);
  });

  it('lit le trait tracé sur le gâteau', () => {
    expect(readCut(0, 100, 200, 100, 100, 100, 80)).toMatchObject({ crosses: true, centered: true, angle: 0 });
    expect(readCut(100, 0, 100, 200, 100, 100, 80).angle).toBe(90);
    expect(readCut(0, 150, 200, 150, 100, 100, 80)).toMatchObject({ crosses: true, centered: false });
    expect(readCut(0, 100, 20, 100, 100, 100, 80).crosses).toBe(false);
  });

  it('vérifie le partage des cookies', () => {
    expect(fairShare([3, 3], 6)).toBe('ok');
    expect(fairShare([3, 2], 6)).toBe('left');
    expect(fairShare([4, 2], 6)).toBe('uneven');
  });
});
