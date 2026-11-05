/**
 * Préparer une réplique pour la voix neuronale (Piper) :
 *
 * 1. Les onomatopées sans voyelle (« bzzz », « sss », « Psst », « Grrr »…)
 *    sont épelées lettre par lettre par le moteur de prononciation, et
 *    « Hihi » ou « hi-han » écrasés en une syllabe : on les réécrit en
 *    orthographes qu'il prononce comme des sons (vérifié sur ses phonèmes).
 * 2. Les « … » et les fins de phrase ne font presque pas de pause : on coupe
 *    la réplique en morceaux et on ajoute de vrais silences entre eux.
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
  return segments;
}
