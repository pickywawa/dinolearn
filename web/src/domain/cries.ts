/**
 * Les cris d'animaux écrits dans les phrases du dino (« Qui fait coin coin ? ») sont joués
 * avec de vrais enregistrements (`public/sfx/animals/`, sons libres de Pixabay)
 * au lieu d'être lus par la voix. Sans enregistrement, la voix les dit (lentement).
 */

/** Animaux dont on a l'enregistrement. */
export const RECORDED_ANIMALS = new Set(['bee', 'cat', 'chick', 'cow', 'dog', 'donkey', 'duck', 'frog', 'hen', 'horse', 'mouse', 'owl',
  'pig', 'rooster', 'sheep', 'snake', 'turkey']);

const L = '\\p{L}';
const cry = (body: string) => new RegExp(`(?<![${L}])(?:${body})(?![${L}])`, 'giu');

/** Onomatopée → animal. L'ordre compte : « hi-han » avant « hiiii ». */
const CRIES: [RegExp, string][] = [
  [cry('hi[- ]han'), 'donkey'],
  [cry('hi{3,}'), 'horse'],
  [cry('coin(?:[ -]coin)+'), 'duck'],
  [cry('b[êe]{2,}h?'), 'sheep'],
  [cry('cro[âa](?:[ -]cro[âa])*'), 'frog'],
  [cry('hou[ -]hou(?:[ -]hou)*'), 'owl'],
  [cry('couic(?:[ -]couic)*'), 'mouse'],
  [cry('cocorico'), 'rooster'],
  [cry('meuh'), 'cow'],
  [cry('miaou'), 'cat'],
  [cry('(?:ouaf|wouf)(?:[ -](?:ouaf|wouf))*'), 'dog'],
  [cry('cot(?:[ -]cot)*(?:[ -]codet)?'), 'hen'],
  [cry('bz{2,}'), 'bee'],
  [cry('piou(?:[ -]piou)*'), 'chick'],
  [cry('groin(?:[ -]groin)*'), 'pig'],
  [cry('glou(?:[ -]glou)+'), 'turkey'],
  [cry('s{3,}'), 'snake'],
];

export type CryPiece = { text: string } | { animal: string };

/**
 * Coupe une phrase autour des cris enregistrés : « Qui fait », [canard], « ? ». Les
 * morceaux de texte sans lettre (ponctuation seule) disparaissent.
 */
export function splitCries(text: string, recorded: ReadonlySet<string> = RECORDED_ANIMALS): CryPiece[] {
  const hits: { start: number; end: number; animal: string }[] = [];
  for (const [re, animal] of CRIES) {
    if (!recorded.has(animal)) continue;
    for (const m of text.matchAll(re)) {
      const start = m.index ?? 0;
      const end = start + m[0].length;
      if (!hits.some((h) => start < h.end && end > h.start)) hits.push({ start, end, animal });
    }
  }
  if (!hits.length) return [{ text }];
  hits.sort((a, b) => a.start - b.start);
  const out: CryPiece[] = [];
  let at = 0;
  const pushText = (t: string) => { if (/\p{L}|\p{N}/u.test(t)) out.push({ text: t.trim() }); };
  for (const h of hits) {
    pushText(text.slice(at, h.start));
    out.push({ animal: h.animal });
    at = h.end;
  }
  pushText(text.slice(at));
  return out;
}
