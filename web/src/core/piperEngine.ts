import { store } from './voiceStore';
import { pitchShift } from './pitch';
import { spokenSegments } from '../domain/sayable';
import { VOICE_URLS } from '../domain/langs';

/**
 * Calcul de la voix Piper (prononciation espeak-ng + réseau onnxruntime, en WebAssembly).
 * Tourne dans un worker (voir piperWorker.ts) : le chargement d'une voix (~60 Mo) et le
 * calcul de chaque phrase ne bloquent plus l'animation du jeu.
 */

/** Dossier du jeu (la page le donne au worker, qui ne le connaît pas). */
let base = '';
export function setEngineBase(url: string) { base = url; }
const engineFile = (name: string) => new URL(`piper/${name}`, base).href;

/** Voix du dino plus aiguë, à la même vitesse (choisie à l'écoute : 1,40), en français comme en anglais. */
export const DINO_PITCH = 1.4;

const voiceUrls = (voiceId: string) => {
  const b = VOICE_URLS[voiceId];
  if (!b) throw new Error(`Voix inconnue : ${voiceId}`);
  return [`${b}.onnx`, `${b}.onnx.json`];
};

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

/** Calcule un morceau de phrase : le son (−1 à 1) et sa fréquence d'échantillonnage. `slow` : débit ralenti (× durée). */
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

/**
 * Une réplique entière, prête à jouer : morceau par morceau (fins de phrase, « … ») avec de
 * vrais silences entre eux, puis rendue plus aiguë (voix du dino).
 */
export async function speech(voiceId: string, text: string, slow: boolean): Promise<{ pcm: Float32Array; sampleRate: number }> {
  const pieces: Float32Array[] = [];
  let sampleRate = 22050;
  for (const segment of spokenSegments(text)) {
    const out = await synthesize(voiceId, segment.text, (segment.slow ?? 1) * (slow ? 1.2 : 1));
    sampleRate = out.sampleRate;
    pieces.push(out.pcm, new Float32Array(Math.round((segment.pauseMs / 1000) * sampleRate)));
  }
  const pcm = new Float32Array(pieces.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of pieces) { pcm.set(p, at); at += p.length; }
  return { pcm: pitchShift(pcm, sampleRate, DINO_PITCH), sampleRate };
}
