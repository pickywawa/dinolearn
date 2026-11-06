import Phaser from 'phaser';
import { animateHomeBackdrop, loadHomeBackdrop } from './homeBackdrop';
import { Sfx } from '../core/sfx';

/**
 * Les décors peints (images de `public/bg/`), un par écran :
 * - `volcano` : l'île au volcan (accueil, réveil du dino) ;
 * - `meadow` : la clairière ensoleillée (chargement, tracés) ;
 * - `forest` : la forêt aux rayons de soleil (choix des jeux, mémo) ;
 * - `jungle` : la jungle fraîche (questions) ;
 * - `twilight` : la forêt violette (habillage) ;
 * - `stars` : l'éclat d'étoiles (fin de série) ;
 * - `sunset` : la clairière au soleil couchant (éclosion, présentation).
 *
 * L'image couvre tout l'écran (recadrée sur les côtés si besoin) et respire
 * très lentement ; quelques éléments vivants s'y ajoutent (fumée et lave du
 * volcan, écume de la cascade, poussières de lumière, étincelles).
 * Profondeur -12 : toujours derrière le reste.
 */
export const BACKDROPS = ['volcano', 'meadow', 'forest', 'jungle', 'twilight', 'stars', 'sunset'] as const;
export type Backdrop = (typeof BACKDROPS)[number];

export const backdropKey = (name: string) => `bg-${name}`;
/** Les décors sont en WebP (≈ 1672×941, compressés : 60 à 200 Ko chacun). */
export const backdropUrl = (name: string) => `bg/${name}.webp`;

/** Charge les images de décor (dans le `preload` d'une scène). */
export function loadBackdrops(scene: Phaser.Scene) {
  loadHomeBackdrop(scene);
  for (const b of BACKDROPS) {
    if (!scene.textures.exists(backdropKey(b))) scene.load.image(backdropKey(b), backdropUrl(b));
  }
}

export interface BackdropOpts {
  animatedHome?: boolean;
  /** Nuit : décor assombri, étoiles qui scintillent. */
  night?: boolean;
  /** Volcan : berge de sable et d'herbe dessinée au premier plan (par défaut non : l'image a sa motte de terre). */
  shore?: boolean;
}

/**
 * Partie de l'image gardée au centre quand l'écran est moins large que
 * l'image (tablette 4:3) : le volcan, à droite, doit rester visible.
 */
const FOCUS_X: Partial<Record<Backdrop, number>> = { volcano: 0.47 };

/** Repères dans l'image du volcan (fractions de l'image). `mound` : la motte de terre où se tient le dino. */
const VOLCANO = { crater: { x: 0.831, y: 0.186 }, fall: { x: 0.772, y: 0.66 } };
export const VOLCANO_MOUND = { x: 0.232, y: 0.895 };

/** Point d'un décor (fractions de l'image) → coordonnées de l'écran. */
export function backdropPoint(scene: Phaser.Scene, img: Phaser.GameObjects.Image, fx: number, fy: number) {
  const s = img.scaleX;
  return { x: img.x + (fx - 0.5) * img.width * s, y: scene.scale.height / 2 + (fy - 0.5) * img.height * s };
}

function softDot(scene: Phaser.Scene, key: string, inner: string, outer: string) {
  if (scene.textures.exists(key)) return key;
  const c = scene.textures.createCanvas(key, 64, 64)!;
  const g = c.getContext();
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.55, outer);
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  c.refresh();
  return key;
}

