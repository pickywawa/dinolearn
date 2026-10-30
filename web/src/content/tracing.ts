import { Point } from '../domain/trace';

/**
 * Modèles à tracer : des traits (suites de points) dans un cadre 0–1, y vers
 * le bas. Les numéros des traits montrent l'ordre conseillé (non obligatoire).
 */
export interface TraceModel {
  id: string;
  /** Ce que dit le dino : « un triangle », « la lettre A »… */
  name: string;
  strokes: Point[][];
  /** Niveau avec pointillés ; les points légers et le dessin libre viennent plus tard. */
  level: number;
}

/** Arc d'ellipse, angles en degrés (0 = à droite, 90 = en bas). */
function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 32): Point[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });
}

const join = (...parts: Point[][]): Point[] => parts.flat();

/** Formes du jeu « Trace les formes ». */
export const SHAPE_MODELS: TraceModel[] = [
  { id: 'line-h', name: 'un trait couché', level: 1, strokes: [[[0.12, 0.5], [0.88, 0.5]]] },
  { id: 'line-v', name: 'un trait debout', level: 1, strokes: [[[0.5, 0.12], [0.5, 0.88]]] },
  { id: 'circle', name: 'un rond', level: 2, strokes: [arc(0.5, 0.5, 0.36, 0.36, -90, 270)] },
  { id: 'diagonal', name: 'un trait penché', level: 2, strokes: [[[0.18, 0.18], [0.82, 0.82]]] },
  { id: 'cross', name: 'une croix', level: 3, strokes: [[[0.5, 0.12], [0.5, 0.88]], [[0.12, 0.5], [0.88, 0.5]]] },
  { id: 'square', name: 'un carré', level: 3, strokes: [[[0.18, 0.18], [0.82, 0.18], [0.82, 0.82], [0.18, 0.82], [0.18, 0.18]]] },
  { id: 'triangle', name: 'un triangle', level: 4, strokes: [[[0.5, 0.14], [0.86, 0.84], [0.14, 0.84], [0.5, 0.14]]] },
  { id: 'rectangle', name: 'un rectangle', level: 4, strokes: [[[0.1, 0.3], [0.9, 0.3], [0.9, 0.7], [0.1, 0.7], [0.1, 0.3]]] },
  { id: 'zigzag', name: 'un zigzag', level: 5, strokes: [[[0.1, 0.35], [0.3, 0.65], [0.5, 0.35], [0.7, 0.65], [0.9, 0.35]]] },
  {
    id: 'wave', name: 'une vague', level: 5,
    strokes: [Array.from({ length: 41 }, (_, i): Point => [0.1 + i * 0.02, 0.5 + 0.15 * Math.sin((i / 40) * Math.PI * 4)])],
  },
  { id: 'diamond', name: 'un losange', level: 6, strokes: [[[0.5, 0.12], [0.8, 0.5], [0.5, 0.88], [0.2, 0.5], [0.5, 0.12]]] },
  {
    id: 'spiral', name: 'un escargot', level: 7,
    strokes: [Array.from({ length: 61 }, (_, i): Point => {
      const t = (i / 60) * Math.PI * 4.5;
      const r = 0.03 + 0.026 * t;
      return [0.5 + r * Math.cos(t), 0.5 + r * Math.sin(t)];
    })],
  },
  {
    id: 'star', name: 'une étoile', level: 7,
    strokes: [Array.from({ length: 11 }, (_, i): Point => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? 0.4 : 0.17;
      return [0.5 + r * Math.cos(a), 0.54 + r * Math.sin(a)];
    })],
  },
  {
    id: 'house', name: 'une maison', level: 8,
    strokes: [[[0.24, 0.48], [0.24, 0.88], [0.76, 0.88], [0.76, 0.48], [0.24, 0.48]], [[0.18, 0.5], [0.5, 0.14], [0.82, 0.5]]],
  },
  {
    id: 'heart', name: 'un cœur', level: 8,
    strokes: [Array.from({ length: 49 }, (_, i): Point => {
      const t = (i / 48) * Math.PI * 2;
      const x = 16 * Math.sin(t) ** 3;
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      return [0.5 + x / 46, 0.47 + y / 46];
    })],
  },
  {
    id: 'sun', name: 'un soleil', level: 9,
    strokes: [arc(0.5, 0.5, 0.2, 0.2, -90, 270), ...Array.from({ length: 8 }, (_, i): Point[] => {
      const a = (i * Math.PI) / 4;
      return [[0.5 + 0.28 * Math.cos(a), 0.5 + 0.28 * Math.sin(a)], [0.5 + 0.42 * Math.cos(a), 0.5 + 0.42 * Math.sin(a)]];
    })],
  },
];

const L = (id: string, level: number, ...strokes: Point[][]): TraceModel =>
  ({ id, name: `la lettre ${id}`, level, strokes });
const D = (id: string, name: string, level: number, ...strokes: Point[][]): TraceModel =>
  ({ id, name: `le chiffre ${name}`, level, strokes });

