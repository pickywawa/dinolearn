import { itemById, itemTexture } from '../content/items';
import { DINO_COLORS, DINO_PARTS, DinoColor, DinoPart, OUTLINE_COLOR, partBody, skinParts } from '../dino/parts';
import { n } from './svg';

/**
 * Le dino de l'enfant dessiné sur papier : les mêmes pièces SVG que dans le
 * jeu, assemblées aux mêmes places que dans `Dino.ts`, avec ses objets.
 * Coordonnées « dino » : origine entre les pieds, hauteur ≈ 500 unités.
 * En version à colorier, tous les remplissages deviennent blancs et les
 * ombres gris clair : il ne reste que les contours.
 */

export interface DinoLook {
  color: number;
  worn?: readonly string[];
  lineArt?: boolean;
  /** Sans pattes (marionnette à doigts : les doigts font les pattes). */
  legs?: boolean;
  eyes?: 'open' | 'happy' | 'closed';
  mouth?: 'smile' | 'open' | 'wide';
}

type PartName = 'tail' | 'body' | 'leg' | 'arm' | 'head';
const PART_NAMES: PartName[] = ['tail', 'body', 'leg', 'arm', 'head'];

export const colorOf = (index: number): DinoColor => DINO_COLORS[Math.max(0, Math.min(DINO_COLORS.length - 1, index))];

/** Version à colorier d'un dessin : remplissages blancs, couleurs secondaires en gris clair. */
export function toLineArt(body: string): string {
  const keep = (c: string) => c.toLowerCase() === OUTLINE_COLOR || c === 'none' || c.toLowerCase() === '#fff' || c.toLowerCase() === '#ffffff';
  return body
    .replace(/fill="(#[0-9a-fA-F]{3,6})"/g, (m, c: string) => (keep(c) ? m : 'fill="#fff"'))
    .replace(/stroke="(#[0-9a-fA-F]{3,6})"/g, (m, c: string) => (keep(c) ? m : 'stroke="#c9ced9"'))
    .replace(/stroke="#fff"/g, 'stroke="#c9ced9"');
}

/** Pièces de couleur du dino (queue, corps, patte, bras, tête). */
function skin(look: DinoLook): Record<PartName, DinoPart & { body: string }> {
  const parts = skinParts(colorOf(look.color));
  return Object.fromEntries(parts.map((p, i) => {
    const body = partBody(p);
    return [PART_NAMES[i], { ...p, body: look.lineArt ? toLineArt(body) : body }];
  })) as Record<PartName, DinoPart & { body: string }>;
}

const fixed = (key: string) => {
  const part = DINO_PARTS.find((p) => p.key === key);
  if (!part) throw new Error(`Pièce introuvable : ${key}`);
  return { ...part, body: partBody(part) };
};

/** Une pièce en place : boîte (x, y) en haut à gauche, retournée en miroir si `flip`. */
function placed(part: { width: number; height: number; body: string }, x: number, y: number, flip = false) {
  const mirror = flip ? ` translate(${part.width} 0) scale(-1 1)` : '';
  return `<g transform="translate(${n(x)} ${n(y)})${mirror}">${part.body}</g>`;
}

/** Boîte (haut-gauche) d'une pièce posée en (x, y) avec l'origine (ox, oy), comme dans Phaser. */
const box = (p: { width: number; height: number }, x: number, y: number, ox = 0.5, oy = 0.5) =>
  [x - ox * p.width, y - oy * p.height] as const;

/** Objets portés par le dino : images, en gris très pâle sur les coloriages. */
function accessories(ids: readonly string[], where: 'head' | 'back' | 'front', lineArt: boolean) {
  let out = '';
  for (const id of ids) {
    const item = itemById(id);
    if (!item) continue;
    const zone = item.parent === 'head' ? 'head' : item.slot === 'back' ? 'back' : 'front';
    if (zone !== where) continue;
    for (const x of item.mirror !== undefined ? [item.x, item.mirror] : [item.x]) {
      const flip = item.mirror !== undefined && x === item.mirror ? ' scale(-1 1)' : '';
      const filter = lineArt ? ' filter="url(#pale)"' : '';
      out += `<g transform="translate(${n(x)} ${n(item.y)}) rotate(${item.angle ?? 0})${flip}">`
        + `<image href="img/${itemTexture(id)}.svg" x="${n(-item.w / 2)}" y="${n(-item.w / 2)}" width="${item.w}" height="${item.w}"${filter}/></g>`;
    }
  }
  return out;
}

/** La tête seule (avec yeux, bouche et objets de tête), origine en bas de la tête. */
export function dinoHead(look: DinoLook, opts: { eyes?: boolean; accessories?: boolean } = {}) {
  const s = skin(look);
  const eyeKey = look.eyes === 'happy' ? 'dino-eye-happy' : look.eyes === 'closed' ? 'dino-eye-closed' : 'dino-eye';
  const mouthKey = `dino-mouth-${look.mouth ?? 'smile'}`;
  const eye = fixed(eyeKey);
  const mouth = fixed(mouthKey);
  const eyes = opts.eyes === false ? ''
    : placed(eye, ...box(eye, -52, -112)) + placed(eye, ...box(eye, 52, -112));
  const head = placed(s.head, ...box(s.head, 0, 0, 0.5, 0.85));
  const m = placed(mouth, ...box(mouth, 0, -40, 0.5, 0.3));
  const acc = opts.accessories === false ? '' : accessories(look.worn ?? [], 'head', !!look.lineArt);
  const body = head + eyes + m + acc;
  return look.lineArt ? body.replace(/fill="#8e2c3a"/g, 'fill="#fff"').replace(/fill="#ff7a8a"/g, 'fill="#fff"') : body;
}

