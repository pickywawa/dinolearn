import { describe, expect, it } from 'vitest';
import { LANGS } from '../src/domain/langs';
import type { Catalog } from '../src/i18n';

import ar from '../src/i18n/locales/ar';
import bn from '../src/i18n/locales/bn';
import de from '../src/i18n/locales/de';
import en from '../src/i18n/locales/en';
import es from '../src/i18n/locales/es';
import hi from '../src/i18n/locales/hi';
import it_ from '../src/i18n/locales/it';
import pt from '../src/i18n/locales/pt';
import ru from '../src/i18n/locales/ru';
import ur from '../src/i18n/locales/ur';
import zh from '../src/i18n/locales/zh';

// Liste écrite à la main (le cache de vitest ne voit pas les fichiers ajoutés à un import.meta.glob).
const CATALOGS: Record<string, Catalog> = { ar, bn, de, en, es, hi, it: it_, pt, ru, ur, zh };
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
      const missing = Object.keys(en).filter((k) => catalog![k] === undefined && (asr || !k.startsWith('num.')));
      expect(missing).toEqual([]);
      for (const [key, entry] of Object.entries(catalog!)) {
        expect(en[key], `${code} : clé inconnue ${key}`).toBeDefined();
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
    expect(inLanguage(tr2, 'ru')).toBe(false);
  });
});