/** Pose le décor et ses animations. Retourne l'image (déjà ajoutée à la scène). */
export function drawBackdrop(scene: Phaser.Scene, name: Backdrop, opts: BackdropOpts = {}) {
  const { width: W, height: H } = scene.scale;
  const key = backdropKey(name);
  const img = scene.add.image(0, H / 2, key).setDepth(-12);
  const cover = Math.max(W / img.width, H / img.height);
  img.setScale(cover);
  // Recadrage horizontal : centré sur `FOCUS_X`, sans laisser de bord vide.
  const iw = img.width * cover;
  const focus = FOCUS_X[name] ?? 0.5;
  img.x = Phaser.Math.Clamp(W / 2 - (focus - 0.5) * iw, W - iw / 2, iw / 2);
  /** Point de l'image (fractions) → écran. */
  const at = (fx: number, fy: number) => ({
    x: img.x + (fx - 0.5) * iw,
    y: H / 2 + (fy - 0.5) * img.height * cover,
  });

  // Le décor « respire » : un zoom très lent, à peine perceptible (sauf le volcan, qui a ses repères).
  if (name !== 'volcano') {
    scene.tweens.add({ targets: img, scale: cover * 1.035, duration: 16000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  if (opts.night) {
    img.setTint(0x5b6aa8);
    for (let i = 0; i < 24; i++) {
      const star = scene.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H * 0.35),
        Phaser.Math.FloatBetween(1.5, 3.2), 0xfff7c2).setDepth(-11.9);
      scene.tweens.add({ targets: star, alpha: 0.2, duration: Phaser.Math.Between(700, 1800), yoyo: true, repeat: -1,
        delay: Phaser.Math.Between(0, 1500) });
    }
  }

  switch (name) {
    case 'volcano':
      if (opts.animatedHome) animateHomeBackdrop(scene, img, !!opts.night);
      else volcanoLife(scene, at, H, !!opts.night);
      if (opts.shore) shore(scene, W, H, !!opts.night);
      break;
    case 'stars': starsLife(scene, W, H); break;
    case 'twilight': motes(scene, W, H, [0xffc2f0, 0xd9b8ff, 0xffffff]); break;
    case 'sunset': motes(scene, W, H, [0xffe2a8, 0xffc48a, 0xffffff]); break;
    default: motes(scene, W, H, [0xfff7c2, 0xffffff, 0xd8ffb0]); break;
  }
  return img;
}

/** Fumée continue, éruption de temps en temps (ou au toucher), écume de la cascade. */
function volcanoLife(scene: Phaser.Scene, at: (x: number, y: number) => { x: number; y: number }, H: number, night: boolean) {
  const puff = softDot(scene, 'bd-puff', 'rgba(255,255,255,1)', 'rgba(255,255,255,0.7)');
  const ember = softDot(scene, 'bd-ember', 'rgba(255,240,180,1)', 'rgba(255,130,30,0.9)');
  const crater = at(VOLCANO.crater.x, VOLCANO.crater.y);
  scene.add.particles(crater.x, crater.y, puff, {
    speedY: { min: -36, max: -20 }, speedX: { min: -4, max: 16 },
    scale: { start: H * 0.0009, end: H * 0.0028 }, alpha: { start: night ? 0.3 : 0.6, end: 0 },
    lifespan: 5200, frequency: 420, tint: night ? [0x8a8fb0, 0x6a6f90] : [0xffffff, 0xf0ece8, 0xdcd6d0],
  }).setDepth(-11.5);
  const lava = scene.add.particles(crater.x, crater.y, ember, {
    speedY: { min: -340, max: -200 }, speedX: { min: -110, max: 110 }, gravityY: 520,
    scale: { start: H * 0.0014, end: H * 0.0005 }, lifespan: 1300, emitting: false,
  }).setDepth(-11.4);
  const erupt = () => {
    lava.explode(26);
    Sfx.play('boing');
    scene.cameras.main.shake(160, 0.0018);
  };
  scene.time.addEvent({ delay: 9000, loop: true, startAt: 3000, callback: erupt });
  scene.add.zone(crater.x, crater.y + H * 0.15, H * 0.26, H * 0.3).setDepth(-11).setInteractive().on('pointerup', erupt);

  const fall = at(VOLCANO.fall.x, VOLCANO.fall.y);
  scene.add.particles(fall.x, fall.y, puff, {
    x: { min: -H * 0.025, max: H * 0.025 }, speedX: { min: -30, max: 30 }, speedY: { min: -26, max: -4 },
    scale: { start: H * 0.0005, end: H * 0.001 }, alpha: { start: night ? 0.4 : 0.75, end: 0 }, lifespan: 900, frequency: 80,
  }).setDepth(-10.9);
}

/**
 * Le premier plan de l'île au volcan : une berge de sable et d'herbe où se
 * tiennent les personnages (l'image elle-même s'arrête sur le lac).
 */
function shore(scene: Phaser.Scene, W: number, H: number, night: boolean) {
  const key = `bd-shore-${W}x${H}`;
  if (!scene.textures.exists(key)) {
    const h = Math.round(H * 0.24);
    const c = scene.textures.createCanvas(key, W, h)!;
    const g = c.getContext();
    /** Bord haut, ondulé : un peu plus haut au centre (là où se tient le dino). */
    const edge = (x: number, lift: number) => {
      const t = x / W;
      return h * (0.2 + lift) - Math.sin(t * Math.PI) * h * 0.12 + Math.sin(t * 17) * h * 0.02 + Math.sin(t * 5.3 + 1) * h * 0.03;
    };
    const fillEdge = (lift: number, style: string | CanvasGradient) => {
      g.beginPath();
      g.moveTo(0, h);
      for (let x = 0; x <= W; x += 8) g.lineTo(x, edge(x, lift));
      g.lineTo(W, h);
      g.closePath();
      g.fillStyle = style;
      g.fill();
    };
    // Écume au bord de l'eau, sable, puis l'herbe.
    fillEdge(-0.03, 'rgba(255,255,255,0.7)');
    const sand = g.createLinearGradient(0, 0, 0, h);
    sand.addColorStop(0, '#f6e2a8');
    sand.addColorStop(1, '#e2c27f');
    fillEdge(0, sand);
    const grass = g.createLinearGradient(0, h * 0.2, 0, h);
    grass.addColorStop(0, '#8fdc5a');
    grass.addColorStop(1, '#4fa636');
    fillEdge(0.09, grass);
    // Touffes et fleurs.
    let seed = 11;
    const r = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < W / 18; i++) {
      const x = r() * W, y = edge(x, 0.09) + 6 + r() * (h * 0.6);
      g.strokeStyle = r() < 0.5 ? '#3f9a2e' : '#a6e46f';
      g.lineWidth = 3;
      g.lineCap = 'round';
      for (const d of [-6, 0, 6]) {
        g.beginPath();
        g.moveTo(x, y);
        g.quadraticCurveTo(x + d * 0.4, y - 10, x + d, y - 16 - r() * 6);
        g.stroke();
      }
      if (r() < 0.25) {
        g.fillStyle = ['#ffffff', '#ffd23f', '#ff8fb8', '#b98cff'][Math.floor(r() * 4)];
        g.beginPath();
        g.arc(x + 4, y - 18, 4, 0, Math.PI * 2);
        g.fill();
      }
    }
    c.refresh();
  }
  const bank = scene.add.image(0, H, key).setOrigin(0, 1).setDepth(-10);
  if (night) bank.setTint(0x5b6aa8);
}

