import { describe, expect, it } from 'vitest';
import { GAMES } from '../src/content/games';
import { MISSION_CATEGORIES, missionCategoryOf } from '../src/content/missionCategories';

describe('catégories des missions', () => {
  it('range chaque jeu dans une catégorie, et chaque catégorie a des jeux', () => {
    const used = new Set(GAMES.map((g) => missionCategoryOf(g)));
    for (const c of MISSION_CATEGORIES) expect(used.has(c), c).toBe(true);
  });

  it('met les jeux de nombres en maths, la langue apprise à part', () => {
    const of = (id: string) => missionCategoryOf(GAMES.find((g) => g.id === id)!);
    expect(of('LO-5')).toBe('math');
    expect(of('VO-13')).toBe('math');
    expect(of('LO-12')).toBe('logic');
    expect(of('EN-2')).toBe('second');
    expect(of('VO-2')).toBe('second');
    expect(of('TR-2')).toBe('primary');
    expect(of('VO-4')).toBe('world');
  });
});
