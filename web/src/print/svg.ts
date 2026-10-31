import { OUTLINE_COLOR } from '../dino/parts';

/**
 * Outils communs des fiches à imprimer : une page A4 en SVG (unités en
 * millimètres, 210 × 297), le titre, le pied de page, les traits de coupe.
 * Tout est vectoriel (sauf les images d'objets) : la fiche reste nette à
 * l'impression, quelle que soit l'imprimante.
 */

export const PAGE_W = 210;
export const PAGE_H = 297;
/** Marge que la plupart des imprimantes ne savent pas imprimer. */
export const MARGIN = 10;
export const INK = OUTLINE_COLOR;
export const FONT = `font-family="Andika, 'Comic Sans MS', Arial, sans-serif" font-weight="700"`;
/** Gris clair des traits de coupe et des pointillés. */
export const GREY = '#9aa1b2';
export const LIGHT = '#d5d9e2';

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const n = (x: number) => (Math.round(x * 100) / 100).toString();

/** Texte centré (ou aligné) en mm. */
export function text(x: number, y: number, size: number, value: string, opts: {
  anchor?: 'start' | 'middle' | 'end'; fill?: string; stroke?: string; strokeWidth?: number; weight?: number; extra?: string;
} = {}) {
  const fill = opts.fill ?? INK;
  const stroke = opts.stroke ? ` stroke="${opts.stroke}" stroke-width="${n(opts.strokeWidth ?? 0.5)}" stroke-linejoin="round"` : '';
  const font = opts.weight === 400 ? FONT.replace('700', '400') : FONT;
  return `<text x="${n(x)}" y="${n(y)}" font-size="${n(size)}" ${font} text-anchor="${opts.anchor ?? 'middle'}" `
    + `fill="${fill}"${stroke} ${opts.extra ?? ''}>${esc(value)}</text>`;
}

/** Lettres creuses à colorier (le prénom en haut des coloriages). */
export const hollowText = (x: number, y: number, size: number, value: string) =>
  text(x, y, size, value, { fill: '#fff', stroke: INK, strokeWidth: size * 0.04, extra: 'letter-spacing="1"' });

/** Image (objets, fruits, animaux…) chargée depuis public/img/. */
export const image = (key: string, x: number, y: number, w: number, h = w, extra = '') =>
  `<image href="img/${key}.svg" x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" ${extra}/>`;

/** Petits ciseaux, au début d'un trait de coupe. */
export function scissors(x: number, y: number, size = 6, angle = 0) {
  const k = size / 10;
  return `<g transform="translate(${n(x)} ${n(y)}) rotate(${angle}) scale(${n(k)})" fill="none" stroke="${INK}" stroke-width="1.1" stroke-linecap="round">
    <circle cx="-3.2" cy="2.6" r="1.8"/><circle cx="-3.2" cy="-2.6" r="1.8"/>
    <path d="M-1.7 1.6 L5 -2.4 M-1.7 -1.6 L5 2.4"/></g>`;
}

/** Trait de coupe en tirets. */
export const cutLine = (d: string, width = 0.4) =>
  `<path d="${d}" fill="none" stroke="${GREY}" stroke-width="${width}" stroke-dasharray="2.2 1.6" stroke-linecap="round"/>`;

/** Rectangle de coupe en tirets. */
export const cutRect = (x: number, y: number, w: number, h: number, r = 0) =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(r)}" fill="none" stroke="${GREY}" stroke-width="0.35" stroke-dasharray="2 1.5"/>`;

/** Trait de pliage (tirets fins et longs). */
export const foldLine = (x1: number, y1: number, x2: number, y2: number) =>
  `<path d="M${n(x1)} ${n(y1)} L${n(x2)} ${n(y2)}" stroke="${GREY}" stroke-width="0.3" stroke-dasharray="4 1 1 1"/>`;

