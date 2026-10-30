import { describe, expect, it } from 'vitest';
import { CONCEPTS, conceptById, conceptsFor, frWithArticle, pickDistractors } from '../src/content/content';
import { GAMES, gameById, gamesForAge, sayMoney, sayTime } from '../src/content/games';
import { PAIRS, SIZES, enNumber } from '../src/content/extra';
import { frNumber } from '../src/content/numbers';
import { ITEMS, giftChoices, sameSlot } from '../src/content/items';
import { existsSync } from 'node:fs';
import { COUNTRIES, setCountry } from '../src/content/countries';
import { RIDDLES } from '../src/content/riddles';
import { SENTENCES } from '../src/content/sentences';
import { ONSETS, RHYMES } from '../src/content/sounds';
import { LINES, LinePicker } from '../src/core/lines';
import { MemoryStore, Progress } from '../src/core/progress';
import { Series } from '../src/core/series';
import { BALANCE } from '../src/domain/balance';
import { adjustment, baseLevel, computeLevel } from '../src/domain/difficulty';
import { AnswerRecord, mulberry32 } from '../src/domain/models';
import { feed, stageFor, xpToNext } from '../src/domain/progression';
import { foodXp, seriesFruits, starsFor } from '../src/domain/rewards';
import { pickQuestions } from '../src/domain/selector';
import { Point, resample, scoreTrace } from '../src/domain/trace';
import { LETTER_MODELS, SHAPE_MODELS } from '../src/content/tracing';

const answers = (count: number, rate: number, gameId = 'EN-1'): AnswerRecord[] =>
  Array.from({ length: count }, (_, i) => ({
    gameId, category: 'foreign_language', questionId: `${gameId}:${i}`, level: 1,
    firstTrySuccess: i < count * rate, at: 0,
  }));

describe('difficulté', () => {
  it('niveau de base selon le dino et l\'âge', () => {
    expect(baseLevel(1, 3)).toBe(1);
    expect(baseLevel(1, 4)).toBe(2);
    expect(baseLevel(1, 7)).toBe(5);
    expect(baseLevel(20, 4)).toBe(11);
    // Niveaux 21 à 40 : difficulté CP, jusqu'à 20.
    expect(baseLevel(40, 3)).toBe(20);
    expect(baseLevel(30, 3)).toBe(15);
  });

  it('ajustement selon le taux de réussite', () => {
    expect([0.95, 0.8, 0.6, 0.4, 0.1].map((r) => adjustment(r))).toEqual([2, 1, 0, -1, -2]);
  });

  it('pas d\'ajustement sous 20 réponses, repli sur la catégorie', () => {
    expect(computeLevel({ experienceLevel: 5, age: 3, gameAnswers: answers(10, 1),
      categoryAnswers: answers(10, 1), allAnswers: answers(10, 1) })).toBe(3);
    expect(computeLevel({ experienceLevel: 5, age: 3, gameAnswers: answers(5, 1),
      categoryAnswers: answers(40, 0.2), allAnswers: [] })).toBe(1);
  });

  it('lissage ±1 et fenêtre des 100 dernières réponses', () => {
    expect(computeLevel({ experienceLevel: 20, age: 7, gameAnswers: answers(100, 1),
      categoryAnswers: [], allAnswers: [], previousLevel: 3 })).toBe(4);
    expect(computeLevel({ experienceLevel: 4, age: 3,
      gameAnswers: [...answers(100, 1), ...answers(300, 0)], categoryAnswers: [], allAnswers: [] })).toBe(4);
  });
});

describe('sélection des questions', () => {
  const questions = Array.from({ length: 10 }, (_, l) =>
    Array.from({ length: 30 }, (_, i) => ({ id: `q${l + 1}-${i}`, level: l + 1 }))).flat();

  it('respecte la longueur et le niveau', () => {
    const picks = pickQuestions({ questions, level: 5, count: 10, mastered: new Set(),
      recent: new Set(), due: new Set(), waiting: new Set() }, mulberry32(1));
    expect(picks).toHaveLength(10);
    expect(new Set(picks.map((p) => p.question.id)).size).toBe(10);
    picks.forEach((p) => expect(Math.abs(p.question.level - 5)).toBeLessThanOrEqual(1));
  });

  it('ne repose jamais une question maîtrisée tant qu\'il en reste', () => {
    const rng = mulberry32(7);
    const mastered = new Set<string>();
    const recent: string[][] = [];
    for (let s = 0; mastered.size < questions.length - 10 && s < 1000; s++) {
      const picks = pickQuestions({ questions, level: 1 + (s % 10), count: 10, mastered,
        recent: new Set(recent.slice(0, 2).flat()), due: new Set(), waiting: new Set() }, rng);
      for (const p of picks) {
        expect(mastered.has(p.question.id)).toBe(false);
        expect(p.isReview).toBe(false);
      }
      picks.forEach((p) => mastered.add(p.question.id));
      recent.unshift(picks.map((p) => p.question.id));
    }
    expect(mastered.size).toBeGreaterThanOrEqual(questions.length - 10);
  });

  it('mode révision quand tout est maîtrisé', () => {
    const picks = pickQuestions({ questions, level: 5, count: 8,
      mastered: new Set(questions.map((q) => q.id)), recent: new Set(), due: new Set(), waiting: new Set() }, mulberry32(3));
    expect(picks).toHaveLength(8);
    expect(picks.every((p) => p.isReview)).toBe(true);
  });
});

