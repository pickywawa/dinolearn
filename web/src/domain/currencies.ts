/**
 * Monnaies du jeu « L'argent » hors euro (l'euro garde ses centimes, dans games.ts) :
 * les pièces et les billets qu'un enfant voit, en unités entières (dollars,
 * roupies…), avec leur métal ou leur couleur. Le jeu les dessine (pas d'images).
 * Les centimes des autres monnaies ne sont pas utilisés : les montants restent
 * des nombres entiers, plus simples à lire et à dire.
 */
export type Metal = 'gold' | 'silver' | 'copper' | 'gold-silver' | 'silver-gold';

export interface Currency {
  code: string;
  /** Pièces : valeur → métal. */
  coins: Record<number, Metal>;
  /** Billets : valeur → couleur. */
  notes: Record<number, number>;
}

const c = (code: string, coins: Record<number, Metal>, notes: Record<number, number>): Currency => ({ code, coins, notes });

export const CURRENCIES: Record<string, Currency> = {
  EUR: c('EUR', { 1: 'gold-silver', 2: 'silver-gold' }, { 5: 0x9aa9a3, 10: 0xe2867a, 20: 0x6f9fdc, 50: 0xf0a640, 100: 0x6dbb72 }),
  USD: c('USD', {}, { 1: 0x9fc29a, 2: 0x93b88d, 5: 0x8fb5a8, 10: 0xd9c27c, 20: 0x86b58c, 50: 0xc3a8c9, 100: 0x8ec3c8 }),
  GBP: c('GBP', { 1: 'gold', 2: 'silver-gold' }, { 5: 0x5fb3a8, 10: 0xe39a4c, 20: 0x9b7bc4, 50: 0xd9534f }),
  CAD: c('CAD', { 1: 'gold', 2: 'silver-gold' }, { 5: 0x5b8fd1, 10: 0x9b6bc4, 20: 0x6cb86c, 50: 0xd9534f, 100: 0xb98a5a }),
  CHF: c('CHF', { 1: 'silver', 2: 'silver', 5: 'silver' }, { 10: 0xf2c94c, 20: 0xd9534f, 50: 0x6cb86c, 100: 0x5b8fd1, 200: 0xb07a4f }),
  JPY: c('JPY', { 1: 'silver', 5: 'gold', 10: 'copper', 50: 'silver', 100: 'silver', 500: 'gold' },
    { 1000: 0x6f9fdc, 5000: 0xc39bd3, 10000: 0xc8a86b }),
  CNY: c('CNY', { 1: 'silver' }, { 5: 0x9b6bc4, 10: 0x5b8fd1, 20: 0xb98a5a, 50: 0x6cb86c, 100: 0xe0625a }),
  INR: c('INR', { 1: 'silver', 2: 'silver', 5: 'gold', 10: 'gold-silver' },
    { 20: 0xc9d36a, 50: 0x6cc4c4, 100: 0xb7a3d9, 200: 0xf2a541, 500: 0xa7a7a0 }),
  BRL: c('BRL', { 1: 'silver-gold' }, { 2: 0x6f9fdc, 5: 0xb08ad1, 10: 0xe0625a, 20: 0xf2c94c, 50: 0xd99a5b, 100: 0x5b8fd1, 200: 0xa7a7a0 }),
  MXN: c('MXN', { 1: 'silver', 2: 'silver', 5: 'silver', 10: 'gold-silver' },
    { 20: 0x6cb8a8, 50: 0xd17bb1, 100: 0xe0625a, 200: 0x6cb86c, 500: 0x5b8fd1 }),
  RUB: c('RUB', { 1: 'silver', 2: 'silver', 5: 'silver', 10: 'gold' },
    { 50: 0x7fa0b8, 100: 0xb5a26b, 200: 0x6cb8a8, 500: 0xb08ad1, 1000: 0x5b8fd1 }),
  PKR: c('PKR', { 1: 'copper', 2: 'silver', 5: 'gold', 10: 'gold' },
    { 20: 0xf2a541, 50: 0xb08ad1, 100: 0xe0625a, 500: 0x6cb86c, 1000: 0x5b8fd1 }),
  BDT: c('BDT', { 1: 'silver', 2: 'silver', 5: 'gold' }, { 10: 0xd17bb1, 20: 0x6cb86c, 50: 0xb5a26b, 100: 0x5b8fd1, 500: 0xb08ad1 }),
  EGP: c('EGP', { 1: 'gold-silver' }, { 5: 0x6cb8a8, 10: 0xe0625a, 20: 0x6cb86c, 50: 0xb98a5a, 100: 0x5b8fd1, 200: 0xa7a7a0 }),
  SAR: c('SAR', { 1: 'gold-silver', 2: 'silver-gold' }, { 5: 0xb08ad1, 10: 0xb98a5a, 50: 0x6cb86c, 100: 0xe0625a, 500: 0x5b8fd1 }),
  MAD: c('MAD', { 1: 'silver', 2: 'silver', 5: 'gold-silver', 10: 'silver-gold' }, { 20: 0xb08ad1, 50: 0x6cb86c, 100: 0xb98a5a, 200: 0x5b8fd1 }),
  NGN: c('NGN', {}, { 5: 0x6cb86c, 10: 0xe0625a, 20: 0x6cb8a8, 50: 0x5b8fd1, 100: 0xb08ad1, 200: 0xc9a26b, 500: 0x7fa0b8, 1000: 0xb98a5a }),
  PHP: c('PHP', { 1: 'silver', 5: 'gold', 10: 'gold-silver', 20: 'silver-gold' },
    { 50: 0xe0625a, 100: 0xb08ad1, 200: 0x6cb86c, 500: 0xf2c94c, 1000: 0x5b8fd1 }),
  CDF: c('CDF', {}, { 50: 0x6cb8a8, 100: 0x5b8fd1, 200: 0x6cb86c, 500: 0xb08ad1, 1000: 0xe0625a, 5000: 0xb98a5a }),
  TZS: c('TZS', { 50: 'silver', 100: 'silver', 200: 'silver', 500: 'silver' },
    { 1000: 0x5b8fd1, 2000: 0xb98a5a, 5000: 0xe0625a, 10000: 0x6cb86c }),
  ZAR: c('ZAR', { 1: 'silver', 2: 'silver', 5: 'gold-silver' }, { 10: 0x6cb86c, 20: 0xb98a5a, 50: 0xe0625a, 100: 0x5b8fd1, 200: 0xf2a541 }),
  COP: c('COP', { 50: 'silver', 100: 'gold-silver', 200: 'silver', 500: 'gold-silver', 1000: 'gold-silver' },
    { 2000: 0x6cb8a8, 5000: 0xb98a5a, 10000: 0xe0625a, 20000: 0xb5a26b, 50000: 0xb08ad1 }),
  ARS: c('ARS', { 1: 'gold-silver', 2: 'silver-gold', 5: 'gold', 10: 'gold' },
    { 20: 0x5b8fd1, 50: 0xa7a7a0, 100: 0xb08ad1, 200: 0x6cb8a8, 500: 0x6cb86c, 1000: 0xf2a541 }),
  SDG: c('SDG', { 1: 'gold-silver' }, { 5: 0xb98a5a, 10: 0x6cb86c, 20: 0xe0625a, 50: 0xb08ad1, 100: 0x5b8fd1 }),
  DZD: c('DZD', { 5: 'silver', 10: 'silver', 20: 'gold-silver', 50: 'gold-silver', 100: 'silver-gold' },
    { 200: 0xb98a5a, 500: 0xb08ad1, 1000: 0x5b8fd1, 2000: 0x6cb86c }),
  IQD: c('IQD', {}, { 250: 0x5b8fd1, 500: 0x6cb8a8, 1000: 0xb98a5a, 5000: 0xb08ad1, 10000: 0x6cb86c }),
  KES: c('KES', { 1: 'silver', 5: 'gold', 10: 'gold-silver', 20: 'silver-gold' },
    { 50: 0xe0625a, 100: 0xb08ad1, 200: 0x5b8fd1, 500: 0x6cb86c, 1000: 0xb98a5a }),
  UGX: c('UGX', { 100: 'silver', 200: 'silver', 500: 'gold', 1000: 'gold' },
    { 2000: 0xb98a5a, 5000: 0xe0625a, 10000: 0xb08ad1, 20000: 0x5b8fd1 }),
  XOF: c('XOF', { 5: 'gold', 10: 'gold', 25: 'gold', 50: 'silver', 100: 'silver-gold', 200: 'gold-silver', 500: 'silver-gold' },
    { 1000: 0xb98a5a, 2000: 0x5b8fd1, 5000: 0x6cb86c, 10000: 0xb08ad1 }),
  XAF: c('XAF', { 5: 'gold', 10: 'gold', 25: 'gold', 50: 'silver', 100: 'silver-gold', 500: 'silver-gold' },
    { 1000: 0x5b8fd1, 2000: 0x6cb86c, 5000: 0xe0625a, 10000: 0xb08ad1 }),
  IDR: c('IDR', { 100: 'silver', 200: 'silver', 500: 'silver', 1000: 'silver' },
    { 2000: 0xa7a7a0, 5000: 0xb98a5a, 10000: 0xb08ad1, 20000: 0x6cb86c, 50000: 0x5b8fd1 }),
  VND: c('VND', {}, { 1000: 0xc9a26b, 2000: 0x9a8a7a, 5000: 0x6f9fdc, 10000: 0xb98a5a, 20000: 0x5b8fd1, 50000: 0xd17bb1, 100000: 0x6cb86c }),
  TRY: c('TRY', { 1: 'silver-gold' }, { 5: 0xb08ad1, 10: 0xe0625a, 20: 0x6cb86c, 50: 0xf2a541, 100: 0x5b8fd1, 200: 0xd17bb1 }),
  IRR: c('IRR', { 1000: 'silver', 2000: 'silver', 5000: 'gold' }, { 10000: 0x6cb8a8, 20000: 0xf2a541, 50000: 0xb08ad1, 100000: 0x6cb86c }),
  PLN: c('PLN', { 1: 'silver', 2: 'gold-silver', 5: 'silver-gold' }, { 10: 0xb98a5a, 20: 0xb08ad1, 50: 0x5b8fd1, 100: 0x6cb86c, 200: 0xc9a26b }),
  UAH: c('UAH', { 1: 'gold', 2: 'silver', 5: 'silver', 10: 'gold' }, { 20: 0x6cb86c, 50: 0xb08ad1, 100: 0xc9a26b, 200: 0xd17bb1, 500: 0xb98a5a }),
  THB: c('THB', { 1: 'silver', 2: 'gold', 5: 'silver', 10: 'gold-silver' }, { 20: 0x6cb86c, 50: 0x5b8fd1, 100: 0xe0625a, 500: 0xb08ad1, 1000: 0xb98a5a }),
  YER: c('YER', {}, { 100: 0x6cb86c, 200: 0x5b8fd1, 250: 0xb08ad1, 500: 0xe0625a, 1000: 0xb98a5a }),
  AOA: c('AOA', { 10: 'gold', 20: 'silver', 50: 'gold-silver', 100: 'silver-gold' }, { 200: 0x6cb8a8, 500: 0xd17bb1, 1000: 0xb98a5a, 2000: 0x5b8fd1, 5000: 0x6cb86c }),
  GHS: c('GHS', { 1: 'gold-silver', 2: 'silver-gold' }, { 5: 0xe0625a, 10: 0x5b8fd1, 20: 0xb08ad1, 50: 0xb98a5a, 100: 0x6cb86c, 200: 0xc9a26b }),
  MZN: c('MZN', { 1: 'silver', 2: 'gold', 5: 'gold', 10: 'gold-silver' }, { 20: 0xb98a5a, 50: 0xb08ad1, 100: 0x6cb86c, 200: 0x5b8fd1, 500: 0xe0625a }),
  PEN: c('PEN', { 1: 'silver', 2: 'gold-silver', 5: 'silver-gold' }, { 10: 0x6cb86c, 20: 0xf2a541, 50: 0xe0625a, 100: 0x5b8fd1, 200: 0xb08ad1 }),
  MGA: c('MGA', { 50: 'silver' }, { 100: 0xb98a5a, 200: 0x6cb86c, 500: 0x5b8fd1, 1000: 0xb08ad1, 2000: 0x6cb8a8, 5000: 0xe0625a, 10000: 0xc9a26b }),
  VES: c('VES', { 1: 'silver' }, { 5: 0x6cb86c, 10: 0xe0625a, 20: 0x5b8fd1, 50: 0xb98a5a, 100: 0xb08ad1, 200: 0xf2a541 }),
  SYP: c('SYP', { 25: 'silver', 50: 'gold' }, { 100: 0x5b8fd1, 200: 0xb98a5a, 500: 0xb08ad1, 1000: 0x6cb86c, 2000: 0xe0625a }),
  AFN: c('AFN', { 1: 'silver', 2: 'silver', 5: 'gold' }, { 10: 0x6cb86c, 20: 0xb98a5a, 50: 0x5b8fd1, 100: 0xb08ad1, 500: 0xe0625a }),
  NPR: c('NPR', { 1: 'silver', 2: 'gold' }, { 5: 0xe0625a, 10: 0xb98a5a, 20: 0xf2a541, 50: 0x5b8fd1, 100: 0x6cb86c, 500: 0xb08ad1 }),
  KRW: c('KRW', { 10: 'copper', 50: 'silver', 100: 'silver', 500: 'silver' }, { 1000: 0x5b8fd1, 5000: 0xe0625a, 10000: 0x6cb86c, 50000: 0xf2c94c }),
};

