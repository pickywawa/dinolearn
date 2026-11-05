/**
 * Voix plus aiguë sans aller plus vite : on étire le son (WSOLA : on recolle
 * de petits morceaux qui se ressemblent, sans changer la hauteur), puis on le
 * relit plus vite. Il retrouve sa durée d'origine, mais plus aigu.
 * Environ 70 ms pour une phrase de 5 s sur un téléphone récent.
 */
export function pitchShift(x: Float32Array, sampleRate: number, factor: number): Float32Array {
  if (factor === 1 || x.length === 0) return x;
  const N = Math.round(sampleRate * 0.03);
  const Hs = N >> 1;
  const tol = Math.round(N / 4);
  const win = Float32Array.from({ length: N }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1)));
  const out = new Float32Array(Math.ceil(x.length * factor) + 2 * N);
  const norm = new Float32Array(out.length);
  let inPos = 0;
  let prev = -1;
  let outPos = 0;
  while (inPos + N + tol < x.length && outPos + N < out.length) {
    const at = Math.round(inPos);
    let best = at;
    const ref = prev + Hs;
    // On cherche, près de la position idéale, le morceau qui prolonge le mieux le précédent.
    if (prev >= 0 && ref + N <= x.length) {
      let bestC = -Infinity;
      for (let d = -tol; d <= tol; d += 2) {
        const q = at + d;
        if (q < 0 || q + N > x.length) continue;
        let c = 0;
        for (let i = 0; i < N; i += 3) c += x[q + i] * x[ref + i];
        if (c > bestC) { bestC = c; best = q; }
      }
    }
    for (let i = 0; i < N; i++) {
      out[outPos + i] += x[best + i] * win[i];
      norm[outPos + i] += win[i];
    }
    prev = best;
    inPos += Hs / factor;
    outPos += Hs;
  }
  const len = outPos + N;
  for (let i = 0; i < len; i++) if (norm[i] > 1e-3) out[i] /= norm[i];
  // Relecture plus rapide (interpolation linéaire) : même durée qu'au départ, voix plus aiguë.
  const y = new Float32Array(Math.max(0, Math.floor((len - 1) / factor)));
  for (let k = 0; k < y.length; k++) {
    const pos = k * factor;
    const i = Math.floor(pos);
    y[k] = out[i] + (out[i + 1] - out[i]) * (pos - i);
  }
  return y;
}
