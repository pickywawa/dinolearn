import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MemoryStore, Progress } from '../src/core/progress';
import { Profiles } from '../src/core/profiles';
import { mulberry32 } from '../src/domain/models';
import { DIPLOMA_LEVELS, ENVELOPE_SERIES, diplomasBetween, envelopeChoices, weakLettersFrom } from '../src/domain/printables';
import { PRINT_KINDS, printKind } from '../src/print/catalog';
import { buildSheet } from '../src/print/context';
import { cellLabel } from '../src/print/coloring';
import { jigsawEdge, puzzleGrid } from '../src/print/cutouts';
import { dinoBody, toLineArt } from '../src/print/dino';
import { memoryPairs, pips } from '../src/print/games';
import { dotCount, dotsAlong, generateMaze, mazeSize, solveMaze } from '../src/print/puzzles';
import { PrintContext } from '../src/print/types';
import { nameGlyphs } from '../src/print/writing';

const ctxFor = (age: number, extra: Partial<PrintContext> = {}): PrintContext => ({
  name: 'Léa', age, color: 3, worn: ['crown', 'scarf', 'wing'], level: 12,
  family: [{ name: 'Léa', color: 3 }, { name: 'Tom', color: 6 }],
  gameLevel: () => 2 + age, weakLetters: ['R'], at: Date.UTC(2026, 9, 31), lineArt: false, param: 10, ...extra,
});

