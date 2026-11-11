import { ZZFX, zzfx } from 'zzfx';

/**
 * Petits effets sonores. Les bruits du dino (manger, gober une mouche, coup de
 * langue) sont de vrais enregistrements (`public/sfx/`, CC0) ;
 * les autres sont générés par ZzFX (https://killedbyapixel.github.io/ZzFX/),
 * qui sert aussi de secours tant qu'un enregistrement n'est pas chargé.
 */
const SOUNDS = {
  pop: [1.2, , 520, 0.01, 0.02, 0.06, 1, 1.6, , , 300, 0.04],
  correct: [1.1, , 640, 0.02, 0.12, 0.24, 1, 1.8, , , 420, 0.07, , , , , , 0.8],
  wrong: [0.7, , 180, 0.02, 0.08, 0.14, 2, 0.6, -4, , , , , , , , , 0.6],
  star: [1, , 990, 0.02, 0.1, 0.3, , 1.9, , , 620, 0.06, 0.05],
  chomp: [1.4, , 120, 0.01, 0.03, 0.06, 4, 2.4, , , , , , 0.5, , 0.2],
  levelUp: [1.2, , 420, 0.03, 0.3, 0.5, , 1.4, , , 260, 0.08, 0.09, , , , , 0.9],
  boing: [1, , 260, 0.02, 0.1, 0.2, , 1.2, 8, , , , , , , , , 0.7],
  roar: [1.3, , 90, 0.05, 0.25, 0.35, 3, 2.2, , , , , 0.06, 0.6, , 0.2, , 0.6],
  squawk: [0.9, , 700, 0.01, 0.06, 0.12, 2, 1.6, -18, , , , , 0.3, , , , 0.5],
  crack: [1.3, , 380, , 0.01, 0.07, 4, 2.6, , , , , , 1.4, , 0.4, , 0.7],
  hatch: [1.3, , 300, 0.01, 0.2, 0.3, 4, 2, , , 500, 0.1, , 1, , 0.2, 0.05, 0.7],
  rumble: [1.2, , 50, 0.08, 0.5, 0.4, 3, 0.8, , , , , 0.1, 1.2, , 0.1, , 0.6],
  slurp: [1, , 220, 0.01, 0.06, 0.1, , 1.4, 40, , , , , , , , , 0.6],
  whoosh: [0.5, , 900, 0.2, 0.3, 0.5, 4, 0, -2, , , , , 1.8, , , , 0.4],
  gulp: [1.4, , 120, 0.01, 0.03, 0.06, 4, 2.4, , , , , , 0.5, , 0.2],
} satisfies Record<string, (number | undefined)[]>;

export type SoundName = keyof typeof SOUNDS;

/** Enregistrements (une variante au hasard à chaque fois). */
const SAMPLES: Partial<Record<SoundName, string[]>> = {
  chomp: ['crunch-1', 'crunch-2', 'crunch-3'],
  gulp: ['gulp-1', 'gulp-2'],
  slurp: ['slurp-1'],
};
const buffers = new Map<string, AudioBuffer>();
let loading = false;

/** Charge les enregistrements (au premier geste, quand l'audio est débloqué). */
function loadSamples() {
  if (loading) return;
  loading = true;
  const ctx = ZZFX.audioContext;
  for (const file of new Set(Object.values(SAMPLES).flat())) {
    fetch(new URL(`sfx/${file}.mp3`, document.baseURI).href)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((data) => ctx.decodeAudioData(data))
      .then((buf) => buffers.set(file, buf))
      .catch(() => undefined);
  }
}

function playSample(name: SoundName): boolean {
  const files = SAMPLES[name]?.filter((f) => buffers.has(f));
  if (!files?.length) return false;
  const ctx = ZZFX.audioContext;
  const src = ctx.createBufferSource();
  src.buffer = buffers.get(files[Math.floor(Math.random() * files.length)])!;
  const gain = ctx.createGain();
  gain.gain.value = 0.9;
  src.connect(gain).connect(ctx.destination);
  src.start();
  return true;
}

// Dry, irregular shell fractures, with a different cluster of tiny impacts each time.
function playShell(hatching: boolean) {
  const ctx = ZZFX.audioContext;
  const duration = hatching ? .65 : .24 + Math.random() * .12;
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
  const samples = buffer.getChannelData(0);
  const impacts = hatching ? 18 : 5 + Math.floor(Math.random() * 5);
  for (let hit = 0; hit < impacts; hit++) {
    const start = Math.floor(Math.random() * duration * .75 * ctx.sampleRate);
    const length = Math.floor((.008 + Math.random() * .025) * ctx.sampleRate);
    let previous = 0;
    for (let i = 0; i < length && start + i < samples.length; i++) {
      const noise = Math.random() * 2 - 1;
      const dry = noise - previous * .7;
      previous = noise;
      samples[start + i] += dry * Math.exp(-i / (length * .18)) * .22;
    }
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 650;
  const gain = ctx.createGain();
  gain.gain.value = .55;
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
  source.start();
}

/**
 * Ventre qui gargouille : des « glouglous » graves et ronds (bruit filtré très grave, qui
 * monte et descend par petites bulles), doux pour les oreilles, jamais deux fois pareils.
 */
function playRumble() {
  const ctx = ZZFX.audioContext;
  const duration = 1.3;
  const rate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, Math.ceil(rate * duration), rate);
  const out = buffer.getChannelData(0);
  // Bruit brun (très grave) comme fond de « gargouillis ».
  let brown = 0;
  for (let i = 0; i < out.length; i++) {
    brown = (brown + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    out[i] = brown * 3;
  }
  // Des bulles : petits « blop » qui montent en hauteur, à des moments au hasard.
  const bubbles = 5 + Math.floor(Math.random() * 4);
  for (let b = 0; b < bubbles; b++) {
    const start = Math.floor((0.05 + Math.random() * 0.85) * duration * rate);
    const length = Math.floor((0.06 + Math.random() * 0.12) * rate);
    const f0 = 70 + Math.random() * 60;
    let phase = 0;
    for (let i = 0; i < length && start + i < out.length; i++) {
      const t = i / length;
      phase += (2 * Math.PI * f0 * (1 + 0.9 * t)) / rate;
      out[start + i] += Math.sin(phase) * Math.sin(Math.PI * t) * 0.5;
    }
  }
  // Fondu d'entrée et de sortie.
  for (let i = 0; i < out.length; i++) {
    const t = i / out.length;
    out[i] *= Math.min(1, t * 8, (1 - t) * 5);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 420;
  const gain = ctx.createGain();
  gain.gain.value = 0.9;
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
  source.start();
}

export const Sfx = {
  /** Coupé depuis l'espace parents. */
  enabled: true,
  play(name: SoundName) {
    if (!Sfx.enabled) return;
    try {
      if (name === 'crack' || name === 'hatch') playShell(name === 'hatch');
      else if (name === 'rumble') playRumble();
      else if (!playSample(name)) zzfx(...SOUNDS[name]);
    } catch {
      // Audio indisponible.
    }
  },
  /** À appeler lors du premier geste (politique d'autoplay des navigateurs). */
  unlock() {
    try {
      ZZFX.volume = 0.35;
      void ZZFX.audioContext.resume();
      loadSamples();
    } catch {
      // ignoré
    }
  },
};
