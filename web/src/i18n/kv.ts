import type { Catalog } from './index';

/**
 * Dictionnaire compact : `kv('c', 'dog=el perro; cat=el gato')` →
 * { 'c.dog': 'el perro', 'c.cat': 'el gato' }. Pour les longues listes (mots des
 * images, pays, nombres…) des catalogues.
 */
export function kv(prefix: string, text: string): Catalog {
  const out: Catalog = {};
  // Une entrée commence par « clé= » (sans espace) : un « ; » dans une phrase ne coupe pas.
  for (const part of text.split(/;\s*(?=[\w.\-]+=)/)) {
    const at = part.indexOf('=');
    if (at < 0) continue;
    const key = part.slice(0, at).trim();
    if (key) out[`${prefix}.${key}`] = part.slice(at + 1).trim();
  }
  return out;
}
