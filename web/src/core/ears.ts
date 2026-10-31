import type { KaldiRecognizer, Model } from 'vosk-browser';
import { Heard, SpeechLang } from '../domain/speech';

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

export const VOICE_PACKS: Record<SpeechLang, VoicePack> = {
  fr: { file: 'voice/vosk-model-small-fr-0.22.tar.gz', words: 'voice/fr.words.txt', sizeMb: 41, name: 'Français' },
  en: { file: 'voice/vosk-model-small-en-us-0.15.tar.gz', words: 'voice/en.words.txt', sizeMb: 40, name: 'Anglais' },
};

/** Adresse complète : le moteur tourne dans un worker, qui ne connaît pas le dossier du jeu. */
const packUrl = (lang: SpeechLang) => new URL(VOICE_PACKS[lang].file, document.baseURI).href;

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

/** Vrai si le pack est déjà décompressé dans le navigateur (aucun téléchargement à prévoir). */
export async function packInstalled(lang: SpeechLang): Promise<boolean> {
  try {
    const dbs = await indexedDB.databases?.();
    if (dbs && !dbs.some((d) => d.name === STORE_DB)) return false;
  } catch {
    // `databases()` absent : on ouvre directement.
  }
  const key = `${STORE_DB}/${packUrl(lang).replace(/[\W]/g, '_')}/extracted.ok`;
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
      // `createModel` ne rend jamais la main si le téléchargement échoue : on écoute aussi l'erreur.
      model = import('vosk-browser').then(({ Model }) => new Promise<Model>((resolve, reject) => {
        const m = new Model(packUrl(lang), -1);
        const fail = (why: string) => {
          m.terminate();
          reject(new Error(why));
        };
        m.on('load', (message) => (message.event === 'load' && message.result ? resolve(m) : fail('Modèle illisible')));
        m.on('error', (message) => fail(message.event === 'error' ? message.error : 'Erreur du moteur'));
      }));
      model.catch(() => this.models.delete(lang));
      this.models.set(lang, model);
    }
    return model;
  }

  /** Mots connus du modèle (pour ne pas lui demander de mots qu'il ignore). */
  vocab(lang: SpeechLang): Promise<Set<string> | undefined> {
    let vocab = this.vocabs.get(lang);
    if (!vocab) {
      vocab = fetch(new URL(VOICE_PACKS[lang].words, document.baseURI).href)
        // Fichier absent : certains serveurs renvoient la page du jeu à la place.
        .then((r) => (r.ok && !r.headers.get('content-type')?.includes('html') ? r.text() : undefined))
        .then((text) => (text ? new Set(text.split('\n').map((w) => w.trim()).filter(Boolean)) : undefined))
        .catch(() => undefined);
      this.vocabs.set(lang, vocab);
    }
    return vocab;
  }

  /** Télécharge et installe un pack (espace parents). */
  async install(lang: SpeechLang): Promise<void> {
    try {
      await navigator.storage?.persist?.();
    } catch {
      // Stockage non persistant : le navigateur pourra effacer le pack s'il manque de place.
    }
    await this.load(lang);
    await this.vocab(lang);
  }

  /** Supprime tous les packs du navigateur. */
  async removeAll(): Promise<void> {
    for (const m of this.models.values()) void m.then((x) => x.terminate()).catch(() => undefined);
    this.models.clear();
    this.vocabs.clear();
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
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
    });
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
        resolve(heard);
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
