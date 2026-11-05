import Phaser from 'phaser';
import { Sfx } from '../core/sfx';

/**
 * Le décor de l'île aux dinos (paysage) : ciel, mer turquoise, grand volcan
 * qui fume, falaise et cascade, jungle, palmiers, et grandes feuilles au
 * premier plan. Les couches fixes sont peintes une fois au canvas 2D (dégradés
 * doux) et gardées en texture ; seuls les éléments vivants sont des objets
 * Phaser (fumée, lave, nuages, cascade, palmiers et feuilles qui se balancent).
 *
 * Profondeurs : fond peint -12, fumée/lave -11.5, cascade -11, palmiers -10,
 * feuilles du premier plan -9 (toujours derrière l'interface, en profondeur ≥ 0).
 */
export type Mood = 'day' | 'dusk' | 'night' | 'soft';

interface Palette {
  sky: [string, string, string];
  sea: [string, string];
  far: string;
  volcano: [string, string];
  lava: string;
  jungle: [string, string, string];
  ground: [string, string];
  sand: string;
  sun: string;
  /** Voile final (lisibilité des écrans de jeu, nuit). */
  veil?: string;
}

const PALETTES: Record<Mood, Palette> = {
  day: {
    sky: ['#3fb3f0', '#8fd6fb', '#dff5ff'], sea: ['#37c6d8', '#1d93c2'], far: '#9fcfe0',
    volcano: ['#9a6650', '#5e3a35'], lava: '#ff7a1a', jungle: ['#2f8f3a', '#46b04a', '#6fcf55'],
    ground: ['#8fdc5a', '#5db63c'], sand: '#f4dfa6', sun: 'rgba(255,250,220,0.9)',
  },
  dusk: {
    sky: ['#f08a5d', '#f7b977', '#ffe3b8'], sea: ['#e0a38a', '#8c6d9e'], far: '#c9a3b4',
    volcano: ['#86514a', '#4f2f36'], lava: '#ff6a00', jungle: ['#2f7a3f', '#468f45', '#6aa84f'],
    ground: ['#88c45a', '#5a9a3c'], sand: '#f0cf97', sun: 'rgba(255,230,170,0.95)',
  },
  night: {
    sky: ['#0f1a44', '#26357a', '#4a5aa6'], sea: ['#25407a', '#152a58'], far: '#3a4d86',
    volcano: ['#4b3448', '#2a1d30'], lava: '#ff5a1a', jungle: ['#173f3a', '#1f5546', '#2c6b4f'],
    ground: ['#2f6b4a', '#1f4d38'], sand: '#8c8a9e', sun: 'rgba(255,250,220,0.0)',
  },
  soft: {
    sky: ['#5cc0f2', '#a5ddfb', '#e8f8ff'], sea: ['#59cfdc', '#33a3c9'], far: '#b5dbe8',
    volcano: ['#a57a68', '#7a5650'], lava: '#ff8a3a', jungle: ['#3d9a48', '#56b956', '#7fd463'],
    ground: ['#9ce06a', '#6fc04a'], sand: '#f6e4b4', sun: 'rgba(255,250,220,0.9)',
    veil: 'rgba(235,248,255,0.28)',
  },
};

/** Repères du décor (en fractions de l'écran), partagés entre la peinture et l'animation. */
const L = {
  horizon: 0.5,
  volcanoX: 0.74, volcanoTop: 0.14, volcanoBase: 0.6, volcanoHalf: 0.21,
  cliffX: 0.5, fallTop: 0.46, fallBottom: 0.7,
  ground: 0.84,
};

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ---------------------------------------------------------------- peinture