/** Définitions communes : objets en gris très pâle (coloriages), reliefs. */
const DEFS = `<defs>
  <filter id="pale" color-interpolation-filters="sRGB">
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncR type="linear" slope="0.35" intercept="0.65"/><feFuncG type="linear" slope="0.35" intercept="0.65"/><feFuncB type="linear" slope="0.35" intercept="0.65"/></feComponentTransfer>
  </filter>
  <style>.halo * { fill: ${LIGHT} !important; stroke: ${LIGHT} !important; stroke-width: inherit !important; stroke-linejoin: round !important; stroke-dasharray: none !important; stroke-opacity: 1 !important; fill-opacity: 1 !important; opacity: 1 !important; }</style>
</defs>`;

export interface PageOptions {
  /** Titre en haut de la page. */
  title?: string;
  /** Pied de page (prénom, date). */
  footer?: string;
  /** Pas de cadre (pièces à découper qui vont jusqu'au bord). */
  frame?: boolean;
}

/** Une page A4 complète, prête à être insérée dans le document ou imprimée. */
export function page(body: string, opts: PageOptions = {}): string {
  const frame = opts.frame === false ? '' : frameDecor();
  const title = opts.title ? text(PAGE_W / 2, MARGIN + 11, 9, opts.title) : '';
  const footer = opts.footer
    ? text(PAGE_W / 2, PAGE_H - 6.5, 3, opts.footer, { fill: GREY, weight: 400 })
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${PAGE_W} ${PAGE_H}" `
    + `width="${PAGE_W}mm" height="${PAGE_H}mm">${DEFS}<rect width="${PAGE_W}" height="${PAGE_H}" fill="#fff"/>`
    + `${frame}${title}${body}${footer}</svg>`;
}

/** Cadre arrondi avec de petits piquants de dino dans les coins. */
function frameDecor() {
  const m = MARGIN - 4;
  const spikes = (x: number, y: number, sx: number, sy: number) =>
    `<path d="M${x} ${y + sy * 10} l${sx * 3} ${-sy * 6} l${sx * 3} ${sy * 6} M${x + sx * 10} ${y} l${-sx * 6} ${sy * 3} l${sx * 6} ${sy * 3}"
      fill="none" stroke="${GREY}" stroke-width="0.6" stroke-linejoin="round"/>`;
  return `<rect x="${m}" y="${m}" width="${PAGE_W - 2 * m}" height="${PAGE_H - 2 * m}" rx="6" fill="none" stroke="${LIGHT}" stroke-width="0.8"/>`
    + spikes(m + 3, m + 3, 1, 1) + spikes(PAGE_W - m - 3, m + 3, -1, 1)
    + spikes(m + 3, PAGE_H - m - 3, 1, -1) + spikes(PAGE_W - m - 3, PAGE_H - m - 3, -1, -1);
}

/** Bulle de BD (consigne dite par le dino sur la fiche) ; la pointe part en bas, vers le dino. */
export function speech(x: number, y: number, w: number, lines: string[], size = 4.2, tail: 'left' | 'right' = 'left') {
  const h = lines.length * size * 1.3 + size * 0.9;
  // Pointe : deux côtés tracés, la base (sur le bord de la bulle) recouverte de blanc.
  const [a, b, tip] = tail === 'left'
    ? [x + 8, x + 18, [x + 2, y + h + 7]]
    : [x + w - 18, x + w - 8, [x + w - 2, y + h + 7]];
  return `<g><rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(size)}" fill="#fff" stroke="${INK}" stroke-width="0.6"/>`
    + `<path d="M${n(a)} ${n(y + h)} L${n(tip[0])} ${n(tip[1])} L${n(b)} ${n(y + h)}" fill="#fff" stroke="${INK}" stroke-width="0.6" stroke-linejoin="round"/>`
    + `<path d="M${n(a + 0.6)} ${n(y + h)} L${n(b - 0.6)} ${n(y + h)}" stroke="#fff" stroke-width="0.9"/>`
    + lines.map((l, i) => text(x + w / 2, y + size * 1.15 + i * size * 1.3, size, l, { weight: 400 })).join('')
    + '</g>';
}

/** Date du jour en toutes lettres (pied de page, diplôme). */
export const frDate = (at: number) =>
  new Date(at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/** Prénom pour les titres : « Léa » ; rien si pas de prénom. */
export const ofName = (name: string, noun: string) => (name ? `${noun} de ${name}` : noun);
