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
  /** Prénom de l'enfant. */
  name: string;
  /** Couleur du dino (0 à 9) ; -1 tant que l'œuf n'est pas éclos. */
  color: number;
  age: number;
  ageChosen: boolean;
  dino: DinoState;
  answers: AnswerRecord[];
  mastered: Record<string, string[]>;
  /** Révision espacée : question ratée → étape (0, 1, 2) et date (ms) à partir de laquelle la reposer. */
  reviews: Record<string, Record<string, Review>>;
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
  /** Minutes de jeu ajoutées par un parent (code), par jour ; -1 = illimité ce jour-là. */
  bonusLog: Record<string, number>;
  /** Objets du dino. */
  collection: Collection;
  /** Mode nuit du soir en cours : dernière série jouée (`done`) ou débloqué par un parent. */
  night?: { day: string; state: 'done' | 'unlocked' };
}

export interface Collection {
  owned: string[];
  worn: string[];
  /** Cadeaux à choisir (un par niveau gagné). */
  pending: number;
}

export interface Review {
  stage: number;
  due: number;
}

/** Minuit du jour `days` jours après `at` : une révision « demain » est possible dès le matin. */
const dayStartPlus = (at: number, days: number) => {
  const d = new Date(at);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.getTime();
};

export interface Settings {
  /** Jeux désactivés par les parents. */
  disabledGames: string[];
  /** Temps de jeu maximum par jour, en minutes (0 = illimité). */
  dailyMinutes: number;
  /** Bruitages. */
  sfx: boolean;
  /** Musique de fond. */
  music: boolean;
  /** Heure du coucher (« 19:30 ») : le soir, mode nuit ; '' = pas de mode nuit. */
  nightTime: string;
  /** Pays de l'enfant (« fr », « be »…, ou « other ») pour le jeu « Mon pays ». */
  country: string;
  /** Ancien emplacement du code parent (désormais commun à tous les enfants, dans les profils). */
  pin?: string;
}

/** Clé du premier enfant (et de la progression d'avant les profils). */
export const PROGRESS_KEY = 'dinolearn.progress.v1';
const MAX_ANSWERS = 3000;

const empty = (): Data => ({
  name: '',
  color: -1,
  age: 4,
  ageChosen: false,
  dino: { level: 1, xp: 0 },
  answers: [],
  mastered: {},
  reviews: {},
  recentSeries: {},
  gameLevels: {},
  leftovers: [],
  feedLog: {},
  seriesPlayed: 0,
  seenTutorial: false,
  settings: { disabledGames: [], dailyMinutes: 0, sfx: true, music: true, nightTime: '', country: 'fr' },
  playLog: {},
  bonusLog: {},
  collection: { owned: [], worn: [], pending: 0 },
});

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Progression du profil enfant, stockée sur l'appareil (spécifications §13). */
export class Progress {
  private data: Data;

  constructor(private store: KeyValueStore, private key = PROGRESS_KEY) {
    let parsed: Partial<Data> = {};
    try {
      parsed = JSON.parse(store.getItem(key) ?? '{}');
    } catch {
      parsed = {};
    }
    this.data = { ...empty(), ...parsed };
    this.data.settings = { ...empty().settings, ...parsed.settings };
    // Joueur d'avant la collection : quelques cadeaux pour commencer.
    if (!parsed.collection && this.data.dino.level > 1) {
      this.data.collection = { owned: [], worn: [], pending: Math.min(3, this.data.dino.level - 1) };
    }
    // Ancien format : questions ratées sans calendrier → révision dès le lendemain.
    const legacy = (parsed as { failedAt?: Record<string, Record<string, number>> }).failedAt;
    if (legacy && !parsed.reviews) {
      this.data.reviews = Object.fromEntries(Object.entries(legacy).map(([gameId, ids]) => [gameId,
        Object.fromEntries(Object.entries(ids).map(([id, at]) => [id, { stage: 0, due: dayStartPlus(at, 1) }]))]));
    }
  }

  private save() {
    try {
      this.store.setItem(this.key, JSON.stringify(this.data));
    } catch {
      // Stockage indisponible (navigation privée) : la partie continue en mémoire.
    }
  }

  get name() { return this.data.name; }
  set name(value: string) { this.data.name = value.trim(); this.save(); }
  get color() { return Math.max(0, this.data.color); }
  /** L'œuf est-il éclos ? */
  get hatched() { return this.data.color >= 0; }
  hatch(color: number) { this.data.color = color; this.save(); }
  /** Partie d'avant les profils : l'œuf était déjà éclos (dino vert). */
  get isLegacy() { return this.data.answers.length > 0 || this.data.seriesPlayed > 0 || this.data.seenTutorial; }

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

  /** Questions ratées dont la date de révision est arrivée. */
  dueReviews(gameId: string, now = Date.now()): Set<string> {
    return new Set(Object.entries(this.data.reviews[gameId] ?? {}).filter(([, r]) => r.due <= now).map(([id]) => id));
  }

