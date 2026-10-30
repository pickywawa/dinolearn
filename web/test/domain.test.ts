import { describe, expect, it } from 'vitest';
import { CONCEPTS, conceptById, conceptsFor, frWithArticle, pickDistractors } from '../src/content/content';
import { GAMES, gameById } from '../src/content/games';
import { frNumber } from '../src/content/numbers';
import { RIDDLES } from '../src/content/riddles';
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
      recent: new Set(), toRetry: new Set() }, mulberry32(1));
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
        recent: new Set(recent.slice(0, 2).flat()), toRetry: new Set() }, rng);
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
      mastered: new Set(questions.map((q) => q.id)), recent: new Set(), toRetry: new Set() }, mulberry32(3));
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
    const expectedCount = (gameId: string, id: string, level: number) => {
      const expert = id.endsWith(':x');
      if (gameId === 'EN-1') return expert ? 4 : 2;
      if (['MO-1', 'MO-3', 'LO-1'].includes(gameId) && expert) return 6;
      if (gameId === 'MO-2' && level >= 15) return 6;
      if (gameId === 'FR-1' && level >= 17) return 6;
      return 4;
    };
    for (const game of GAMES) {
      expect(game.questions.length).toBeGreaterThan(40);
      // Chaque niveau de 1 à 20 a des questions.
      for (let level = 1; level <= 20; level++) {
        expect(game.questions.some((q) => Math.abs(q.level - level) <= 1), `${game.id} niveau ${level}`).toBe(true);
      }
      for (const ref of game.questions) {
        for (const level of [ref.level, 5, 10]) {
          const q = game.build(ref, level, rng);
          const all = [q.answer, ...q.distractors];
          const expected = expectedCount(game.id, ref.id, level);
          expect(all, ref.id).toHaveLength(expected);
          expect(new Set(all.map((c) => c.id)).size, ref.id).toBe(expected);
          const concepts = all.filter((c) => c.image && !c.image.startsWith('food-')).map((c) => conceptById(c.id));
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
    expect(progress.toRetry('MO-1', 14).has(id)).toBe(true);
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
