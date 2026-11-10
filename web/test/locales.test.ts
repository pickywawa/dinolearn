import { describe, expect, it } from 'vitest';
import { LANGS } from '../src/domain/langs';
import type { Catalog } from '../src/i18n';

import ar from '../src/i18n/locales/ar';
import bn from '../src/i18n/locales/bn';
import de from '../src/i18n/locales/de';
import en from '../src/i18n/locales/en';
import es from '../src/i18n/locales/es';
import hi from '../src/i18n/locales/hi';
import id from '../src/i18n/locales/id';
import it_ from '../src/i18n/locales/it';
import pt from '../src/i18n/locales/pt';
import ru from '../src/i18n/locales/ru';
import ur from '../src/i18n/locales/ur';
import zh from '../src/i18n/locales/zh';
import vi from '../src/i18n/locales/vi';
import tr from '../src/i18n/locales/tr';
import fa from '../src/i18n/locales/fa';
import pl from '../src/i18n/locales/pl';
import uk from '../src/i18n/locales/uk';
import ko from '../src/i18n/locales/ko';
import ne from '../src/i18n/locales/ne';

// Liste écrite à la main (le cache de vitest ne voit pas les fichiers ajoutés à un import.meta.glob).
const CATALOGS: Record<string, Catalog> = { ar, bn, de, en, es, fa, hi, id, it: it_, ko, ne, pl, pt, ru, tr, uk, ur, vi, zh };
const catalogOf = (code: string): Catalog | undefined => CATALOGS[code];
const params = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const texts = (entry: string | string[]) => (Array.isArray(entry) ? entry : [entry]);

describe('catalogues de traduction', () => {
  for (const { code } of LANGS.filter((l) => l.code !== 'fr')) {
    it(`${code} : toutes les clés de l'anglais, sans texte vide ni paramètre inconnu`, () => {
      const catalog = catalogOf(code);
      expect(catalog, `locales/${code}.ts`).toBeDefined();
      // Les nombres prononcés ne servent qu'aux langues avec reconnaissance vocale.
      const asr = LANGS.find((l) => l.code === code)!.asr;
      // Les noms de pays « dans une phrase » (cty.name.*) ne servent qu'aux langues qui en ont besoin.
      const missing = Object.keys(en).filter((k) => catalog![k] === undefined && (asr || !k.startsWith('num.')) && !k.startsWith('cty.name.'));
      expect(missing).toEqual([]);
      for (const [key, entry] of Object.entries(catalog!)) {
        if (!key.startsWith('cty.name.')) expect(en[key], `${code} : clé inconnue ${key}`).toBeDefined();
        if (!en[key]) continue;
        const allowed = new Set([...texts(en[key]).flatMap(params), ...(key.startsWith('time.') ? ['h', 'next', 'm', 'mm'] : [])]);
        // L'anglais apprend l'espagnol : les autres langues écrivent « anglais » en toutes lettres.
        for (const text of texts(entry)) {
          expect(text.trim(), `${code} : ${key} vide`).not.toBe('');
          for (const p of params(text)) expect(allowed.has(p), `${code} : ${key} utilise {${p}}`).toBe(true);
        }
      }
    });
  }
});

describe('mots des images', () => {
  for (const [code, catalog] of Object.entries(CATALOGS)) {
    it(`${code} : deux images n'ont jamais le même mot`, () => {
      const seen = new Map<string, string>();
      const doubles: string[] = [];
      for (const [key, value] of Object.entries(catalog)) {
        if (!key.startsWith('c.')) continue;
        const word = String(value).toLowerCase();
        if (seen.has(word)) doubles.push(`${seen.get(word)} = ${key} (${word})`);
        else seen.set(word, key);
      }
      expect(doubles).toEqual([]);
    });
  }
});

describe('jeux proposés selon la langue', () => {
  it('sans reconnaissance vocale (arabe, ourdou, bengali), pas de jeux à voix haute', async () => {
    const { GAMES, inLanguage } = await import('../src/content/games');
    const voiceGames = GAMES.filter((g) => g.voice !== undefined).map((g) => g.id);
    expect(voiceGames.length).toBeGreaterThan(0);
    for (const code of ['ar', 'ur', 'bn'] as const) {
      expect(GAMES.filter((g) => inLanguage(g, code) && g.voice !== undefined)).toEqual([]);
    }
    for (const code of ['en', 'es', 'zh', 'hi'] as const) {
      expect(GAMES.filter((g) => inLanguage(g, code) && g.voice !== undefined).map((g) => g.id)).toEqual(['VO-1', 'VO-2', 'VO-13']);
    }
  });
  it('les jeux de lettres latines ne sont proposés qu’en alphabet latin', async () => {
    const { GAMES, inLanguage } = await import('../src/content/games');
    const tr2 = GAMES.find((g) => g.id === 'TR-2')!;
    expect(inLanguage(tr2, 'de')).toBe(true);
    // Les autres écritures ont leurs propres modèles.
    for (const code of ['ru', 'zh', 'ar', 'ur', 'hi', 'bn', 'uk', 'fa', 'vi', 'tr', 'pl'] as const) expect(inLanguage(tr2, code), code).toBe(true);
  });
});