  /** Questions ratées qui attendent encore leur date de révision. */
  waitingReviews(gameId: string, now = Date.now()): Set<string> {
    return new Set(Object.entries(this.data.reviews[gameId] ?? {}).filter(([, r]) => r.due > now).map(([id]) => id));
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

  /** Questions en cours de révision, de la prochaine à revenir à la plus lointaine. */
  reviewList(limit: number): { gameId: string; questionId: string; stage: number; due: number }[] {
    return Object.entries(this.data.reviews)
      .flatMap(([gameId, ids]) => Object.entries(ids).map(([questionId, r]) => ({ gameId, questionId, ...r })))
      .sort((a, b) => a.due - b.due)
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

  /** Vrai si le temps de jeu du jour fixé par les parents (plus les minutes débloquées) est atteint. */
  timeIsUp(now = new Date()) {
    const max = this.data.settings.dailyMinutes;
    const bonus = this.data.bonusLog[dayKey(now)] ?? 0;
    return max > 0 && bonus !== -1 && this.playMsToday(now) >= (max + bonus) * 60_000;
  }

  /** Un parent débloque : `minutes` de plus aujourd'hui, ou -1 pour illimité aujourd'hui. */
  unlockToday(minutes: number, now = new Date()) {
    const day = dayKey(now);
    const current = this.data.bonusLog[day] ?? 0;
    this.data.bonusLog = { [day]: minutes === -1 || current === -1 ? -1 : current + minutes };
    this.save();
  }


  // ---- Mode nuit ----

  /** Le soir après l'heure du coucher choisie par les parents (et jusqu'à 6 h du matin). */
  isNight(now = new Date()) {
    const time = this.data.settings.nightTime;
    if (!time) return false;
    const [h, m] = time.split(':').map(Number);
    const minutes = now.getHours() * 60 + now.getMinutes();
    return minutes >= h * 60 + m || now.getHours() < 6;
  }

  /** La soirée en cours (avant 6 h, c'est encore la soirée de la veille). */
  private evening(now: Date) {
    const d = new Date(now);
    if (d.getHours() < 6) d.setDate(d.getDate() - 1);
    return dayKey(d);
  }

  /** La dernière série du soir est jouée : le dino dort jusqu'au matin. */
  isSleeping(now = new Date()) {
    const n = this.data.night;
    return this.isNight(now) && !!n && n.day === this.evening(now) && n.state === 'done';
  }

  /** À la fin d'une série, le soir : c'était la dernière. */
  markNightSeries(now = new Date()) {
    if (!this.isNight(now)) return;
    const n = this.data.night;
    if (n && n.day === this.evening(now) && n.state === 'unlocked') return;
    this.data.night = { day: this.evening(now), state: 'done' };
    this.save();
  }

  /** Un parent laisse jouer encore ce soir. */
  unlockNight(now = new Date()) {
    this.data.night = { day: this.evening(now), state: 'unlocked' };
    this.save();
  }

  // ---- Collection d'objets ----

  get collection(): Readonly<Collection> { return this.data.collection; }

  /** Ajoute un objet à la collection et le met au dino (il remplace ceux de `replaced`). */
  own(id: string, replaced: string[]) {
    const c = this.data.collection;
    if (!c.owned.includes(id)) c.owned = [...c.owned, id];
    c.pending = Math.max(0, c.pending - 1);
    this.data.collection = c;
    this.wear(id, replaced);
  }

  /** Met un objet au dino ; les objets du même emplacement (`replaced`) sont enlevés. */
  wear(id: string, replaced: string[]) {
    const c = this.data.collection;
    c.worn = [...c.worn.filter((w) => w !== id && !replaced.includes(w)), id];
    this.save();
  }

  takeOff(id: string) {
    this.data.collection.worn = this.data.collection.worn.filter((w) => w !== id);
    this.save();
  }

  /** Plus de cadeau à choisir quand tous les objets sont gagnés. */
  limitPending(remaining: number) {
    this.data.collection.pending = Math.min(this.data.collection.pending, remaining);
    this.save();
  }

  xpEatenToday(now = new Date()) { return this.data.feedLog[dayKey(now)] ?? 0; }

  isFirstSeriesToday(now = new Date()) { return this.data.lastSeriesDay !== dayKey(now); }

  /**
   * Enregistre une réponse. Ratée : la question revient le lendemain. Réussie
   * à sa date de révision : elle revient 3 jours plus tard, puis 7 jours plus
   * tard ; réussie à cette dernière révision, elle est acquise.
   */
  recordAnswer(a: AnswerRecord) {
    this.data.answers.unshift(a);
    this.data.answers.length = Math.min(this.data.answers.length, MAX_ANSWERS);
    const days = BALANCE.reviewDays;
    const reviews = (this.data.reviews[a.gameId] ??= {});
    const review = reviews[a.questionId];
    const mastered = this.mastered(a.gameId);
    if (!a.firstTrySuccess) {
      reviews[a.questionId] = { stage: 0, due: dayStartPlus(a.at, days[0]) };
      mastered.delete(a.questionId);
    } else if (review) {
      if (a.at >= review.due) {
        const stage = review.stage + 1;
        if (stage >= days.length) {
          delete reviews[a.questionId];
          mastered.add(a.questionId);
        } else {
          reviews[a.questionId] = { stage, due: dayStartPlus(a.at, days[stage]) };
        }
      }
    } else {
      mastered.add(a.questionId);
    }
    this.data.mastered[a.gameId] = [...mastered];
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
    // Chaque niveau gagné en mangeant donne un cadeau à choisir.
    if (dino.level > this.data.dino.level) this.data.collection.pending += dino.level - this.data.dino.level;
    this.data.dino = dino;
    this.data.feedLog = { [dayKey(now)]: xpEatenToday };
    this.save();
  }

  reset() {
    const { name, color, age, ageChosen, settings } = this.data;
    this.data = { ...empty(), name, color, age, ageChosen, settings, collection: { owned: [], worn: [], pending: 0 } };
    this.save();
  }
}

export class MemoryStore implements KeyValueStore {
  private map = new Map<string, string>();
  getItem(key: string) { return this.map.get(key) ?? null; }
  setItem(key: string, value: string) { this.map.set(key, value); }
}
