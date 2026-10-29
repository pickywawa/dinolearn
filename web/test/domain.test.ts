import { describe, expect, it } from 'vitest';
import {
  CONCEPTS, GAMES, choicesFor, conceptsFor, distractorsFor, frWithArticle, pickDistractors,
} from '../src/content/content';
import { LINES, LinePicker } from '../src/core/lines';
import { MemoryStore, Progress } from '../src/core/progress';
import { Series } from '../src/core/series';
import { gameById } from '../src/content/content';
import { adjustment, baseLevel, computeLevel } from '../src/domain/difficulty';
import { AnswerRecord, mulberry32 } from '../src/domain/models';
import { feed, stageFor, xpToNext } from '../src/domain/progression';
import { rewardsFor, starsFor } from '../src/domain/rewards';
import { pickQuestions } from '../src/domain/selector';

const answers = (count: number, rate: number, gameId = 'EN-1'): AnswerRecord[] =>
  Array.from({ length: count }, (_, i) => ({
    gameId, category: 'foreign_language', questionId: `${gameId}:${i}`, level: 1,
    firstTrySuccess: i < count * rate, at: 0,
  }));

describe('difficulté', () => {
  it('niveau de base selon le dino et l\'âge', () => {
    expect(baseLevel(1, 3)).toBe(1);
    expect(baseLevel(1, 7)).toBe(4);
    expect(baseLevel(20, 4)).toBe(10);
  });

  it('ajustement selon le taux de réussite', () => {
    expect([0.95, 0.8, 0.6, 0.4, 0.1].map((r) => adjustment(r))).toEqual([2, 1, 0, -1, -2]);
  });

  it('pas d\'ajustement sous 20 réponses, repli sur la catégorie', () => {
    expect(computeLevel({ experienceLevel: 5, age: 4, gameAnswers: answers(10, 1),
      categoryAnswers: answers(10, 1), allAnswers: answers(10, 1) })).toBe(3);
    expect(computeLevel({ experienceLevel: 5, age: 4, gameAnswers: answers(5, 1),
      categoryAnswers: answers(40, 0.2), allAnswers: [] })).toBe(1);
  });

  it('lissage ±1 et fenêtre des 100 dernières réponses', () => {
    expect(computeLevel({ experienceLevel: 20, age: 7, gameAnswers: answers(100, 1),
      categoryAnswers: [], allAnswers: [], previousLevel: 3 })).toBe(4);
    expect(computeLevel({ experienceLevel: 4, age: 4,
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

  it('toujours une feuille, cumul des aliments', () => {
    const rng = mulberry32(1);
    expect(rewardsFor({ stars: 0, perfect: false, level: 1, firstSeriesOfDay: false }, rng)).toEqual({ leaf: 1 });
    expect(rewardsFor({ stars: 3, perfect: false, level: 1, firstSeriesOfDay: true }, rng))
      .toEqual({ leaf: 2, apple: 1, cherry: 1, watermelon: 1 });
  });

  it('table d\'XP et plafond quotidien', () => {
    expect(xpToNext(1)).toBe(18);
    expect(xpToNext(19)).toBe(378);
    expect(Array.from({ length: 19 }, (_, i) => xpToNext(i + 1)).reduce((a, b) => a + b)).toBe(3412);
    expect(feed({ level: 1, xp: 15 }, 'cherry', 0)).toEqual({ outcome: 'levelUp', dino: { level: 2, xp: 1 }, xpEatenToday: 4 });
    expect(feed({ level: 3, xp: 0 }, 'apple', 40).outcome).toBe('full');
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

  it('distracteurs : bon nombre, sans mot en double', () => {
    const rng = mulberry32(4);
    for (const game of GAMES) {
      const pool = conceptsFor(game.id);
      for (const answer of pool) {
        for (let level = 1; level <= 10; level++) {
          const d = pickDistractors(answer, pool, choicesFor(game, level) - 1, distractorsFor(game, level), rng);
          expect(d).toHaveLength(choicesFor(game, level) - 1);
          expect(new Set([answer, ...d].map((c) => c.en.word)).size).toBe(d.length + 1);
          expect(new Set([answer, ...d].map((c) => c.fr.word)).size).toBe(d.length + 1);
        }
      }
    }
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
  it('sans faute : 3 étoiles, aliments, questions maîtrisées', () => {
    const progress = new Progress(new MemoryStore());
    const series = new Series(gameById('EN-1'), progress, mulberry32(1));
    expect(series.items).toHaveLength(6);
    expect(series.level).toBe(1);
    while (!series.finished) {
      expect(series.tap(series.current.answer).kind).toBe('correct');
      series.next();
    }
    expect(series.result!.stars).toBe(3);
    expect(progress.pantry.watermelon).toBe(1);
    expect(progress.mastered('EN-1').size).toBe(6);
    expect(progress.isFirstSeriesToday()).toBe(false);
  });

  it('erreurs : carte désactivée, indice après 2 erreurs, question à retravailler', () => {
    const progress = new Progress(new MemoryStore());
    progress.age = 7;
    const series = new Series(gameById('MO-1'), progress, mulberry32(2));
    expect(series.level).toBe(4);
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

  it('abandon après 3 réponses : récompense au prorata', () => {
    const progress = new Progress(new MemoryStore());
    const series = new Series(gameById('EN-1'), progress, mulberry32(3));
    for (let i = 0; i < 3; i++) {
      series.tap(series.current.answer);
      series.next();
    }
    series.abandon();
    expect(series.result!.total).toBe(3);
    expect(progress.pantryCount).toBeGreaterThan(0);
  });

  it('la progression survit à un rechargement', () => {
    const store = new MemoryStore();
    const a = new Progress(store);
    a.age = 6;
    a.saveFeeding('apple', { level: 2, xp: 5 }, 10);
    const b = new Progress(store);
    expect(b.age).toBe(6);
    expect(b.dino).toEqual({ level: 2, xp: 5 });
    expect(b.xpEatenToday()).toBe(10);
  });
});
