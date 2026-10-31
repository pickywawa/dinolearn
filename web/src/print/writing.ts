import { LETTER_MODELS, SHAPE_MODELS, TraceModel } from '../content/tracing';
import { Point } from '../domain/trace';
import { Rng, shuffle } from '../domain/models';
import { footerOf, lookOf } from './common';
import { dinoAt } from './dino';
import { GREY, INK, LIGHT, n, page, text } from './svg';
import { PrintKind } from './types';

/**
 * Fiche d'écriture : le prénom de l'enfant en lettres capitales (les mêmes
 * modèles que le jeu « Trace les lettres »), d'abord en trait plein avec le
 * point de départ, puis en pointillés à repasser, puis seul. Les plus petits
 * font du graphisme (traits, ronds, vagues) ; les plus grands ajoutent les
 * chiffres et les lettres qu'ils ratent dans les jeux.
 */

const LETTERS = new Map(LETTER_MODELS.map((m) => [m.id, m]));

/** « Léa-Rose » → ['L', 'E', 'A', ' ', 'R', 'O', 'S', 'E'] : capitales sans accents, tiret = espace. */
export function nameGlyphs(name: string): string[] {
  return [...name.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()]
    .map((c) => (LETTERS.has(c) ? c : c === ' ' || c === '-' || c === '\'' ? ' ' : ''))
    .filter((c, i, all) => c !== '' && !(c === ' ' && (i === 0 || all[i - 1] === ' ')));
}

type RowStyle = 'model' | 'dots' | 'first';

/** Une ligne d'écriture : trois lignes de guidage et des modèles posés côte à côte. */
function row(models: (TraceModel | null)[], x: number, y: number, size: number, style: RowStyle, width: number) {
  const top = y + size * 0.1;
  const mid = y + size * 0.5;
  const base = y + size * 0.9;
  let out = `<path d="M${n(x)} ${n(top)} H${n(x + width)} M${n(x)} ${n(base)} H${n(x + width)}" stroke="${LIGHT}" stroke-width="0.4"/>`
    + `<path d="M${n(x)} ${n(mid)} H${n(x + width)}" stroke="${LIGHT}" stroke-width="0.3" stroke-dasharray="1.5 1.5"/>`;
  const step = size * 0.82;
  models.forEach((m, i) => {
    if (!m || (style === 'first' && i > 0)) return;
    const ox = x + i * step - size * 0.08;
    const path = (stroke: Point[]) => stroke.map(([px, py], k) => `${k ? 'L' : 'M'}${n(ox + px * size)} ${n(y + py * size)}`).join(' ');
    const d = m.strokes.map(path).join(' ');
    if (style === 'model') {
      out += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${n(Math.max(0.9, size * 0.06))}" stroke-linecap="round" stroke-linejoin="round"/>`;
      m.strokes.forEach((s, k) => {
        const [px, py] = s[0];
        out += `<circle cx="${n(ox + px * size)}" cy="${n(y + py * size)}" r="${n(Math.max(0.9, size * 0.05))}" fill="#43b649"/>`;
        if (m.strokes.length > 1) out += text(ox + px * size - size * 0.08, y + py * size - size * 0.05, Math.max(2.4, size * 0.13), String(k + 1), { fill: '#2f8a34', weight: 400 });
      });
    } else {
      out += `<path d="${d}" fill="none" stroke="${GREY}" stroke-width="${n(Math.max(0.7, size * 0.045))}" stroke-dasharray="0.01 ${n(Math.max(1.6, size * 0.09))}" stroke-linecap="round" stroke-linejoin="round"/>`;
      if (style === 'dots') {
        const [px, py] = m.strokes[0][0];
        out += `<circle cx="${n(ox + px * size)}" cy="${n(y + py * size)}" r="${n(Math.max(0.7, size * 0.04))}" fill="#43b649"/>`;
      }
    }
  });
  return out;
}

/** Une ligne de graphisme : la même forme répétée. */
const repeatShape = (id: string, count: number) => Array.from({ length: count }, () => SHAPE_MODELS.find((m) => m.id === id) ?? null);

interface Section { label: string; models: (TraceModel | null)[]; rows: RowStyle[]; size: number }

