import { describe, expect, it } from 'vitest';
import { pitchShift } from '../src/core/pitch';
import {
  LANGUAGES, SIZES_MB, asrLanguages, formatRemaining, packChoices, remainingSeconds, secondLanguage, throughput,
} from '../src/domain/packs';
import { LANGS, VOICE_URLS, deviceCountry, deviceLang } from '../src/domain/langs';

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
  it('en français : voix du dino, voix anglaise, reconnaissance française et anglaise', () => {
    const choices = packChoices('fr', true);
    expect(choices.map((c) => c.id)).toEqual(['speech', 'second', 'asr']);
    expect(choices[0].sizeMb).toBeCloseTo(SIZES_MB.voices['fr_FR-upmc-medium']);
    expect(choices[1].sizeMb).toBeCloseTo(SIZES_MB.voices['en_GB-alba-medium']);
    expect(choices[2].sizeMb).toBeCloseTo(SIZES_MB.asr.fr + SIZES_MB.asr.en);
    // Sans la langue apprise en plus : la reconnaissance ne prend que le français.
    expect(packChoices('fr', false)[2].sizeMb).toBeCloseTo(SIZES_MB.asr.fr);
    expect(LANGUAGES.find((l) => l.code === 'fr')?.voice).toBe('fr_FR-upmc-medium');
  });

  it('langue apprise en plus : l\'anglais, ou l\'espagnol pour les anglophones', () => {
    expect(secondLanguage('fr')).toBe('en');
    expect(secondLanguage('zh')).toBe('en');
    expect(secondLanguage('en')).toBe('es');
    expect(asrLanguages('en', true)).toEqual(['en', 'es']);
  });

  it('sans reconnaissance vocale (arabe, ourdou, bengali) : pas de pack de reconnaissance', () => {
    for (const code of ['ar', 'ur', 'bn']) {
      expect(packChoices(code, true).map((c) => c.id)).toEqual(['speech', 'second']);
      expect(asrLanguages(code, true)).toEqual([]);
    }
  });

  it('chaque langue a sa voix (adresse et taille), et la langue de l\'appareil est reconnue', () => {
    for (const l of LANGS) {
      expect(VOICE_URLS[l.voice], l.code).toMatch(/^https:\/\/huggingface\.co\//);
      expect(SIZES_MB.voices[l.voice], l.code).toBeGreaterThan(30);
    }
    expect(deviceLang(['pt-BR', 'en-US'])).toBe('pt');
    expect(deviceLang(['ja-JP'])).toBe('fr');
    expect(deviceCountry(['pt-BR'])).toBe('br');
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

describe('répliques pour la voix neuronale', async () => {
  const { respell, spokenSegments } = await import('../src/domain/sayable');
  it('les onomatopées sont réécrites pour être dites comme des sons', () => {
    expect(respell('Qui fait bzzz, et fabrique du miel ?')).toBe('Qui fait beuzzz, et fabrique du miel ?');
    expect(respell('Chut… je dors. Zzz… À demain !')).toBe('Chut… je dors. rron, rron… À demain !');
    expect(respell('Qui fait sss ?')).toBe('Qui fait sssi ?');
    expect(respell('Psst ! C\'est celle qui brille !')).toBe('pssit ! C\'est celle qui brille !');
    expect(respell('Hmm, regarde bien…')).toBe('Hmm, regarde bien…');
    expect(respell('Hmmm, c\'est bon !')).toBe('hmm, c\'est bon !');
    expect(respell('Mmmh… ces fruits')).toBe('mmmeu… ces fruits');
    expect(respell('Grrr… c\'est mon ventre')).toBe('greuh… c\'est mon ventre');
    expect(respell('Hihi ! Hihihi !')).toBe('hi hi ! hi hi hi !');
    expect(respell('Qui fait hi-han ?')).toBe('Qui fait hi han ?');
    expect(respell('Qui fait hiiii, et galope ?')).toBe('Qui fait hi hi hi, et galope ?');
    // Les vrais mots ne bougent pas.
    expect(respell('Miam miam ! Coin coin, cocorico, ouaf ouaf, meuh, hibou, Hugo')).toBe('Miam miam ! Coin coin, cocorico, ouaf ouaf, meuh, hibou, Hugo');
  });

  it('un vrai silence après les « … » et les fins de phrase', () => {
    expect(spokenSegments('Chut… je dors. Zzz… À demain !')).toEqual([
      { text: 'Chut…', pauseMs: 450 },
      { text: 'je dors.', pauseMs: 300 },
      { text: 'rron, rron…', pauseMs: 450 },
      { text: 'À demain !', pauseMs: 0 },
    ]);
    expect(spokenSegments('Coucou Léa')).toEqual([{ text: 'Coucou Léa', pauseMs: 0 }]);
    expect(spokenSegments('Bravo ! Tu as trouvé...')).toEqual([{ text: 'Bravo !', pauseMs: 300 }, { text: 'Tu as trouvé…', pauseMs: 0 }]);
  });
});

describe('packs de reconnaissance préparés au déploiement', () => {
  it('scripts/voice-packs.mjs prépare exactement les modèles de langs.ts', async () => {
    const { readFileSync } = await import('node:fs');
    const script = readFileSync(new URL('../scripts/voice-packs.mjs', import.meta.url), 'utf8');
    const listed = [...script.matchAll(/\{ lang: '(\w+)', model: '([\w.-]+)' \}/g)].map((m) => `${m[1]}:${m[2]}`).sort();
    const expected = LANGS.filter((l) => l.asr).map((l) => `${l.code}:${l.asr!.model}`).sort();
    expect(listed).toEqual(expected);
  });
});
