import { AnswerRecord, DinoState, Food } from '../domain/models';

/** Mémoire clé-valeur ; `localStorage` dans le navigateur, en mémoire dans les tests. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface Data {
  age: number;
  dino: DinoState;
  answers: AnswerRecord[];
  mastered: Record<string, string[]>;
  failedAt: Record<string, Record<string, number>>;
  recentSeries: Record<string, string[][]>;
  gameLevels: Record<string, number>;
  pantry: Partial<Record<Food, number>>;
  feedLog: Record<string, number>;
  seriesPlayed: number;
  lastSeriesDay?: string;
  seenTutorial: boolean;
}

const KEY = 'dinolearn.progress.v1';
const MAX_ANSWERS = 3000;

const empty = (): Data => ({
  age: 4,
  dino: { level: 1, xp: 0 },
  answers: [],
  mastered: {},
  failedAt: {},
  recentSeries: {},
  gameLevels: {},
  pantry: {},
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
  set age(value: number) { this.data.age = value; this.save(); }
  get dino() { return this.data.dino; }
  get pantry() { return this.data.pantry; }
  get seriesPlayed() { return this.data.seriesPlayed; }
  get seenTutorial() { return this.data.seenTutorial; }

  markTutorialSeen() { this.data.seenTutorial = true; this.save(); }

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

  get pantryCount() {
    return Object.values(this.data.pantry).reduce((a, b) => a + (b ?? 0), 0);
  }

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

  recordSeries(gameId: string, questionIds: string[], level: number,
    rewards: Partial<Record<Food, number>>, now = new Date()) {
    const series = (this.data.recentSeries[gameId] ??= []);
    series.unshift(questionIds);
    series.length = Math.min(series.length, 5);
    this.data.gameLevels[gameId] = level;
    for (const [food, n] of Object.entries(rewards) as [Food, number][]) {
      this.data.pantry[food] = (this.data.pantry[food] ?? 0) + n;
    }
    this.data.seriesPlayed++;
    this.data.lastSeriesDay = dayKey(now);
    this.save();
  }

  saveFeeding(food: Food, dino: DinoState, xpEatenToday: number, now = new Date()) {
    const left = (this.data.pantry[food] ?? 1) - 1;
    if (left > 0) this.data.pantry[food] = left;
    else delete this.data.pantry[food];
    this.data.dino = dino;
    this.data.feedLog = { [dayKey(now)]: xpEatenToday };
    this.save();
  }

  reset() {
    const age = this.data.age;
    this.data = { ...empty(), age };
    this.save();
  }
}

export class MemoryStore implements KeyValueStore {
  private map = new Map<string, string>();
  getItem(key: string) { return this.map.get(key) ?? null; }
  setItem(key: string, value: string) { this.map.set(key, value); }
}
