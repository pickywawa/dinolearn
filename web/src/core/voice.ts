import EasySpeech from 'easy-speech';
import { Speech } from '../content/content';
import { LinePicker } from './lines';
import { animalCry, audioContext, neuralVoiceFor, play, render, unlockAudio } from './neuralVoice';
import { splitCries } from '../domain/cries';
import { LANGS, Lang, langInfo } from '../domain/langs';
import { lang as appLang } from '../i18n';

type TalkListener = (talking: boolean) => void;
/** Début d'un mot : durée estimée du mot, en millisecondes. */
type BoundaryListener = (wordMs: number) => void;

/**
 * Voix du dino via la synthèse vocale du navigateur, pilotée par la
 * bibliothèque `easy-speech` (compatibilité iOS / Android / Chrome).
 * Voix du dino : la voix française la plus naturelle de l'appareil, juste un
 * peu plus aiguë qu'une voix normale (une voix trop aiguë devient agaçante).
 * Les mots anglais sont dits par une voix anglaise naturelle.
 * La bouche du dino ne bouge que pendant le son : `talking` passe à vrai au
 * vrai début de la parole (événement `start`), et chaque mot (événement
 * `boundary`) est signalé pour animer la bouche mot par mot.
 */
export class Voice {
  private voices: Partial<Record<Lang, SpeechSynthesisVoice>> = {};
  private ready = false;
  private generation = 0;
  private talkListeners = new Set<TalkListener>();
  private boundaryListeners = new Set<BoundaryListener>();
  talking = false;
  /** Son de la voix neuronale en cours (pour pouvoir le couper). */
  private playing?: { stop: () => void };

  /** Réglages de la voix du dino (1 = voix normale, max = 2). */
  static readonly DINO = { pitch: 1.2, rate: 0.95 };
  /** Mots anglais : lents et bien articulés. */
  static readonly WORD = { pitch: 1.0, rate: 0.72 };

  constructor(readonly lines: LinePicker) {}

  async init(): Promise<boolean> {
    try {
      this.ready = await EasySpeech.init({ maxTimeout: 5000, interval: 250, quiet: true });
    } catch {
      this.ready = false;
    }
    if (this.ready) {
      const all = EasySpeech.voices();
      // Voix du téléphone (en secours de la voix du dino) : une par langue.
      for (const l of LANGS) this.voices[l.code] = bestVoice(all, l.code);
    }
    return this.ready;
  }

