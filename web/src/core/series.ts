import { Speech } from '../content/content';
import { BuiltQuestion, Choice, GameDef, Show } from '../content/games';
import { BALANCE, Balance, seriesLengthFor } from '../domain/balance';
import { computeLevel } from '../domain/difficulty';
import { Food, Rng } from '../domain/models';
import { seriesFruits, starsFor } from '../domain/rewards';
import { pickQuestions } from '../domain/selector';
import { Progress } from './progress';

export interface SeriesItem {
  game: GameDef;
  questionId: string;
  level: number;
  answer: Choice;
  /** Réponses proposées, bonne réponse comprise. */
  choices: Choice[];
  show?: Show;
  prompt: Speech[];
  reinforce: Speech[];
  hints: Speech[];
  /** Jeux à voix haute (voir BuiltQuestion). */
  say?: BuiltQuestion['say'];
  fallback?: BuiltQuestion['fallback'];
  repeatAfterMe?: Speech[];
  repeat?: Speech[];
  isReview: boolean;
  /** Question ratée un autre jour, reposée pour la réviser. */
  due: boolean;
  /** Fruit de la barre de progression, gagné si la réponse est trouvée du premier coup. */
  fruit: Food;
  /** undefined : pas encore répondu. */
  firstTry?: boolean;
}

