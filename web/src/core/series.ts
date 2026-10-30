import { Speech } from '../content/content';
import { Choice, GameDef } from '../content/games';
import { BALANCE, Balance, seriesLengthFor } from '../domain/balance';
import { computeLevel } from '../domain/difficulty';
import { Food, Rng } from '../domain/models';
import { seriesFruits, starsFor } from '../domain/rewards';
import { pickQuestions } from '../domain/selector';
import { Progress } from './progress';

export interface SeriesItem {
  questionId: string;
  level: number;
  answer: Choice;
  /** Réponses proposées, bonne réponse comprise. */
  choices: Choice[];
  show?: { image: string; count: number };
  prompt: Speech[];
  reinforce: Speech[];
  isReview: boolean;
  /** Fruit de la barre de progression, gagné si la réponse est trouvée du premier coup. */
  fruit: Food;
  /** undefined : pas encore répondu. */
  firstTry?: boolean;
}

export interface SeriesResult {
  gameId: string;
  level: number;
  total: number;
  firstTrySuccesses: number;
  stars: number;
  /** Fruits gagnés (+ gâteau si sans-faute), à donner au dino. */
  earned: Food[];
}

export type TapOutcome =
  | { kind: 'ignored' }
  | { kind: 'correct'; firstTry: boolean; streak: number; last: boolean }
  | { kind: 'wrong'; hint: boolean };

/**
 * Déroulé d'une série (spécifications §5.1–5.3), sans dépendance à Phaser :
 * la scène s'occupe des animations et de la voix.
 */
export class Series {
  readonly level: number;
  readonly items: SeriesItem[];
  index = 0;
  wrongAttempts = 0;
  readonly disabled = new Set<string>();
  firstTrySuccesses = 0;
  private streak = 0;
  private answered = 0;
  result?: SeriesResult;

  constructor(
    readonly game: GameDef,
    private progress: Progress,
    rng: Rng,
    private b: Balance = BALANCE,
  ) {
    const category = game.category;
    this.level = computeLevel({
      experienceLevel: progress.dino.level,
      age: progress.age,
      gameAnswers: progress.answers({ gameId: game.id }),
      categoryAnswers: progress.answers({ category }),
      allAnswers: progress.answers(),
      previousLevel: progress.gameLevel(game.id),
    }, b);

    const refs = new Map(game.questions.map((q) => [q.id, q]));
    const selection = pickQuestions({
      questions: game.questions,
      level: this.level,
      count: seriesLengthFor(progress.age, b),
      mastered: progress.mastered(game.id),
      recent: progress.recentQuestions(game.id, b.recentSeriesExcluded),
      toRetry: progress.toRetry(game.id, b.retryMaxAgeDays),
    }, rng, b);

    const positions: number[] = [];
    const fruits = seriesFruits(selection.length, rng);
    this.items = selection.map((s, i) => {
      const ref = refs.get(s.question.id)!;
      const q = game.build(ref, this.level, rng);
      const choices = [...q.distractors];
      // Position de la bonne réponse : jamais 3 fois de suite la même.
      let position = Math.floor(rng() * (choices.length + 1));
      const n = positions.length;
      if (n >= 2 && positions[n - 1] === position && positions[n - 2] === position) {
        position = (position + 1) % (choices.length + 1);
      }
      positions.push(position);
      choices.splice(position, 0, q.answer);
      return {
        questionId: ref.id, level: ref.level, answer: q.answer, choices, show: q.show,
        prompt: q.prompt, reinforce: q.reinforce, isReview: s.isReview, fruit: fruits[i],
      };
    });
  }

  get current(): SeriesItem { return this.items[this.index]; }
  get hint(): boolean { return this.wrongAttempts >= this.b.hintAfterWrongAttempts; }
  get finished(): boolean { return this.result !== undefined; }

  tap(choice: Choice): TapOutcome {
    if (this.finished || this.disabled.has(choice.id)) return { kind: 'ignored' };
    if (choice.id !== this.current.answer.id) {
      this.disabled.add(choice.id);
      this.wrongAttempts++;
      this.streak = 0;
      return { kind: 'wrong', hint: this.hint };
    }
    const firstTry = this.wrongAttempts === 0;
    if (firstTry) {
      this.firstTrySuccesses++;
      this.streak++;
    } else {
      this.streak = 0;
    }
    this.answered++;
    this.current.firstTry = firstTry;
    this.progress.recordAnswer({
      gameId: this.game.id,
      category: this.game.category,
      questionId: this.current.questionId,
      level: this.current.level,
      firstTrySuccess: firstTry,
      at: Date.now(),
    });
    return { kind: 'correct', firstTry, streak: this.streak, last: this.index + 1 >= this.items.length };
  }

  /** Passe à la question suivante ; termine la série après la dernière. */
  next() {
    if (this.index + 1 >= this.items.length) {
      this.finish(this.items.length);
      return;
    }
    this.index++;
    this.wrongAttempts = 0;
    this.disabled.clear();
  }

  /** Retire la question courante sans la compter (démonstration du tutoriel). */
  skipCurrent() {
    if (this.items.length > 1) this.items.splice(this.index, 1);
    this.wrongAttempts = 0;
    this.disabled.clear();
  }

  /** Sortie anticipée : récompense au prorata après 3 réponses (spécifications §5.1). */
  abandon() {
    if (!this.finished && this.answered >= this.b.minQuestionsForReward) this.finish(this.answered);
  }

  private finish(answered: number) {
    const score = answered === 0 ? 0 : this.firstTrySuccesses / answered;
    const stars = starsFor(score, this.b);
    const answeredItems = this.items.slice(0, answered);
    const earned: Food[] = answeredItems.filter((i) => i.firstTry).map((i) => i.fruit);
    if (answered === this.items.length && this.firstTrySuccesses === answered) earned.push('cake');
    this.progress.recordSeries(this.game.id, answeredItems.map((i) => i.questionId), this.level);
    this.result = {
      gameId: this.game.id, level: this.level, total: answered,
      firstTrySuccesses: this.firstTrySuccesses, stars, earned,
    };
  }
}
