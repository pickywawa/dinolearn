import { describe, expect, it } from 'vitest';
import { CONCEPTS, conceptById, conceptsFor, frWithArticle, pickDistractors } from '../src/content/content';
import { GAMES, gameById } from '../src/content/games';
import { RIDDLES } from '../src/content/riddles';
import { LINES, LinePicker } from '../src/core/lines';
import { MemoryStore, Progress } from '../src/core/progress';
import { Series } from '../src/core/series';
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
    expect(baseLevel(20, 4)).toBe(10);
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
    expect(feed({ level: 3, xp: 0 }, 2, 40).outcome).toBe('full');
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

  it('chaque question de chaque jeu se construit avec 4 réponses distinctes', () => {
    const rng = mulberry32(4);
    for (const game of GAMES) {
      expect(game.questions.length).toBeGreaterThan(40);
      for (const ref of game.questions) {
        for (const level of [1, 5, 10]) {
          const q = game.build(ref, level, rng);
          const all = [q.answer, ...q.distractors];
          expect(q.distractors, ref.id).toHaveLength(3);
          expect(new Set(all.map((c) => c.id)).size, ref.id).toBe(4);
          const concepts = all.filter((c) => c.image && !c.image.startsWith('food-')).map((c) => conceptById(c.id));
          if (concepts.length === 4) {
            expect(new Set(concepts.map((c) => c.fr.word)).size, ref.id).toBe(4);
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
    expect(q.show).toEqual({ image: 'food-banana', count: 7 });
    expect(q.answer.count).toBe(7);
    q.distractors.forEach((d) => expect(Math.abs(d.count! - 7)).toBeLessThanOrEqual(2));
    expect(q.reinforce[0].text).toContain('Il y a sept bananes');
  });

  it('devinettes : chaque réponse existe, sans leurre qui répondrait aussi', () => {
    RIDDLES.forEach(([id]) => expect(() => conceptById(id)).not.toThrow());
    const game = gameById('MO-2');
    for (let seed = 0; seed < 30; seed++) {
      const q = game.build({ id: 'MO-2:moon', level: 5 }, 7, mulberry32(seed));
      expect(q.distractors.map((c) => c.id)).not.toContain('star');
    }
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
    series.items.forEach((i) => expect(i.choices).toHaveLength(4));
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
