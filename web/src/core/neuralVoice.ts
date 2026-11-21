import { loadVoice, speech } from './piper';
import type { VoiceTune } from './piperEngine';

/**
 * Lecture des voix neuronales (Piper) : un seul AudioContext, débloqué au
 * premier toucher, et un cache des phrases déjà calculées (le dino répète
 * souvent les mêmes consignes et les mêmes bravos).
 */


import type { Lang } from '../domain/langs';

const voices: Partial<Record<Lang, string>> = {};

/** Active (ou retire) une voix neuronale pour une langue des répliques. */
export function setNeuralVoice(lang: Lang, voiceId: string | undefined) {
  if (voiceId) {
    voices[lang] = voiceId;
    // On la prépare tout de suite (voix et prononciation) : la première phrase n'attendra pas le chargement.
    void loadVoice(voiceId).then(() => speech(voiceId, 'OK.')).catch(() => {
      if (voices[lang] === voiceId) delete voices[lang];
    });
  } else {
    delete voices[lang];
  }
}

/** Vitesse et aigus de la voix, réglés par les parents (commun à tous les enfants de l'appareil). */
export const TUNE_RANGE = { speed: { min: 0.7, max: 1.4 }, pitch: { min: 0.7, max: 1.3 } };
const TUNE_KEY = 'dinolearn.voiceTune.v1';
const clamp = (v: unknown, r: { min: number; max: number }) => {
  const n = typeof v === 'number' && isFinite(v) ? v : 1;
  return Math.round(Math.min(r.max, Math.max(r.min, n)) * 20) / 20;
};
let tune: VoiceTune | undefined;
export function voiceTune(): VoiceTune {
  if (!tune) {
    let saved: Partial<VoiceTune> = {};
    try { saved = JSON.parse(localStorage.getItem(TUNE_KEY) ?? '{}'); } catch { /* réglage d'origine */ }
    tune = { speed: clamp(saved.speed, TUNE_RANGE.speed), pitch: clamp(saved.pitch, TUNE_RANGE.pitch) };
  }
  return tune;
}
export function setVoiceTune(next: Partial<VoiceTune>) {
  const cur = voiceTune();
  tune = { speed: clamp(next.speed ?? cur.speed, TUNE_RANGE.speed), pitch: clamp(next.pitch ?? cur.pitch, TUNE_RANGE.pitch) };
  try { localStorage.setItem(TUNE_KEY, JSON.stringify(tune)); } catch { /* pas de stockage : valable jusqu'à la fermeture */ }
}

export const neuralVoiceFor = (lang: Lang) => voices[lang];

let ctx: AudioContext | undefined;
type AudioContextClass = typeof AudioContext;
export function audioContext(): AudioContext | undefined {
  if (!ctx) {
    const Ctx = window.AudioContext
      ?? (window as unknown as { webkitAudioContext?: AudioContextClass }).webkitAudioContext;
    if (!Ctx) return undefined;
    ctx = new Ctx();
  }
  return ctx;
}

/** À appeler pendant un toucher (iOS n'autorise le son qu'ainsi). */
export function unlockAudio() {
  const c = audioContext();
  if (c && c.state === 'suspended') void c.resume();
}

const MAX_CACHED = 200;
const rendered = new Map<string, Promise<AudioBuffer>>();

/** Le son d'une phrase (calculé une fois, puis gardé). */
export function render(lang: Lang, text: string, slow = false): Promise<AudioBuffer> | undefined {
  const voiceId = voices[lang];
  const c = audioContext();
  if (!voiceId || !c) return undefined;
  const tune = voiceTune();
  const key = `${voiceId}|${slow}|${tune.speed}|${tune.pitch}|${text}`;
  let p = rendered.get(key);
  if (p) {
    // Plus récent : on le remet à la fin (le plus ancien part en premier).
    rendered.delete(key);
    rendered.set(key, p);
    return p;
  }
  // Calculée dans un worker (voix aiguë et pauses comprises) : le jeu reste fluide pendant ce temps.
  p = speech(voiceId, text, slow, tune).then(({ pcm: samples, sampleRate }) => {
    const buffer = c.createBuffer(1, Math.max(1, samples.length), sampleRate);
    buffer.getChannelData(0).set(normalize(samples));
    return buffer;
  });
  p.catch(() => rendered.delete(key));
  rendered.set(key, p);
  while (rendered.size > MAX_CACHED) rendered.delete(rendered.keys().next().value!);
  return p;
}

/**
 * Les voix Piper sortent faibles (le plus fort passage reste souvent sous la moitié de l'échelle) : sur iPhone,
 * même avec le volume à fond, on les entendait à peine. On amène le plus fort passage tout près du maximum.
 */
const PEAK = 0.97;
const MAX_BOOST = 6;
export function normalize(samples: Float32Array): Float32Array {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const v = Math.abs(samples[i]);
    if (v > peak) peak = v;
  }
  if (peak < 0.001) return samples;
  const gain = Math.min(MAX_BOOST, PEAK / peak);
  if (Math.abs(gain - 1) < 0.02) return samples;
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) out[i] = samples[i] * gain;
  return out;
}

/**
 * Sortie commune des voix et des cris : un compresseur serre les écarts de volume (les voyelles fortes ne
 * saturent plus), puis un gain rend le tout nettement plus fort, sans craquer.
 */
let output: AudioNode | undefined;
let outputCtx: AudioContext | undefined;
function destination(c: AudioContext): AudioNode {
  if (output && outputCtx === c) return output;
  const compressor = c.createDynamicsCompressor();
  compressor.threshold.value = -20;
  compressor.knee.value = 12;
  compressor.ratio.value = 6;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.2;
  const makeup = c.createGain();
  makeup.gain.value = 2;
  compressor.connect(makeup).connect(c.destination);
  output = compressor;
  outputCtx = c;
  return output;
}

/** Joue un son ; renvoie de quoi l'arrêter et une promesse de fin. */
export function play(buffer: AudioBuffer): { stop: () => void; ended: Promise<void> } {
  const c = audioContext()!;
  const src = c.createBufferSource();
  src.buffer = buffer;
  src.connect(destination(c));
  let resolveEnd: () => void = () => undefined;
  const ended = new Promise<void>((resolve) => { resolveEnd = resolve; });
  src.onended = () => resolveEnd();
  src.start();
  return {
    stop: () => {
      try {
        src.stop();
      } catch {
        // déjà arrêté
      }
      resolveEnd();
    },
    ended,
  };
}

/** Cris d'animaux enregistrés (`public/sfx/animals/<animal>.mp3`), chargés une fois. */
const cries = new Map<string, Promise<AudioBuffer>>();
export function animalCry(animal: string): Promise<AudioBuffer> | undefined {
  const c = audioContext();
  if (!c) return undefined;
  let p = cries.get(animal);
  if (!p) {
    p = fetch(new URL(`sfx/animals/${animal}.mp3`, document.baseURI).href)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((data) => c.decodeAudioData(data));
    p.catch(() => cries.delete(animal));
    cries.set(animal, p);
  }
  return p;
}
