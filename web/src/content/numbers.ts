/** Nombres en toutes lettres (0 à 100), pour que le dino les dise bien. */
const UNITS = [
  'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
  'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf',
];
const TENS = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

export function frNumber(n: number): string {
  if (n < 20) return UNITS[n];
  if (n === 100) return 'cent';
  const ten = Math.floor(n / 10);
  // 70–79 et 90–99 : soixante-dix, quatre-vingt-onze…
  const rest = ten === 7 || ten === 9 ? n % 10 + 10 : n % 10;
  if (rest === 0) return ten === 8 ? 'quatre-vingts' : TENS[ten];
  if ((rest === 1 && ten !== 8) || (ten === 7 && rest === 11)) return `${TENS[ten]} et ${UNITS[rest]}`;
  return `${TENS[ten]}-${UNITS[rest]}`;
}
