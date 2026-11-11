import { loadVoice, speech } from './piper';

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
  const key = `${voiceId}|${slow}|${text}`;
  let p = rendered.get(key);
  if (p) {
    // Plus récent : on le remet à la fin (le plus ancien part en premier).
    rendered.delete(key);
    rendered.set(key, p);
    return p;
  }
  // Calculée dans un worker (voix aiguë et pauses comprises) : le jeu reste fluide pendant ce temps.
  p = speech(voiceId, text, slow).then(({ pcm: samples, sampleRate }) => {
    const buffer = c.createBuffer(1, Math.max(1, samples.length), sampleRate);
    buffer.getChannelData(0).set(samples);
    return buffer;
  });
  p.catch(() => rendered.delete(key));
  rendered.set(key, p);
  while (rendered.size > MAX_CACHED) rendered.delete(rendered.keys().next().value!);
  return p;
}

/** Joue un son ; renvoie de quoi l'arrêter et une promesse de fin. */
export function play(buffer: AudioBuffer): { stop: () => void; ended: Promise<void> } {
  const c = audioContext()!;
  const src = c.createBufferSource();
  src.buffer = buffer;
  src.connect(c.destination);
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