describe('fiches à imprimer', () => {
  it('chaque fiche se fabrique à tous les âges, en couleur et à colorier, sans valeur manquante', () => {
    for (const kind of PRINT_KINDS) {
      for (const age of [3, 4, 5, 6, 7]) {
        for (const lineArt of kind.lineArtOption ? [false, true] : [false]) {
          for (let seed = 1; seed <= 4; seed++) {
            const sheet = kind.build(ctxFor(age, { lineArt }), mulberry32(seed * 101 + age));
            expect(sheet.pages.length, kind.id).toBeGreaterThan(0);
            for (const svg of sheet.pages) {
              expect(svg.startsWith('<svg'), kind.id).toBe(true);
              expect(svg.endsWith('</svg>'), kind.id).toBe(true);
              expect(svg, `${kind.id} ${age}`).not.toMatch(/NaN|undefined|Infinity|\[object/);
              // Toutes les images utilisées existent.
              for (const m of svg.matchAll(/href="img\/([^"]+)"/g)) {
                expect(existsSync(`public/img/${m[1]}`), `${kind.id}: ${m[1]}`).toBe(true);
              }
            }
            expect(sheet.advice.skills.length, kind.id).toBeGreaterThan(0);
            expect(sheet.advice.talk.length, kind.id).toBeGreaterThan(20);
          }
        }
      }
      expect(existsSync(`public/img/${kind.icon}.svg`), kind.icon).toBe(true);
    }
  });

  it('la même graine redonne la même fiche', () => {
    for (const kind of PRINT_KINDS) {
      const a = kind.build(ctxFor(5), mulberry32(42)).pages.join('');
      const b = kind.build(ctxFor(5), mulberry32(42)).pages.join('');
      expect(a, kind.id).toBe(b);
    }
  });

  it('le dino imprimé est celui de l\'enfant : sa couleur et ses objets ; à colorier, plus de couleurs', () => {
    const svg = dinoBody({ color: 3, worn: ['crown'] });
    expect(svg).toContain('#ff9fcd');
    expect(svg).toContain('acc-crown.svg');
    const line = toLineArt(svg);
    expect(line).not.toContain('#ff9fcd');
    expect(line).toContain('#2d3354');
  });

  it('labyrinthe parfait, de la bonne taille, avec un chemin de l\'entrée à la sortie', () => {
    for (const age of [3, 4, 5, 6, 7]) {
      const [cols, rows] = mazeSize(age);
      const m = generateMaze(cols, rows, mulberry32(age));
      // Parfait : (cases − 1) passages, donc toutes les cases sont reliées sans boucle.
      let passages = 0;
      for (const row of m.open) for (const cell of row) passages += [1, 2, 4, 8].filter((b) => cell & b).length;
      expect(passages / 2).toBe(cols * rows - 1);
      const path = solveMaze(m);
      expect(path[0]).toEqual([0, 0]);
      expect(path[path.length - 1]).toEqual([rows - 1, cols - 1]);
      for (let i = 1; i < path.length; i++) {
        expect(Math.abs(path[i][0] - path[i - 1][0]) + Math.abs(path[i][1] - path[i - 1][1])).toBe(1);
      }
    }
    expect(mazeSize(3)[0] * mazeSize(3)[1]).toBeLessThan(mazeSize(7)[0] * mazeSize(7)[1]);
  });

  it('points à relier : le bon nombre de points, tous les sommets gardés', () => {
    const square: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]];
    const dots = dotsAlong(square, 10);
    expect(dots).toHaveLength(10);
    for (const v of square) expect(dots).toContainEqual(v);
    expect(dotsAlong(square, 3)).toHaveLength(3);
    expect(dotCount(3, 1)).toBe(10);
    expect(dotCount(7, 1)).toBe(40);
    expect(dotCount(6, 15)).toBeGreaterThan(dotCount(6, 5));
  });

  it('coloriage magique : les calculs donnent bien le nombre de la couleur', () => {
    const rng = mulberry32(3);
    for (let code = 2; code <= 13; code++) {
      for (let i = 0; i < 20; i++) {
        const label = cellLabel(code, 'addsub', rng);
        const [a, op, b] = label.split(/([+−])/);
        expect(op === '+' ? +a + +b : +a - +b, label).toBe(code);
        if (op === '+') expect(+a).toBeGreaterThan(0);
      }
    }
    expect(cellLabel(4, 'number', rng)).toBe('4');
  });

  it('écriture : le prénom en capitales sans accents', () => {
    expect(nameGlyphs('Léa')).toEqual(['L', 'E', 'A']);
    expect(nameGlyphs('Zoé-Lou')).toEqual(['Z', 'O', 'E', ' ', 'L', 'O', 'U']);
    expect(nameGlyphs('Çelia')).toEqual(['C', 'E', 'L', 'I', 'A']);
  });

  it('puzzle, memory et dés suivent l\'âge', () => {
    expect(puzzleGrid(3)).toEqual([2, 3]);
    expect(puzzleGrid(7)[0] * puzzleGrid(7)[1]).toBe(30);
    expect(jigsawEdge([0, 0], [10, 0], 1)).toMatch(/^M0 0 L3\.4 0 C/);
    expect(memoryPairs(3, mulberry32(1)).pairs).toHaveLength(6);
    expect(memoryPairs(5, mulberry32(1)).mode).toBe('count');
    const words = memoryPairs(6, mulberry32(1));
    expect(words.mode).toBe('word');
    for (const [, w] of words.pairs) expect(w.word!.length).toBeLessThanOrEqual(6);
    expect(pips(6, 0, 0, 10).match(/<circle/g)).toHaveLength(6);
    expect(pips(0, 0, 0, 10)).toBe('');
  });
});

