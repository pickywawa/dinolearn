import { DinoLook, dinoAt } from './dino';
import { PrintContext } from './types';
import { frDate, speech } from './svg';

/** Le dino de l'enfant tel qu'il est dans le jeu (avec ses objets). */
export const lookOf = (ctx: PrintContext, lineArt = ctx.lineArt): DinoLook =>
  ({ color: ctx.color, worn: ctx.worn, lineArt });

/** Pied de page : prénom et date. */
export const footerOf = (ctx: PrintContext) =>
  `${ctx.name ? `${ctx.name} · ` : ''}${frDate(ctx.at)} · DinoLearn`;

/** Le petit dino qui donne la consigne, avec sa bulle (pieds en x, y). */
export function guide(ctx: PrintContext, x: number, y: number, h: number, lines: string[], bubbleW = 70, size = 4) {
  const bubbleH = lines.length * size * 1.3 + size * 0.9;
  return dinoAt({ ...lookOf(ctx, false), eyes: 'happy' }, x, y, h)
    + speech(x + h * 0.32, y - h * 1.02 - bubbleH, bubbleW, lines, size);
}

/** Identifiant unique dans le document (plusieurs fiches peuvent être affichées ensemble). */
export const uid = (prefix: string, rng: () => number) => `${prefix}-${Math.floor(rng() * 1e9).toString(36)}`;

/** Détail des dessins selon l'âge : 1 (3 ans), 2 (4–5 ans), 3 (6–7 ans). */
export const detailFor = (age: number) => (age <= 3 ? 1 : age <= 5 ? 2 : 3);