describe('mon pays, dans toutes les langues', () => {
  it('chaque pays a des questions bien remplies, sans texte vide ni paramètre oublié', async () => {
    const { setLang } = await import('../src/i18n');
    const { gameById } = await import('../src/content/games');
    const { COUNTRIES, setCountry } = await import('../src/content/countries');
    const { mulberry32 } = await import('../src/domain/models');
    const { existsSync } = await import('node:fs');
    const game = gameById('MO-6');
    for (const { code: language } of LANGS) {
      await setLang(language);
      for (const country of COUNTRIES) {
        setCountry(country.code);
        expect(game.questions.length, `${language} ${country.code}`).toBeGreaterThanOrEqual(8);
        for (const ref of game.questions) {
          const q = game.build(ref, ref.level, mulberry32(3));
          const ids = [q.answer, ...q.distractors].map((c) => c.id);
          expect(new Set(ids).size, `${language} ${ref.id}`).toBe(ids.length);
          for (const c of [q.answer, ...q.distractors]) {
            if (c.image) expect(existsSync(`public/img/${c.image}.svg`), `${ref.id} ${c.image}`).toBe(true);
          }
          for (const s of [...q.prompt, ...q.reinforce, ...(q.hints ?? [])]) {
            expect(s.text.trim(), `${language} ${ref.id}`).not.toBe('');
            expect(s.text, `${language} ${ref.id}`).not.toMatch(/\{\w+\}|undefined/);
            if (language !== 'fr') expect(s.lang, `${language} ${ref.id}`).toBe(language);
            expect(s.text, `${language} ${ref.id} : clé non traduite`).not.toMatch(/\b(cty|g)\.\w+/);
            if (language === 'ar') expect(s.text, ref.id).toMatch(/[\u0600-\u06FF]/);
            if (language === 'zh') expect(s.text, ref.id).toMatch(/[\u4E00-\u9FFF]/);
          }
        }
      }
    }
    await setLang('fr');
    setCountry('fr');
  });
});

describe('monnaies', () => {
  it('chaque pays a une monnaie connue, et le jeu de l’argent marche à tous les niveaux', async () => {
    const { COUNTRIES, setCountry } = await import('../src/content/countries');
    const { CURRENCIES } = await import('../src/domain/currencies');
    const { gameById } = await import('../src/content/games');
    const { mulberry32 } = await import('../src/domain/models');
    const { setLang } = await import('../src/i18n');
    await setLang('en');
    const game = gameById('LO-9');
    for (const country of COUNTRIES) {
      expect(country.currency, country.code).toBeDefined();
      const code = country.currency![2];
      expect(CURRENCIES[code], code).toBeDefined();
      setCountry(country.code);
      for (let level = 1; level <= 20; level++) {
        const q = game.build({ id: `LO-9:${level}:0`, level }, level, mulberry32(level));
        const totals = [q.answer, ...q.distractors].map((c) => c.id);
        expect(new Set(totals).size, `${code} ${level}`).toBe(totals.length);
        expect(q.distractors.length, `${code} ${level}`).toBeGreaterThanOrEqual(2);
        for (const c of [q.answer, ...q.distractors]) {
          expect(c.money, `${code} ${level} ${JSON.stringify(c)}`).toBeDefined();
          const sum = c.money!.reduce((a, b) => a + b, 0);
          expect(c.id, `${code} ${level}`).toBe(`m:${sum}`);
          if (code !== 'EUR') for (const v of c.money!) expect(CURRENCIES[code].coins[v] ?? CURRENCIES[code].notes[v], `${code} ${v}`).toBeDefined();
        }
        expect(q.prompt[0].text, `${code} ${level}`).not.toMatch(/\{\w+\}|NaN|undefined/);
      }
    }
    setCountry('fr');
    await setLang('fr');
  });
});

describe('tracé des autres écritures', () => {
  it('chaque modèle est dans le cadre, a des traits, et se reconnaît lui-même', async () => {
    const { SCRIPT_MODELS, traceModel } = await import('../src/content/tracing');
    const { scoreTrace } = await import('../src/domain/trace');
    for (const [code, models] of Object.entries(SCRIPT_MODELS)) {
      expect(models.length, code).toBeGreaterThanOrEqual(10);
      expect(new Set(models.map((m) => m.id)).size, code).toBe(models.length);
      for (const m of models) {
        expect(traceModel(m.id), m.id).toBe(m);
        for (const stroke of m.strokes) {
          expect(stroke.length, m.id).toBeGreaterThanOrEqual(2);
          for (const [x, y] of stroke) expect(x >= 0 && x <= 1 && y >= 0 && y <= 1, `${m.id} ${x},${y}`).toBe(true);
        }
        expect(scoreTrace(m.strokes, m.strokes, false).ok, m.id).toBe(true);
      }
    }
  });
});

describe('mon pays à voix haute (français)', () => {
  it('chaque pays a ses questions et des réponses à dire', async () => {
    const { gameById } = await import('../src/content/games');
    const { COUNTRIES, setCountry } = await import('../src/content/countries');
    const { mulberry32 } = await import('../src/domain/models');
    const game = gameById('VO-11');
    for (const country of COUNTRIES) {
      setCountry(country.code);
      for (const ref of game.questions) {
        const q = game.build(ref, ref.level, mulberry32(2));
        expect(q.say!.accept.length, ref.id).toBeGreaterThan(0);
        expect(q.prompt[0].text, ref.id).not.toMatch(/undefined/);
      }
    }
    setCountry('fr');
  });
});