export const WRITING: PrintKind = {
  id: 'writing',
  family: 'write',
  title: 'J\'écris',
  said: 'une fiche pour apprendre à écrire',
  icon: 'pr-writing',
  minAge: 3,
  envelope: true,
  build(ctx, rng: Rng) {
    const width = 180;
    const x = 15;
    const sections: Section[] = [];
    const glyphs = nameGlyphs(ctx.name || 'Dino');
    const fit = (size: number, count: number) => Math.min(size, (width + size * 0.1) / Math.max(1, count) / 0.82);
    const graph = shuffle(['line-v', 'circle', 'wave', 'zigzag', 'cross', 'square', 'spiral'].filter((id) =>
      (SHAPE_MODELS.find((m) => m.id === id)?.level ?? 9) <= (ctx.age <= 3 ? 5 : 7)), rng);
    if (ctx.age <= 3) {
      for (const id of graph.slice(0, 4)) {
        const size = 26;
        sections.push({ label: '', models: repeatShape(id, Math.floor(width / (size * 0.82))), rows: ['dots', 'dots'], size });
      }
      sections[0].label = 'Repasse sur les pointillés, sans lever le crayon !';
    } else {
      const big = ctx.age <= 4 ? 24 : ctx.age <= 5 ? 18 : 14;
      const size = fit(big, glyphs.length);
      const name = glyphs.map((g) => LETTERS.get(g) ?? null);
      sections.push({ label: ctx.name ? `J'écris mon prénom : ${ctx.name}` : 'J\'écris : DINO', models: name, rows: ['model', 'dots', 'dots', 'first', 'first'], size });
      if (ctx.age <= 4) {
        for (const id of graph.slice(0, 2)) {
          sections.push({ label: sections.length === 1 ? 'Et maintenant, des formes :' : '', models: repeatShape(id, Math.floor(width / (20 * 0.82))), rows: ['dots'], size: 20 });
        }
      } else {
        const digits = (ctx.age <= 5 ? '12345' : '0123456789').split('').map((d) => LETTERS.get(d) ?? null);
        sections.push({ label: 'Les chiffres', models: digits, rows: ['model', 'dots'], size: fit(ctx.age <= 5 ? 16 : 14, digits.length) });
        const weak = ctx.weakLetters.filter((l) => LETTERS.has(l)).slice(0, 3);
        const extra = weak.length ? weak : shuffle(LETTER_MODELS.filter((m) => /[A-Z]/.test(m.id) && !glyphs.includes(m.id)), rng).slice(0, 2).map((m) => m.id);
        const repeat = Math.floor(width / (13 * 0.82) / extra.length);
        const models = extra.flatMap((l) => Array.from({ length: repeat }, () => LETTERS.get(l) ?? null));
        sections.push({ label: weak.length ? 'Les lettres à retravailler' : 'D\'autres lettres', models, rows: ['dots', 'dots'], size: 13 });
      }
    }
    let y = 34;
    let body = '';
    for (const s of sections) {
      if (s.label) {
        body += text(x, y + 5, 5, s.label, { anchor: 'start' });
        y += 9;
      }
      for (const style of s.rows) {
        if (y + s.size > 262) break;
        body += row(s.models, x, y, s.size, style, width);
        y += s.size * 1.08;
      }
      y += 4;
    }
    // Place libre en bas : un cadre pour dessiner son dino.
    if (ctx.age >= 4 && y < 205) {
      body += text(x, y + 6, 5, 'Dessine ton dino et écris son nom :', { anchor: 'start' })
        + `<rect x="${x}" y="${n(y + 10)}" width="${width}" height="${n(268 - y - 10)}" rx="4" fill="none" stroke="${LIGHT}" stroke-width="0.6"/>`;
    }
    body = text(105, 24, 7, ctx.age <= 3 ? 'Je trace des formes' : 'J\'écris') + body
      + dinoAt({ ...lookOf(ctx, false), eyes: 'happy' }, 186, 286, 20);
    return {
      title: ctx.age <= 3 ? 'Graphisme' : ofTitle(ctx.name),
      pages: [page(body, { footer: footerOf(ctx) })],
      advice: {
        skills: ctx.age <= 3
          ? ['Graphisme : traits, ronds, vagues (préparent l\'écriture)', 'Tenue du crayon', 'Suivre une ligne de gauche à droite']
          : ['Écrire son prénom en capitales', 'Sens du tracé : on part du point vert', ctx.age >= 5 ? 'Les chiffres et quelques lettres' : 'Graphisme'],
        talk: 'Montrez d\'abord le modèle en trait plein : on commence au point vert, et les petits numéros donnent l\'ordre des traits. '
          + 'Dites le nom de chaque lettre en la traçant.',
        further: 'Tracez les lettres de son prénom dans la farine, le sable ou avec le doigt dans son dos : il devine la lettre.',
        material: 'Un crayon à papier bien taillé (ou un feutre fin). Les crayons triangulaires aident à bien le tenir.',
      },
    };
  },
};

const ofTitle = (name: string) => (name ? `J'écris ${name}` : 'J\'écris');