export interface SeriesResult {
  /** Jeu joué, ou 'MIX' pour une série tout mélangée. */
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
 * Avec un seul jeu, toutes les questions en viennent ; avec plusieurs jeux
 * (gros bouton de l'accueil), chaque question est tirée d'un jeu au hasard.
 */
export class Series {
  readonly level: number;
  readonly items: SeriesItem[];
  readonly mixed: boolean;
  index = 0;
  wrongAttempts = 0;
  readonly disabled = new Set<string>();
  firstTrySuccesses = 0;
  private streak = 0;
  private answered = 0;
  private levels = new Map<string, number>();
  result?: SeriesResult;

  constructor(
    games: GameDef | GameDef[],
    private progress: Progress,
    rng: Rng,
    private b: Balance = BALANCE,
  ) {
    const list = Array.isArray(games) ? games : [games];
    this.mixed = list.length > 1;
    for (const game of list) this.levels.set(game.id, this.levelFor(game));

    const count = (!this.mixed && list[0].seriesLength) || seriesLengthFor(progress.age, b);
    const picks: { game: GameDef; question: { id: string; level: number }; isReview: boolean; due?: boolean }[] = [];
    if (this.mixed) {
      // Une question par tirage, jamais deux fois le même jeu de suite.
      let previous: GameDef | undefined;
      for (let i = 0; i < count; i++) {
        const options = list.filter((g) => g !== previous);
        const game = options[Math.floor(rng() * options.length)];
        const taken = new Set(picks.filter((p) => p.game === game).map((p) => p.question.id));
        const [pick] = this.select(game, 1, rng, taken);
        if (pick) picks.push({ game, ...pick });
        previous = game;
      }
    } else {
      for (const pick of this.select(list[0], count, rng, new Set())) picks.push({ game: list[0], ...pick });
    }
    this.level = Math.round(picks.reduce((sum, p) => sum + this.levels.get(p.game.id)!, 0) / Math.max(1, picks.length));

    const positions: number[] = [];
    const fruits = seriesFruits(picks.length, rng);
    this.items = picks.map(({ game, question, isReview, due }, i) => {
      const q = game.build(question, this.levels.get(game.id)!, rng);
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
        game, questionId: question.id, level: question.level, answer: q.answer, choices, show: q.show,
        prompt: q.prompt, reinforce: q.reinforce, hints: q.hints ?? [], isReview, due: !!due, fruit: fruits[i],
        say: q.say, fallback: q.fallback, repeatAfterMe: q.repeatAfterMe, repeat: q.repeat,
      };
    });
  }

  private levelFor(game: GameDef): number {
    const p = this.progress;
    // Tracés : on commence toujours par les plus simples (traits, ronds), puis on monte d'un niveau
    // par série selon les réussites dans ce jeu seulement, sans dépasser le plafond de l'âge.
    if (game.trace) {
      const level = computeLevel({
        experienceLevel: 1,
        age: p.age,
        gameAnswers: p.answers({ gameId: game.id }),
        categoryAnswers: [],
        allAnswers: [],
        previousLevel: p.gameLevel(game.id),
      }, this.b);
      return Math.min(level, traceLevelCap(p.age));
    }
    return computeLevel({
      experienceLevel: p.dino.level,
      age: p.age,
      gameAnswers: p.answers({ gameId: game.id }),
      categoryAnswers: p.answers({ category: game.category }),
      allAnswers: p.answers(),
      previousLevel: p.gameLevel(game.id),
    }, this.b);
  }

  private select(game: GameDef, count: number, rng: Rng, taken: Set<string>) {
    const p = this.progress;
    return pickQuestions({
      questions: game.questions,
      level: this.levels.get(game.id)!,
      count,
      mastered: p.mastered(game.id),
      recent: new Set([...p.recentQuestions(game.id, this.b.recentSeriesExcluded), ...taken]),
      due: p.dueReviews(game.id),
      waiting: p.waitingReviews(game.id),
    }, rng, this.b);
  }

  get current(): SeriesItem { return this.items[this.index]; }
  get hint(): boolean { return this.wrongAttempts >= this.b.hintAfterWrongAttempts; }
  get finished(): boolean { return this.result !== undefined; }
  /** Vrai si le jeu change par rapport à la question précédente (mode mélangé). */
  get gameChanged(): boolean { return this.index === 0 || this.items[this.index - 1].game !== this.current.game; }

  tap(choice: Choice): TapOutcome {
    if (this.finished || this.disabled.has(choice.id)) return { kind: 'ignored' };
    if (choice.id !== this.current.answer.id) {
      this.disabled.add(choice.id);
      this.wrongAttempts++;
      this.streak = 0;
      // Avec 2 réponses, il n'en reste qu'une : on la montre tout de suite.
      return { kind: 'wrong', hint: this.hint || this.disabled.size >= this.current.choices.length - 1 };
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
      gameId: this.current.game.id,
      category: this.current.game.category,
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
    // Historique et niveau enregistrés jeu par jeu.
    for (const [gameId, level] of this.levels) {
      const ids = answeredItems.filter((i) => i.game.id === gameId).map((i) => i.questionId);
      if (ids.length > 0) this.progress.recordSeries(gameId, ids, level);
    }
    this.result = {
      gameId: this.mixed ? 'MIX' : this.items[0].game.id, level: this.level, total: answered,
      firstTrySuccesses: this.firstTrySuccesses, stars, earned,
    };
  }
}

/**
 * Niveau maximal des tracés selon l'âge : à 3 ans, des formes simples sur pointillés
 * (traits, rond, croix, carré, triangle, vagues) ; les points légers et le dessin libre viennent plus tard.
 */
export const traceLevelCap = (age: number) => ({ 3: 5, 4: 8, 5: 12 } as Record<number, number>)[age] ?? 20;

/** Scène qui affiche une question de ce jeu : cartes (et voix), tracé, ou memory. */
export type SeriesScene = 'Game' | 'Trace' | 'Memory';
export const sceneOf = (game: GameDef): SeriesScene => (game.trace ? 'Trace' : game.memory ? 'Memory' : 'Game');

/**
 * Série de la planète : les questions de tous les modes se suivent. On met en
 * premier une question à cartes (la série démarre sur l'écran principal).
 */
export function startWithCards(series: Series) {
  const first = series.items.findIndex((i) => sceneOf(i.game) === 'Game');
  if (first > 0) [series.items[0], series.items[first]] = [series.items[first], series.items[0]];
}
