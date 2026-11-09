import { Lang, deviceLang, isLang, langInfo } from '../domain/langs';
import type { Rng } from '../domain/models';

/**
 * Traductions. Le français reste écrit dans le code (c'est la langue d'origine,
 * la plus riche : tous les jeux). Les autres langues ont un catalogue
 * (`locales/<code>.ts`) : textes de l'interface, répliques du dino, mots des
 * images et phrases des jeux, avec des variantes et des « {paramètres} ».
 * Une clé absente retombe sur l'anglais, puis sur le texte français donné.
 */

export type Entry = string | string[];
export type Catalog = Record<string, Entry>;

let current: Lang = 'fr';
let catalog: Catalog = {};
let english: Catalog = {};

const loaders = import.meta.glob<{ default: Catalog }>('./locales/*.ts');
const load = async (code: Lang): Promise<Catalog> =>
  (await loaders[`./locales/${code}.ts`]?.())?.default ?? {};

/** Langue de l'application. */
export const lang = (): Lang => current;
/** Vrai en français (le jeu complet, textes d'origine). */
export const isFr = () => current === 'fr';
/** Langue apprise en plus : l'anglais, ou l'espagnol pour les anglophones. */
export const second = (): Lang => langInfo(current).second;

/** Charge le catalogue d'une langue (avant de lancer le jeu, ou quand les parents changent de langue). */
export async function setLang(code: string) {
  const next: Lang = isLang(code) ? code : deviceLang(navigator.languages ?? [navigator.language]);
  const [main, en] = await Promise.all([next === 'fr' ? {} : load(next), next === 'en' || next === 'fr' ? {} : load('en')]);
  current = next;
  catalog = main;
  english = next === 'en' ? main : en;
  const info = langInfo(next);
  document.documentElement.lang = info.locale;
  document.documentElement.dir = info.dir;
}

/** Remplace les « {nom} » d'un texte. */
export function fill(text: string, params: Record<string, string | number> = {}): string {
  return text.replace(/\{(\w+)\}/g, (m, key: string) => (params[key] !== undefined ? String(params[key]) : m));
}

const pickOne = (entry: Entry, rng: Rng = Math.random) =>
  (Array.isArray(entry) ? entry[Math.floor(rng() * entry.length)] ?? '' : entry);

/** La clé existe dans la langue (ou en anglais). */
export const has = (key: string) => catalog[key] !== undefined || english[key] !== undefined;

/** Toutes les variantes d'une clé dans la langue (anglais à défaut). */
export function variants(key: string): string[] | undefined {
  const entry = catalog[key] ?? english[key];
  if (entry === undefined) return undefined;
  return Array.isArray(entry) ? entry : [entry];
}

/**
 * Texte traduit. En français, `fr` (le texte d'origine) ; ailleurs, la clé du catalogue
 * (une variante au hasard s'il y en a plusieurs), ou l'anglais, ou le français à défaut.
 */
export function t(key: string, params?: Record<string, string | number>, fr?: string, rng?: Rng): string {
  if (current === 'fr' && fr !== undefined) return fill(fr, params);
  const entry = catalog[key] ?? english[key];
  if (entry === undefined) return fill(fr ?? key, params);
  return fill(pickOne(entry, rng), params);
}

/**
 * Phrase d'un jeu : le texte français d'origine (calculé seulement en français, pour
 * garder exactement le jeu d'origine), sinon la clé du catalogue.
 */
export function phrase(frText: () => string, key: string, params: Record<string, string | number> = {}, rng?: Rng): string {
  return current === 'fr' ? frText() : t(key, params, undefined, rng);
}

/** Un nombre écrit en chiffres (la voix le lit dans sa langue). */
export const num = (n: number) => String(n);
