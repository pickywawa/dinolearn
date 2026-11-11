import type { KaldiRecognizer, Model } from 'vosk-browser';
import { Heard, SpeechLang } from '../domain/speech';
import { voiceAsset } from './native';
import { LANGS } from '../domain/langs';
import { storedBlob } from './piper';

/**
 * Liste des mots d'un pack : téléchargée une fois puis gardée sur l'appareil
 * (l'appli doit marcher hors ligne une fois les packs installés).
 */
async function wordsOf(url: string): Promise<string | undefined> {
  const kept = await storedBlob.get(url).catch(() => undefined);
  if (kept) return kept.text();
  const r = await fetch(url);
  // Fichier absent : certains serveurs renvoient la page du jeu à la place.
  if (!r.ok || r.headers.get('content-type')?.includes('html')) return undefined;
  const text = await r.text();
  await storedBlob.put(url, new Blob([text], { type: 'text/plain' })).catch(() => undefined);
  return text;
}

/**
 * Les oreilles du dino : reconnaissance vocale Vosk (WebAssembly), entièrement
 * sur l'appareil. Rien n'est enregistré ni envoyé : le son du micro va
 * directement au moteur, qui ne renvoie que le mot reconnu.
 *
 * Un « pack » par langue (environ 40 Mo), téléchargé une seule fois depuis
 * l'espace parents puis gardé par le navigateur (IndexedDB). La bibliothèque
 * (≈ 6 Mo) n'est chargée qu'au premier jeu à voix haute.
 * Le micro ne s'allume que pendant l'écoute (quand l'enfant a touché le bouton).
 */

export interface VoicePack {
  /** Archive du modèle, à côté du jeu (voir scripts/voice-packs.mjs). */
  file: string;
  /** Liste des mots connus du modèle, un par ligne. */
  words: string;
  sizeMb: number;
  name: string;
}

/**
 * Les archives des packs sont publiées sur HuggingFace (dataset public, voir
 * .github/workflows/voice-packs.yml) : le site n'a plus à les embarquer. Les listes de
 * mots, petites, restent servies à côté du jeu.
 */
export const PACKS_BASE = 'https://huggingface.co/datasets/pickywawa/dinolearn-voice-packs/resolve/main/';

/** Packs de reconnaissance (ceux des langues qui en ont un léger). */
export const VOICE_PACKS = Object.fromEntries(LANGS.filter((l) => l.asr).map((l) => [l.code, {
  file: `${PACKS_BASE}${l.asr!.model}.tar.gz`, words: `voice/${l.code}.words.txt`, sizeMb: l.asr!.sizeMb, name: l.name,
}])) as Record<SpeechLang, VoicePack>;

/** Adresse de l'archive sur HuggingFace. */
const packUrl = (lang: SpeechLang) => VOICE_PACKS[lang].file;
/** Ancienne adresse (le site du jeu) : les packs déjà installés depuis là restent valables. */
const legacyUrl = (lang: SpeechLang) => voiceAsset(`voice/${LANGS.find((l) => l.code === lang)!.asr!.model}.tar.gz`);

/**
 * Le moteur range chaque pack sous un nom tiré de l'adresse qu'on lui donne. Le jeu télécharge
 * l'archive lui-même (pour la barre de progression) et la lui passe en adresse locale (blob:) :
 * un seul téléchargement. On retient ici sous quelle adresse chaque pack a été rangé.
 */
const INSTALLED_KEY = 'dinolearn.asr.v1';
function installedUrls(): Partial<Record<SpeechLang, string>> {
  try {
    return JSON.parse(localStorage.getItem(INSTALLED_KEY) ?? '{}');
  } catch {
    return {};
  }
}
function rememberUrl(lang: SpeechLang, url: string) {
  try {
    localStorage.setItem(INSTALLED_KEY, JSON.stringify({ ...installedUrls(), [lang]: url }));
  } catch {
    // Stockage refusé : le pack sera cherché à son adresse habituelle.
  }
}

/** Base IndexedDB où le moteur garde les modèles décompressés (dossier `/vosk` d'Emscripten). */
const STORE_DB = '/vosk';

type AudioContextClass = typeof AudioContext;
const AudioCtx = (): AudioContextClass | undefined =>
  window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextClass }).webkitAudioContext;

/** Ce qu'il faut au navigateur : micro, WebAssembly, son, worker et stockage. */
export function voiceSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
    && typeof WebAssembly === 'object' && !!AudioCtx() && typeof Worker !== 'undefined' && typeof indexedDB !== 'undefined';
}

/**
 * Place pour un pack dans le navigateur. En navigation privée, les navigateurs
 * gardent très peu de place (ou rien) : le pack ne peut pas s'installer.
 * `unknown` : le navigateur ne dit pas combien de place il reste.
 */
