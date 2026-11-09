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

/** Adresse d'un fichier du moteur embarqué. */
const engineFile = (name: string) => new URL(`piper/${name}`, document.baseURI).href;
const VOICES_BASE = 'https://huggingface.co/diffusionstudio/piper-voices/resolve/main/';
const CACHE = 'dinolearn-voices-v1';

/** Chemins des voix sur HuggingFace. */
const VOICE_PATHS: Record<string, string> = {
  'fr_FR-upmc-medium': 'fr/fr_FR/upmc/medium/fr_FR-upmc-medium.onnx',
  'en_GB-alba-medium': 'en/en_GB/alba/medium/en_GB-alba-medium.onnx',
  'es_ES-davefx-medium': 'es/es_ES/davefx/medium/es_ES-davefx-medium.onnx',
  'de_DE-thorsten-medium': 'de/de_DE/thorsten/medium/de_DE-thorsten-medium.onnx',
  'it_IT-paola-medium': 'it/it_IT/paola/medium/it_IT-paola-medium.onnx',
};

const voiceUrls = (voiceId: string) => {
  const path = VOICE_PATHS[voiceId];
  if (!path) throw new Error(`Voix inconnue : ${voiceId}`);
  return [`${VOICES_BASE}${path}`, `${VOICES_BASE}${path}.json`];
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

// ---- Rangement des voix : Cache API, ou IndexedDB quand elle n'existe pas ----

interface BlobStore {
  get(url: string): Promise<Blob | undefined>;
  put(url: string, blob: Blob): Promise<void>;
  clear(): Promise<void>;
}

const cacheStore: BlobStore = {
  async get(url) {
    const res = await (await caches.open(CACHE)).match(url);
    return res ? res.blob() : undefined;
  },
  async put(url, blob) {
    await (await caches.open(CACHE)).put(url, new Response(blob, { headers: { 'content-type': blob.type } }));
  },
  async clear() { await caches.delete(CACHE); },
};

function idb<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(CACHE, 1);
    open.onupgradeneeded = () => open.result.createObjectStore('files');
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const req = run(db.transaction('files', mode).objectStore('files'));
      req.onsuccess = () => { db.close(); resolve(req.result); };
      req.onerror = () => { db.close(); reject(req.error); };
    };
  });
}

const idbStore: BlobStore = {
  get: (url) => idb<Blob | undefined>('readonly', (s) => s.get(url) as IDBRequest<Blob | undefined>),
  put: (url, blob) => idb('readwrite', (s) => s.put(blob, url)).then(() => undefined),
  clear: () => idb('readwrite', (s) => s.clear()).then(() => undefined),
};

