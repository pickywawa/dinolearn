import Phaser from 'phaser';
import { Sfx } from '../core/sfx';

/**
 * Kit d'interface « île aux dinos » : panneaux en bois, boutons bonbon
 * brillants, cartes crème, rubans. Tout est dessiné au canvas 2D (dégradés,
 * ombres douces, reflets) puis mis en cache comme texture Phaser.
 */

export const FONT = "'Baloo 2', 'Arial Rounded MT Bold', Arial, sans-serif";
export const INK = '#2d3354';

/** Couleurs des boutons (dessus clair → dessous foncé). */
export const CANDY = {
  green: ['#8be05a', '#3fae2c', '#2a7f1d'],
  orange: ['#ffb347', '#ff8a1f', '#c75e00'],
  purple: ['#a78bfa', '#7c4dff', '#4f2bb8'],
  pink: ['#ff9ee6', '#e95bd0', '#a92f93'],
  blue: ['#7cc8ff', '#2f8cf0', '#1a5fb0'],
  yellow: ['#ffe27a', '#ffc21f', '#c98b00'],
  red: ['#ff8a8a', '#f04848', '#b02424'],
  teal: ['#6ee7d8', '#1fbfa9', '#12867a'],
  white: ['#ffffff', '#eef4fb', '#b7c6dc'],
  cream: ['#fffaf0', '#fff1d6', '#e3c99a'],
} as const;
export type Candy = keyof typeof CANDY;

const PALETTE: Candy[] = ['orange', 'purple', 'green', 'pink', 'blue', 'teal', 'yellow', 'red'];
/** Couleur de bouton n° `i` (tuiles des jeux…). */
export const candyAt = (i: number) => PALETTE[i % PALETTE.length];

/** Crée (une fois) une texture dessinée au canvas 2D. */
export function canvasTexture(scene: Phaser.Scene, key: string, w: number, h: number,
  draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, Math.ceil(w), Math.ceil(h))!;
  draw(tex.getContext(), w, h);
  tex.refresh();
  return key;
}

