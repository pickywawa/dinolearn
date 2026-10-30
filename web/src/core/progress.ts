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
  /** Réglages de l'espace parents. */
  settings: Settings;
  /** Temps de jeu (ms) du jour, par jour. */
  playLog: Record<string, number>;
}

export interface Settings {
  /** Jeux désactivés par les parents. */
  disabledGames: string[];
  /** Temps de jeu maximum par jour, en minutes (0 = illimité). */
  dailyMinutes: number;
  /** Bruitages. */
  sfx: boolean;
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
  settings: { disabledGames: [], dailyMinutes: 0, sfx: true },
  playLog: {},
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
    this.data.settings = { ...empty().settings, ...parsed.settings };
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

  /** Règle le niveau de difficulté d'un jeu (espace parents) ; il évolue ensuite selon les réussites. */
  setGameLevel(gameId: string, level: number | null) {
    if (level === null) delete this.data.gameLevels[gameId];
    else this.data.gameLevels[gameId] = Math.max(1, Math.min(BALANCE.maxLevel, level));
    this.save();
  }

  /** Tous les jeux repartent du niveau calculé (après un changement d'âge ou de niveau du dino). */
  clearGameLevels() {
    this.data.gameLevels = {};
    this.save();
  }

  get settings(): Readonly<Settings> { return this.data.settings; }

  updateSettings(change: Partial<Settings>) {
    this.data.settings = { ...this.data.settings, ...change };
    this.save();
  }

  /** Dernière réponse donnée dans ce jeu (date), pour le suivi des parents. */
  lastPlayed(gameId: string): number | undefined {
    return this.data.answers.find((a) => a.gameId === gameId)?.at;
  }

  /** Questions ratées récemment et pas encore réussies, de la plus récente à la plus ancienne. */
  recentFailures(limit: number): { gameId: string; questionId: string; at: number }[] {
    return Object.entries(this.data.failedAt)
      .flatMap(([gameId, ids]) => Object.entries(ids).map(([questionId, at]) => ({ gameId, questionId, at })))
      .sort((a, b) => b.at - a.at)
      .slice(0, limit);
  }

  playMsToday(now = new Date()) { return this.data.playLog[dayKey(now)] ?? 0; }

  addPlayTime(ms: number, now = new Date()) {
    const day = dayKey(now);
    // On ne garde que les 30 derniers jours.
    const days = Object.keys(this.data.playLog).sort().slice(-29).filter((d) => d !== day);
    const log: Record<string, number> = Object.fromEntries(days.map((d) => [d, this.data.playLog[d]]));
    log[day] = (this.data.playLog[day] ?? 0) + ms;
    this.data.playLog = log;
    this.save();
  }

  /** Temps de jeu des 7 derniers jours (ms), du plus ancien à aujourd'hui. */
  playWeek(now = new Date()): { day: string; ms: number }[] {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return { day: dayKey(d), ms: this.data.playLog[dayKey(d)] ?? 0 };
    });
  }

  /** Vrai si le temps de jeu du jour fixé par les parents est atteint. */
  timeIsUp(now = new Date()) {
    const max = this.data.settings.dailyMinutes;
    return max > 0 && this.playMsToday(now) >= max * 60_000;
  }

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
    const { age, ageChosen, settings } = this.data;
    this.data = { ...empty(), age, ageChosen, settings };
    this.save();
  }
}

export class MemoryStore implements KeyValueStore {
  private map = new Map<string, string>();
  getItem(key: string) { return this.map.get(key) ?? null; }
  setItem(key: string, value: string) { this.map.set(key, value); }
}