  /**
   * iOS n'autorise la parole qu'après un geste : à appeler dans le
   * gestionnaire du premier toucher.
   */
  unlock() {
    unlockAudio();
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      speechSynthesis.speak(u);
    } catch {
      // Pas de synthèse vocale : le jeu continue sans voix.
    }
  }

  /** Voix choisies (pour l'espace parents). */
  voiceNames(): { fr?: string; en?: string } {
    const main = appLang();
    return { fr: this.voices[main]?.name, en: this.voices[langInfo(main).second]?.name };
  }

  onTalk(fn: TalkListener) { this.talkListeners.add(fn); return () => this.talkListeners.delete(fn); }
  onBoundary(fn: BoundaryListener) { this.boundaryListeners.add(fn); return () => this.boundaryListeners.delete(fn); }

  private setTalking(value: boolean) {
    if (this.talking === value) return;
    this.talking = value;
    this.talkListeners.forEach((fn) => fn(value));
  }

  /** Dit une réplique du dino (variante tirée au hasard). */
  line(group: string): Promise<void> {
    return this.say([{ text: this.lines.pick(group), lang: appLang() }]);
  }

  /** Dit une suite de morceaux ; une nouvelle demande coupe la précédente. */
  async say(input: Speech[]): Promise<void> {
    const generation = ++this.generation;
    this.cancelEngine();
    // Les cris d'animaux écrits (« coin coin ») deviennent de vrais enregistrements, joués entre les morceaux.
    const parts: (Speech & { animal?: string })[] = input.flatMap((part) => part.lang !== 'fr' ? [part]
      : splitCries(part.text).map((piece) => ('animal' in piece
        ? { text: '', lang: part.lang, animal: piece.animal, pauseAfter: 250 }
        : { ...part, text: piece.text })));
    for (const part of parts) if (part.animal) void animalCry(part.animal);
    // Voix neuronale : on lance le calcul de tous les morceaux tout de suite (le 2e se prépare pendant le 1er).
    for (const part of parts) if (part.text.trim()) render(part.lang, part.text, part.slow);
    for (const part of parts) {
      if (generation !== this.generation) return;
      if (part.animal) {
        await this.playCry(part.animal);
        if (generation !== this.generation) return;
        await wait(part.pauseAfter ?? 180);
        continue;
      }
      if (!part.text.trim()) continue;
      await this.speak(part);
      if (generation !== this.generation) return;
      this.setTalking(false);
      await wait(part.pauseAfter ?? 180);
    }
    if (generation === this.generation) this.setTalking(false);
  }

  stop() {
    this.generation++;
    this.setTalking(false);
    this.cancelEngine();
  }

  private cancelEngine() {
    this.playing?.stop();
    this.playing = undefined;
    if (!this.ready) return;
    try {
      EasySpeech.cancel();
    } catch {
      // ignoré
    }
  }

  /** Joue un cri d'animal enregistré (on n'attend pas plus de 4 s qu'il se charge). */
  private async playCry(animal: string): Promise<void> {
    const pending = animalCry(animal);
    if (!pending) return;
    const buffer = await Promise.race([pending.catch(() => undefined), wait(4000).then(() => undefined)]);
    // Son pas encore débloqué (aucun toucher) : on ne joue rien plutôt que d'attendre une fin qui ne viendra pas.
    if (!buffer || audioContext()?.state !== 'running') return;
    const sound = play(buffer);
    this.playing = sound;
    await Promise.race([sound.ended, wait(buffer.duration * 1000 + 1500)]);
    if (this.playing === sound) this.playing = undefined;
  }

  private async speak(part: Speech): Promise<void> {
    // La voix neuronale du dino si elle est installée ; sinon (ou si elle tarde trop), la voix du téléphone.
    if (neuralVoiceFor(part.lang) && await this.speakNeural(part)) return;
    // Garde-fou : on n'attend jamais indéfiniment la fin de la parole.
    const estimate = 500 + part.text.length * (part.slow ? 110 : 70);
    if (!this.ready) {
      await wait(estimate);
      return;
    }
    const settings = part.lang === appLang() ? Voice.DINO : Voice.WORD;
    const rate = part.slow ? settings.rate * 0.85 : settings.rate;
    const generation = this.generation;
    const speaking = EasySpeech.speak({
      text: part.text,
      voice: this.voices[part.lang],
      pitch: settings.pitch,
      rate,
      volume: 1,
      // La bouche ne s'ouvre qu'une fois le son vraiment parti.
      start: () => { if (generation === this.generation) this.setTalking(true); },
      boundary: (event) => {
        if (generation !== this.generation || (event.name && event.name !== 'word')) return;
        const word = part.text.slice(event.charIndex).match(/^[\p{L}\p{N}'’-]+/u)?.[0] ?? '';
        const ms = Math.min(700, Math.max(140, (word.length * 70) / rate));
        this.boundaryListeners.forEach((fn) => fn(ms));
      },
    }).catch(() => undefined);
    await Promise.race([speaking, wait(estimate * 2.5)]);
  }

  /**
   * Dit un morceau avec la voix neuronale. Faux si elle n'est pas prête à temps
   * (on passe alors à la voix du téléphone, pour ne jamais faire attendre l'enfant).
   */
  private async speakNeural(part: Speech): Promise<boolean> {
    const generation = this.generation;
    const pending = render(part.lang, part.text, part.slow);
    if (!pending) return false;
    let buffer: AudioBuffer | undefined;
    try {
      buffer = await Promise.race([pending, wait(5000).then(() => undefined)]);
    } catch {
      return false;
    }
    if (generation !== this.generation) return true;
    if (!buffer) return false;
    const sound = play(buffer);
    this.playing = sound;
    this.setTalking(true);
    // La bouche suit les mots : chaque mot reçoit une part du temps selon sa longueur.
    const words = part.text.match(WORDS) ?? [];
    const letters = words.reduce((n, w) => n + w.length, 0) || 1;
    const speaking = buffer.duration * 1000 * 0.92;
    let at = 0;
    const timers = words.map((w) => {
      const ms = (w.length / letters) * speaking;
      const t = setTimeout(() => {
        if (generation === this.generation) this.boundaryListeners.forEach((fn) => fn(Math.min(700, Math.max(140, ms))));
      }, at);
      at += ms;
      return t;
    });
    await sound.ended;
    timers.forEach(clearTimeout);
    if (this.playing === sound) this.playing = undefined;
    return true;
  }
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Les mots d'une phrase (pour faire bouger la bouche mot par mot). */
const WORDS = /[\p{L}\p{N}'’-]+/gu;

/** Préférences : voix « naturelles » et connues pour bien sonner. */
const PREFERRED: Partial<Record<Lang, RegExp[]>> = {
  fr: [/premium|enhanced|amélioré/i, /natural|neural/i, /google/i, /amélie|amelie/i, /audrey/i, /thomas/i, /denise/i, /marie/i],
  // Voix anglaise : accent britannique, claire et douce, de préférence féminine.
  en: [/(sonia|libby|maisie).*(natural|neural)/i, /premium|enhanced/i, /sonia|libby|maisie/i, /google uk english female/i, /serena|kate|martha|stephanie/i,
    /google uk/i, /daniel/i, /natural/i, /samantha|karen|moira|tessa/i],
};

function bestVoice(all: SpeechSynthesisVoice[], lang: Lang): SpeechSynthesisVoice | undefined {
  const candidates = all.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(lang));
  const locale = langInfo(lang).locale.toLowerCase();
  const regional = candidates.filter((v) => v.lang.toLowerCase().replace('_', '-') === locale);
  const pool = regional.length ? regional : candidates;
  for (const pattern of PREFERRED[lang] ?? [/premium|enhanced/i, /natural|neural/i, /google/i]) {
    const voice = pool.find((v) => pattern.test(v.name));
    if (voice) return voice;
  }
  return pool[0];
}