function rounded(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

const S = 2; // les textures sont dessinées en double résolution

/**
 * Bouton « bonbon » : dessus brillant, tranche foncée en dessous, liseré blanc.
 * Renvoie la clé de texture (taille w×h en pixels de jeu, dessinée en ×2).
 */
export function candyTexture(scene: Phaser.Scene, w: number, h: number, color: Candy, radius = h * 0.32) {
  const [light, mid, dark] = CANDY[color];
  const key = `kit-candy-${color}-${Math.round(w)}x${Math.round(h)}-${Math.round(radius)}`;
  const pad = 10;
  return canvasTexture(scene, key, (w + pad * 2) * S, (h + pad * 2) * S, (g) => {
    g.scale(S, S);
    const x = pad, y = pad, depth = h * 0.09;
    // Ombre portée douce.
    g.save();
    g.shadowColor = 'rgba(30,40,70,0.35)';
    g.shadowBlur = 8;
    g.shadowOffsetY = 4;
    rounded(g, x, y, w, h, radius);
    g.fillStyle = dark;
    g.fill();
    g.restore();
    // Tranche du dessous.
    rounded(g, x, y, w, h, radius);
    g.fillStyle = dark;
    g.fill();
    // Dessus.
    rounded(g, x, y, w, h - depth, radius);
    const grad = g.createLinearGradient(0, y, 0, y + h - depth);
    grad.addColorStop(0, light);
    grad.addColorStop(0.55, mid);
    grad.addColorStop(1, mid);
    g.fillStyle = grad;
    g.fill();
    // Reflet.
    g.save();
    rounded(g, x + h * 0.12, y + h * 0.07, w - h * 0.24, (h - depth) * 0.38, radius * 0.7);
    const shine = g.createLinearGradient(0, y, 0, y + h * 0.45);
    shine.addColorStop(0, 'rgba(255,255,255,0.55)');
    shine.addColorStop(1, 'rgba(255,255,255,0.05)');
    g.fillStyle = shine;
    g.fill();
    g.restore();
    // Liseré blanc.
    rounded(g, x + 1.5, y + 1.5, w - 3, h - 3, radius);
    g.lineWidth = Math.max(2.5, h * 0.045);
    g.strokeStyle = 'rgba(255,255,255,0.85)';
    g.stroke();
  });
}

/** Disque bonbon (boutons ronds). */
export function discTexture(scene: Phaser.Scene, r: number, color: string) {
  const key = `kit-disc-${color}-${Math.round(r)}`;
  const pad = 10;
  const base = Phaser.Display.Color.HexStringToColor(color);
  const light = Phaser.Display.Color.Interpolate.ColorWithColor(base, new Phaser.Display.Color(255, 255, 255), 100, 45);
  const dark = Phaser.Display.Color.Interpolate.ColorWithColor(base, new Phaser.Display.Color(20, 30, 60), 100, 35);
  const css = (c: { r: number; g: number; b: number }) => `rgb(${c.r | 0},${c.g | 0},${c.b | 0})`;
  return canvasTexture(scene, key, (r * 2 + pad * 2) * S, (r * 2 + pad * 2) * S, (g) => {
    g.scale(S, S);
    const c = r + pad;
    g.save();
    g.shadowColor = 'rgba(30,40,70,0.35)';
    g.shadowBlur = 8;
    g.shadowOffsetY = 4;
    g.beginPath();
    g.arc(c, c, r, 0, Math.PI * 2);
    g.fillStyle = css(dark);
    g.fill();
    g.restore();
    g.beginPath();
    g.arc(c, c - r * 0.05, r * 0.94, 0, Math.PI * 2);
    const grad = g.createLinearGradient(0, c - r, 0, c + r);
    grad.addColorStop(0, css(light));
    grad.addColorStop(0.6, color);
    grad.addColorStop(1, color);
    g.fillStyle = grad;
    g.fill();
    g.beginPath();
    g.ellipse(c - r * 0.25, c - r * 0.5, r * 0.45, r * 0.22, -0.4, 0, Math.PI * 2);
    g.fillStyle = 'rgba(255,255,255,0.45)';
    g.fill();
    g.beginPath();
    g.arc(c, c, r - 2, 0, Math.PI * 2);
    g.lineWidth = Math.max(3, r * 0.1);
    g.strokeStyle = '#ffffff';
    g.stroke();
  });
}

/** Carte crème aux coins ronds (cartes de réponses, panneaux). */
export function cardTexture(scene: Phaser.Scene, w: number, h: number, fill = '#fffaf0', border = '#f1dfbd',
  radius = Math.min(w, h) * 0.14) {
  const key = `kit-card-${fill}-${border}-${Math.round(w)}x${Math.round(h)}-${Math.round(radius)}`;
  const pad = 14;
  return canvasTexture(scene, key, (w + pad * 2) * S, (h + pad * 2) * S, (g) => {
    g.scale(S, S);
    const x = pad, y = pad;
    g.save();
    g.shadowColor = 'rgba(30,40,70,0.28)';
    g.shadowBlur = 12;
    g.shadowOffsetY = 5;
    rounded(g, x, y, w, h, radius);
    g.fillStyle = border;
    g.fill();
    g.restore();
    rounded(g, x + 3, y + 3, w - 6, h - 9, radius * 0.9);
    const grad = g.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.35, fill);
    grad.addColorStop(1, fill);
    g.fillStyle = grad;
    g.fill();
  });
}