/** Poussières de lumière qui montent doucement (forêts, clairières). */
function motes(scene: Phaser.Scene, W: number, H: number, tint: number[]) {
  const dot = softDot(scene, 'bd-mote', 'rgba(255,255,255,1)', 'rgba(255,255,255,0.5)');
  scene.add.particles(0, 0, dot, {
    x: { min: 0, max: W }, y: { min: H * 0.3, max: H }, speedY: { min: -22, max: -8 }, speedX: { min: -10, max: 10 },
    scale: { start: H * 0.0002, end: H * 0.00045 }, alpha: { start: 0, end: 0.85, ease: 'Sine.easeInOut' }, lifespan: 4500,
    frequency: 320, tint, blendMode: Phaser.BlendModes.ADD,
  }).setDepth(-11.6);
}

/** L'éclat de la fin de série : halo qui pulse, étincelles qui s'allument au hasard. */
function starsLife(scene: Phaser.Scene, W: number, H: number) {
  const glow = softDot(scene, 'bd-glow', 'rgba(255,245,200,0.9)', 'rgba(255,220,120,0.35)');
  const halo = scene.add.image(W / 2, H * 0.48, glow).setDepth(-11.8).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.5);
  halo.setScale((H * 0.9) / 64);
  scene.tweens.add({ targets: halo, alpha: 0.85, scale: (H * 1.05) / 64, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  scene.time.addEvent({
    delay: 260, loop: true, callback: () => {
      const s = scene.add.star(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H * 0.8), 4, H * 0.006, H * 0.022, 0xfff3a8)
        .setDepth(-11.7).setScale(0).setBlendMode(Phaser.BlendModes.ADD);
      scene.tweens.add({ targets: s, scale: 1, angle: 45, duration: 500, yoyo: true, ease: 'Sine.easeInOut',
        onComplete: () => s.destroy() });
    },
  });
}
