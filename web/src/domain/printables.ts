import { Rng, shuffle } from './models';

/**
 * Règles des fiches à imprimer : quand l'enfant gagne une enveloppe, et
 * lesquelles lui proposer.
 */

/** Niveaux du dino qui donnent un diplôme. */
export const DIPLOMA_LEVELS = [5, 10, 15, 20, 25, 30, 35, 40];

/** Sans temps de jeu limité ni heure du coucher : une enveloppe après ce nombre de séries dans la journée. */
export const ENVELOPE_SERIES = 4;

/** Nombre d'enveloppes proposées. */
export const ENVELOPE_CHOICES = 3;

/** Fiches gardées par enfant (les plus anciennes partent). */
export const MAX_PRINTABLES = 60;

export interface KindInfo {
  id: string;
  family: string;
  minAge: number;
  envelope: boolean;
}

/** Ce qu'il faut savoir des fiches déjà gagnées. */
export interface Obtained {
  kind: string;
  at: number;
}

/**
 * Trois enveloppes de familles différentes (un coloriage, un jeu, un
 * découpage…), parmi les fiches de son âge, en préférant celles qu'il n'a pas
 * eues depuis longtemps (ou jamais).
 */
export function envelopeChoices(kinds: readonly KindInfo[], age: number, obtained: readonly Obtained[], rng: Rng,
  count = ENVELOPE_CHOICES): string[] {
  const last = new Map<string, number>();
  for (const o of obtained) last.set(o.kind, Math.max(last.get(o.kind) ?? 0, o.at));
  const eligible = shuffle(kinds.filter((k) => k.envelope && k.minAge <= age), rng)
    .sort((a, b) => (last.get(a.id) ?? -1) - (last.get(b.id) ?? -1));
  const picked: KindInfo[] = [];
  for (const k of eligible) if (picked.length < count && !picked.some((p) => p.family === k.family)) picked.push(k);
  for (const k of eligible) if (picked.length < count && !picked.includes(k)) picked.push(k);
  return shuffle(picked.map((k) => k.id), rng);
}

/** Diplômes gagnés en passant du niveau `from` au niveau `to`. */
export const diplomasBetween = (from: number, to: number) => DIPLOMA_LEVELS.filter((l) => l > from && l <= to);

/**
 * Lettres capitales ratées dans les jeux de lettres (questions en révision) :
 * « TR-2:R:dots », « FR-4:L:S:caps ».
 */
export function weakLettersFrom(questionIds: readonly string[]): string[] {
  const out: string[] = [];
  for (const id of questionIds) {
    const m = /^TR-2:([A-Z]):/.exec(id) ?? /^FR-4:L:([A-Z]):/.exec(id);
    if (m && !out.includes(m[1])) out.push(m[1]);
  }
  return out;
}