/** Planche de bois (titres), accrochée par deux cordes si `ropes`. */
export function woodTexture(scene: Phaser.Scene, w: number, h: number, ropes = true) {
  const key = `kit-wood-${Math.round(w)}x${Math.round(h)}-${ropes}`;
  const pad = 14;
  const top = ropes ? h * 0.5 : 0;
  return canvasTexture(scene, key, (w + pad * 2) * S, (h + top + pad * 2) * S, (g) => {
    g.scale(S, S);
    const x = pad, y = pad + top;
    if (ropes) {
      g.strokeStyle = '#8a5a2b';
      g.lineWidth = 5;
      g.lineCap = 'round';
      for (const rx of [x + w * 0.18, x + w * 0.82]) {
        g.beginPath();
        g.moveTo(rx, pad);
        g.lineTo(rx, y + h * 0.3);
        g.stroke();
      }
    }
    g.save();
    g.shadowColor = 'rgba(40,25,10,0.4)';
    g.shadowBlur = 10;
    g.shadowOffsetY = 5;
    rounded(g, x, y, w, h, h * 0.28);
    g.fillStyle = '#8a5a2b';
    g.fill();
    g.restore();
    rounded(g, x + 4, y + 4, w - 8, h - 10, h * 0.24);
    const grad = g.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, '#f6dcae');
    grad.addColorStop(1, '#e7bf80');
    g.fillStyle = grad;
    g.fill();
    // Veines du bois.
    g.save();
    rounded(g, x + 4, y + 4, w - 8, h - 10, h * 0.24);
    g.clip();
    g.strokeStyle = 'rgba(160,105,50,0.25)';
    g.lineWidth = 2;
    for (let i = 1; i < 4; i++) {
      const yy = y + (h - 6) * (i / 4);
      g.beginPath();
      g.moveTo(x, yy);
      for (let xx = x; xx <= x + w; xx += 20) g.lineTo(xx, yy + Math.sin(xx * 0.05 + i * 2) * 2.5);
      g.stroke();
    }
    g.restore();
    // Clous.
    for (const nx of [x + w * 0.18, x + w * 0.82]) {
      g.beginPath();
      g.arc(nx, y + h * 0.28, 4, 0, Math.PI * 2);
      g.fillStyle = '#6b4520';
      g.fill();
    }
  });
}

/** Ruban (bannières « Bravo ! », « Nouveau trophée ! »). */
export function ribbonTexture(scene: Phaser.Scene, w: number, h: number, color: Candy = 'orange') {
  const [light, mid, dark] = CANDY[color];
  const key = `kit-ribbon-${color}-${Math.round(w)}x${Math.round(h)}`;
  const pad = 12;
  return canvasTexture(scene, key, (w + pad * 2) * S, (h * 1.35 + pad * 2) * S, (g) => {
    g.scale(S, S);
    const x = pad, y = pad, tail = h * 0.55, curve = h * 0.18;
    // Queues repliées.
    g.fillStyle = dark;
    for (const s of [0, 1]) {
      const ex = s ? x + w : x;
      const ix = s ? x + w - tail * 1.4 : x + tail * 1.4;
      g.beginPath();
      g.moveTo(ix, y + h * 0.3);
      g.lineTo(ex, y + h * 0.3);
      g.lineTo(s ? ex - tail * 0.5 : ex + tail * 0.5, y + h * 0.8);
      g.lineTo(ex, y + h * 1.3);
      g.lineTo(ix, y + h * 1.3);
      g.closePath();
      g.fill();
    }
    // Bande centrale bombée.
    g.save();
    g.shadowColor = 'rgba(30,40,70,0.3)';
    g.shadowBlur = 8;
    g.shadowOffsetY = 4;
    g.beginPath();
    g.moveTo(x + tail, y + curve);
    g.quadraticCurveTo(x + w / 2, y - curve, x + w - tail, y + curve);
    g.lineTo(x + w - tail, y + h + curve);
    g.quadraticCurveTo(x + w / 2, y + h - curve, x + tail, y + h + curve);
    g.closePath();
    const grad = g.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, light);
    grad.addColorStop(1, mid);
    g.fillStyle = grad;
    g.fill();
    g.restore();
  });
}

// ---------------------------------------------------------------- objets