/** Le dino entier (origine entre les pieds, environ 500 unités de haut, 600 avec un chapeau). */
export function dinoBody(look: DinoLook): string {
  const s = skin(look);
  const worn = look.worn ?? [];
  const lineArt = !!look.lineArt;
  const legs = look.legs === false ? ''
    : placed(s.leg, ...box(s.leg, -62, -36)) + placed(s.leg, ...box(s.leg, 62, -36), true);
  return accessories(worn, 'back', lineArt)
    + placed(s.tail, ...box(s.tail, 80, -120, 0.08, 0.72))
    + legs
    + placed(s.body, ...box(s.body, 0, -135))
    + placed(s.arm, ...box(s.arm, -96, -190, 0.4, 0.12))
    + placed(s.arm, ...box(s.arm, 96, -190, 0.4, 0.12), true)
    + `<g transform="translate(0 -250)">${dinoHead(look)}</g>`
    + accessories(worn, 'front', lineArt);
}

/** Hauteur du dessin (pieds → haut du chapeau éventuel), en unités dino. */
export const dinoTop = (worn: readonly string[] = []) =>
  worn.some((id) => itemById(id)?.slot === 'head') ? 560 : 500;

/** Place le dino : pieds en (x, y) mm, hauteur `h` mm du corps (sans chapeau), tourné vers la gauche si `flip`. */
export function dinoAt(look: DinoLook, x: number, y: number, h: number, flip = false) {
  const k = h / 500;
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${flip ? -k : k} ${n(k)})">${dinoBody(look)}</g>`;
}

/** La tête du dino posée en (x, y) mm (centre), largeur `w` mm. */
export function headAt(look: DinoLook, x: number, y: number, w: number) {
  const k = w / 330;
  // Le centre de la tête est 101,5 unités au-dessus de son origine.
  return `<g transform="translate(${n(x)} ${n(y + 101.5 * k)}) scale(${n(k)})">${dinoHead(look, { accessories: false })}</g>`;
}

/** Pièce fixe du décor (volcan, fougère, œuf, ptérodactyle), haut-gauche en (x, y) mm, largeur `w` mm. */
export function propAt(key: string, x: number, y: number, w: number, lineArt = false, flip = false) {
  const part = fixed(key);
  const k = w / part.width;
  const body = lineArt ? toLineArt(part.body) : part.body;
  const mirror = flip ? ` translate(${part.width} 0) scale(-1 1)` : '';
  return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(k)})${mirror}">${body}</g>`;
}

/** Hauteur (mm) d'une pièce fixe affichée sur `w` mm de large. */
export const propHeight = (key: string, w: number) => {
  const part = fixed(key);
  return (w * part.height) / part.width;
};

// ---- Dino articulé : chaque pièce séparément, avec ses attaches ----

export interface Piece {
  id: string;
  width: number;
  height: number;
  body: string;
  /** Points d'attache (attaches parisiennes), dans le repère de la pièce. */
  pivots: [number, number][];
}

/** Les 7 pièces du dino articulé, dans leur repère propre (unités dino). */
export function puppetPieces(look: DinoLook): Piece[] {
  const s = skin(look);
  // Attaches, en coordonnées dino (voir les boîtes de `dinoBody`).
  const neck: [number, number] = [0, -225];
  const armL: [number, number] = [-90, -175];
  const armR: [number, number] = [104, -175];
  const legL: [number, number] = [-62, -50];
  const legR: [number, number] = [62, -50];
  const tail: [number, number] = [92, -122];
  const bodyBox = box(s.body, 0, -135);
  const local = (p: [number, number], b: readonly [number, number]): [number, number] => [p[0] - b[0], p[1] - b[1]];
  const headBox = [-165, -250 - 0.85 * 290] as const;
  const headPart = { width: 330, height: 290, body: `<g transform="translate(165 ${0.85 * 290})">${dinoHead(look)}</g>` };
  const armLBox = box(s.arm, -96, -190, 0.4, 0.12);
  const armRBox = box(s.arm, 96, -190, 0.4, 0.12);
  const legLBox = box(s.leg, -62, -36);
  const legRBox = box(s.leg, 62, -36);
  const tailBox = box(s.tail, 80, -120, 0.08, 0.72);
  const flip = (p: DinoPart & { body: string }) => `<g transform="translate(${p.width} 0) scale(-1 1)">${p.body}</g>`;
  return [
    { id: 'head', ...headPart, pivots: [local(neck, headBox)] },
    { id: 'body', width: s.body.width, height: s.body.height, body: s.body.body,
      pivots: [neck, armL, armR, legL, legR, tail].map((p) => local(p, bodyBox)) },
    { id: 'tail', width: s.tail.width, height: s.tail.height, body: s.tail.body, pivots: [local(tail, tailBox)] },
    { id: 'armL', width: s.arm.width, height: s.arm.height, body: s.arm.body, pivots: [local(armL, armLBox)] },
    { id: 'armR', width: s.arm.width, height: s.arm.height, body: flip(s.arm), pivots: [local(armR, armRBox)] },
    { id: 'legL', width: s.leg.width, height: s.leg.height, body: s.leg.body, pivots: [local(legL, legLBox)] },
    { id: 'legR', width: s.leg.width, height: s.leg.height, body: flip(s.leg), pivots: [local(legR, legRBox)] },
  ];
}
