import { pitchShift } from './pitch';
import { loadVoice, synthesize } from './piper';
import { spokenSegments } from '../domain/sayable';

/**
 * Lecture des voix neuronales (Piper) : un seul AudioContext, débloqué au
 * premier toucher, et un cache des phrases déjà calculées (le dino répète
 * souvent les mêmes consignes et les mêmes bravos).
 */

/** Voix du dino plus aiguë, à la même vitesse (choisie à l'écoute : 1,40), en français comme en anglais. */
export const DINO_PITCH = 1.4;

import type { Lang } from '../domain/langs';

const voices: Partial<Record<Lang, string>> = {};

/** Active (ou retire) une voix neuronale pour une langue des répliques. */
export function setNeuralVoice(lang: Lang, voiceId: string | undefined) {
  if (voiceId) {
    voices[lang] = voiceId;
    // On la prépare tout de suite (voix et prononciation) : la première phrase n'attendra pas le chargement.
    void loadVoice(voiceId).then(() => synthesize(voiceId, 'OK.')).catch(() => {
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
  p = synthesizeWithPauses(voiceId, text, slow).then(({ pcm, sampleRate }) => {
    // Le dino garde sa voix aiguë dans les deux langues (mots anglais compris).
    const samples = pitchShift(pcm, sampleRate, DINO_PITCH);
    const buffer = c.createBuffer(1, Math.max(1, samples.length), sampleRate);
    buffer.getChannelData(0).set(samples);
    return buffer;
  });
  p.catch(() => rendered.delete(key));
  rendered.set(key, p);
  while (rendered.size > MAX_CACHED) rendered.delete(rendered.keys().next().value!);
  return p;
}

/**
 * Une réplique morceau par morceau (fins de phrase, « … ») avec de vrais
 * silences entre eux, et les onomatopées réécrites pour être dites comme des sons.
 */
async function synthesizeWithPauses(voiceId: string, text: string, slow: boolean): Promise<{ pcm: Float32Array; sampleRate: number }> {
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
  return { pcm, sampleRate };
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
