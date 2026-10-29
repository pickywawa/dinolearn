import { BALANCE, Balance } from './balance';
import { QuestionRef, Rng, shuffle } from './models';

export interface SelectedQuestion {
  question: QuestionRef;
  /** Question déjà maîtrisée, reposée parce que le jeu est épuisé. */
  isReview: boolean;
}

/** Sélection des questions d'une série (spécifications §7.3). */
export function pickQuestions(
  opts: {
    questions: QuestionRef[];
    level: number;
    count: number;
    mastered: Set<string>;
    recent: Set<string>;
    toRetry: Set<string>;
  },
  rng: Rng,
  b: Balance = BALANCE,
): SelectedQuestion[] {
  const { questions, level, count, mastered, recent, toRetry } = opts;
  const candidates = questions.filter((q) => !mastered.has(q.id) && !recent.has(q.id));
  const picks: QuestionRef[] = [];

  const retry = shuffle(
    candidates.filter((q) => toRetry.has(q.id) && q.level <= level + 1),
    rng,
  );
  picks.push(...retry.slice(0, Math.round(count * b.retryShare)));

  while (picks.length < count) {
    const q = nearestAvailable(candidates, weightedLevel(level, rng, b), picks, rng);
    if (!q) break;
    picks.push(q);
  }

  const result: SelectedQuestion[] = picks.map((question) => ({ question, isReview: false }));
  if (result.length < count) {
    // Mode révision : questions maîtrisées (ou récentes en dernier recours).
    const masteredPool = shuffle(
      questions.filter((q) => mastered.has(q.id) && !recent.has(q.id) && !picks.includes(q)),
      rng,
    );
    const fallback = shuffle(questions.filter((q) => !picks.includes(q) && !masteredPool.includes(q)), rng);
    for (const question of [...masteredPool, ...fallback].slice(0, count - result.length)) {
      result.push({ question, isReview: true });
    }
  }
  return shuffle(result, rng);
}

function weightedLevel(level: number, rng: Rng, b: Balance): number {
  const r = rng();
  if (r < b.levelMixSame) return level;
  if (r < b.levelMixSame + b.levelMixBelow) return level - 1;
  return level + 1;
}

/** Question au niveau demandé, sinon au plus proche (N±1, N±2…). */
function nearestAvailable(
  candidates: QuestionRef[],
  level: number,
  exclude: QuestionRef[],
  rng: Rng,
): QuestionRef | undefined {
  for (let distance = 0; distance < 12; distance++) {
    const levels = distance === 0 ? [level] : [level - distance, level + distance];
    const pool = candidates.filter((q) => levels.includes(q.level) && !exclude.includes(q));
    if (pool.length > 0) return pool[Math.floor(rng() * pool.length)];
  }
  return undefined;
}
