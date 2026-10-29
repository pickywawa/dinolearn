/**
 * Dino « peluche » en pièces SVG détachées, animées par Phaser (tweens).
 * Style aligné sur le pack d'illustrations withicons Plush : contour bleu nuit
 * épais, couleurs douces, reflet clair.
 */
const OUTLINE = '#2d3354';
const SKIN = '#7bd45a';
const SKIN_DARK = '#58b23f';
const BELLY = '#fff1bd';
const SPIKE = '#ff9f43';
const CHEEK = '#ff8fa3';
const W = 8; // épaisseur du contour

const svg = (w: number, h: number, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

export interface DinoPart {
  key: string;
  width: number;
  height: number;
  svg: string;
}

export const DINO_PARTS: DinoPart[] = [
  {
    key: 'dino-tail',
    width: 220,
    height: 170,
    svg: svg(220, 170, `
      <path d="M20 110 C70 120 120 112 160 70 C178 50 196 30 206 16 C210 60 196 110 160 136 C120 162 60 160 18 148 Z"
        fill="${SKIN}" stroke="${OUTLINE}" stroke-width="${W}" stroke-linejoin="round"/>
      <path d="M40 140 C90 146 140 130 170 100" fill="none" stroke="${SKIN_DARK}" stroke-width="10" stroke-linecap="round" opacity=".6"/>
      <path d="M120 98 l14 -26 l10 24 z M154 64 l16 -22 l6 22 z" fill="${SPIKE}" stroke="${OUTLINE}" stroke-width="5" stroke-linejoin="round"/>`),
  },
  {
    key: 'dino-body',
    width: 270,
    height: 250,
    svg: svg(270, 250, `
      <ellipse cx="135" cy="128" rx="118" ry="112" fill="${SKIN}" stroke="${OUTLINE}" stroke-width="${W}"/>
      <path d="M40 170 C70 225 200 225 230 170" fill="none" stroke="${SKIN_DARK}" stroke-width="16" stroke-linecap="round" opacity=".55"/>
      <ellipse cx="135" cy="146" rx="70" ry="74" fill="${BELLY}" stroke="${OUTLINE}" stroke-width="6"/>
      <path d="M85 120 h100 M80 150 h110 M88 180 h94" stroke="#f1d98f" stroke-width="6" stroke-linecap="round"/>
      <ellipse cx="80" cy="70" rx="26" ry="14" fill="#fff" opacity=".35" transform="rotate(-35 80 70)"/>`),
  },
  {
    key: 'dino-leg',
    width: 110,
    height: 80,
    svg: svg(110, 80, `
      <path d="M12 60 C10 22 34 8 56 8 C80 8 100 24 98 60 C98 70 90 72 55 72 C20 72 12 70 12 60 Z"
        fill="${SKIN_DARK}" stroke="${OUTLINE}" stroke-width="${W}" stroke-linejoin="round"/>
      <path d="M30 70 v-10 M55 72 v-12 M80 70 v-10" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`),
  },
  {
    key: 'dino-arm',
    width: 70,
    height: 110,
    svg: svg(70, 110, `
      <path d="M22 10 C40 6 54 18 54 38 L56 78 C58 96 46 104 34 102 C20 100 14 90 16 76 L14 34 C12 20 14 12 22 10 Z"
        fill="${SKIN}" stroke="${OUTLINE}" stroke-width="${W}" stroke-linejoin="round"/>
      <path d="M24 100 l-4 8 M36 103 v8 M48 99 l4 7" stroke="${OUTLINE}" stroke-width="5" stroke-linecap="round"/>`),
  },
  {
    key: 'dino-head',
    width: 330,
    height: 290,
    svg: svg(330, 290, `
      <path d="M96 66 l18 -50 l26 46 z M150 50 l26 -46 l20 50 z M206 60 l32 -36 l8 52 z"
        fill="${SPIKE}" stroke="${OUTLINE}" stroke-width="7" stroke-linejoin="round"/>
      <ellipse cx="165" cy="160" rx="150" ry="116" fill="${SKIN}" stroke="${OUTLINE}" stroke-width="${W}"/>
      <path d="M40 200 C80 262 250 262 290 200" fill="none" stroke="${SKIN_DARK}" stroke-width="16" stroke-linecap="round" opacity=".5"/>
      <ellipse cx="88" cy="96" rx="34" ry="18" fill="#fff" opacity=".35" transform="rotate(-30 88 96)"/>
      <ellipse cx="62" cy="196" rx="26" ry="15" fill="${CHEEK}" opacity=".75"/>
      <ellipse cx="268" cy="196" rx="26" ry="15" fill="${CHEEK}" opacity=".75"/>
      <circle cx="148" cy="190" r="5" fill="${OUTLINE}"/>
      <circle cx="182" cy="190" r="5" fill="${OUTLINE}"/>`),
  },
  {
    key: 'dino-eye',
    width: 80,
    height: 90,
    svg: svg(80, 90, `
      <ellipse cx="40" cy="45" rx="32" ry="38" fill="#fff" stroke="${OUTLINE}" stroke-width="7"/>
      <circle cx="44" cy="50" r="20" fill="${OUTLINE}"/>
      <circle cx="36" cy="40" r="8" fill="#fff"/>
      <circle cx="52" cy="60" r="4" fill="#fff"/>`),
  },
  {
    key: 'dino-eye-closed',
    width: 80,
    height: 90,
    svg: svg(80, 90, `<path d="M10 50 Q40 66 70 50" fill="none" stroke="${OUTLINE}" stroke-width="8" stroke-linecap="round"/>`),
  },
  {
    key: 'dino-eye-happy',
    width: 80,
    height: 90,
    svg: svg(80, 90, `<path d="M10 58 Q40 18 70 58" fill="none" stroke="${OUTLINE}" stroke-width="9" stroke-linecap="round"/>`),
  },
  {
    key: 'dino-mouth-smile',
    width: 120,
    height: 80,
    svg: svg(120, 80, `<path d="M20 24 Q60 66 100 24" fill="none" stroke="${OUTLINE}" stroke-width="8" stroke-linecap="round"/>`),
  },
  {
    key: 'dino-mouth-small',
    width: 120,
    height: 80,
    svg: svg(120, 80, `
      <ellipse cx="60" cy="36" rx="22" ry="14" fill="#8e2c3a" stroke="${OUTLINE}" stroke-width="6"/>
      <ellipse cx="60" cy="44" rx="12" ry="5" fill="#ff7a8a"/>`),
  },
  {
    key: 'dino-mouth-open',
    width: 120,
    height: 80,
    svg: svg(120, 80, `
      <path d="M26 18 Q60 10 94 18 Q92 70 60 72 Q28 70 26 18 Z" fill="#8e2c3a" stroke="${OUTLINE}" stroke-width="6" stroke-linejoin="round"/>
      <ellipse cx="60" cy="58" rx="20" ry="10" fill="#ff7a8a"/>
      <path d="M40 18 l6 10 l6 -10 M68 18 l6 10 l6 -10" fill="#fff"/>`),
  },
  {
    key: 'dino-mouth-wide',
    width: 120,
    height: 80,
    svg: svg(120, 80, `
      <path d="M12 12 Q60 2 108 12 Q104 76 60 78 Q16 76 12 12 Z" fill="#8e2c3a" stroke="${OUTLINE}" stroke-width="6" stroke-linejoin="round"/>
      <ellipse cx="60" cy="62" rx="28" ry="12" fill="#ff7a8a"/>
      <path d="M30 12 l7 12 l7 -12 M76 12 l7 12 l7 -12" fill="#fff"/>`),
  },
  {
    key: 'dino-mouth-o',
    width: 120,
    height: 80,
    svg: svg(120, 80, `<ellipse cx="60" cy="40" rx="18" ry="22" fill="#8e2c3a" stroke="${OUTLINE}" stroke-width="6"/>`),
  },
  {
    key: 'guide-hand',
    width: 120,
    height: 150,
    // Main qui pointe de l'index (le bout du doigt est en haut à gauche).
    svg: svg(120, 150, `
      <path d="M30 14 C30 4 50 4 50 14 L50 62 C54 54 70 54 72 64 C76 56 92 58 92 70 C96 62 112 66 110 80
        L108 112 C106 132 92 144 70 144 L58 144 C40 144 30 134 24 120 L8 88 C4 78 16 70 24 78 L30 86 Z"
        fill="#ffe0c2" stroke="${OUTLINE}" stroke-width="7" stroke-linejoin="round"/>
      <path d="M50 66 v22 M72 66 v22 M92 74 v16" stroke="${OUTLINE}" stroke-width="5" stroke-linecap="round" opacity=".5"/>
      <rect x="40" y="128" width="52" height="16" rx="6" fill="#3b7de9" stroke="${OUTLINE}" stroke-width="6"/>`),
  },
  {
    key: 'egg',
    width: 220,
    height: 270,
    svg: svg(220, 270, `
      <path d="M110 10 C170 10 210 110 210 170 C210 230 166 262 110 262 C54 262 10 230 10 170 C10 110 50 10 110 10 Z"
        fill="#fff8e7" stroke="${OUTLINE}" stroke-width="${W}"/>
      <circle cx="70" cy="110" r="18" fill="#7bd45a" stroke="${OUTLINE}" stroke-width="5"/>
      <circle cx="146" cy="80" r="12" fill="#ff9f43" stroke="${OUTLINE}" stroke-width="5"/>
      <circle cx="150" cy="180" r="22" fill="#7bd45a" stroke="${OUTLINE}" stroke-width="5"/>
      <circle cx="80" cy="210" r="12" fill="#ff8fa3" stroke="${OUTLINE}" stroke-width="5"/>
      <ellipse cx="72" cy="60" rx="20" ry="10" fill="#fff" transform="rotate(-40 72 60)"/>`),
  },
];

/** Résolution de rendu des SVG (×2 pour un affichage net sur mobile). */
export const PART_RESOLUTION = 2;