/** Toutes les valeurs, des plus petites aux plus grandes. */
export const ladder = (cur: Currency): number[] =>
  [...Object.keys(cur.coins), ...Object.keys(cur.notes)].map(Number).sort((a, b) => a - b);

export const isNote = (cur: Currency, value: number) => cur.notes[value] !== undefined;

/**
 * Valeurs utilisées au niveau 1 à 20 : on commence par les plus petites, puis la
 * fenêtre monte vers les gros billets ; le nombre de pièces et de cartes augmente.
 */
export function moneyLevel(cur: Currency, level: number): { values: number[]; pieces: [number, number]; cards: number } {
  const all = ladder(cur);
  const top = Math.min(all.length - 1, 1 + Math.floor((level - 1) / 3));
  const from = Math.max(0, top - (level < 10 ? 2 : 3));
  const values = all.slice(from, top + 1);
  const pieces: [number, number] = level <= 3 ? [2, 3] : level <= 9 ? [2, 4] : level <= 15 ? [3, 5] : [3, 6];
  const cards = level <= 2 ? 3 : level <= 16 ? 4 : 6;
  return { values, pieces, cards };
}

/** Montant écrit avec le symbole (« $25 », « 25 € », « ₹10 »). */
export function moneyLabel(code: string, value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

/** Montant dit en toutes lettres pour le nom de la monnaie (« 25 US dollars », « 25 roupies indiennes »). */
export function moneySaid(code: string, value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: code, currencyDisplay: 'name',
    minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}