describe('récompenses et croissance', () => {
  it('étoiles', () => {
    expect([1, 0.9, 0.75, 0.5, 0.2].map((s) => starsFor(s))).toEqual([3, 3, 2, 1, 0]);
  });

  it('fruits de série tous différents, valeur selon le niveau', () => {
    const fruits = seriesFruits(10, mulberry32(1));
    expect(new Set(fruits).size).toBe(10);
    expect(foodXp('banana', 1)).toBe(2);
    expect(foodXp('banana', 8)).toBe(4);
    expect(foodXp('cake', 1)).toBe(6);
  });

  it('table d\'XP et plafond quotidien', () => {
    expect(xpToNext(1)).toBe(18);
    expect(xpToNext(19)).toBe(378);
    expect(Array.from({ length: 19 }, (_, i) => xpToNext(i + 1)).reduce((a, b) => a + b)).toBe(3412);
    expect(feed({ level: 1, xp: 15 }, 4, 0)).toEqual({ outcome: 'levelUp', dino: { level: 2, xp: 1 }, xpEatenToday: 4 });
    expect(feed({ level: 3, xp: 0 }, 2, 40).outcome).toBe('eaten');
    expect(feed({ level: 3, xp: 0 }, 2, BALANCE.dailyXpCap).outcome).toBe('full');
    expect([1, 5, 20].map(stageFor)).toEqual([1, 2, 5]);
  });
});

