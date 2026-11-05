import { describe, expect, it } from 'vitest';
import { pitchShift } from '../src/core/pitch';
import {
  ENGLISH_VOICE, LANGUAGES, SIZES_MB, asrLanguages, englishGamesAllowed, formatRemaining, packChoices, remainingSeconds, throughput,
} from '../src/domain/packs';

const freq = (y: Float32Array, sr: number, a: number, b: number) => {
  let z = 0;
  for (let i = a + 1; i < b; i++) if (y[i - 1] < 0 && y[i] >= 0) z++;
  return z / ((b - a) / sr);
};

describe('voix du dino plus aiguë', () => {
  it('monte la hauteur de 40 % sans changer la durée', () => {
    const sr = 22050;
    const x = Float32Array.from({ length: sr * 2 }, (_, i) => 0.5 * Math.sin((2 * Math.PI * 200 * i) / sr));
    const y = pitchShift(x, sr, 1.4);
    expect(Math.abs(y.length - x.length) / x.length).toBeLessThan(0.03);
    expect(freq(y, sr, 2000, 30000)).toBeGreaterThan(270);
    expect(freq(y, sr, 2000, 30000)).toBeLessThan(290);
    expect(pitchShift(x, sr, 1)).toBe(x);
  });
});

describe('téléchargements', () => {
  it('en français : voix du dino (moteur + UPMC), voix anglaise, reconnaissance française et anglaise', () => {
    const choices = packChoices('fr', true);
    expect(choices.map((c) => c.id)).toEqual(['speech', 'english', 'asr']);
    expect(choices[0].sizeMb).toBeCloseTo(SIZES_MB.engine + SIZES_MB.voices['fr_FR-upmc-medium']);
    expect(choices[1].sizeMb).toBeCloseTo(SIZES_MB.voices[ENGLISH_VOICE]);
    expect(choices[2].sizeMb).toBeCloseTo(SIZES_MB.asr.fr + SIZES_MB.asr.en);
    // Sans la voix anglaise : la reconnaissance ne prend que le français.
    expect(packChoices('fr', false)[2].sizeMb).toBeCloseTo(SIZES_MB.asr.fr);
    // Moteur déjà là : la voix seule.
    expect(packChoices('fr', true, true)[0].sizeMb).toBeCloseTo(SIZES_MB.voices['fr_FR-upmc-medium']);
    expect(LANGUAGES.find((l) => l.code === 'fr')?.voice).toBe('fr_FR-upmc-medium');
  });

  it('en anglais : pas de pack anglais, et pas de jeux d\'anglais', () => {
    expect(packChoices('en', true).map((c) => c.id)).toEqual(['speech', 'asr']);
    expect(asrLanguages('en', true)).toEqual(['en']);
    expect(englishGamesAllowed('en')).toBe(false);
    expect(englishGamesAllowed('fr')).toBe(true);
    // Langue sans reconnaissance vocale : pas de pack de reconnaissance.
    expect(packChoices('de', true).map((c) => c.id)).toEqual(['speech', 'english']);
  });

  it('temps restant : débit lissé et texte lisible', () => {
    const samples = [0, 1, 2, 3, 4].map((s) => ({ at: s * 1000, bytes: s * 2e6 }));
    expect(throughput(samples)).toBeCloseTo(2e6);
    expect(remainingSeconds(10e6, 130e6, 2e6)).toBe(60);
    expect(remainingSeconds(0, 100, 0)).toBeUndefined();
    expect(formatRemaining(undefined)).toBe('calcul du temps restant…');
    expect(formatRemaining(3)).toBe('quelques secondes');
    expect(formatRemaining(42)).toBe('≈ 40 s');
    expect(formatRemaining(150)).toBe('≈ 2 min 30 s');
    expect(formatRemaining(3700)).toBe('≈ 1 h 01');
  });
});