/** Le Cache API manque dans certaines vues d'appli (iOS) : IndexedDB prend le relais. */
let storePromise: Promise<BlobStore> | undefined;
function store(): Promise<BlobStore> {
  storePromise ??= (async () => {
    try {
      if (typeof caches !== 'undefined') {
        await caches.open(CACHE);
        return cacheStore;
      }
    } catch {
      // Cache API refusée : IndexedDB.
    }
    return idbStore;
  })();
  return storePromise;
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

// ---- Calcul ----

interface OrtLike {
  env: { wasm: { wasmPaths?: string; numThreads?: number } };
  InferenceSession: { create(model: Uint8Array, opts: object): Promise<OrtSession> };
  Tensor: new (type: string, data: unknown, dims: number[]) => unknown;
}
interface OrtSession { run(feeds: Record<string, unknown>): Promise<Record<string, { data: Float32Array }>> }
interface PiperConfig {
  audio: { sample_rate: number };
  espeak: { voice: string };
  inference: { noise_scale: number; length_scale: number; noise_w: number };
  speaker_id_map?: Record<string, number>;
}
interface Phonemizer { callMain(args: string[]): void }

let ortPromise: Promise<OrtLike> | undefined;
function ort(): Promise<OrtLike> {
  ortPromise ??= import(/* @vite-ignore */ engineFile('ort.wasm.min.js')).then((m) => {
    const lib = (m.default ?? m) as OrtLike;
    lib.env.wasm.wasmPaths = engineFile('');
    lib.env.wasm.numThreads = 1;
    return lib;
  });
  ortPromise.catch(() => { ortPromise = undefined; });
  return ortPromise;
}

/** Le phonétiseur est créé une fois ; sa sortie est aiguillée vers la phrase en cours. */
let phonemizer: Promise<Phonemizer> | undefined;
let onPrint: ((line: string) => void) | undefined;
function getPhonemizer(): Promise<Phonemizer> {
  phonemizer ??= import(/* @vite-ignore */ engineFile('piper-phonemize.js')).then((m) => m.createPiperPhonemize({
    print: (line: string) => onPrint?.(line),
    printErr: () => undefined,
    locateFile: (file: string) => (file.endsWith('.wasm') ? engineFile('piper_phonemize.wasm')
      : file.endsWith('.data') ? engineFile('piper_phonemize.data') : file),
  }) as Promise<Phonemizer>);
  phonemizer.catch(() => { phonemizer = undefined; });
  return phonemizer;
}

async function phonemeIds(text: string, espeakVoice: string): Promise<number[]> {
  const run = async () => {
    const module = await getPhonemizer();
    return new Promise<number[]>((resolve, reject) => {
      onPrint = (line) => {
        try {
          resolve(JSON.parse(line).phoneme_ids);
        } catch (e) {
          reject(e);
        }
      };
      try {
        module.callMain(['-l', espeakVoice, '--input', JSON.stringify([{ text }]), '--espeak_data', '/espeak-ng-data']);
      } catch (e) {
        if ((e as { name?: string })?.name !== 'ExitStatus') reject(e);
      }
      setTimeout(() => reject(new Error('Phonétisation sans réponse')), 4000);
    });
  };
  try {
    return await run();
  } catch {
    // Le module n'aime pas toujours être relancé : on en recrée un, une fois.
    phonemizer = undefined;
    return run();
  }
}

const sessions = new Map<string, Promise<{ session: OrtSession; config: PiperConfig }>>();

/** Prépare une voix (lecture depuis le cache et chargement dans le moteur, quelques secondes). */
export function loadVoice(voiceId: string) {
  let s = sessions.get(voiceId);
  if (!s) {
    s = (async () => {
      const s = await store();
      const [modelUrl, configUrl] = voiceUrls(voiceId);
      const [model, config] = await Promise.all([s.get(modelUrl), s.get(configUrl)]);
      if (!model || !config) throw new Error('Voix pas encore téléchargée');
      const lib = await ort();
      const session = await lib.InferenceSession.create(new Uint8Array(await model.arrayBuffer()), { executionProviders: ['wasm'] });
      return { session, config: JSON.parse(await config.text()) as PiperConfig };
    })();
    s.catch(() => sessions.delete(voiceId));
    sessions.set(voiceId, s);
  }
  return s;
}

/** Calcule une phrase : le son (−1 à 1) et sa fréquence d'échantillonnage. `slow` : débit ralenti (× durée). */
export async function synthesize(voiceId: string, text: string, slow = 1): Promise<{ pcm: Float32Array; sampleRate: number }> {
  const [{ session, config }, lib] = await Promise.all([loadVoice(voiceId), ort()]);
  const ids = await phonemeIds(text.trim(), config.espeak.voice);
  const { noise_scale: noise, length_scale: length, noise_w: noiseW } = config.inference;
  const feeds: Record<string, unknown> = {
    input: new lib.Tensor('int64', BigInt64Array.from(ids.map((i) => BigInt(i))), [1, ids.length]),
    input_lengths: new lib.Tensor('int64', BigInt64Array.of(BigInt(ids.length)), [1]),
    scales: new lib.Tensor('float32', Float32Array.of(noise, length * slow, noiseW), [3]),
  };
  // Voix à plusieurs locuteurs (UPMC : 0 = Jessica, 1 = Pierre) : la première.
  if (config.speaker_id_map && Object.keys(config.speaker_id_map).length) {
    feeds.sid = new lib.Tensor('int64', BigInt64Array.of(0n), [1]);
  }
  const out = await session.run(feeds);
  return { pcm: out.output.data, sampleRate: config.audio.sample_rate };
}
