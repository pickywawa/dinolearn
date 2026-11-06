/**
 * Moteur de voix neuronale Piper, dans le navigateur (aucune voix enregistrée :
 * chaque phrase est calculée sur l'appareil).
 *
 * - Prononciation : piper_phonemize (espeak-ng compilé en WebAssembly), via le
 *   module de la bibliothèque @mintplex-labs/piper-tts-web (MIT).
 * - Calcul : onnxruntime-web 1.18.0 (WebAssembly).
 * - Voix : modèles Piper (fichiers .onnx + .json), téléchargés une fois et
 *   gardés dans le cache du navigateur (Cache API, qui marche partout, Safari
 *   compris). Le moteur (≈ 30 Mo) reste dans le cache HTTP (versions figées).
 *
 * Tout est chargé depuis jsDelivr et HuggingFace ; le texte ne quitte jamais
 * l'appareil.
 */

const PIPER_BASE = 'https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.5/dist/';
const ORT_BASE = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/';
const PHONEMIZE = 'https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize';
const VOICES_BASE = 'https://huggingface.co/diffusionstudio/piper-voices/resolve/main/';
const CACHE = 'dinolearn-voices-v1';
const ENGINE_KEY = 'dinolearn.piperEngine.v1';

/** Chemins des voix sur HuggingFace. */
const VOICE_PATHS: Record<string, string> = {
  'fr_FR-upmc-medium': 'fr/fr_FR/upmc/medium/fr_FR-upmc-medium.onnx',
  'en_GB-alba-medium': 'en/en_GB/alba/medium/en_GB-alba-medium.onnx',
  'es_ES-davefx-medium': 'es/es_ES/davefx/medium/es_ES-davefx-medium.onnx',
  'de_DE-thorsten-medium': 'de/de_DE/thorsten/medium/de_DE-thorsten-medium.onnx',
  'it_IT-paola-medium': 'it/it_IT/paola/medium/it_IT-paola-medium.onnx',
};

/** Fichiers du moteur (préchargés au téléchargement pour être dans le cache du navigateur). */
const ENGINE_FILES = [
  `${ORT_BASE}esm/ort.wasm.min.js`,
  `${ORT_BASE}ort-wasm-simd.wasm`,
  `${PIPER_BASE}piper-o91UDS6e.js`,
  `${PHONEMIZE}.wasm`,
  `${PHONEMIZE}.data`,
];

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

/** Le moteur a été téléchargé une fois. */
export function engineReady(): boolean {
  try {
    return localStorage.getItem(ENGINE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Précharge le moteur (≈ 30 Mo) : ensuite le navigateur le garde dans son cache. */
export async function downloadEngine(onBytes: OnBytes): Promise<void> {
  // En parallèle ; chaque fichier annonce sa taille (le gestionnaire additionne).
  await Promise.all(ENGINE_FILES.map((url) => fetchWithProgress(url, onBytes)));
  try {
    localStorage.setItem(ENGINE_KEY, '1');
  } catch {
    // Stockage indisponible : on retéléchargera au besoin.
  }
}

/** La voix est dans le cache du navigateur. */
export async function voiceStored(voiceId: string): Promise<boolean> {
  try {
    const cache = await caches.open(CACHE);
    const found = await Promise.all(voiceUrls(voiceId).map((u) => cache.match(u)));
    return found.every(Boolean);
  } catch {
    return false;
  }
}

/** Télécharge une voix et la range dans le cache du navigateur. */
export async function downloadVoice(voiceId: string, onBytes: OnBytes): Promise<void> {
  try {
    await navigator.storage?.persist?.();
  } catch {
    // Stockage non persistant : le navigateur pourra effacer la voix s'il manque de place.
  }
  const cache = await caches.open(CACHE);
  for (const url of voiceUrls(voiceId)) {
    if (await cache.match(url)) continue;
    const blob = await fetchWithProgress(url, onBytes);
    await cache.put(url, new Response(blob, { headers: { 'content-type': blob.type } }));
  }
}

export async function removeVoices(): Promise<void> {
  try {
    await caches.delete(CACHE);
    localStorage.removeItem(ENGINE_KEY);
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
  ortPromise ??= import(/* @vite-ignore */ `${ORT_BASE}esm/ort.wasm.min.js`).then((m) => {
    const lib = (m.default ?? m) as OrtLike;
    lib.env.wasm.wasmPaths = ORT_BASE;
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
  phonemizer ??= import(/* @vite-ignore */ `${PIPER_BASE}piper-o91UDS6e.js`).then((m) => m.createPiperPhonemize({
    print: (line: string) => onPrint?.(line),
    printErr: () => undefined,
    locateFile: (file: string) => (file.endsWith('.wasm') ? `${PHONEMIZE}.wasm` : file.endsWith('.data') ? `${PHONEMIZE}.data` : file),
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
      const cache = await caches.open(CACHE);
      const [modelUrl, configUrl] = voiceUrls(voiceId);
      const [model, config] = await Promise.all([cache.match(modelUrl), cache.match(configUrl)]);
      if (!model || !config) throw new Error('Voix pas encore téléchargée');
      const lib = await ort();
      const session = await lib.InferenceSession.create(new Uint8Array(await model.arrayBuffer()), { executionProviders: ['wasm'] });
      return { session, config: (await config.json()) as PiperConfig };
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
