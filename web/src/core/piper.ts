import { VOICE_URLS } from '../domain/langs';
import { store } from './voiceStore';
/**
 * Moteur de voix neuronale Piper, dans le navigateur (aucune voix enregistrée :
 * chaque phrase est calculée sur l'appareil).
 *
 * - Prononciation : piper_phonemize (espeak-ng compilé en WebAssembly), via le
 *   module de la bibliothèque @mintplex-labs/piper-tts-web (MIT).
 * - Calcul : onnxruntime-web 1.18.0 (WebAssembly).
 * - Voix : modèles Piper (fichiers .onnx + .json), téléchargés une fois et
 *   gardés sur l'appareil (Cache API, ou IndexedDB là où elle manque).
 *
 * Le moteur est embarqué avec le jeu (`public/piper/`, copié depuis les paquets
 * npm par `scripts/vendor-piper.mjs`) : seules les voix se téléchargent, depuis
 * HuggingFace. Le texte ne quitte jamais l'appareil.
 */


/** Adresses d'une voix (modèle et réglages). */
const voiceUrls = (voiceId: string) => {
  const base = VOICE_URLS[voiceId];
  if (!base) throw new Error(`Voix inconnue : ${voiceId}`);
  return [`${base}.onnx`, `${base}.onnx.json`];
};

export type OnBytes = (bytes: number, contentLength?: number) => void;

/** Télécharge une adresse en signalant chaque morceau reçu ; renvoie le contenu. */
async function fetchWithProgress(url: string, onBytes: OnBytes): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`Téléchargement impossible (${res.status})`);
  const length = Number(res.headers.get('content-length') ?? 0) || undefined;
  onBytes(0, length);
  const reader = res.body.getReader();
  const parts: BlobPart[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value);
    onBytes(value.length);
  }
  return new Blob(parts, { type: res.headers.get('content-type') ?? 'application/octet-stream' });
}

/** Le moteur est embarqué avec le jeu : rien à télécharger. */
export function engineReady(): boolean {
  return true;
}

export async function downloadEngine(_onBytes: OnBytes): Promise<void> {
  // Embarqué : plus de téléchargement.
}

/** Fichiers gardés sur l'appareil (voix, listes de mots des packs). */
export const storedBlob = {
  get: async (url: string) => (await store()).get(url),
  put: async (url: string, blob: Blob) => (await store()).put(url, blob),
};

/** La voix est rangée sur l'appareil. */
export async function voiceStored(voiceId: string): Promise<boolean> {
  try {
    const s = await store();
    const found = await Promise.all(voiceUrls(voiceId).map((u) => s.get(u)));
    return found.every(Boolean);
  } catch {
    return false;
  }
}

/** Télécharge une voix et la range sur l'appareil. */
export async function downloadVoice(voiceId: string, onBytes: OnBytes): Promise<void> {
  try {
    await navigator.storage?.persist?.();
  } catch {
    // Stockage non persistant : le navigateur pourra effacer la voix s'il manque de place.
  }
  const s = await store();
  for (const url of voiceUrls(voiceId)) {
    if (await s.get(url)) continue;
    const blob = await fetchWithProgress(url, onBytes);
    await s.put(url, blob);
  }
}

export async function removeVoices(): Promise<void> {
  try {
    await (await store()).clear();
  } catch {
    // ignoré
  }
}

// ---- Calcul, dans un worker ----

type Reply = { id: number; ok: true; pcm?: Float32Array; sampleRate?: number } | { id: number; ok: false; error: string };
let worker: Worker | undefined | null;
let nextId = 1;
const pending = new Map<number, { resolve: (r: Reply) => void }>();

/** Le worker du calcul de la voix (null s'il ne peut pas démarrer : calcul dans la page). */
function engineWorker(): Worker | null {
  if (worker !== undefined) return worker;
  try {
    worker = new Worker(new URL('./piperWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<Reply>) => {
      pending.get(e.data.id)?.resolve(e.data);
      pending.delete(e.data.id);
    };
    worker.onerror = () => {
      // Worker en panne (vue web trop ancienne…) : la suite se calcule dans la page.
      worker?.terminate();
      worker = null;
      for (const [id, p] of pending) p.resolve({ id, ok: false, error: 'worker' });
      pending.clear();
    };
  } catch {
    worker = null;
  }
  return worker;
}

let inPage: Promise<typeof import('./piperEngine')> | undefined;
function pageEngine() {
  inPage ??= import('./piperEngine').then((m) => { m.setEngineBase(document.baseURI); return m; });
  return inPage;
}

async function call(msg: { kind: 'load' | 'speech'; voiceId: string; text?: string; slow?: boolean }) {
  const w = engineWorker();
  if (w) {
    const id = nextId++;
    const reply = await new Promise<Reply>((resolve) => {
      pending.set(id, { resolve });
      w.postMessage({ ...msg, id, base: document.baseURI });
    });
    if (reply.ok) return reply;
    if (reply.error !== 'worker') throw new Error(reply.error);
  }
  const engine = await pageEngine();
  if (msg.kind === 'load') {
    await engine.loadVoice(msg.voiceId);
    return { id: 0, ok: true as const };
  }
  return { id: 0, ok: true as const, ...await engine.speech(msg.voiceId, msg.text ?? '', !!msg.slow) };
}

/** Prépare une voix (lecture depuis l'appareil et chargement dans le moteur, quelques secondes, hors de la page). */
export async function loadVoice(voiceId: string): Promise<void> {
  await call({ kind: 'load', voiceId });
}

/** Une réplique calculée, prête à jouer (voix du dino : pauses et voix aiguë comprises). */
export async function speech(voiceId: string, text: string, slow = false): Promise<{ pcm: Float32Array; sampleRate: number }> {
  const r = await call({ kind: 'speech', voiceId, text, slow });
  return { pcm: r.pcm!, sampleRate: r.sampleRate! };
}