describe('contenus', () => {
  it('lexique valide et articles', () => {
    expect(new Set(CONCEPTS.map((c) => c.id)).size).toBe(CONCEPTS.length);
    expect(frWithArticle(CONCEPTS.find((c) => c.id === 'bird')!)).toBe('l\'oiseau');
    expect(frWithArticle(CONCEPTS.find((c) => c.id === 'dog')!)).toBe('le chien');
    expect(frWithArticle(CONCEPTS.find((c) => c.id === 'red')!)).toBe('rouge');
  });

  it('leurres de la même sous-famille aux niveaux difficiles', () => {
    const pool = conceptsFor('EN-1');
    const dolphin = pool.find((c) => c.id === 'dolphin')!;
    const d = pickDistractors(dolphin, pool, 3, 'same_category', mulberry32(2));
    expect(d.every((c) => c.category === 'sea')).toBe(true);
    const easy = pickDistractors(dolphin, pool, 3, 'other_group', mulberry32(2));
    expect(easy.every((c) => c.group !== 'animal')).toBe(true);
  });

  it('chaque question se construit avec des réponses distinctes (2 en anglais, 4 ailleurs, 6 au niveau CP)', () => {
    const rng = mulberry32(4);
    const expectedCount = (gameId: string, id: string, level: number, refLevel: number) => {
      const expert = id.endsWith(':x');
      if (gameId.startsWith('TR-')) return 1;
      if (gameId === 'MO-6') return id.endsWith(':flag') ? 3 : /hard6|capital6|neighbour6/.test(id) ? 6 : 4;
      if (gameId === 'EN-1') return expert ? 4 : 2;
      if (gameId === 'EN-2') return Number(id.split(':')[1]) <= 10 ? 3 : 4;
      if (['MO-1', 'MO-3', 'LO-1', 'MO-4', 'LO-6'].includes(gameId) && expert) return 6;
      if (gameId === 'MO-5' && Number(id.split(':')[1]) >= 16) return 6;
      if (gameId === 'FR-3' || gameId === 'FR-5') return refLevel <= 3 ? 3 : refLevel >= 16 ? 6 : 4;
      if (gameId === 'FR-6') return refLevel <= 2 ? 3 : refLevel >= 16 ? 6 : 4;
      if (gameId === 'FR-7') return refLevel >= 16 ? 6 : 4;
      if (gameId === 'LO-7') return refLevel <= 2 ? 3 : refLevel >= 18 ? 6 : 4;
      if (gameId === 'LO-8') return refLevel <= 2 ? 3 : refLevel >= 17 ? 6 : 4;
      if (gameId === 'LO-9') return refLevel <= 2 ? 3 : refLevel >= 17 ? 6 : 4;
      if (gameId === 'MO-2' && level >= 15) return 6;
      if (gameId === 'FR-1' && level >= 17) return 6;
      return 4;
    };
    for (const game of GAMES) {
      // « Mon pays » : une quinzaine de questions sur le pays de l'enfant.
      expect(game.questions.length).toBeGreaterThan(game.id === 'MO-6' ? 10 : 40);
      // Chaque niveau de 1 à 20 a des questions.
      for (let level = 1; level <= 20; level++) {
        expect(game.questions.some((q) => Math.abs(q.level - level) <= 1), `${game.id} niveau ${level}`).toBe(true);
      }
      for (const ref of game.questions) {
        for (const level of [ref.level, 5, 10]) {
          const q = game.build(ref, level, rng);
          const all = [q.answer, ...q.distractors];
          const expected = expectedCount(game.id, ref.id, level, ref.level);
          expect(all, ref.id).toHaveLength(expected);
          expect(new Set(all.map((c) => c.id)).size, ref.id).toBe(expected);
          const concepts = all.filter((c) => c.image && !/^(food|flag|cty)-/.test(c.image)).map((c) => conceptById(c.id));
          if (concepts.length === expected) {
            expect(new Set(concepts.map((c) => c.fr.word)).size, ref.id).toBe(expected);
          }
          expect(q.prompt[0].text.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('l\'intrus est le seul d\'une autre famille', () => {
    const game = gameById('LO-1');
    for (const ref of game.questions) {
      const q = game.build(ref, 5, mulberry32(1));
      const odd = conceptById(q.answer.id);
      const others = q.distractors.map((c) => conceptById(c.id));
      const family = ref.id.split(':')[2];
      expect(others.every((c) => c.category === family), ref.id).toBe(true);
      expect(odd.category, ref.id).not.toBe(family);
    }
  });

  it('combien : la bonne quantité est montrée, les autres nombres sont proches aux niveaux difficiles', () => {
    const game = gameById('LO-2');
    const q = game.build({ id: 'LO-2:food-banana:7', level: 5 }, 8, mulberry32(3));
    expect(q.show?.kind).toBe('count');
    if (q.show?.kind === 'count') {
      expect(q.show.groups[0]).toEqual({ image: 'food-banana', count: 7 });
      expect(q.show.groups).toHaveLength(2); // niveau 8 : d'autres fruits mélangés
    }
    expect(q.prompt[0].text).toContain('seulement les bananes');
    expect(q.answer.count).toBe(7);
    q.distractors.forEach((d) => expect(Math.abs(d.count! - 7)).toBeLessThanOrEqual(2));
    expect(q.reinforce[0].text).toContain('Il y a sept bananes');
  });

  it('devinettes : chaque réponse existe, sans leurre qui répondrait aussi', () => {
    RIDDLES.forEach(([id]) => expect(() => conceptById(id.split('~')[0])).not.toThrow());
    expect(new Set(RIDDLES.map(([id]) => id)).size).toBe(RIDDLES.length);
    const game = gameById('MO-2');
    for (let seed = 0; seed < 30; seed++) {
      const q = game.build({ id: 'MO-2:moon', level: 5 }, 7, mulberry32(seed));
      expect(q.distractors.map((c) => c.id)).not.toContain('star');
    }
  });

  it('la suite : la bonne réponse continue le motif', () => {
    const game = gameById('LO-3');
    for (const ref of game.questions) {
      const q = game.build(ref, 5, mulberry32(11));
      if (q.show?.kind === 'numbers') {
        // Suite de nombres : pas constant, ou qui grandit de 1 (1, 2, 4, 7, 11).
        const [a, b, c, d] = q.show.items as number[];
        const next = b - a === c - b ? d + (d - c) : d + (d - c) + 1;
        expect(q.answer.number, ref.id).toBe(next);
        expect(q.distractors.map((x) => x.number), ref.id).not.toContain(next);
        continue;
      }
      if (q.show?.kind !== 'sequence') throw new Error('suite attendue');
      const pattern = ref.id.split(':')[1];
      const seq = q.show.images.slice(0, -1);
      const expected = seq[seq.length - pattern.length];
      expect(`food-${q.answer.id}`, ref.id).toBe(expected);
    }
  });

  it('le plus / le moins : la bonne carte a le plus (ou le moins) de fruits', () => {
    const game = gameById('LO-4');
    for (const ref of game.questions) {
      const q = game.build(ref, 5, mulberry32(12));
      if (ref.id.includes(':num:')) {
        // Niveau CP : comparer des nombres écrits.
        const others = q.distractors.map((d) => d.number!);
        if (ref.id.includes('least')) expect(Math.min(...others), ref.id).toBeGreaterThan(q.answer.number!);
        else expect(Math.max(...others), ref.id).toBeLessThan(q.answer.number!);
        continue;
      }
      const counts = q.distractors.map((d) => d.repeat!.count);
      if (ref.id.endsWith('least')) expect(Math.min(...counts), ref.id).toBeGreaterThan(q.answer.repeat!.count);
      else expect(Math.max(...counts), ref.id).toBeLessThan(q.answer.repeat!.count);
    }
  });

  it('calcul : la bonne réponse est le résultat du calcul', () => {
    const game = gameById('LO-5');
    for (const ref of game.questions) {
      const q = game.build(ref, ref.level, mulberry32(3));
      if (q.show?.kind !== 'sum') throw new Error('calcul attendu');
      const { a, b, op, total } = q.show;
      const value = q.answer.number ?? q.answer.count!;
      if (total !== undefined) expect(a + value, ref.id).toBe(total);
      else expect(value, ref.id).toBe(op === '+' ? a + b : a - b);
      expect(value, ref.id).toBeGreaterThanOrEqual(0);
      expect(value, ref.id).toBeLessThanOrEqual(20);
      // En images jusqu'au niveau 10, écrit ensuite.
      expect(Boolean(q.show.image), ref.id).toBe(ref.level <= 10);
    }
  });

  it('les sons : la réponse rime (ou commence) comme le mot, les leurres non', () => {
    const rhyme = new Map(RHYMES.flatMap(([k, ids]) => ids.map((id) => [id, k] as const)));
    const onset = new Map(ONSETS.flatMap(([k, ids]) => ids.map((id) => [id, k] as const)));
    const game = gameById('FR-1');
    for (const ref of game.questions) {
      const [, kind, x] = ref.id.split(':');
      const family = kind === 'rime' ? rhyme : onset;
      const q = game.build(ref, ref.level, mulberry32(9));
      expect(q.show).toEqual({ kind: 'image', image: x });
      expect(family.get(q.answer.id), ref.id).toBe(family.get(x));
      expect(q.answer.id, ref.id).not.toBe(x);
      q.distractors.forEach((d) => {
        expect(d.id, ref.id).not.toBe(x);
        expect(family.get(d.id), ref.id).not.toBe(family.get(x));
      });
    }
  });

  it('le plus grand : la réponse est nettement plus grande (ou plus petite) que les autres, en vrai', () => {
    const game = gameById('MO-5');
    for (const ref of game.questions) {
      const q = game.build(ref, ref.level, mulberry32(ref.level * 31 + ref.id.length));
      const size = SIZES[q.answer.id];
      const others = q.distractors.map((d) => SIZES[d.id]);
      if (ref.id.endsWith('big')) expect(Math.max(...others) * 1.5, ref.id).toBeLessThanOrEqual(size);
      else expect(Math.min(...others), ref.id).toBeGreaterThanOrEqual(size * 1.5);
    }
  });

  it('ça va ensemble : la réponse est le partenaire, sans leurre qui irait aussi', () => {
    const game = gameById('MO-4');
    for (const ref of game.questions) {
      const [, a, b] = ref.id.split(':');
      for (let seed = 0; seed < 5; seed++) {
        const q = game.build(ref, ref.level, mulberry32(seed));
        expect(q.answer.id).toBe(b);
        expect(q.show).toEqual({ kind: 'image', image: a });
        const banned = PAIRS.filter(([x, y]) => x === a || y === a || x === b).flatMap(([x, y, , , extra]) => [x, y, ...(extra ?? [])]);
        q.distractors.forEach((d) => expect(banned, ref.id).not.toContain(d.id));
      }
    }
  });

  it('syllabes, nombres en anglais et jeux selon l\'âge', () => {
    const q = gameById('FR-2').build({ id: 'FR-2:elephant', level: 7 }, 7, mulberry32(1));
    expect(q.answer.count).toBe(3);
    const rev = gameById('FR-2').build({ id: 'FR-2:hippo:x', level: 18 }, 18, mulberry32(1));
    expect(rev.answer.id).toBe('hippo');
    expect(rev.show).toEqual({ kind: 'numbers', items: [4] });
    expect([1, 13, 21, 30, 99, 100].map(enNumber)).toEqual(['one', 'thirteen', 'twenty-one', 'thirty', 'ninety-nine', 'one hundred']);
    const thirteen = gameById('EN-2').build({ id: 'EN-2:13', level: 8 }, 8, mulberry32(1));
    expect(thirteen.distractors.map((d) => d.number)).toContain(30);
    const at3 = gamesForAge(3).map((g) => g.id);
    expect(at3).not.toContain('EN-1');
    expect(at3).not.toContain('LO-5');
    expect(at3).toContain('MO-1');
    expect(gamesForAge(5).map((g) => g.id)).toContain('LO-5');
    expect(gamesForAge(7)).toHaveLength(GAMES.length);
  });

  it('lecture : le bon mot écrit, dans la bonne écriture, des leurres de plus en plus ressemblants', () => {
    const game = gameById('FR-3');
    const easy = game.build({ id: 'FR-3:maman:caps', level: 1 }, 1, mulberry32(1));
    expect(easy.answer.text).toEqual({ value: 'MAMAN', script: 'caps' });
    easy.distractors.forEach((d) => expect(d.text!.value[0]).not.toBe('M'));
    const hard = game.build({ id: 'FR-3:chapeau:cursive', level: 14 }, 14, mulberry32(1));
    expect(hard.answer.text).toEqual({ value: 'chapeau', script: 'cursive' });
    expect(hard.show).toEqual({ kind: 'image', image: 'hat' });
    expect(hard.hints![0].text).toContain('cé');
    const letters = gameById('FR-4');
    for (const ref of letters.questions) {
      const q = letters.build(ref, ref.level, mulberry32(2));
      const values = [q.answer, ...q.distractors].map((c) => c.text!.value);
      expect(new Set(values).size, ref.id).toBe(values.length);
      const [, , value, script] = ref.id.split(':');
      expect(q.answer.text!.value.toLowerCase(), ref.id).toBe(value.toLowerCase());
      if (script === 'caps') values.forEach((v) => expect(v, ref.id).toBe(v.toUpperCase()));
    }
    const b = letters.build({ id: 'FR-4:L:B:lower', level: 8 }, 8, mulberry32(3));
    expect(b.distractors.map((d) => d.text!.value).some((v) => 'dpq'.includes(v))).toBe(true);
  });

  it('phrase à trou, lis et touche l\'image, formes et couleurs', () => {
    // Phrase à trou : la réponse est le mot qui manque, jamais un leurre exclu.
    for (const ref of gameById('FR-6').questions) {
      const [, i, answer] = ref.id.split(':');
      const [, , , extra] = SENTENCES[Number(i)];
      for (let seed = 0; seed < 4; seed++) {
        const q = gameById('FR-6').build(ref, ref.level, mulberry32(seed));
        expect(q.answer.id).toBe(answer);
        q.distractors.forEach((d) => {
          expect(extra ?? [], ref.id).not.toContain(d.id);
          expect(extra ?? [], ref.id).not.toContain(`cat:${conceptById(d.id).category}`);
        });
      }
    }
    const text = gameById('FR-7').build({ id: 'FR-7:2:bed', level: 5 }, 5, mulberry32(1));
    expect(text.answer.text).toEqual({ value: 'LIT', script: 'caps' });
    expect(text.show).toEqual({ kind: 'text', value: 'Le soir, je dors dans mon …….', script: 'lower' });
    expect(text.prompt[0].text).toBe('Le soir, je dors dans mon…');
    expect(text.reinforce[0].text).toBe('Oui ! Le soir, je dors dans mon lit.');
    // Lis et touche l'image : le mot est écrit, pas dit.
    const read = gameById('FR-5').build({ id: 'FR-5:chapeau:cursive', level: 14 }, 14, mulberry32(1));
    expect(read.answer.id).toBe('hat');
    expect(read.show).toEqual({ kind: 'text', value: 'chapeau', script: 'cursive' });
    expect(read.prompt.map((x) => x.text).join(' ')).not.toContain('chapeau');
    // Formes : une seule carte correspond à la consigne.
    for (const ref of gameById('LO-7').questions) {
      const q = gameById('LO-7').build(ref, ref.level, mulberry32(ref.id.length + ref.level));
      const all = [q.answer, ...q.distractors].map((c) => c.shape!);
      const a = q.answer.shape!;
      const prompt = q.prompt[0].text;
      const matches = all.filter((c) => {
        if (prompt.includes('n\'est pas')) return c.shape === a.shape && c.color !== all[1].color;
        if (ref.level === 1 || ref.level === 3) return c.shape === a.shape;
        if (ref.level === 2 || ref.level === 4) return c.color === a.color;
        const sized = ref.level >= 14 && ref.level !== 16 && ref.level !== 17;
        return c.shape === a.shape && c.color === a.color && (!sized || !!c.small === !!a.small);
      });
      expect(matches, `${ref.id} ${prompt}`).toHaveLength(1);
    }
  });

  it('l\'heure et la monnaie : une seule bonne carte', () => {
    expect([[3, 0], [3, 30], [3, 15], [2, 45], [12, 0], [1, 20]].map(([h, m]) => sayTime(h, m))).toEqual([
      'trois heures', 'trois heures et demie', 'trois heures et quart', 'trois heures moins le quart', 'midi',
      'une heure vingt']);
    expect(sayTime(3, 30, true)).toBe('quinze heures trente');
    for (const ref of gameById('LO-8').questions) {
      const q = gameById('LO-8').build(ref, ref.level, mulberry32(ref.id.length * 7 + ref.level));
      const all = [q.answer, ...q.distractors].map((c) => `${c.clock!.h}:${c.clock!.m}`);
      expect(new Set(all).size, ref.id).toBe(all.length);
    }
    expect([250, 100, 50, 1, 2000, 120].map(sayMoney)).toEqual(
      ['deux euros cinquante', 'un euro', 'cinquante centimes', 'un centime', 'vingt euros', 'un euro vingt']);
    for (const ref of gameById('LO-9').questions) {
      const q = gameById('LO-9').build(ref, ref.level, mulberry32(ref.id.length * 3 + ref.level));
      const sum = (coins: number[]) => coins.reduce((a, b) => a + b, 0);
      const target = Number(q.answer.id.slice(2));
      expect(sum(q.answer.money!), ref.id).toBe(target);
      expect(q.prompt[0].text, ref.id).toContain(sayMoney(target));
      q.distractors.forEach((d) => expect(sum(d.money!), ref.id).not.toBe(target));
      [q.answer, ...q.distractors].forEach((c) => expect(c.money!.length, ref.id).toBeLessThanOrEqual(8));
    }
  });

  it('nombres en lettres', () => {
    expect([1, 17, 21, 71, 80, 91, 100].map(frNumber)).toEqual(
      ['un', 'dix-sept', 'vingt et un', 'soixante et onze', 'quatre-vingts', 'quatre-vingt-onze', 'cent']);
  });

  it('les ombres : une silhouette de la bonne réponse, avec des indices', () => {
    const q = gameById('MO-3').build({ id: 'MO-3:giraffe', level: 4 }, 4, mulberry32(2));
    expect(q.show).toEqual({ kind: 'silhouette', image: 'giraffe' });
    expect(q.hints!.length).toBeGreaterThan(0);
  });

  it('série mélangée : des questions de plusieurs jeux, jamais deux fois le même jeu de suite', () => {
    const progress = new Progress(new MemoryStore());
    progress.age = 7;
    const series = new Series(GAMES, progress, mulberry32(21));
    expect(series.mixed).toBe(true);
    expect(series.items).toHaveLength(10);
    expect(new Set(series.items.map((i) => i.game.id)).size).toBeGreaterThan(3);
    series.items.slice(1).forEach((item, i) => expect(item.game).not.toBe(series.items[i].game));
    while (!series.finished) {
      series.tap(series.current.answer);
      series.next();
    }
    expect(series.result!.gameId).toBe('MIX');
    const played = new Set(series.items.map((i) => i.game.id));
    played.forEach((id) => expect(progress.gameLevel(id)).toBeDefined());
  });

  it('Montre-moi : des leurres de la même sous-famille dès le niveau 2', () => {
    const q = gameById('MO-1').build({ id: 'MO-1:dog', level: 1 }, 2, mulberry32(8));
    expect(q.distractors.every((c) => conceptById(c.id).category === 'farm')).toBe(true);
  });

  it('chaque groupe de répliques utilisé existe', () => {
    for (const game of GAMES) expect(LINES[game.introLine]?.length).toBeGreaterThan(0);
  });

  it('pas de répétition des dernières répliques', () => {
    const picker = new LinePicker(mulberry32(9));
    const history: string[] = [];
    for (let i = 0; i < 200; i++) {
      const line = picker.pick('correct');
      expect(history.slice(0, Math.min(5, LINES.correct.length - 1))).not.toContain(line);
      history.unshift(line);
    }
  });
});

describe('série', () => {
  it('sans faute : 3 étoiles, un fruit par question + le gâteau, questions maîtrisées', () => {
    const progress = new Progress(new MemoryStore());
    const series = new Series(gameById('EN-1'), progress, mulberry32(1));
    expect(series.items).toHaveLength(6);
    expect(series.level).toBe(2);
    expect(new Set(series.items.map((i) => i.fruit)).size).toBe(6);
    series.items.forEach((i) => expect(i.choices).toHaveLength(2));
    expect(series.items[0].prompt).toHaveLength(2);
    while (!series.finished) {
      expect(series.tap(series.current.answer).kind).toBe('correct');
      series.next();
    }
    expect(series.result!.stars).toBe(3);
    expect(series.result!.earned).toEqual([...series.items.map((i) => i.fruit), 'cake']);
    expect(progress.mastered('EN-1').size).toBe(6);
    expect(progress.isFirstSeriesToday()).toBe(false);
  });

  it('erreurs : carte désactivée, indice après 2 erreurs, question à retravailler', () => {
    const progress = new Progress(new MemoryStore());
    progress.age = 7;
    expect(progress.ageChosen).toBe(true);
    const series = new Series(gameById('MO-1'), progress, mulberry32(2));
    expect(series.level).toBe(5);
    expect(series.current.choices).toHaveLength(4);
    const wrong = series.current.choices.filter((c) => c.id !== series.current.answer.id);
    expect(series.tap(wrong[0])).toEqual({ kind: 'wrong', hint: false });
    expect(series.tap(wrong[0]).kind).toBe('ignored');
    expect(series.tap(wrong[1])).toEqual({ kind: 'wrong', hint: true });
    const id = series.current.questionId;
    expect(series.tap(series.current.answer)).toMatchObject({ kind: 'correct', firstTry: false });
    expect(progress.mastered('MO-1').has(id)).toBe(false);
    // Ratée : pas avant demain.
    expect(progress.waitingReviews('MO-1').has(id)).toBe(true);
    expect(progress.dueReviews('MO-1').has(id)).toBe(false);
  });

  it('révision espacée : le lendemain, puis 3 jours, puis 7 jours plus tard', () => {
    const p = new Progress(new MemoryStore());
    const day = (d: number, h = 10) => new Date(2026, 9, d, h).getTime();
    const answer = (at: number, ok: boolean) =>
      p.recordAnswer({ gameId: 'MO-1', category: 'world', questionId: 'MO-1:cat', level: 1, firstTrySuccess: ok, at });
    answer(day(1), false);
    expect(p.dueReviews('MO-1', day(1, 20)).size).toBe(0);
    expect(p.dueReviews('MO-1', day(2, 8)).has('MO-1:cat')).toBe(true);
    // Réussie trop tôt (le jour même, en fin de série) : rien ne change.
    answer(day(1, 11), true);
    expect(p.reviewList(5)[0]).toMatchObject({ stage: 0, due: new Date(2026, 9, 2).getTime() });
    answer(day(2), true);
    expect(p.reviewList(5)[0]).toMatchObject({ stage: 1, due: new Date(2026, 9, 5).getTime() });
    answer(day(5), true);
    expect(p.reviewList(5)[0]).toMatchObject({ stage: 2, due: new Date(2026, 9, 12).getTime() });
    expect(p.mastered('MO-1').has('MO-1:cat')).toBe(false);
    answer(day(12), true);
    expect(p.reviewList(5)).toHaveLength(0);
    expect(p.mastered('MO-1').has('MO-1:cat')).toBe(true);
    // Ratée à nouveau : retour au lendemain.
    answer(day(20), false);
    expect(p.reviewList(5)[0]).toMatchObject({ stage: 0, due: new Date(2026, 9, 21).getTime() });
    expect(p.mastered('MO-1').has('MO-1:cat')).toBe(false);
  });

  it('les révisions du jour passent en premier, les autres attendent leur date', () => {
    const questions = Array.from({ length: 30 }, (_, i) => ({ id: `q${i}`, level: 3 }));
    const picks = pickQuestions({ questions, level: 3, count: 10, mastered: new Set(), recent: new Set(),
      due: new Set(['q1', 'q2']), waiting: new Set(['q3', 'q4']) }, mulberry32(1));
    const ids = picks.map((p) => p.question.id);
    expect(ids).toEqual(expect.arrayContaining(['q1', 'q2']));
    expect(ids).not.toContain('q3');
    expect(ids).not.toContain('q4');
    expect(picks.filter((p) => p.due).map((p) => p.question.id).sort()).toEqual(['q1', 'q2']);
  });

  it('tutoriel : la question de démonstration ne compte pas', () => {
    const progress = new Progress(new MemoryStore());
    const series = new Series(gameById('EN-1'), progress, mulberry32(5));
    series.skipCurrent();
    expect(series.items).toHaveLength(5);
    while (!series.finished) {
      series.tap(series.current.answer);
      series.next();
    }
    expect(series.result!.total).toBe(5);
  });

  it('seuls les fruits trouvés du premier coup sont gagnés ; abandon après 3 réponses', () => {
    const progress = new Progress(new MemoryStore());
    const series = new Series(gameById('EN-1'), progress, mulberry32(3));
    const wrong = series.current.choices.find((c) => c.id !== series.current.answer.id)!;
    series.tap(wrong);
    for (let i = 0; i < 3; i++) {
      series.tap(series.current.answer);
      series.next();
    }
    series.abandon();
    expect(series.result!.total).toBe(3);
    expect(series.result!.earned).toEqual([series.items[1].fruit, series.items[2].fruit]);
  });

  it('la progression survit à un rechargement', () => {
    const store = new MemoryStore();
    const a = new Progress(store);
    a.age = 6;
    a.saveFeeding({ level: 2, xp: 5 }, 10);
    a.leftovers = [{ food: 'banana', xp: 2 }];
    const b = new Progress(store);
    expect(b.age).toBe(6);
    expect(b.dino).toEqual({ level: 2, xp: 5 });
    expect(b.xpEatenToday()).toBe(10);
    expect(b.leftovers).toEqual([{ food: 'banana', xp: 2 }]);
  });
});

describe('espace parents', () => {
  it('temps de jeu, limite quotidienne, réglages et niveaux par jeu', () => {
    const store = new MemoryStore();
    const p = new Progress(store);
    const day = new Date(2026, 9, 30, 10);
    expect(p.timeIsUp(day)).toBe(false);
    p.updateSettings({ dailyMinutes: 20 });
    p.addPlayTime(15 * 60_000, day);
    expect(p.timeIsUp(day)).toBe(false);
    p.addPlayTime(5 * 60_000, day);
    expect(p.timeIsUp(day)).toBe(true);
    // Le lendemain, on peut rejouer.
    expect(p.timeIsUp(new Date(2026, 9, 31, 10))).toBe(false);
    expect(p.playWeek(day)[6]).toEqual({ day: '2026-10-30', ms: 20 * 60_000 });

    p.updateSettings({ disabledGames: ['EN-1'], sfx: false });
    p.setGameLevel('LO-5', 14);
    expect(p.gameLevel('LO-5')).toBe(14);
    p.setGameLevel('LO-5', 99);
    expect(p.gameLevel('LO-5')).toBe(20);
    p.setGameLevel('LO-5', null);
    expect(p.gameLevel('LO-5')).toBeUndefined();

    p.recordAnswer({ gameId: 'MO-1', category: 'world', questionId: 'MO-1:cat', level: 1, firstTrySuccess: false, at: 5 });
    expect(p.reviewList(5)).toMatchObject([{ gameId: 'MO-1', questionId: 'MO-1:cat', stage: 0 }]);

    // Réglages conservés après rechargement et après « tout recommencer ».
    const reloaded = new Progress(store);
    expect(reloaded.settings).toMatchObject({ disabledGames: ['EN-1'], dailyMinutes: 20, sfx: false, music: true });
    reloaded.reset();
    expect(reloaded.settings.dailyMinutes).toBe(20);
    expect(reloaded.answers()).toHaveLength(0);
  });

  it('le niveau réglé par les parents sert de point de départ à la série', () => {
    const p = new Progress(new MemoryStore());
    p.age = 5;
    p.setGameLevel('LO-6', 15);
    const series = new Series(gameById('LO-6'), p, mulberry32(3));
    expect(series.level).toBeGreaterThanOrEqual(14);
    expect(series.level).toBeLessThanOrEqual(16);
  });
});

describe('code parent et collection', () => {
  it('le code débloque du temps de jeu pour la journée', () => {
    const p = new Progress(new MemoryStore());
    const day = new Date(2026, 9, 30, 10);
    expect(p.checkPin('1234')).toBe(false);
    p.updateSettings({ pin: '1234', dailyMinutes: 15 });
    expect(p.checkPin('1234')).toBe(true);
    expect(p.checkPin('0000')).toBe(false);
    p.addPlayTime(16 * 60_000, day);
    expect(p.timeIsUp(day)).toBe(true);
    p.unlockToday(15, day);
    expect(p.timeIsUp(day)).toBe(false);
    p.addPlayTime(15 * 60_000, day);
    expect(p.timeIsUp(day)).toBe(true);
    p.unlockToday(-1, day);
    p.addPlayTime(120 * 60_000, day);
    expect(p.timeIsUp(day)).toBe(false);
    // Le lendemain, la limite revient.
    const next = new Date(2026, 9, 31, 10);
    p.addPlayTime(20 * 60_000, next);
    expect(p.timeIsUp(next)).toBe(true);
  });

  it('un cadeau par niveau gagné ; un objet remplace celui du même emplacement', () => {
    const p = new Progress(new MemoryStore());
    p.saveFeeding({ level: 3, xp: 0 }, 10);
    expect(p.collection.pending).toBe(2);
    const choices = giftChoices(p.collection.owned, mulberry32(1));
    expect(choices).toHaveLength(4);
    expect(new Set(choices.map((c) => c.slot)).size).toBe(4);
    p.own('billed-cap', sameSlot('billed-cap'));
    expect(p.collection.pending).toBe(1);
    p.own('sunglasses', sameSlot('sunglasses'));
    expect(p.collection.worn).toEqual(['billed-cap', 'sunglasses']);
    // Le chapeau remplace la casquette, pas les lunettes.
    p.wear('top-hat', sameSlot('top-hat'));
    expect(p.collection.worn).toEqual(['sunglasses', 'top-hat']);
    p.takeOff('sunglasses');
    expect(p.collection.worn).toEqual(['top-hat']);
    expect(giftChoices(ITEMS.map((i) => i.id), mulberry32(1))).toHaveLength(0);
  });
});

describe('mode nuit', () => {
  it('le soir, une dernière série, puis dodo jusqu\'au matin (sauf code parent)', () => {
    const p = new Progress(new MemoryStore());
    const at = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m);
    expect(p.isNight(at(30, 22))).toBe(false);
    p.updateSettings({ nightTime: '19:30' });
    expect(p.isNight(at(30, 19, 10))).toBe(false);
    expect(p.isNight(at(30, 19, 30))).toBe(true);
    expect(p.isNight(at(31, 5))).toBe(true);
    expect(p.isNight(at(31, 7))).toBe(false);
    // Série de l'après-midi : rien.
    p.markNightSeries(at(30, 17));
    expect(p.isSleeping(at(30, 20))).toBe(false);
    // Dernière série du soir : le dino dort, même après minuit, jusqu'à 6 h.
    p.markNightSeries(at(30, 20));
    expect(p.isSleeping(at(30, 21))).toBe(true);
    expect(p.isSleeping(at(31, 2))).toBe(true);
    expect(p.isSleeping(at(31, 8))).toBe(false);
    // Le soir suivant, une nouvelle dernière série.
    expect(p.isSleeping(at(31, 20))).toBe(false);
    // Un parent débloque : on peut rejouer ce soir.
    p.markNightSeries(at(31, 20));
    p.unlockNight(at(31, 20, 30));
    expect(p.isSleeping(at(31, 21))).toBe(false);
    p.markNightSeries(at(31, 21));
    expect(p.isSleeping(at(31, 21, 30))).toBe(false);
  });
});

describe('correction des tracés', () => {
  const all = [...SHAPE_MODELS, ...LETTER_MODELS];
  const shift = (strokes: Point[][], dx: number, dy: number, k = 1): Point[][] =>
    strokes.map((s) => s.map(([x, y]): Point => [0.5 + (x - 0.5) * k + dx, 0.5 + (y - 0.5) * k + dy]));
  const wobble = (strokes: Point[][], rng: () => number): Point[][] =>
    strokes.map((s) => resample([s], 0.02).map(([x, y]): Point => [x + (rng() - 0.5) * 0.06, y + (rng() - 0.5) * 0.06]));

  it('un tracé correct, un peu tremblé ou décalé, est accepté', () => {
    const rng = mulberry32(3);
    for (const m of all) {
      expect(scoreTrace(m.strokes, m.strokes, false).ok, m.id).toBe(true);
      expect(scoreTrace(m.strokes, wobble(m.strokes, rng), false).ok, `${m.id} tremblé`).toBe(true);
      expect(scoreTrace(m.strokes, shift(m.strokes, 0.04, -0.03), false).ok, `${m.id} décalé`).toBe(true);
      // Sans pointillés : plus petit et ailleurs dans le cadre, c'est bon aussi.
      expect(scoreTrace(m.strokes, shift(wobble(m.strokes, rng), 0.1, 0.05, 0.6), true).ok, `${m.id} libre`).toBe(true);
    }
  });

  it('un tracé incomplet, un gribouillis ou une autre forme est refusé', () => {
    const rng = mulberry32(5);
    for (const m of all) {
      const points = resample(m.strokes, 0.02);
      const half = [points.slice(0, Math.floor(points.length / 2))];
      expect(scoreTrace(m.strokes, half, false).ok, `${m.id} à moitié`).toBe(false);
      const scribble = [Array.from({ length: 200 }, (): Point => [rng(), rng()])];
      expect(scoreTrace(m.strokes, scribble, false).ok, `${m.id} gribouillis`).toBe(false);
    }
    const byId = (id: string) => all.find((m) => m.id === id)!.strokes;
    for (const [asked, drawn] of [['triangle', 'square'], ['O', 'L'], ['A', 'H'], ['T', 'L'], ['star', 'circle'],
      ['heart', 'triangle'], ['M', 'N'], ['X', 'V'], ['O', 'C'], ['E', 'F'], ['F', 'E'], ['P', 'R'], ['C', 'G']]) {
      expect(scoreTrace(byId(asked), byId(drawn), false).ok, `${asked} ≠ ${drawn}`).toBe(false);
      expect(scoreTrace(byId(asked), byId(drawn), true).ok, `${asked} ≠ ${drawn} (libre)`).toBe(false);
    }
    // Un carré à la place d'un rond : refusé quand on dessine seul (sur les pointillés, impossible de s'y tromper).
    expect(scoreTrace(byId('circle'), byId('square'), true).ok).toBe(false);
  });
});

describe('mon pays', () => {
  it('chaque pays a ses questions, avec une seule bonne réponse et des images existantes', () => {
    const game = gameById('MO-6');
    for (const country of COUNTRIES) {
      setCountry(country.code);
      expect(game.questions.length, country.code).toBeGreaterThanOrEqual(10);
      for (const ref of game.questions) {
        for (let seed = 0; seed < 3; seed++) {
          const q = game.build(ref, ref.level, mulberry32(seed));
          const ids = [q.answer, ...q.distractors].map((c) => c.id);
          expect(new Set(ids).size, ref.id).toBe(ids.length);
          expect(q.distractors.length, ref.id).toBeGreaterThanOrEqual(2);
          for (const c of [q.answer, ...q.distractors]) {
            if (c.image) expect(existsSync(`public/img/${c.image}.svg`), `${ref.id} ${c.image}`).toBe(true);
          }
        }
      }
    }
    setCountry('other');
    expect(game.questions).toHaveLength(0);
    setCountry('fr');
    const flag = game.build({ id: 'MO-6:fr:flag', level: 1 }, 1, mulberry32(1));
    expect(flag.answer.image).toBe('flag-fr');
    expect(flag.prompt[0].text).toBe('Quel est le drapeau de la France ?');
  });
});
