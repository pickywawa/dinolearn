/**
 * Corrections de prononciation des voix françaises (espeak-ng lit parfois mal) :
 * - les voyelles à accent circonflexe sortaient allongées (« bientôt », « âne », « mûre ») : en français
 *   d'aujourd'hui, on ne les allonge pas ;
 * - « kiwi » devenait « kyoui » ;
 * - quelques mots d'origine anglaise étaient lus à l'anglaise (« mammouth », « skateboard », « tee-shirt »).
 */

const isFrench = (espeakVoice: string) => espeakVoice.toLowerCase().startsWith('fr');

/** Mots réécrits comme ils se disent (sans accents ni lettres muettes) avant d'être lus. */
const RESPELL: [RegExp, string][] = ([
  ['mammouth', 'mamoute'], ['skateboard', 'skèïtbord'], ['tee-shirt', 'ti-cheurte'], ['pizza', 'pidza'],
] as const).flatMap(([word, spoken]) => {
  const edge = (s: string) => new RegExp(`(?<![\\p{L}\\p{N}])${s}(s?)(?![\\p{L}\\p{N}])`, 'giu');
  return [[edge(word), `${spoken}$1`] as [RegExp, string]];
});

/** Le texte tel qu'il sera lu : lettres composées d'un seul bloc (é, ê…), et mots à réécrire. */
export function respell(espeakVoice: string, text: string): string {
  const t = text.normalize('NFC');
  if (!isFrench(espeakVoice)) return t;
  return RESPELL.reduce((s, [pattern, spoken]) => s.replace(pattern, spoken), t);
}

/** Corrige la suite de sons (symboles de phonétique) avant la lecture. */
export function fixPhonemes(espeakVoice: string, phonemes: string[]): string[] {
  if (!isFrench(espeakVoice)) return phonemes;
  // Pas de voyelle longue.
  const out = phonemes.filter((p) => p !== 'ː');
  // « kiwi » : k + i + w + i (et non k + j + w + i).
  for (let i = 0; i + 2 < out.length; i++) {
    if (out[i] === 'k' && out[i + 1] === 'j' && out[i + 2] === 'w') out[i + 1] = 'i';
  }
  return out;
}

/** Les numéros de sons attendus par la voix : début, puis chaque son suivi d'un blanc, puis fin. Undefined si un son est inconnu. */
export function idsFor(phonemes: string[], map: Record<string, number[]>): number[] | undefined {
  const begin = map['^']?.[0], pad = map._?.[0], end = map.$?.[0];
  if (begin === undefined || pad === undefined || end === undefined) return undefined;
  const ids = [begin, pad];
  for (const p of phonemes) {
    const id = map[p]?.[0];
    if (id === undefined) return undefined;
    ids.push(id, pad);
  }
  ids.push(end);
  return ids;
}