export async function storageRoom(lang: SpeechLang): Promise<'ok' | 'full' | 'unknown'> {
  try {
    const estimate = await navigator.storage?.estimate?.();
    if (!estimate?.quota) return 'unknown';
    // Le pack est stocké décompressé : il faut environ trois fois sa taille.
    const needed = VOICE_PACKS[lang].sizeMb * 3 * 1e6;
    return estimate.quota - (estimate.usage ?? 0) >= needed ? 'ok' : 'full';
  } catch {
    return 'unknown';
  }
}

/** Message pour les parents quand un pack ne peut pas s'installer. */
export const NO_ROOM_MESSAGE = 'Pas assez de place dans ce navigateur pour la reconnaissance vocale. En navigation privée, '
  + 'les navigateurs ne gardent presque rien : ouvrez le jeu dans une fenêtre normale. Les jeux à voix haute se jouent '
  + 'alors au doigt.';

/** Demande l'accès au micro (pour que la question soit posée au parent), puis le referme. */
export async function askMicPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
}

/** Le pack rangé sous cette adresse est-il décompressé dans le navigateur ? */
async function extractedAt(url: string): Promise<boolean> {
  try {
    const dbs = await indexedDB.databases?.();
    if (dbs && !dbs.some((d) => d.name === STORE_DB)) return false;
  } catch {
    // `databases()` absent : on ouvre directement.
  }
  const key = `${STORE_DB}/${url.replace(/[\W]/g, '_')}/extracted.ok`;
  return new Promise((resolve) => {
    const req = indexedDB.open(STORE_DB);
    req.onerror = () => resolve(false);
    req.onsuccess = () => {
      const db = req.result;
      try {
        const get = db.transaction('FILE_DATA', 'readonly').objectStore('FILE_DATA').get(key);
        get.onsuccess = () => { db.close(); resolve(get.result !== undefined); };
        get.onerror = () => { db.close(); resolve(false); };
      } catch {
        db.close();
        resolve(false);
      }
    };
  });
}

/** Adresse sous laquelle le pack est installé (undefined : pas installé). */
async function installedUrl(lang: SpeechLang): Promise<string | undefined> {
  for (const url of [installedUrls()[lang], packUrl(lang), legacyUrl(lang)]) {
    if (url && await extractedAt(url)) return url;
  }
  return undefined;
}

/** Vrai si le pack est déjà décompressé dans le navigateur (aucun téléchargement à prévoir). */
export async function packInstalled(lang: SpeechLang): Promise<boolean> {
  return !!await installedUrl(lang);
}

/** Charge un modèle Vosk depuis une adresse (rejette si l'archive est illisible ou absente). */
function openModel(url: string): Promise<Model> {
  return import('vosk-browser').then(({ Model }) => new Promise<Model>((resolve, reject) => {
    const m = new Model(url, -1);
    const fail = (why: string) => {
      m.terminate();
      reject(new Error(why));
    };
    m.on('load', (message) => (message.event === 'load' && message.result ? resolve(m) : fail('Modèle illisible')));
    m.on('error', (message) => fail(message.event === 'error' ? message.error : 'Erreur du moteur'));
  }));
}

class Ears {
  private models = new Map<SpeechLang, Promise<Model>>();
  private vocabs = new Map<SpeechLang, Promise<Set<string> | undefined>>();
  private ctx?: AudioContext;
  private cancel?: () => void;

  /** Charge le modèle d'une langue (le télécharge la première fois) ; un seul modèle en mémoire. */
  load(lang: SpeechLang): Promise<Model> {
    let model = this.models.get(lang);
    if (!model) {
      for (const [other, m] of this.models) {
        if (other !== lang) void m.then((x) => x.terminate()).catch(() => undefined);
      }
      this.models.clear();
      // Installé : depuis l'appareil ; sinon le moteur télécharge l'archive lui-même.
      model = installedUrl(lang).then((url) => openModel(url ?? packUrl(lang)));
      model.catch(() => this.models.delete(lang));
      this.models.set(lang, model);
    }
    return model;
  }

  /** Mots connus du modèle (pour ne pas lui demander de mots qu'il ignore). */
  vocab(lang: SpeechLang): Promise<Set<string> | undefined> {
    let vocab = this.vocabs.get(lang);
    if (!vocab) {
      vocab = wordsOf(voiceAsset(VOICE_PACKS[lang].words))
        .then((text) => (text ? new Set(text.split('\n').map((w) => w.trim()).filter(Boolean)) : undefined))
        .catch(() => undefined);
      this.vocabs.set(lang, vocab);
    }
    return vocab;
  }

