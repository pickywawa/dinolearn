import { BALANCE } from '../domain/balance';
import { AnswerRecord, DinoState, Food } from '../domain/models';

/** Aliment gagné mais pas encore mangé (ventre plein), gardé pour plus tard. */
export interface Leftover {
  food: Food;
  xp: number;
}

/** Mémoire clé-valeur ; `localStorage` dans le navigateur, en mémoire dans les tests. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface Data {
  age: number;
  ageChosen: boolean;
  dino: DinoState;
  answers: AnswerRecord[];
  mastered: Record<string, string[]>;
  failedAt: Record<string, Record<string, number>>;
  recentSeries: Record<string, string[][]>;
  gameLevels: Record<string, number>;
  leftovers: Leftover[];
  feedLog: Record<string, number>;
  seriesPlayed: number;
  lastSeriesDay?: string;
  seenTutorial: boolean;
}

const KEY = 'dinolearn.progress.v1';
const MAX_ANSWERS = 3000;

const empty = (): Data => ({
  age: 4,
  ageChosen: false,
  dino: { level: 1, xp: 0 },
  answers: [],
  mastered: {},
  failedAt: {},
  recentSeries: {},
  gameLevels: {},
  leftovers: [],
  feedLog: {},
  seriesPlayed: 0,
  seenTutorial: false,
});

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Progression du profil enfant, stockée sur l'appareil (spécifications §13). */
export class Progress {
  private data: Data;

  constructor(private store: KeyValueStore) {
    let parsed: Partial<Data> = {};
    try {
      parsed = JSON.parse(store.getItem(KEY) ?? '{}');
    } catch {
      parsed = {};
    }
    this.data = { ...empty(), ...parsed };
  }

  private save() {
    try {
      this.store.setItem(KEY, JSON.stringify(this.data));
    } catch {
      // Stockage indisponible (navigation privée) : la partie continue en mémoire.
    }
  }

  get age() { return this.data.age; }
  set age(value: number) { this.data.age = value; this.data.ageChosen = true; this.save(); }
  get ageChosen() { return this.data.ageChosen; }
  get dino() { return this.data.dino; }
  get leftovers(): readonly Leftover[] { return this.data.leftovers; }
  set leftovers(value: readonly Leftover[]) { this.data.leftovers = [...value]; this.save(); }
  get seriesPlayed() { return this.data.seriesPlayed; }
  get seenTutorial() { return this.data.seenTutorial; }

  markTutorialSeen() { this.data.seenTutorial = true; this.save(); }

  /** Change directement le niveau du dino (réglage de test depuis l'accueil). */
  setDinoLevel(level: number) {
    this.data.dino = { level: Math.max(1, Math.min(BALANCE.dinoMaxLevel, level)), xp: 0 };
    this.save();
  }

  answers(filter: { gameId?: string; category?: string } = {}): AnswerRecord[] {
    return this.data.answers.filter((a) =>
      (!filter.gameId || a.gameId === filter.gameId) && (!filter.category || a.category === filter.category));
  }

  mastered(gameId: string): Set<string> {
    return new Set(this.data.mastered[gameId] ?? []);
  }

  toRetry(gameId: string, maxAgeDays: number, now = Date.now()): Set<string> {
    const limit = now - maxAgeDays * 86_400_000;
    const mastered = this.mastered(gameId);
    return new Set(Object.entries(this.data.failedAt[gameId] ?? {})
      .filter(([id, at]) => at > limit && !mastered.has(id))
      .map(([id]) => id));
  }

  recentQuestions(gameId: string, seriesCount: number): Set<string> {
    return new Set((this.data.recentSeries[gameId] ?? []).slice(0, seriesCount).flat());
  }

  gameLevel(gameId: string): number | undefined { return this.data.gameLevels[gameId]; }

  xpEatenToday(now = new Date()) { return this.data.feedLog[dayKey(now)] ?? 0; }

  isFirstSeriesToday(now = new Date()) { return this.data.lastSeriesDay !== dayKey(now); }

  recordAnswer(a: AnswerRecord) {
    this.data.answers.unshift(a);
    this.data.answers.length = Math.min(this.data.answers.length, MAX_ANSWERS);
    if (a.firstTrySuccess) {
      const mastered = this.mastered(a.gameId).add(a.questionId);
      this.data.mastered[a.gameId] = [...mastered];
      delete this.data.failedAt[a.gameId]?.[a.questionId];
    } else {
      (this.data.failedAt[a.gameId] ??= {})[a.questionId] = a.at;
    }
    this.save();
  }

  recordSeries(gameId: string, questionIds: string[], level: number, now = new Date()) {
    const series = (this.data.recentSeries[gameId] ??= []);
    series.unshift(questionIds);
    series.length = Math.min(series.length, 5);
    this.data.gameLevels[gameId] = level;
    this.data.seriesPlayed++;
    this.data.lastSeriesDay = dayKey(now);
    this.save();
  }

  saveFeeding(dino: DinoState, xpEatenToday: number, now = new Date()) {
    this.data.dino = dino;
    this.data.feedLog = { [dayKey(now)]: xpEatenToday };
    this.save();
  }

  reset() {
    const { age, ageChosen } = this.data;
    this.data = { ...empty(), age, ageChosen };
    this.save();
  }
}

export class MemoryStore implements KeyValueStore {
  private map = new Map<string, string>();
  getItem(key: string) { return this.map.get(key) ?? null; }
  setItem(key: string, value: string) { this.map.set(key, value); }
}