/** Lettres capitales et chiffres du jeu « Trace les lettres ». */
export const LETTER_MODELS: TraceModel[] = [
  L('I', 1, [[0.5, 0.1], [0.5, 0.9]]),
  L('L', 1, [[0.3, 0.1], [0.3, 0.9], [0.75, 0.9]]),
  L('T', 1, [[0.2, 0.1], [0.8, 0.1]], [[0.5, 0.1], [0.5, 0.9]]),
  D('1', 'un', 1, [[0.35, 0.28], [0.55, 0.1], [0.55, 0.9]]),
  L('H', 2, [[0.25, 0.1], [0.25, 0.9]], [[0.75, 0.1], [0.75, 0.9]], [[0.25, 0.5], [0.75, 0.5]]),
  L('E', 2, [[0.75, 0.1], [0.25, 0.1], [0.25, 0.9], [0.75, 0.9]], [[0.25, 0.5], [0.65, 0.5]]),
  L('F', 2, [[0.75, 0.1], [0.25, 0.1], [0.25, 0.9]], [[0.25, 0.5], [0.65, 0.5]]),
  D('7', 'sept', 2, [[0.22, 0.1], [0.78, 0.1], [0.42, 0.9]]),
  L('A', 3, [[0.2, 0.9], [0.5, 0.1], [0.8, 0.9]], [[0.32, 0.6], [0.68, 0.6]]),
  L('V', 3, [[0.2, 0.1], [0.5, 0.9], [0.8, 0.1]]),
  L('X', 3, [[0.22, 0.1], [0.78, 0.9]], [[0.78, 0.1], [0.22, 0.9]]),
  L('Z', 3, [[0.22, 0.1], [0.78, 0.1], [0.22, 0.9], [0.78, 0.9]]),
  D('4', 'quatre', 3, [[0.62, 0.9], [0.62, 0.1], [0.2, 0.65], [0.8, 0.65]]),
  L('N', 4, [[0.25, 0.9], [0.25, 0.1], [0.75, 0.9], [0.75, 0.1]]),
  L('M', 4, [[0.2, 0.9], [0.2, 0.1], [0.5, 0.72], [0.8, 0.1], [0.8, 0.9]]),
  L('W', 4, [[0.12, 0.1], [0.3, 0.9], [0.5, 0.35], [0.7, 0.9], [0.88, 0.1]]),
  L('K', 4, [[0.28, 0.1], [0.28, 0.9]], [[0.75, 0.1], [0.28, 0.55], [0.75, 0.9]]),
  L('Y', 4, [[0.22, 0.1], [0.5, 0.5], [0.78, 0.1]], [[0.5, 0.5], [0.5, 0.9]]),
  L('O', 5, arc(0.5, 0.5, 0.32, 0.4, -90, 270)),
  L('C', 5, arc(0.54, 0.5, 0.32, 0.4, -45, -315)),
  D('0', 'zéro', 5, arc(0.5, 0.5, 0.27, 0.4, -90, 270)),
  L('U', 5, join([[0.25, 0.1], [0.25, 0.6]], arc(0.5, 0.6, 0.25, 0.3, 180, 0), [[0.75, 0.6], [0.75, 0.1]])),
  L('J', 6, join([[0.65, 0.1], [0.65, 0.65]], arc(0.45, 0.65, 0.2, 0.25, 0, 180))),
  L('D', 6, [[0.25, 0.1], [0.25, 0.9]], join([[0.25, 0.1], [0.45, 0.1]], arc(0.45, 0.5, 0.32, 0.4, -90, 90), [[0.45, 0.9], [0.25, 0.9]])),
  L('P', 6, join([[0.28, 0.9], [0.28, 0.1], [0.52, 0.1]], arc(0.52, 0.3, 0.22, 0.2, -90, 90), [[0.52, 0.5], [0.28, 0.5]])),
  D('2', 'deux', 6, join(arc(0.5, 0.3, 0.25, 0.2, 200, 390), [[0.25, 0.9], [0.78, 0.9]])),
  D('5', 'cinq', 6, join([[0.72, 0.1], [0.32, 0.1], [0.3, 0.45]], arc(0.48, 0.65, 0.27, 0.25, -140, 150))),
  L('B', 7, [[0.25, 0.1], [0.25, 0.9]],
    join([[0.25, 0.1], [0.55, 0.1]], arc(0.55, 0.3, 0.2, 0.2, -90, 90), [[0.25, 0.5], [0.58, 0.5]],
      arc(0.58, 0.7, 0.22, 0.2, -90, 90), [[0.58, 0.9], [0.25, 0.9]])),
  L('R', 7, join([[0.28, 0.9], [0.28, 0.1], [0.52, 0.1]], arc(0.52, 0.3, 0.22, 0.2, -90, 90), [[0.52, 0.5], [0.28, 0.5]]),
    [[0.48, 0.5], [0.78, 0.9]]),
  L('G', 7, join(arc(0.52, 0.5, 0.32, 0.4, -45, -360), [[0.84, 0.5], [0.58, 0.5]])),
  D('3', 'trois', 7, arc(0.48, 0.3, 0.25, 0.2, 200, 450), arc(0.48, 0.7, 0.27, 0.2, -90, 160)),
  D('6', 'six', 7, join(arc(0.56, 0.5, 0.3, 0.4, -60, -180), arc(0.5, 0.68, 0.24, 0.22, 180, 540))),
  L('S', 8, join(arc(0.5, 0.3, 0.24, 0.2, -30, -270), arc(0.5, 0.7, 0.26, 0.2, -90, 150))),
  L('Q', 8, arc(0.5, 0.5, 0.32, 0.4, -90, 270), [[0.58, 0.68], [0.82, 0.92]]),
  D('8', 'huit', 8, arc(0.5, 0.3, 0.2, 0.2, 90, 450), arc(0.5, 0.7, 0.25, 0.2, -90, 270)),
  D('9', 'neuf', 8, arc(0.5, 0.32, 0.24, 0.22, 0, 360), [[0.74, 0.32], [0.68, 0.9]]),
];

/** Modes : avec pointillés, avec des points légers, puis tout seul (avec un modèle à côté). */
export type TraceMode = 'dots' | 'faint' | 'free';
export const TRACE_MODES: [TraceMode, number][] = [['dots', 0], ['faint', 5], ['free', 10]];

export const traceModel = (id: string) =>
  [...SHAPE_MODELS, ...LETTER_MODELS].find((m) => m.id === id);