describe('enveloppes et diplômes', () => {
  const kinds = PRINT_KINDS;

  it('trois enveloppes de familles différentes, de son âge, en préférant les fiches jamais eues', () => {
    for (let seed = 0; seed < 30; seed++) {
      const ids = envelopeChoices(kinds, 3, [], mulberry32(seed));
      expect(ids).toHaveLength(3);
      const families = ids.map((id) => printKind(id)!.family);
      expect(new Set(families).size).toBe(3);
      for (const id of ids) {
        expect(printKind(id)!.minAge).toBeLessThanOrEqual(3);
        expect(printKind(id)!.envelope).toBe(true);
      }
    }
    // Tout a déjà été gagné sauf le labyrinthe : il est proposé.
    const obtained = kinds.filter((k) => k.id !== 'maze').map((k) => ({ kind: k.id, at: 1000 }));
    for (let seed = 0; seed < 10; seed++) expect(envelopeChoices(kinds, 6, obtained, mulberry32(seed))).toContain('maze');
  });

  it('une enveloppe par jour, à la fin du temps de jeu', () => {
    const p = new Progress(new MemoryStore());
    const day = new Date(2026, 9, 31, 10);
    p.updateSettings({ dailyMinutes: 20 });
    expect(p.envelopeDue(day)).toBe(false);
    p.addPlayTime(21 * 60_000, day);
    expect(p.envelopeDue(day)).toBe(true);
    const r = p.openEnvelope('maze', 1234, day);
    expect(p.printables[0]).toEqual(r);
    expect(p.envelopeDue(day)).toBe(false);
    expect(p.newPrintables).toBe(1);
    p.markPrinted(r.id);
    expect(p.newPrintables).toBe(0);
    // Le lendemain, une nouvelle.
    const next = new Date(2026, 10, 1, 10);
    p.addPlayTime(25 * 60_000, next);
    expect(p.envelopeDue(next)).toBe(true);
  });

  it('le soir, quand le dino va dormir ; sans aucune limite, après quelques séries', () => {
    const p = new Progress(new MemoryStore());
    const evening = new Date(2026, 9, 31, 20, 30);
    p.updateSettings({ nightTime: '19:30' });
    expect(p.envelopeDue(evening)).toBe(false);
    p.markNightSeries(evening);
    expect(p.envelopeDue(evening)).toBe(true);

    const free = new Progress(new MemoryStore());
    const day = new Date(2026, 9, 31, 10);
    for (let i = 0; i < ENVELOPE_SERIES; i++) {
      expect(free.envelopeDue(day)).toBe(false);
      free.recordSeries('LO-1', [], 3, day);
    }
    expect(free.envelopeDue(day)).toBe(true);
    // Un nouveau jour : on recompte.
    expect(free.seriesToday(new Date(2026, 10, 1, 10))).toBe(0);
  });

  it('un diplôme tous les 5 niveaux ; les fiches survivent au rechargement et à « tout recommencer »', () => {
    expect(diplomasBetween(4, 5)).toEqual([5]);
    expect(diplomasBetween(5, 6)).toEqual([]);
    expect(diplomasBetween(9, 16)).toEqual([10, 15]);
    expect(DIPLOMA_LEVELS[DIPLOMA_LEVELS.length - 1]).toBe(40);
    const store = new MemoryStore();
    const p = new Progress(store);
    p.saveFeeding({ level: 4, xp: 0 }, 10);
    p.saveFeeding({ level: 5, xp: 0 }, 20);
    expect(p.printables.map((r) => [r.kind, r.param])).toEqual([['diploma', 5]]);
    const again = new Progress(store);
    expect(again.printables).toHaveLength(1);
    again.reset();
    expect(again.printables).toHaveLength(1);
  });

  it('les lettres à retravailler viennent des jeux de lettres', () => {
    expect(weakLettersFrom(['TR-2:R:dots', 'FR-4:L:S:caps', 'FR-4:S:MA:caps', 'TR-2:7:dots', 'TR-2:R:free'])).toEqual(['R', 'S']);
  });

  it('une fiche se reconstruit à partir de la progression de l\'enfant', () => {
    const store = new MemoryStore();
    const profiles = new Profiles(store);
    const id = profiles.add({ name: 'Léa', age: 5, country: 'fr', dailyMinutes: 0, nightTime: '' });
    const p = profiles.progressOf(id);
    p.hatch(4);
    const record = p.openEnvelope('coloring', 99);
    const sheet = buildSheet(p, profiles, record);
    expect(sheet?.pages[0]).toContain('LÉA');
    p.renewPrintable(record.id, 100);
    expect(buildSheet(p, profiles, p.printables[0])?.pages[0]).not.toBe(sheet?.pages[0]);
  });
});