function paintBackground(g: CanvasRenderingContext2D, W: number, H: number, p: Palette, mood: Mood) {
  const r = rng(7);
  const hz = H * L.horizon;

  // Ciel.
  const sky = g.createLinearGradient(0, 0, 0, hz);
  sky.addColorStop(0, p.sky[0]);
  sky.addColorStop(0.6, p.sky[1]);
  sky.addColorStop(1, p.sky[2]);
  g.fillStyle = sky;
  g.fillRect(0, 0, W, hz + 2);

  // Soleil (halo doux) ou étoiles.
  if (mood === 'night') {
    for (let i = 0; i < 90; i++) {
      g.fillStyle = `rgba(255,248,210,${0.3 + r() * 0.7})`;
      g.beginPath();
      g.arc(r() * W, r() * hz * 0.9, 0.6 + r() * 1.8, 0, Math.PI * 2);
      g.fill();
    }
  } else {
    const sx = W * 0.18, sy = H * 0.14;
    const sun = g.createRadialGradient(sx, sy, 0, sx, sy, H * 0.35);
    sun.addColorStop(0, p.sun);
    sun.addColorStop(0.15, p.sun.replace(/[\d.]+\)$/, '0.6)'));
    sun.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = sun;
    g.fillRect(0, 0, W, hz);
  }

  // Îles lointaines.
  g.fillStyle = p.far;
  for (const [cx, w, h] of [[0.08, 0.22, 0.07], [0.3, 0.16, 0.045], [0.97, 0.18, 0.06]]) {
    g.beginPath();
    g.ellipse(W * cx, hz, W * w / 2, H * h, 0, Math.PI, 0);
    g.fill();
  }

  // Mer.
  const sea = g.createLinearGradient(0, hz, 0, H);
  sea.addColorStop(0, p.sea[0]);
  sea.addColorStop(1, p.sea[1]);
  g.fillStyle = sea;
  g.fillRect(0, hz, W, H - hz);
  g.strokeStyle = mood === 'night' ? 'rgba(200,220,255,0.25)' : 'rgba(255,255,255,0.45)';
  g.lineCap = 'round';
  for (let i = 0; i < 26; i++) {
    const y = hz + 6 + r() * H * 0.3;
    const x = r() * W;
    const w = 14 + r() * 40 * (1 + (y - hz) / H);
    g.lineWidth = 1.5 + (y - hz) / H * 3;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + w, y);
    g.stroke();
  }

  paintVolcano(g, W, H, p);
  paintIsland(g, W, H, p, r);
  if (p.veil) {
    g.fillStyle = p.veil;
    g.fillRect(0, 0, W, H);
  }
}

function paintVolcano(g: CanvasRenderingContext2D, W: number, H: number, p: Palette) {
  const cx = W * L.volcanoX, top = H * L.volcanoTop, base = H * L.volcanoBase, half = H * L.volcanoHalf / 0.5 * 0.5;
  const hw = W * 0.02 + H * 0.06; // demi-largeur du cratère
  const bw = half * 2.2;
  g.save();
  g.beginPath();
  g.moveTo(cx - bw, base);
  g.bezierCurveTo(cx - bw * 0.55, base - (base - top) * 0.25, cx - hw * 1.6, top + (base - top) * 0.25, cx - hw, top);
  g.quadraticCurveTo(cx, top + H * 0.025, cx + hw, top);
  g.bezierCurveTo(cx + hw * 1.6, top + (base - top) * 0.25, cx + bw * 0.55, base - (base - top) * 0.25, cx + bw, base);
  g.closePath();
  const body = g.createLinearGradient(cx - bw, 0, cx + bw, 0);
  body.addColorStop(0, p.volcano[0]);
  body.addColorStop(0.55, p.volcano[0]);
  body.addColorStop(1, p.volcano[1]);
  g.fillStyle = body;
  g.fill();
  g.clip();
  // Ombre verticale douce et stries de roche.
  g.strokeStyle = 'rgba(40,20,20,0.18)';
  g.lineWidth = 3;
  for (let i = -3; i <= 3; i++) {
    g.beginPath();
    g.moveTo(cx + i * hw * 0.5, top + 10);
    g.quadraticCurveTo(cx + i * bw * 0.25, base - (base - top) * 0.5, cx + i * bw * 0.32, base);
    g.stroke();
  }
  // Coulées de lave lumineuses.
  for (const [dx, len, wd] of [[-0.35, 0.55, 1], [0.15, 0.7, 1.2], [0.55, 0.4, 0.8]]) {
    const x0 = cx + dx * hw;
    g.save();
    g.shadowColor = p.lava;
    g.shadowBlur = 14;
    g.strokeStyle = p.lava;
    g.lineWidth = H * 0.012 * wd;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(x0, top + 4);
    g.bezierCurveTo(x0 + dx * 30, top + (base - top) * len * 0.4, x0 - dx * 20, top + (base - top) * len * 0.7,
      x0 + dx * 60, top + (base - top) * len);
    g.stroke();
    g.strokeStyle = '#ffd23f';
    g.lineWidth = H * 0.004 * wd;
    g.stroke();
    g.restore();
  }
  // Lueur du cratère.
  const glow = g.createRadialGradient(cx, top, 0, cx, top, hw * 1.6);
  glow.addColorStop(0, 'rgba(255,200,80,0.95)');
  glow.addColorStop(0.4, 'rgba(255,110,30,0.6)');
  glow.addColorStop(1, 'rgba(255,90,20,0)');
  g.fillStyle = glow;
  g.fillRect(cx - hw * 2, top - hw, hw * 4, hw * 3);
  g.restore();
}