export interface TextOpts {
  size: number;
  color?: string;
  stroke?: string;
  strokeRatio?: number;
  weight?: string;
  font?: string;
  align?: string;
  wrap?: number;
}

/** Texte arrondi (Baloo) avec contour. */
export function label(scene: Phaser.Scene, x: number, y: number, text: string, o: TextOpts) {
  const t = scene.add.text(x, y, text, {
    fontFamily: o.font ?? FONT,
    fontSize: `${Math.round(o.size)}px`,
    fontStyle: o.weight ?? '800',
    color: o.color ?? '#ffffff',
    stroke: o.stroke ?? '',
    strokeThickness: o.stroke ? Math.max(2, Math.round(o.size * (o.strokeRatio ?? 0.14))) : 0,
    align: o.align ?? 'center',
    wordWrap: o.wrap ? { width: o.wrap, useAdvancedWrap: true } : undefined,
    padding: { x: 4, y: 4 },
  }).setOrigin(0.5);
  return t;
}

/** Flèche blanche « lecture / suivant » (pour les boutons). */
export function arrowTexture(scene: Phaser.Scene, dir: 'play' | 'right' | 'left' = 'play') {
  return canvasTexture(scene, `kit-arrow-${dir}`, 128, 128, (g) => {
    g.lineJoin = 'round';
    g.lineCap = 'round';
    g.beginPath();
    if (dir === 'play') {
      g.moveTo(34, 20);
      g.lineTo(108, 64);
      g.lineTo(34, 108);
      g.closePath();
    } else {
      const s = dir === 'right' ? 1 : -1;
      const x = (v: number) => 64 + s * (v - 64);
      g.moveTo(x(18), 52);
      g.lineTo(x(70), 52);
      g.lineTo(x(70), 26);
      g.lineTo(x(112), 64);
      g.lineTo(x(70), 102);
      g.lineTo(x(70), 76);
      g.lineTo(x(18), 76);
      g.closePath();
    }
    g.lineWidth = 16;
    g.strokeStyle = 'rgba(20,60,20,0.45)';
    g.stroke();
    g.fillStyle = '#ffffff';
    g.fill();
  });
}

/** Étoile dorée bombée (récompenses, niveau). `empty` : étoile à gagner, en creux. */
export function starTexture(scene: Phaser.Scene, empty = false) {
  return canvasTexture(scene, `kit-star-${empty}`, 256, 256, (g) => {
    const path = (r1: number, r2: number) => {
      g.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 5;
        const r = i % 2 ? r2 : r1;
        const x = 128 + Math.cos(a) * r, y = 136 + Math.sin(a) * r;
        if (i) g.lineTo(x, y);
        else g.moveTo(x, y);
      }
      g.closePath();
    };
    g.lineJoin = 'round';
    g.save();
    g.shadowColor = 'rgba(60,40,0,0.35)';
    g.shadowBlur = 10;
    g.shadowOffsetY = 6;
    path(112, 52);
    g.fillStyle = empty ? '#d9cbb0' : '#e09a00';
    g.fill();
    g.restore();
    path(104, 48);
    if (empty) {
      g.fillStyle = '#efe4cf';
    } else {
      const grad = g.createLinearGradient(0, 30, 0, 230);
      grad.addColorStop(0, '#fff3a0');
      grad.addColorStop(0.45, '#ffd23f');
      grad.addColorStop(1, '#ffa500');
      g.fillStyle = grad;
    }
    g.fill();
    g.lineWidth = 10;
    g.strokeStyle = '#ffffff';
    g.stroke();
    if (!empty) {
      g.beginPath();
      g.ellipse(100, 92, 26, 12, -0.5, 0, Math.PI * 2);
      g.fillStyle = 'rgba(255,255,255,0.7)';
      g.fill();
    }
  });
}