  /**
   * Installe un pack (décompression sur l'appareil). `archive` : l'archive déjà téléchargée
   * par le jeu (barre de progression), passée au moteur sans la retélécharger. Le modèle en
   * mémoire (celui qui écoute l'enfant) n'est pas délogé : le pack est chargé à part, puis libéré.
   */
  async install(lang: SpeechLang, archive?: Blob): Promise<void> {
    try {
      await navigator.storage?.persist?.();
    } catch {
      // Stockage non persistant : le navigateur pourra effacer le pack s'il manque de place.
    }
    if (!await packInstalled(lang)) {
      const local = archive ? URL.createObjectURL(archive) : undefined;
      try {
        const model = await openModel(local ?? packUrl(lang));
        if (local) rememberUrl(lang, local);
        // Langue en cours (ou aucune) : on garde le modèle prêt à écouter ; sinon on le libère.
        if (this.models.size === 0 || this.models.has(lang)) {
          for (const [, m] of this.models) void m.then((x) => x.terminate()).catch(() => undefined);
          this.models.set(lang, Promise.resolve(model));
        } else {
          model.terminate();
        }
      } finally {
        if (local) URL.revokeObjectURL(local);
      }
    } else if (this.models.size === 0) {
      await this.load(lang);
    }
    await this.vocab(lang);
  }

  /** Supprime tous les packs du navigateur. */
  async removeAll(): Promise<void> {
    for (const m of this.models.values()) void m.then((x) => x.terminate()).catch(() => undefined);
    this.models.clear();
    this.vocabs.clear();
    try {
      localStorage.removeItem(INSTALLED_KEY);
    } catch {
      // ignoré
    }
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase(STORE_DB);
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    });
  }

  /** Débloque le son (à appeler pendant un toucher, pour iOS). */
  wake() {
    const Ctx = AudioCtx();
    if (!Ctx) return;
    this.ctx ??= new Ctx();
    void this.ctx.resume();
  }

  /**
   * Écoute l'enfant (au plus `maxMs`) et renvoie ce que le moteur a reconnu
   * parmi les phrases de la grammaire. `onLevel` reçoit le volume (0 à 1).
   */
  async listen(lang: SpeechLang, grammar: string[], opts: {
    maxMs?: number;
    onLevel?: (level: number) => void;
    /** Faux si ce qui a été entendu ne veut rien dire (« euh… ») : on écoute encore jusqu'à la fin. */
    decisive?: (heard: Heard) => boolean;
  } = {}): Promise<Heard> {
    this.stop();
    const maxMs = opts.maxMs ?? 6000;
    const model = await this.load(lang);
    this.wake();
    const ctx = this.ctx!;
    // Sans annulation d'écho : avec elle, Android et iOS passent en mode « appel téléphonique »
    // (son envoyé dans l'écouteur, volume très bas) et la voix du dino devient inaudible
    // quelques secondes après l'écoute. Le dino ne parle jamais pendant qu'il écoute.
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
    });
    if (ctx.state !== 'running') await ctx.resume().catch(() => undefined);
    const recognizer: KaldiRecognizer = new model.KaldiRecognizer(ctx.sampleRate, JSON.stringify(grammar));
    recognizer.setWords(true);
    const source = ctx.createMediaStreamSource(stream);
    const node = ctx.createScriptProcessor(4096, 1, 1);

    return new Promise<Heard>((resolve) => {
      let done = false;
      let finalTimer: ReturnType<typeof setTimeout> | undefined;
      let last: Heard = { text: '' };
      const finish = (heard: Heard) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        clearTimeout(finalTimer);
        node.onaudioprocess = null;
        source.disconnect();
        node.disconnect();
        stream.getTracks().forEach((t) => t.stop());
        try {
          recognizer.remove();
        } catch {
          // Moteur déjà arrêté.
        }
        this.cancel = undefined;
        opts.onLevel?.(0);
        // Le temps que le téléphone rende le son au haut-parleur avant que le dino reparle.
        setTimeout(() => resolve(heard), 350);
      };
      this.cancel = () => finish({ text: '' });

      recognizer.on('result', (message) => {
        if (message.event !== 'result') return;
        const { text, result } = message.result;
        const heard = { text, words: result?.map((w) => ({ word: w.word, conf: w.conf })) };
        if (text.trim()) last = heard;
        // Silence ou « euh » : on continue d'écouter, sauf à la fin.
        if (finalTimer) finish(text.trim() ? heard : last);
        else if (text.trim() && (opts.decisive?.(heard) ?? true)) finish(heard);
      });
      recognizer.on('error', () => finish({ text: '' }));

      node.onaudioprocess = (event) => {
        if (done) return;
        const data = event.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
        opts.onLevel?.(Math.min(1, Math.sqrt(sum / data.length) * 6));
        try {
          recognizer.acceptWaveform(event.inputBuffer);
        } catch {
          finish({ text: '' });
        }
      };
      source.connect(node);
      node.connect(ctx.destination);

      // Temps écoulé : on demande le résultat de ce qui a été dit jusque-là.
      const timer = setTimeout(() => {
        finalTimer = setTimeout(() => finish(last), 1500);
        recognizer.retrieveFinalResult();
      }, maxMs);
    });
  }

  /** Arrête l'écoute en cours (scène quittée). */
  stop() {
    this.cancel?.();
  }
}

export const ears = new Ears();
