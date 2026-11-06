/**
 * Préparer une réplique pour la voix neuronale (Piper) :
 *
 * 1. Les onomatopées sans voyelle (« bzzz », « sss », « Psst », « Grrr »…)
 *    sont épelées lettre par lettre par le moteur de prononciation, et
 *    « Hihi » ou « hi-han » écrasés en une syllabe : on les réécrit en
 *    orthographes qu'il prononce comme des sons (vérifié sur ses phonèmes).
 * 2. Les « … » et les fins de phrase ne font presque pas de pause : on coupe
 *    la réplique en morceaux et on ajoute de vrais silences entre eux.
 * 3. Les cris d'animaux (« meuh », « ouaf ouaf », « cocorico »…) sont dits à
 *    part, bien plus lentement : sinon ils passent trop vite pour être reconnus.
 */

const RESPELL: [RegExp, string | ((m: string) => string)][] = [
  // Abeille, mouche : « beu-zzz ».
  [/\bbz+\b/gi, 'beuzzz'],
  // Le dino qui dort : il ronfle.
  [/\bz{2,}\b/gi, 'rron, rron'],
  // Serpent.
  [/\bs{3,}\b/gi, 'sssi'],
  [/\bps+t\b/gi, 'pssit'],
  // « Hmm » (il réfléchit) est bien dit ; « Hmmm » serait épelé. « Mmmh » (c'est bon) : « mmmeu ».
  [/\bhm{3,}\b/gi, 'hmm'],
  [/\bm{2,}h?\b/gi, 'mmmeu'],
  [/\bgr{2,}\b/gi, 'greuh'],
  // Rires et âne : une syllabe « hi » par « hi » écrit.
  [/\bhi(?:-?hi)+\b/gi, (m) => Array((m.match(/hi/gi) ?? []).length).fill('hi').join(' ')],
  [/\bhi-han\b/gi, 'hi han'],
  // Cheval : « hiiii ».
  [/\bhi{3,}\b/gi, 'hi hi hi'],
];

/** Réécrit les onomatopées pour que la voix les dise comme des sons. */
export function respell(text: string): string {
  return RESPELL.reduce((t, [pattern, by]) => t.replace(pattern, by as string), text);
}

export interface SpokenSegment {
  text: string;
  /** Silence après ce morceau (ms). */
  pauseMs: number;
  /** Débit ralenti (× durée) : les cris d'animaux. */
  slow?: number;
}

/** Ralenti des cris d'animaux. */
export const ANIMAL_SLOW = 1.9;

/** Mots des cris d'animaux (après réécriture des onomatopées). */
const ANIMAL_WORD = /^(?:meuh|miaou|ouaf|wouf|coin|cot|codet|cocorico|groin|b[êe]{2,}h?|han|hou|glou|cro[âa]|couic|beuzzz|sssi|greuh|cui|piou)$/i;

/** Sépare les cris d'animaux du reste du morceau (« La vache fait | meuh ! »). */
function splitAnimals(segment: SpokenSegment): SpokenSegment[] {
  const words = segment.text.split(/(\s+)/);
  const out: SpokenSegment[] = [];
  let current = '';
  let animal = false;
  const flush = () => {
    if (/[\p{L}\p{N}]/u.test(current)) out.push({ text: current.trim(), pauseMs: 0, ...(animal ? { slow: ANIMAL_SLOW } : {}) });
    current = '';
  };
  const bareOf = (w: string) => w.replace(/[^\p{L}]/gu, '').toLowerCase();
  const tokens = words.filter((w) => !/^\s+$/.test(w)).map(bareOf);
  let k = -1;
  for (const w of words) {
    if (/^\s+$/.test(w)) { current += w; continue; }
    k++;
    const bare = bareOf(w);
    // « hi » : cri seulement dans « hi han » (l'âne) ou « hi hi hi » (le cheval), pas dans un rire.
    const hi = bare === 'hi' && (tokens[k + 1] === 'han' || tokens[k - 1] === 'hi' && tokens[k + 1] === 'hi'
      || tokens[k + 1] === 'hi' && tokens[k + 2] === 'hi' || tokens[k - 1] === 'hi' && tokens[k - 2] === 'hi');
    const isAnimal = hi || ANIMAL_WORD.test(bare);
    if (current.trim() && isAnimal !== animal) flush();
    animal = isAnimal;
    current += w;
  }
  flush();
  if (out.length) out[out.length - 1].pauseMs = segment.pauseMs;
  // Un mot seul « hi » (rire) n'est pas un cri : on ne ralentit que s'il y a au moins un vrai cri dans la phrase.
  return out;
}

/** Silence après chaque ponctuation de fin. */
const PAUSES: Record<string, number> = { '…': 450, '.': 300, '!': 300, '?': 350, ':': 200, ';': 200 };

/**
 * Coupe une réplique aux fins de phrase et aux « … » : chaque morceau est
 * calculé à part, suivi d'un vrai silence (aucun après le dernier).
 */
export function spokenSegments(text: string): SpokenSegment[] {
  const clean = respell(text.replace(/\.\.\./g, '…')).trim();
  const parts = clean.match(/[^.!?…:;]+(?:[.!?…:;]+|$)/g) ?? [clean];
  const segments = parts.map((p) => p.trim()).filter((p) => /[\p{L}\p{N}]/u.test(p)).map((p) => {
    const end = p.match(/[.!?…:;]+$/)?.[0] ?? '';
    const pause = Math.max(0, ...[...end].map((c) => PAUSES[c] ?? 0));
    return { text: p, pauseMs: pause };
  });
  if (segments.length) segments[segments.length - 1].pauseMs = 0;
  return segments.flatMap(splitAnimals);
}