/** Arbres « boules » de jungle (grappes de cercles en dégradé). */
function tree(g: CanvasRenderingContext2D, x: number, y: number, s: number, p: Palette, r: () => number) {
  for (let i = 0; i < 5; i++) {
    const cx = x + (r() - 0.5) * s * 1.2;
    const cy = y - s * 0.4 - r() * s * 0.6;
    const rad = s * (0.35 + r() * 0.3);
    const grad = g.createRadialGradient(cx - rad * 0.3, cy - rad * 0.4, rad * 0.1, cx, cy, rad);
    grad.addColorStop(0, p.jungle[2]);
    grad.addColorStop(0.7, p.jungle[1]);
    grad.addColorStop(1, p.jungle[0]);
    g.fillStyle = grad;
    g.beginPath();
    g.arc(cx, cy, rad, 0, Math.PI * 2);
    g.fill();
  }
}

function paintIsland(g: CanvasRenderingContext2D, W: number, H: number, p: Palette, r: () => number) {
  // Végétation au pied du volcan.
  for (let i = 0; i < 14; i++) {
    tree(g, W * (0.5 + r() * 0.5), H * (L.volcanoBase + 0.02 + r() * 0.03), H * (0.05 + r() * 0.04), p, r);
  }

  // Falaise rocheuse (d'où tombe la cascade) puis lagon.
  const cx = W * L.cliffX;
  g.fillStyle = '#8a7a6a';
  g.beginPath();
  g.moveTo(cx - W * 0.1, H * 0.74);
  g.lineTo(cx - W * 0.08, H * L.fallTop);
  g.quadraticCurveTo(cx, H * (L.fallTop - 0.04), cx + W * 0.09, H * (L.fallTop + 0.01));
  g.lineTo(cx + W * 0.12, H * 0.74);
  g.closePath();
  const rock = g.createLinearGradient(cx - W * 0.1, 0, cx + W * 0.12, 0);
  rock.addColorStop(0, '#a8968a');
  rock.addColorStop(1, '#6e5f58');
  g.fillStyle = rock;
  g.fill();
  for (let i = 0; i < 8; i++) tree(g, cx + (r() - 0.5) * W * 0.18, H * (L.fallTop + 0.01), H * (0.04 + r() * 0.03), p, r);
  // Lagon au pied de la cascade.
  const lag = g.createRadialGradient(cx, H * 0.74, 0, cx, H * 0.74, W * 0.16);
  lag.addColorStop(0, '#8ff0f0');
  lag.addColorStop(1, p.sea[0]);
  g.fillStyle = lag;
  g.beginPath();
  g.ellipse(cx, H * 0.745, W * 0.15, H * 0.05, 0, 0, Math.PI * 2);
  g.fill();

  // Jungle à gauche, derrière la plage.
  for (let i = 0; i < 18; i++) tree(g, W * (r() * 0.42), H * (0.62 + r() * 0.08), H * (0.06 + r() * 0.05), p, r);
  for (let i = 0; i < 10; i++) tree(g, W * (0.62 + r() * 0.4), H * (0.68 + r() * 0.06), H * (0.06 + r() * 0.05), p, r);

  // Plage.
  g.fillStyle = p.sand;
  g.beginPath();
  g.moveTo(0, H * 0.79);
  g.bezierCurveTo(W * 0.3, H * 0.74, W * 0.7, H * 0.76, W, H * 0.78);
  g.lineTo(W, H);
  g.lineTo(0, H);
  g.closePath();
  g.fill();

  // Herbe du premier plan, où se tient le dino.
  const gr = g.createLinearGradient(0, H * L.ground - 20, 0, H);
  gr.addColorStop(0, p.ground[0]);
  gr.addColorStop(1, p.ground[1]);
  g.fillStyle = gr;
  g.beginPath();
  g.moveTo(0, H * (L.ground - 0.01));
  g.bezierCurveTo(W * 0.25, H * (L.ground - 0.05), W * 0.6, H * (L.ground + 0.02), W, H * (L.ground - 0.03));
  g.lineTo(W, H);
  g.lineTo(0, H);
  g.closePath();
  g.fill();
  // Touffes d'herbe.
  g.strokeStyle = p.ground[1];
  g.lineWidth = 2.5;
  g.lineCap = 'round';
  for (let i = 0; i < 70; i++) {
    const x = r() * W, y = H * (L.ground + 0.02 + r() * 0.14);
    g.beginPath();
    g.moveTo(x - 4, y);
    g.lineTo(x - 7, y - 9);
    g.moveTo(x, y);
    g.lineTo(x, y - 12);
    g.moveTo(x + 4, y);
    g.lineTo(x + 7, y - 9);
    g.stroke();
  }
  // Petites fleurs.
  for (let i = 0; i < 24; i++) {
    const x = r() * W, y = H * (L.ground + 0.04 + r() * 0.12);
    g.fillStyle = ['#ff8fa3', '#ffd23f', '#ffffff', '#b58cec'][i % 4];
    for (let k = 0; k < 5; k++) {
      const a = k / 5 * Math.PI * 2;
      g.beginPath();
      g.arc(x + Math.cos(a) * 3.5, y + Math.sin(a) * 3.5, 3, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = '#ff9f1c';
    g.beginPath();
    g.arc(x, y, 2.2, 0, Math.PI * 2);
    g.fill();
  }
}

/** Palmier (texture) : tronc courbe annelé, palmes en éventail, noix de coco. */
function paintPalm(g: CanvasRenderingContext2D, w: number, h: number, dark: boolean) {
  const base = { x: w * 0.42, y: h };
  const top = { x: w * 0.55, y: h * 0.28 };
  const ctrl = { x: w * 0.3, y: h * 0.6 };
  // Tronc en anneaux.
  for (let i = 0; i <= 26; i++) {
    const t = i / 26;
    const x = (1 - t) ** 2 * base.x + 2 * (1 - t) * t * ctrl.x + t * t * top.x;
    const y = (1 - t) ** 2 * base.y + 2 * (1 - t) * t * ctrl.y + t * t * top.y;
    const rad = w * (0.055 - t * 0.02);
    g.fillStyle = i % 2 ? (dark ? '#5a4232' : '#a0714a') : (dark ? '#4a3628' : '#8a5e3b');
    g.beginPath();
    g.ellipse(x, y, rad, rad * 0.75, 0, 0, Math.PI * 2);
    g.fill();
  }
  // Palmes.
  const leaf = dark ? ['#1f4d3a', '#2b6447'] : ['#2f9a3a', '#5cc24a'];
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * 0.95 + i * (Math.PI * 1.1 / 6);
    const len = w * (0.42 + (i % 2) * 0.06);
    const ex = top.x + Math.cos(a) * len, ey = top.y + Math.sin(a) * len * 0.55 + len * 0.35;
    const mx = top.x + Math.cos(a) * len * 0.5, my = top.y + Math.sin(a) * len * 0.5 - len * 0.05;
    g.fillStyle = leaf[i % 2];
    g.beginPath();
    g.moveTo(top.x, top.y);
    g.quadraticCurveTo(mx - Math.sin(a) * len * 0.18, my + Math.cos(a) * len * 0.12, ex, ey);
    g.quadraticCurveTo(mx + Math.sin(a) * len * 0.08, my - Math.cos(a) * len * 0.12, top.x, top.y);
    g.fill();
    // Nervure.
    g.strokeStyle = 'rgba(0,40,0,0.25)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(top.x, top.y);
    g.quadraticCurveTo(mx, my, ex, ey);
    g.stroke();
  }
  for (const [dx, dy] of [[-0.03, 0.03], [0.03, 0.035], [0, 0.06]]) {
    g.fillStyle = dark ? '#3a2a1e' : '#6b4423';
    g.beginPath();
    g.arc(top.x + w * dx, top.y + h * dy, w * 0.035, 0, Math.PI * 2);
    g.fill();
  }
}

/** Grande feuille de jungle (premier plan). */
function paintLeaf(g: CanvasRenderingContext2D, w: number, h: number, colors: [string, string]) {
  const grad = g.createLinearGradient(0, h, w, 0);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(1, colors[1]);
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(w * 0.05, h);
  g.bezierCurveTo(-w * 0.05, h * 0.45, w * 0.45, h * 0.02, w * 0.98, h * 0.02);
  g.bezierCurveTo(w * 0.85, h * 0.45, w * 0.5, h * 0.9, w * 0.05, h);
  g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.25)';
  g.lineWidth = Math.max(2, w * 0.012);
  g.beginPath();
  g.moveTo(w * 0.05, h);
  g.quadraticCurveTo(w * 0.4, h * 0.45, w * 0.95, h * 0.05);
  g.stroke();
  g.lineWidth = Math.max(1.5, w * 0.007);
  for (let i = 1; i < 7; i++) {
    const t = i / 7;
    const x = w * (0.05 + 0.9 * t * t * 0.9 + t * 0.1), y = h * (1 - 0.95 * t);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x - w * 0.1, y - h * 0.12);
    g.moveTo(x, y);
    g.lineTo(x + w * 0.08, y + h * 0.02);
    g.stroke();
  }
}