/** Rebond au toucher + anti-rebond de 400 ms. */
export function makePressable(obj: Phaser.GameObjects.Container, onTap: () => void, sound = 'pop') {
  let last = 0;
  const base = { v: obj.scale };
  obj.on('pointerdown', () => {
    base.v = obj.scale;
    obj.scene.tweens.add({ targets: obj, scale: base.v * 0.92, duration: 80, yoyo: true });
  });
  obj.on('pointerup', () => {
    const now = performance.now();
    if (now - last < 400 || obj.getData('disabled')) return;
    last = now;
    Sfx.play(sound as never);
    onTap();
  });
}

/**
 * Gros bouton bonbon avec texte (et icône à gauche si donnée).
 * Origine au centre ; zone de toucher = tout le bouton.
 */
export function candyButton(scene: Phaser.Scene, x: number, y: number, w: number, h: number, color: Candy,
  text: string, onTap: () => void, icon?: string, iconRight = false) {
  const c = scene.add.container(x, y);
  const bg = scene.add.image(0, 0, candyTexture(scene, w, h, color)).setScale(1 / S);
  c.add(bg);
  const [, , dark] = CANDY[color];
  const ty = -h * 0.045;
  if (icon) {
    const img = scene.add.image(0, ty, icon);
    img.setScale((h * 0.62) / Math.max(img.width, img.height));
    c.add(img);
    if (text) img.x = iconRight ? w / 2 - h * 0.6 : -w / 2 + h * 0.55;
  }
  if (text) {
    const t = label(scene, icon ? (iconRight ? -h * 0.25 : h * 0.25) : 0, ty, text, { size: h * 0.46, stroke: dark, strokeRatio: 0.12 });
    const maxW = w - (icon ? h * 1.2 : h * 0.5);
    if (t.width > maxW) t.setScale(maxW / t.width);
    c.add(t);
  }
  c.setSize(w, h);
  c.setInteractive({ useHandCursor: true });
  makePressable(c, onTap);
  return c;
}

/** Bouton rond blanc à icône (accueil, retour, réglages…). */
export function roundButton(scene: Phaser.Scene, x: number, y: number, r: number, icon: string, onTap: () => void,
  color = '#ffffff', iconScale = 0.62) {
  const c = scene.add.container(x, y);
  const bg = scene.add.image(0, 0, discTexture(scene, r, color)).setScale(1 / S);
  const img = scene.add.image(0, -r * 0.04, icon);
  img.setScale((r * 2 * iconScale) / Math.max(img.width, img.height));
  c.add([bg, img]);
  c.setSize(r * 2, r * 2);
  c.setInteractive(new Phaser.Geom.Circle(r, r, r), Phaser.Geom.Circle.Contains);
  makePressable(c, onTap);
  return c;
}

/** Titre sur planche de bois (avec cordes). */
export function woodSign(scene: Phaser.Scene, x: number, y: number, text: string, size: number, ropes = true,
  minWidth = 0) {
  const c = scene.add.container(x, y);
  const t = label(scene, 0, 0, text, { size, color: '#5a3415', weight: '800' });
  const w = Math.max(minWidth, t.width + size * 1.4);
  const h = size * 1.55;
  const key = woodTexture(scene, w, h, ropes);
  const img = scene.add.image(0, 0, key).setScale(1 / S);
  const top = ropes ? h * 0.5 : 0;
  // L'origine du conteneur est au centre de la planche (les cordes montent au-dessus).
  img.setOrigin(0.5, (14 + top + h / 2) / (h + top + 28));
  t.y = -size * 0.05;
  c.add([img, t]);
  c.setSize(w, h);
  return c;
}

/** Bannière ruban avec texte. */
export function ribbonBanner(scene: Phaser.Scene, x: number, y: number, text: string, size: number,
  color: Candy = 'orange') {
  const c = scene.add.container(x, y);
  const t = label(scene, 0, 0, text, { size, stroke: CANDY[color][2], strokeRatio: 0.12 });
  const w = t.width + size * 3.2;
  const h = size * 1.5;
  const img = scene.add.image(0, 0, ribbonTexture(scene, w, h, color)).setScale(1 / S);
  img.setOrigin(0.5, (12 + h / 2) / (h * 1.35 + 24));
  t.y = -size * 0.04;
  c.add([img, t]);
  return c;
}

