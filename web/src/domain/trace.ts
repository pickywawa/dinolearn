/**
 * Correction d'un tracé, tolérante mais fiable. Le modèle et le dessin sont
 * des suites de points (coordonnées 0–1 dans le cadre de dessin), rééchantillonnées
 * tous les 0,01. On mesure :
 * - la couverture : la part du modèle qui a un point du dessin tout près
 *   (le tracé est complet) ;
 * - la précision : la part du dessin qui est près du modèle (on n'a pas
 *   gribouillé partout) ;
 * - la longueur : pas plus de 2,5 fois celle du modèle (un gribouillis est
 *   très long, même sur une forme dense comme l'escargot).
 * Sans pointillés, le dessin peut être n'importe où et de n'importe quelle
 * taille : on le recadre d'abord sur le modèle (même centre, même taille).
 * Le sens et l'ordre des traits ne comptent pas.
 */
export type Point = [number, number];

export interface TraceScore {
  coverage: number;
  precision: number;
  /** Longueur du dessin / longueur du modèle (après recadrage). */
  length: number;
  ok: boolean;
}

const STEP = 0.01;

/** Points tous les `STEP` le long de chaque trait. */
export function resample(strokes: Point[][], step = STEP): Point[] {
  const out: Point[] = [];
  for (const stroke of strokes) {
    if (stroke.length === 0) continue;
    out.push(stroke[0]);
    // `since` : distance parcourue depuis le dernier point posé.
    let since = 0;
    for (let i = 1; i < stroke.length; i++) {
      const [px, py] = stroke[i - 1];
      const [x, y] = stroke[i];
      const len = Math.hypot(x - px, y - py);
      let pos = step - since;
      while (pos <= len) {
        out.push([px + ((x - px) * pos) / len, py + ((y - py) * pos) / len]);
        pos += step;
      }
      since = len - (pos - step);
    }
  }
  return out;
}

export function pathLength(strokes: Point[][]): number {
  let total = 0;
  for (const s of strokes) for (let i = 1; i < s.length; i++) total += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]);
  return total;
}

function bounds(points: Point[]) {
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [x, y] of points) {
    x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
  }
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, size: Math.max(x1 - x0, y1 - y0, 1e-6) };
}

/** Recadre le dessin sur le modèle : même centre, même taille (sans déformer). */
export function fitTo(drawn: Point[], model: Point[]): Point[] {
  const a = bounds(drawn);
  const b = bounds(model);
  const k = b.size / a.size;
  return drawn.map(([x, y]) => [b.cx + (x - a.cx) * k, b.cy + (y - a.cy) * k]);
}

/** Part des points de `from` qui ont un point de `to` à moins de `tol`. */
function near(from: Point[], to: Point[], tol: number): number {
  if (from.length === 0) return 0;
  const t2 = tol * tol;
  let hits = 0;
  for (const [x, y] of from) {
    for (const [u, v] of to) {
      if ((x - u) ** 2 + (y - v) ** 2 <= t2) {
        hits++;
        break;
      }
    }
  }
  return hits / from.length;
}

/**
 * Note un tracé. `free` : sans pointillés (le dessin est recadré, tolérance
 * un peu plus large).
 */
export function scoreTrace(model: Point[][], drawn: Point[][], free: boolean): TraceScore {
  const m = resample(model);
  let d = resample(drawn.filter((s) => s.length > 1));
  if (d.length < 5) return { coverage: 0, precision: 0, length: 0, ok: false };
  if (free) d = fitTo(d, m);
  const tol = 0.1;
  const coverage = near(m, d, tol);
  const precision = near(d, m, tol * 1.25);
  const length = d.length / m.length;
  return { coverage, precision, length, ok: coverage >= 0.93 && precision >= 0.9 && length <= 2.5 };
}