/** Nuage doux. */
function paintCloud(g: CanvasRenderingContext2D, w: number, h: number, night: boolean) {
  const puffs = [[0.25, 0.65, 0.22], [0.45, 0.45, 0.3], [0.68, 0.55, 0.25], [0.5, 0.7, 0.28], [0.8, 0.7, 0.17]];
  for (const [x, y, r] of puffs) {
    const grad = g.createRadialGradient(w * x, h * y - h * r * 0.4, 0, w * x, h * y, h * r * 1.6);
    grad.addColorStop(0, night ? 'rgba(170,180,220,0.9)' : 'rgba(255,255,255,1)');
    grad.addColorStop(1, night ? 'rgba(120,130,190,0.85)' : 'rgba(225,240,252,0.95)');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(w * x, h * y, h * r * 1.2, 0, Math.PI * 2);
    g.fill();
  }
}

// ---------------------------------------------------------------- textures

function texture(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: CanvasRenderingContext2D) => void) {
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, Math.ceil(w), Math.ceil(h))!;
  paint(tex.getContext());
  tex.refresh();
  return key;
}

function ensureParticles(scene: Phaser.Scene) {
  texture(scene, 'isl-puff', 64, 64, (g) => {
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.6, 'rgba(255,255,255,0.7)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  });
  texture(scene, 'isl-ember', 24, 24, (g) => {
    const grad = g.createRadialGradient(12, 12, 0, 12, 12, 12);
    grad.addColorStop(0, 'rgba(255,240,180,1)');
    grad.addColorStop(0.5, 'rgba(255,150,40,0.9)');
    grad.addColorStop(1, 'rgba(255,80,20,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 24, 24);
  });
}

// ---------------------------------------------------------------- scène

export interface IslandOpts {
  /** Palmiers et grandes feuilles (non pour les écrans très chargés). */
  plants?: boolean;
  clouds?: number;
}

/** Peint l'île et lance ses animations. */
export function drawIsland(scene: Phaser.Scene, mood: Mood = 'day', opts: IslandOpts = {}) {
  const { width: W, height: H } = scene.scale;
  const p = PALETTES[mood];
  const night = mood === 'night';
  ensureParticles(scene);

  const bg = texture(scene, `isl-bg-${mood}-${W}x${H}`, W, H, (g) => paintBackground(g, W, H, p, mood));
  scene.add.image(0, 0, bg).setOrigin(0).setDepth(-12);

  // Nuages qui dérivent.
  const clouds = opts.clouds ?? 3;
  const cloudKey = texture(scene, `isl-cloud-${night}`, 320, 150, (g) => paintCloud(g, 320, 150, night));
  for (let i = 0; i < clouds; i++) {
    const c = scene.add.image(0, H * (0.07 + i * 0.09), cloudKey).setDepth(-11.8).setAlpha(night ? 0.5 : 0.95);
    c.setScale(H * (0.0011 + (i % 2) * 0.0004));
    scene.tweens.add({
      targets: c, x: { from: -c.displayWidth, to: W + c.displayWidth }, duration: 60000 + i * 20000,
      repeat: -1, delay: -(i * 23000 + 9000),
    });
  }

  // Volcan : fumée continue, éruption de temps en temps ou quand on le touche.
  const crater = { x: W * L.volcanoX, y: H * L.volcanoTop };
  scene.add.particles(crater.x, crater.y, 'isl-puff', {
    speedY: { min: -40, max: -22 }, speedX: { min: -6, max: 18 },
    scale: { start: H * 0.0012, end: H * 0.0032 }, alpha: { start: night ? 0.35 : 0.75, end: 0 },
    lifespan: 5200, frequency: 380, tint: night ? [0x8a8fb0, 0x6a6f90] : [0xffffff, 0xf0ece8, 0xdcd6d0],
  }).setDepth(-11.5);
  const lava = scene.add.particles(crater.x, crater.y, 'isl-ember', {
    speedY: { min: -380, max: -220 }, speedX: { min: -120, max: 120 }, gravityY: 520,
    scale: { start: H * 0.0016, end: H * 0.0006 }, lifespan: 1300, emitting: false,
  }).setDepth(-11.4);
  const erupt = () => {
    lava.explode(28);
    Sfx.play('boing');
    scene.cameras.main.shake(180, 0.002);
  };
  scene.time.addEvent({ delay: 9000, loop: true, startAt: 3000, callback: erupt });
  const hit = scene.add.zone(crater.x, crater.y + H * 0.2, H * 0.34, H * 0.42).setDepth(-11).setInteractive();
  hit.on('pointerup', erupt);

  // Cascade : bandes d'eau qui défilent vers le bas, écume en bas.
  const fallW = W * 0.035;
  const fallKey = texture(scene, 'isl-fall', 64, 128, (g) => {
    const grad = g.createLinearGradient(0, 0, 64, 0);
    grad.addColorStop(0, 'rgba(200,245,255,0.75)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.95)');
    grad.addColorStop(1, 'rgba(200,245,255,0.75)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 128);
    g.fillStyle = 'rgba(120,210,240,0.5)';
    for (let i = 0; i < 6; i++) g.fillRect(8 + i * 9, (i * 37) % 128, 4, 40);
  });
  const fx = W * L.cliffX, fTop = H * L.fallTop, fBot = H * 0.74;
  const fall = scene.add.tileSprite(fx, fTop, fallW, fBot - fTop, fallKey).setOrigin(0.5, 0).setDepth(-11)
    .setAlpha(night ? 0.55 : 0.95);
  scene.tweens.addCounter({ from: 0, to: 128, duration: 900, repeat: -1, onUpdate: (tw) => (fall.tilePositionY = -(tw.getValue() ?? 0)) });
  scene.add.particles(fx, fBot, 'isl-puff', {
    speedX: { min: -40, max: 40 }, speedY: { min: -30, max: -5 }, scale: { start: H * 0.0006, end: H * 0.0012 },
    alpha: { start: 0.8, end: 0 }, lifespan: 900, frequency: 70,
  }).setDepth(-10.9);

  if (opts.plants !== false) {
    // Palmiers qui se balancent.
    const palmKey = texture(scene, `isl-palm-${night}`, 300, 420, (g) => paintPalm(g, 300, 420, night));
    for (const [x, s, flip, delay] of [[0.04, 0.62, false, 0], [0.13, 0.48, true, 600], [0.97, 0.56, true, 300]] as const) {
      const palm = scene.add.image(W * x, H * (L.ground + 0.02), palmKey).setOrigin(0.42, 1).setDepth(-10).setFlipX(flip);
      palm.setScale((H * s) / palm.height);
      scene.tweens.add({ targets: palm, angle: { from: -1.5, to: 2.5 }, duration: 2800, delay, yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut' });
    }
    // Grandes feuilles dans les coins du bas.
    const leafColors: [string, string] = night ? ['#123a2e', '#24604a'] : ['#1f7a33', '#59c24a'];
    const leafKey = texture(scene, `isl-leaf-${night}`, 260, 300, (g) => paintLeaf(g, 260, 300, leafColors));
    for (const [x, ang, s, flip] of [[0, 8, 0.4, false], [0.02, -18, 0.32, false], [1, -8, 0.4, true], [0.985, 18, 0.3, true]] as const) {
      const leaf = scene.add.image(W * x, H + H * 0.03, leafKey).setOrigin(0.05, 1).setDepth(-9).setFlipX(flip);
      if (flip) leaf.setOrigin(0.95, 1);
      leaf.setScale((H * s) / leaf.height).setAngle(ang);
      scene.tweens.add({ targets: leaf, angle: ang + (flip ? -3 : 3), duration: 2200 + s * 2000, yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut' });
    }
  }

  // La nuit : quelques étoiles qui scintillent et la lune.
  if (night) {
    for (let i = 0; i < 18; i++) {
      const star = scene.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H * 0.4),
        Phaser.Math.FloatBetween(1.5, 3.2), 0xfff7c2).setDepth(-11.9);
      scene.tweens.add({ targets: star, alpha: 0.2, duration: Phaser.Math.Between(700, 1800), yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 1500) });
    }
    const moonKey = texture(scene, 'isl-moon', 160, 160, (g) => {
      const glow = g.createRadialGradient(80, 80, 20, 80, 80, 80);
      glow.addColorStop(0, 'rgba(255,250,215,0.5)');
      glow.addColorStop(1, 'rgba(255,250,215,0)');
      g.fillStyle = glow;
      g.fillRect(0, 0, 160, 160);
      g.fillStyle = '#fff6cf';
      g.beginPath();
      g.arc(80, 80, 40, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(220,205,150,0.6)';
      for (const [x, y, r] of [[68, 70, 8], [92, 88, 6], [78, 98, 5]]) {
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
      }
    });
    const moon = scene.add.image(W * 0.22, H * 0.15, moonKey).setDepth(-11.9).setScale(H * 0.0016);
    scene.tweens.add({ targets: moon, scale: moon.scale * 1.04, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}

/** Hauteur (en pixels) de la ligne d'herbe où se tiennent les personnages. */
export const groundY = (scene: Phaser.Scene) => scene.scale.height * (L.ground + 0.1);