/** Carte crème (Container avec la carte au centre). */
export function card(scene: Phaser.Scene, x: number, y: number, w: number, h: number, fill?: string, border?: string) {
  const c = scene.add.container(x, y);
  c.add(scene.add.image(0, 0, cardTexture(scene, w, h, fill, border)).setScale(1 / S));
  c.setSize(w, h);
  return c;
}

/** Pastilles de progression d'une série (faites en vert, à venir en gris). */
export class ProgressDots extends Phaser.GameObjects.Container {
  private dots: Phaser.GameObjects.Image[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, private total: number, private r: number) {
    super(scene, x, y);
    const count = total;
    const gap = r * 2.5;
    const w = gap * (count - 1) + r * 3.4;
    this.add(scene.add.image(0, 0, cardTexture(scene, w, r * 3, '#ffffff', '#dfe8f3', r * 1.5)).setScale(1 / S));
    for (let i = 0; i < count; i++) {
      const d = scene.add.image(-gap * (count - 1) / 2 + gap * i, -r * 0.1, discTexture(scene, r, '#c9d3e0'))
        .setScale(1 / S);
      this.dots.push(d);
      this.add(d);
    }
    scene.add.existing(this);
  }

  set(done: number) {
    this.dots.forEach((d, i) => {
      const key = discTexture(this.scene, this.r, i < done ? '#4cc93a' : '#c9d3e0');
      if (d.texture.key !== key) {
        d.setTexture(key);
        if (i === done - 1) this.scene.tweens.add({ targets: d, scale: { from: 0.8 / S, to: 1 / S }, duration: 300, ease: 'Back.easeOut' });
      }
    });
  }

  get size() { return this.total; }
}

/**
 * Tuile carrée « bonbon » : grande icône et petit nom dessous (barre du bas de l'accueil,
 * choix des jeux). `badge` : petite icône animée dans le coin (cadeau à ouvrir…).
 */
export function tileButton(scene: Phaser.Scene, x: number, y: number, w: number, h: number, icon: string, text: string,
  onTap: () => void, color: Candy = 'white') {
  const c = scene.add.container(x, y);
  c.add(scene.add.image(0, 0, candyTexture(scene, w, h, color, Math.min(w, h) * 0.24)).setScale(1 / S));
  const light = color === 'white' || color === 'cream' || color === 'yellow';
  const img = scene.add.image(0, text ? -h * 0.12 : -h * 0.03, icon);
  const iconSize = Math.min(w, h) * (text ? 0.52 : 0.66);
  img.setScale(iconSize / Math.max(img.width, img.height));
  c.add(img);
  if (text) {
    const t = label(scene, 0, h * 0.27, text, {
      size: h * 0.17, color: light ? INK : '#ffffff', stroke: light ? '' : CANDY[color][2], strokeRatio: 0.12,
    });
    if (t.width > w * 0.9) t.setScale((w * 0.9) / t.width);
    c.add(t);
  }
  c.setSize(w, h);
  c.setInteractive({ useHandCursor: true });
  makePressable(c, onTap);
  return c;
}

/** « C'est ici qu'il faut toucher » : l'objet pulse doucement (et s'arrête avec `on = false`). */
export function setHighlight(obj: Phaser.GameObjects.Container, on: boolean) {
  const prev = obj.getData('pulse') as Phaser.Tweens.Tween | undefined;
  prev?.stop();
  const base = (obj.getData('baseScale') as number | undefined) ?? obj.scale;
  obj.setData('baseScale', base);
  obj.setScale(base);
  obj.setData('pulse', on
    ? obj.scene.tweens.add({ targets: obj, scale: base * 1.08, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    : undefined);
}
