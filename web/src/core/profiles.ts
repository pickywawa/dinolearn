import { KeyValueStore, PROGRESS_KEY, Progress } from './progress';

/**
 * Les enfants de la famille : chacun a sa progression (son dino, ses réglages,
 * ses réponses). Le code parent et l'alternance des séries sont communs.
 */
interface ProfilesData {
  pin?: string;
  /** Plusieurs enfants : on change d'enfant après chaque série. */
  alternate: boolean;
  children: string[];
  active: string;
}

const KEY = 'dinolearn.profiles.v1';

export interface NewChild {
  name: string;
  age: number;
  country: string;
  dailyMinutes: number;
  nightTime: string;
  /** Micro autorisé (jeux à voix haute). */
  voice?: boolean;
}

export class Profiles {
  private data: ProfilesData;
  private cache = new Map<string, Progress>();

  constructor(private store: KeyValueStore) {
    let parsed: Partial<ProfilesData> | undefined;
    try {
      parsed = JSON.parse(store.getItem(KEY) ?? 'null') ?? undefined;
    } catch {
      parsed = undefined;
    }
    this.data = { alternate: false, children: [], active: '', ...parsed };
    const legacy = !parsed && store.getItem(PROGRESS_KEY) ? new Progress(store, PROGRESS_KEY) : undefined;
    if (legacy && (legacy.isLegacy || legacy.ageChosen || legacy.settings.pin)) {
      // Partie d'avant les profils : elle devient le premier enfant, avec son code.
      this.data.children = ['c1'];
      this.data.active = 'c1';
      this.data.pin = legacy.settings.pin;
      if (!legacy.hatched && legacy.isLegacy) legacy.hatch(0);
      this.save();
    }
  }

  private save() {
    try {
      this.store.setItem(KEY, JSON.stringify(this.data));
    } catch {
      // Stockage indisponible : la partie continue en mémoire.
    }
  }

  private keyOf(id: string) { return id === 'c1' ? PROGRESS_KEY : `dinolearn.progress.${id}`; }

  progressOf(id: string): Progress {
    let p = this.cache.get(id);
    if (!p) {
      p = new Progress(this.store, this.keyOf(id));
      this.cache.set(id, p);
    }
    return p;
  }

  get ids(): readonly string[] { return this.data.children; }
  get count() { return this.data.children.length; }
  get activeId() { return this.data.active; }
  get active(): Progress { return this.progressOf(this.data.active || 'c1'); }

  setActive(id: string) {
    if (!this.data.children.includes(id)) return;
    this.data.active = id;
    this.save();
  }

  /** Enfant suivant (pour l'alternance) ; le même s'il est seul. */
  nextId(): string {
    const list = this.data.children;
    return list[(list.indexOf(this.data.active) + 1) % list.length] ?? this.data.active;
  }

  add(child: NewChild): string {
    const used = new Set(this.data.children);
    let n = 1;
    while (used.has(`c${n}`)) n++;
    const id = `c${n}`;
    const p = this.progressOf(id);
    p.name = child.name;
    p.age = child.age;
    // Les packs de reconnaissance vocale sont sur l'appareil : communs à tous les enfants.
    const packs = this.data.children.length ? this.progressOf(this.data.children[0]).settings.voicePacks : [];
    p.updateSettings({
      country: child.country, dailyMinutes: child.dailyMinutes, nightTime: child.nightTime, voice: !!child.voice, voicePacks: packs,
    });
    this.data.children = [...this.data.children, id];
    if (!this.data.active) this.data.active = id;
    this.save();
    return id;
  }

  /** Supprime un enfant et toute sa progression (jamais le dernier). */
  remove(id: string) {
    if (this.data.children.length <= 1) return;
    this.data.children = this.data.children.filter((c) => c !== id);
    if (this.data.active === id) this.data.active = this.data.children[0];
    try {
      this.store.setItem(this.keyOf(id), '{}');
    } catch {
      // ignoré
    }
    this.cache.delete(id);
    this.save();
  }

  get pin() { return this.data.pin; }
  setPin(pin: string) { this.data.pin = pin; this.save(); }
  checkPin(pin: string) { return !!this.data.pin && this.data.pin === pin; }

  get alternate() { return this.data.alternate; }
  setAlternate(on: boolean) { this.data.alternate = on; this.save(); }
}
