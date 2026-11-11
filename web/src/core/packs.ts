import { PackId, SIZES_MB, asrLanguages, languageOf, remainingSeconds, secondLanguage, throughput } from '../domain/packs';
import { SpeechLang } from '../domain/speech';
import { app } from './app';
import { appLanguage } from './appSettings';
import { VOICE_PACKS, ears, packInstalled, storageRoom, voiceSupported } from './ears';
import { setNeuralVoice } from './neuralVoice';
import { downloadEngine, downloadVoice, engineReady, voiceStored } from './piper';

/**
 * Réglages de l'application (communs à tous les enfants) et téléchargements :
 * voix du dino, voix anglaise, reconnaissance vocale. Les téléchargements se
 * font en parallèle ; le gestionnaire suit les octets reçus pour estimer le
 * temps restant en direct, et continue même si la fenêtre est fermée.
 */

export { appLanguage, markPacksAsked, packsAsked, setAppLanguage } from './appSettings';

/** Note un pack de reconnaissance comme prêt pour tous les enfants (et active le micro). */
function markAsrInstalled(lang: SpeechLang) {
  for (const id of app.profiles.ids) {
    const child = app.profiles.progressOf(id);
    if (!child.settings.voicePacks.includes(lang)) child.updateSettings({ voicePacks: [...child.settings.voicePacks, lang] });
  }
}

/** Ce qui est déjà installé sur l'appareil. */
export async function installedPacks(language = appLanguage()): Promise<Record<PackId, boolean>> {
  const lang = languageOf(language);
  const second = languageOf(secondLanguage(language));
  const asrLangs = asrLanguages(language, true);
  const [speech, secondVoice, asr] = await Promise.all([
    voiceStored(lang.voice).then((v) => v && engineReady()),
    voiceStored(second.voice).then((v) => v && engineReady()),
    // Pas de pack de reconnaissance dans cette langue : rien à installer.
    asrLangs.length ? Promise.all(asrLangs.map((l) => packInstalled(l as SpeechLang))).then((all) => all.every(Boolean)) : true,
  ]);
  return { speech, second: secondVoice, asr };
}

/** Au lancement : les voix déjà téléchargées remplacent la voix du téléphone. */
export async function enableInstalledVoices() {
  const language = appLanguage();
  const installed = await installedPacks(language);
  if (installed.speech) setNeuralVoice(languageOf(language).code, languageOf(language).voice);
  const second = languageOf(secondLanguage(language));
  if (installed.second) setNeuralVoice(second.code, second.voice);
}

// ---- Téléchargements ----

/** Le moteur Piper n'est téléchargé qu'une fois, même si les deux voix sont choisies. */
let engineDownload: Promise<void> | undefined;
function ensureEngine(onBytes: (n: number) => void): Promise<void> {
  if (engineReady()) return Promise.resolve();
  engineDownload ??= downloadEngine((n) => onBytes(n)).catch((e) => {
    engineDownload = undefined;
    throw e;
  });
  return engineDownload;
}

export type TaskState = 'waiting' | 'downloading' | 'installing' | 'done' | 'error';

export interface TaskProgress {
  id: PackId;
  state: TaskState;
  loaded: number;
  total: number;
  error?: string;
}

export interface Progress {
  tasks: TaskProgress[];
  loaded: number;
  total: number;
  /** Secondes restantes (undefined tant qu'on ne peut pas estimer). */
  remaining?: number;
  running: boolean;
}

type Listener = (p: Progress) => void;

