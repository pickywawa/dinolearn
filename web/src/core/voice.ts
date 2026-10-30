import EasySpeech from 'easy-speech';
import { Speech } from '../content/content';
import { LinePicker } from './lines';

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
  private voices: Partial<Record<'fr' | 'en', SpeechSynthesisVoice>> = {};
  private ready = false;
  private generation = 0;
  private talkListeners = new Set<TalkListener>();
  private boundaryListeners = new Set<BoundaryListener>();
  talking = false;

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
      this.voices.fr = bestVoice(all, 'fr');
      this.voices.en = bestVoice(all, 'en');
    }
    return this.ready;
  }

  /**
   * iOS n'autorise la parole qu'après un geste : à appeler dans le
   * gestionnaire du premier toucher.
   */
  unlock() {
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      speechSynthesis.speak(u);
    } catch {
      // Pas de synthèse vocale : le jeu continue sans voix.
    }
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
    return this.say([{ text: this.lines.pick(group), lang: 'fr' }]);
  }

  /** Dit une suite de morceaux ; une nouvelle demande coupe la précédente. */
  async say(parts: Speech[]): Promise<void> {
    const generation = ++this.generation;
    this.cancelEngine();
    for (const part of parts) {
      if (generation !== this.generation) return;
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
    if (!this.ready) return;
    try {
      EasySpeech.cancel();
    } catch {
      // ignoré
    }
  }

  private async speak(part: Speech): Promise<void> {
    // Garde-fou : on n'attend jamais indéfiniment la fin de la parole.
    const estimate = 500 + part.text.length * (part.slow ? 110 : 70);
    if (!this.ready) {
      await wait(estimate);
      return;
    }
    const settings = part.lang === 'fr' ? Voice.DINO : Voice.WORD;
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
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Préférences : voix « naturelles » et connues pour bien sonner. */
const PREFERRED: Record<'fr' | 'en', RegExp[]> = {
  fr: [/premium|enhanced|amélioré/i, /natural|neural/i, /google/i, /amélie|amelie/i, /audrey/i, /thomas/i, /denise/i, /marie/i],
  // Voix anglaise : accent britannique, claire et douce, de préférence féminine.
  en: [/(sonia|libby|maisie).*(natural|neural)/i, /premium|enhanced/i, /sonia|libby|maisie/i, /google uk english female/i, /serena|kate|martha|stephanie/i,
    /google uk/i, /daniel/i, /natural/i, /samantha|karen|moira|tessa/i],
};

function bestVoice(all: SpeechSynthesisVoice[], lang: 'fr' | 'en'): SpeechSynthesisVoice | undefined {
  const candidates = all.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(lang));
  const regional = candidates.filter((v) => (lang === 'en' ? /en-gb/i : /fr-fr/i).test(v.lang.replace('_', '-')));
  const pool = regional.length ? regional : candidates;
  for (const pattern of PREFERRED[lang]) {
    const voice = pool.find((v) => pattern.test(v.name));
    if (voice) return voice;
  }
  return pool[0];
}