class Downloads {
  private tasks = new Map<PackId, TaskProgress>();
  private samples: { at: number; bytes: number }[] = [];
  private listeners = new Set<Listener>();
  private timer?: ReturnType<typeof setInterval>;
  /** Reconnaissance vocale en cours d'installation (le dino peut l'attendre pour entendre le prénom). */
  asrPending?: Promise<void>;

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.snapshot());
    return () => this.listeners.delete(fn);
  }

  get running() { return [...this.tasks.values()].some((t) => t.state === 'waiting' || t.state === 'downloading' || t.state === 'installing'); }

  snapshot(): Progress {
    const tasks = [...this.tasks.values()];
    const loaded = tasks.reduce((n, t) => n + t.loaded, 0);
    const total = tasks.reduce((n, t) => n + Math.max(t.total, t.loaded), 0);
    const active = tasks.filter((t) => t.state === 'downloading');
    const remaining = active.length ? remainingSeconds(loaded, total, throughput(this.samples)) : this.running ? undefined : 0;
    return { tasks: tasks.map((t) => ({ ...t })), loaded, total, remaining, running: this.running };
  }

  private emit() {
    const p = this.snapshot();
    this.listeners.forEach((fn) => fn(p));
  }

  /** Lance les téléchargements choisis, en parallèle (ceux déjà en cours ne repartent pas). */
  start(ids: PackId[], language: string, withSecond = true) {
    const lang = languageOf(language);
    const second = languageOf(secondLanguage(language));
    const secondChosen = withSecond;
    for (const id of ids) {
      const current = this.tasks.get(id);
      if (current && current.state !== 'error' && current.state !== 'done') continue;
      const task: TaskProgress = { id, state: 'waiting', loaded: 0, total: 0 };
      this.tasks.set(id, task);
      // Tailles connues d'avance (plus fiables que celles annoncées par les serveurs, souvent compressées).
      const needsEngine = !engineReady() && (id === 'speech' || (id === 'second' && !ids.includes('speech')));
      task.total = 1e6 * (id === 'speech' ? SIZES_MB.voices[lang.voice] ?? 0
        : id === 'second' ? SIZES_MB.voices[second.voice] ?? 0 : asrLanguages(language, secondChosen).reduce((n, l) => n + (SIZES_MB.asr[l] ?? 0), 0));
      if (needsEngine) task.total += SIZES_MB.engine * 1e6;
      const onBytes = (n: number) => {
        task.state = 'downloading';
        task.loaded += n;
      };
      const run = async () => {
        if (id === 'speech') {
          await Promise.all([ensureEngine(onBytes), downloadVoice(lang.voice, onBytes)]);
          setNeuralVoice(lang.code, lang.voice);
        } else if (id === 'second') {
          // Le moteur est compté avec la voix du dino quand elle est aussi choisie.
          await Promise.all([needsEngine ? ensureEngine(onBytes) : ensureEngine(() => undefined), downloadVoice(second.voice, onBytes)]);
          setNeuralVoice(second.code, second.voice);
        } else {
          await this.installAsr(asrLanguages(language, secondChosen) as SpeechLang[], task, onBytes);
        }
      };
      const promise = run().then(() => {
        task.state = 'done';
        task.loaded = Math.max(task.loaded, task.total);
      }, (e) => {
        task.state = 'error';
        task.error = e instanceof Error ? e.message : String(e);
      }).finally(() => this.emit());
      if (id === 'asr') this.asrPending = promise;
    }
    this.samples = [];
    this.timer ??= setInterval(() => {
      const p = this.snapshot();
      this.samples.push({ at: performance.now(), bytes: p.loaded });
      if (this.samples.length > 60) this.samples.shift();
      this.emit();
      if (!this.running && this.timer) {
        clearInterval(this.timer);
        this.timer = undefined;
      }
    }, 500);
    this.emit();
  }

  /**
   * Packs de reconnaissance : on télécharge d'abord l'archive nous-mêmes (pour
   * suivre la progression ; elle reste dans le cache du navigateur), puis le
   * moteur l'installe (décompression).
   */
  private async installAsr(langs: SpeechLang[], task: TaskProgress, onBytes: (n: number) => void) {
    if (!voiceSupported()) throw new Error('Ce navigateur ne permet pas la reconnaissance vocale.');
    const archives = new Map<SpeechLang, Blob>();
    for (const l of langs) {
      if (await packInstalled(l)) {
        markAsrInstalled(l);
        continue;
      }
      if (await storageRoom(l) === 'full') {
        throw new Error('Pas assez de place dans ce navigateur (en navigation privée, ouvrez une fenêtre normale).');
      }
      const res = await fetch(VOICE_PACKS[l].file);
      if (!res.ok || !res.body || res.headers.get('content-type')?.includes('html')) {
        throw new Error('Ce pack n\'est pas disponible pour l\'instant.');
      }
      const reader = res.body.getReader();
      const parts: BlobPart[] = [];
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        parts.push(value);
        onBytes(value.length);
      }
      archives.set(l, new Blob(parts, { type: 'application/gzip' }));
    }
    task.state = 'installing';
    this.emit();
    for (const l of langs) {
      if (await packInstalled(l)) continue;
      // L'archive téléchargée ci-dessus est passée au moteur : pas de second téléchargement.
      await ears.install(l, archives.get(l));
      archives.delete(l);
      markAsrInstalled(l);
    }
  }
}

export const downloads = new Downloads();

/**
 * Packs manquants de la langue de l'appli : voix du dino et reconnaissance vocale de la
 * langue (`withSecond` : aussi la voix et la reconnaissance de la langue apprise en plus).
 */
export async function missingPacks(withSecond: boolean, language = appLanguage()): Promise<PackId[]> {
  const installed = await installedPacks(language);
  const primary = asrLanguages(language, false) as SpeechLang[];
  const asrNeeded = voiceSupported() && primary.length > 0;
  const ids: PackId[] = [];
  if (!installed.speech) ids.push('speech');
  if (asrNeeded && (withSecond ? !installed.asr : (await Promise.all(primary.map(packInstalled))).some((ok) => !ok))) ids.push('asr');
  if (withSecond && !installed.second) ids.push('second');
  return ids;
}

let secondStarted = false;
/**
 * La langue apprise en plus (voix, reconnaissance) : téléchargée en arrière-plan une fois à
 * l'accueil (pas pendant l'éclosion, où le dino écoute le prénom), une fois par lancement.
 */
export async function prepareSecondPacks() {
  if (secondStarted) return;
  secondStarted = true;
  const ids = await missingPacks(true);
  if (ids.length) downloads.start(ids, appLanguage(), true);
}
