import { CONCEPTS, Concept } from '../content/content';
import { FRUITS, Rng, shuffle } from '../domain/models';
import { colorOf, dinoAt, headAt, propAt } from './dino';
import { footerOf, lookOf } from './common';
import { GREY, INK, LIGHT, PAGE_W, cutRect, foldLine, image, n, page, scissors, text } from './svg';
import { PrintContext, PrintKind } from './types';

/**
 * Jeux de société à imprimer et découper : jeu de l'oie du dino (avec le dé
 * et les pions des dinos de la famille), memory, loto et dominos. Le contenu
 * suit l'âge : des images pour les petits, des quantités puis des nombres,
 * des mots et des calculs pour les plus grands.
 */

/** Points d'un dé (0 à 9) dans un carré de côté `size` centré en (cx, cy). */
export function pips(value: number, cx: number, cy: number, size: number, color = INK): string {
  const g = size * 0.28;
  const at: Record<number, [number, number][]> = {
    0: [], 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
    7: [[-1, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [1, 1]],
    8: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]],
    9: [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]],
  };
  return (at[value] ?? []).map(([x, y]) =>
    `<circle cx="${n(cx + x * g)}" cy="${n(cy + y * g)}" r="${n(size * 0.09)}" fill="${color}"/>`).join('');
}

/** Images simples et bien connues (animaux, fruits, objets) pour les petits. */
const easyConcepts = (rng: Rng, count: number, maxLetters = 99): Concept[] =>
  shuffle(CONCEPTS.filter((c) => ['animal', 'food', 'object'].includes(c.group)
    && Object.values(c.levels).some((l) => (l ?? 99) <= 4) && c.fr.word.length <= maxLetters && !c.fr.word.includes(' ')), rng)
    .slice(0, count);

/** Les dinos de la famille, complétés par des copains pour avoir `count` pions. */
function familyDinos(ctx: PrintContext, count: number, rng: Rng) {
  const family = ctx.family.length ? ctx.family : [{ name: ctx.name, color: ctx.color }];
  const others = shuffle([...Array(10).keys()].filter((c) => !family.some((f) => f.color === c)), rng);
  return [...family, ...others.map((color) => ({ name: '', color }))].slice(0, count);
}

// ---- Jeu de l'oie du dino ----

type Special = 'fruit' | 'volcano' | 'ptero' | 'egg' | 'sleep';

export const GOOSE: PrintKind = {
  id: 'goose',
  family: 'game',
  title: 'Jeu de l\'oie du dino',
  said: 'un jeu de société',
  icon: 'pr-goose',
  minAge: 3,
  envelope: true,
  build(ctx, rng) {
    const total = ctx.age <= 3 ? 20 : ctx.age <= 4 ? 25 : 35;
    const cols = 5;
    const rows = Math.ceil(total / cols);
    const [cw, ch] = [34, Math.min(30, 196 / rows)];
    const x0 = (PAGE_W - cols * cw) / 2;
    const y0 = 34;
    // Cases spéciales : jamais au départ, à l'arrivée, ni côte à côte.
    const kinds: Special[] = ctx.age <= 3 ? ['fruit', 'fruit', 'fruit', 'volcano', 'egg']
      : ctx.age <= 4 ? ['fruit', 'fruit', 'fruit', 'volcano', 'volcano', 'egg', 'ptero']
        : ['fruit', 'fruit', 'fruit', 'fruit', 'volcano', 'volcano', 'volcano', 'egg', 'egg', 'ptero', 'ptero', 'sleep'];
    const special = new Map<number, Special>();
    const free = shuffle(Array.from({ length: total - 4 }, (_, i) => i + 3), rng);
    for (const kind of kinds) {
      const cell = free.find((c) => !special.has(c) && !special.has(c - 1) && !special.has(c + 1)
        && !(kind === 'ptero' && c > total - 7) && !(kind === 'volcano' && c < 5));
      if (cell !== undefined) special.set(cell, kind);
    }
    const fruits = shuffle([...FRUITS], rng);
    const center = (i: number): [number, number] => {
      const r = Math.floor(i / cols);
      const c = r % 2 === 0 ? i % cols : cols - 1 - (i % cols);
      return [x0 + c * cw + cw / 2, y0 + r * ch + ch / 2];
    };
    let board = '';
    // Le chemin d'abord, sous les cases.
    board += `<path d="${Array.from({ length: total }, (_, i) => `${i ? 'L' : 'M'}${center(i).map(n).join(' ')}`).join(' ')}" fill="none" stroke="${LIGHT}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>`;
    for (let i = 0; i < total; i++) {
      const [cx, cy] = center(i);
      const num = i + 1;
      const kind = special.get(num);
      const fill = num === 1 || num === total ? '#fff3c4' : kind ? '#eef7ff' : '#fff';
      board += `<rect x="${n(cx - cw / 2 + 1.5)}" y="${n(cy - ch / 2 + 1.5)}" width="${n(cw - 3)}" height="${n(ch - 3)}" rx="4" fill="${fill}" stroke="${INK}" stroke-width="0.7"/>`;
      board += text(cx - cw / 2 + 5, cy - ch / 2 + 7, 4, String(num), { weight: 700 });
      const s = Math.min(cw, ch) * 0.55;
      if (num === 1) {
        board += headAt({ color: ctx.color }, cx + 3, cy + 2, s * 1.2) + text(cx, cy + ch / 2 - 3, 3, 'Départ');
      } else if (num === total) {
        board += propAt('egg', cx - s * 0.3 + 3, cy - s * 0.45, s * 0.6) + text(cx, cy + ch / 2 - 3, 3, 'Arrivée');
      } else if (kind === 'fruit') {
        board += image(`food-${fruits[i % fruits.length]}`, cx - s / 2 + 3, cy - s / 2 + 1, s);
      } else if (kind === 'volcano') {
        board += propAt('volcano', cx - s * 0.65 + 3, cy - s * 0.3, s * 1.3);
      } else if (kind === 'ptero') {
        const to = Math.min(total - 1, num + 4 + Math.floor(rng() * 3));
        board += propAt('ptero-up', cx - s * 0.7 + 3, cy - s * 0.5, s * 1.4) + text(cx + 3, cy + ch / 2 - 3, 3, `→ ${to}`);
      } else if (kind === 'egg') {
        board += propAt('egg', cx - s * 0.25 + 3, cy - s * 0.4, s * 0.5);
      } else if (kind === 'sleep') {
        board += image('ui-moon', cx - s / 2 + 3, cy - s / 2, s);
      }
    }
    const legend: [Special, string][] = [
      ['fruit', 'Miam, un fruit ! Avance de 2 cases.'],
      ['volcano', 'Le volcan gronde ! Recule de 3 cases.'],
      ['egg', 'Un œuf ! Rejoue.'],
      ['ptero', 'Le ptérodactyle t\'emmène jusqu\'à la case indiquée.'],
      ['sleep', 'Dodo ! Passe un tour.'],
    ];
    const used = new Set(special.values());
    let ly = y0 + rows * ch + 8;
    let legendSvg = text(x0, ly, 4.2, 'Chacun pose son dino sur Départ et lance le dé. Le premier arrivé à l\'œuf gagne !', { anchor: 'start' });
    ly += 7;
    for (const [kind, label] of legend.filter(([k]) => used.has(k))) {
      const icon = kind === 'fruit' ? image(`food-${fruits[0]}`, x0, ly - 4.5, 6)
        : kind === 'volcano' ? propAt('volcano', x0 - 1, ly - 3.5, 8)
          : kind === 'egg' ? propAt('egg', x0 + 1, ly - 5, 4.5)
            : kind === 'ptero' ? propAt('ptero-up', x0 - 1, ly - 4, 8)
              : image('ui-moon', x0, ly - 4.5, 6);
      legendSvg += icon + text(x0 + 10, ly, 3.8, label, { anchor: 'start', weight: 400 });
      ly += 6.5;
    }
    const pages = [
      page(text(PAGE_W / 2, 26, 6.5, 'Le jeu de l\'oie du dino') + board + legendSvg, { footer: footerOf(ctx) }),
      page(diceAndPawns(ctx, rng), { footer: footerOf(ctx) }),
    ];
    return {
      title: 'Jeu de l\'oie du dino',
      pages,
      advice: {
        skills: ['Compter les points du dé et avancer case par case', 'Reconnaître les nombres de 1 à ' + total, 'Attendre son tour, accepter de perdre'],
        talk: 'Faites-le compter à voix haute en avançant son pion, case par case (« un, deux, trois »). '
          + 'Sur une case spéciale, laissez-le lire l\'image et dire ce qui se passe.',
        further: ctx.age <= 4
          ? 'Avec le dé de 1 à 3 (page 2), les parties restent courtes. Jouez sans « perdant » : on attend que tout le monde arrive.'
          : 'Pour corser le jeu, lancez deux dés et additionnez.',
        material: 'Ciseaux, colle (pour le dé), du carton fin pour les pions. Ou un dé et des pions de la maison.',
      },
    };
  },
};

/** Page 2 du jeu de l'oie : un dé à monter (1 à 3 pour les petits) et 4 pions-dinos à plier. */
function diceAndPawns(ctx: PrintContext, rng: Rng): string {
  const s = 26;
  const [dx, dy] = [22, 40];
  const faces = ctx.age <= 3 ? [1, 2, 3, 1, 2, 3] : [1, 2, 3, 4, 5, 6];
  // Patron en croix : une colonne de 4 faces et deux faces de côté.
  const slots: [number, number][] = [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]];
  const order = [faces[0], faces[1], faces[2], faces[4], faces[5], faces[3]];
  let die = '';
  slots.forEach(([c, r], i) => {
    const [x, y] = [dx + c * s, dy + r * s];
    die += `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="#fff" stroke="${INK}" stroke-width="0.6"/>` + pips(order[i], x + s / 2, y + s / 2, s);
  });
  // Languettes à coller (grises).
  const tab = (x: number, y: number, w: number, h: number) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${LIGHT}" stroke="${INK}" stroke-width="0.4"/>`;
  die = tab(dx + s, dy - 7, s, 7) + tab(dx + 2 * s, dy + s - 7, s, 7) + tab(dx + 3 * s, dy + s - 7, s, 7)
    + tab(dx + 2 * s, dy + 2 * s, s, 7) + tab(dx + 3 * s, dy + 2 * s, s, 7) + tab(dx - 7, dy + s, 7, s) + die;
  // Pions : un dino par enfant de la famille (et des copains), en « tente » pliée.
  const pawns = familyDinos(ctx, 4, rng);
  const [pw, ph, base] = [38, 42, 10];
  let out = '';
  pawns.forEach((p, i) => {
    const x = 18 + i * (pw + 6);
    const y = 138;
    const look = { color: p.color, worn: p.color === ctx.color ? ctx.worn : [] };
    out += `<rect x="${x}" y="${y}" width="${pw}" height="${base * 2 + ph * 2}" fill="#fff" stroke="${INK}" stroke-width="0.5"/>`
      + `<rect x="${x}" y="${y}" width="${pw}" height="${base}" fill="${LIGHT}"/>`
      + `<rect x="${x}" y="${y + base + ph * 2}" width="${pw}" height="${base}" fill="${LIGHT}"/>`
      // Dos (à l'envers) et face.
      + `<g transform="rotate(180 ${x + pw / 2} ${y + base + ph / 2})">${dinoAt(look, x + pw / 2, y + base + ph - 2, ph * 0.66)}</g>`
      + dinoAt(look, x + pw / 2, y + base + ph * 2 - 2, ph * 0.66)
      + foldLine(x, y + base, x + pw, y + base) + foldLine(x, y + base + ph, x + pw, y + base + ph)
      + foldLine(x, y + base + ph * 2, x + pw, y + base + ph * 2)
      + (p.name ? text(x + pw / 2, y + base * 2 + ph * 2 + 5, 3.4, p.name, { weight: 400 }) : '');
  });
  return text(PAGE_W / 2, 26, 6.5, 'Le dé et les pions')
    + die + scissors(dx - 6, dy - 8, 6, 0)
    + text(160, dy + 10, 3.6, 'Découpe le dé,', { weight: 400 })
    + text(160, dy + 16, 3.6, 'plie sur les traits', { weight: 400 })
    + text(160, dy + 22, 3.6, 'et colle les languettes grises.', { weight: 400 })
    + out
    + text(PAGE_W / 2, 262, 3.6, 'Pions : découpe, plie sur les traits fins, et colle les deux bandes grises ensemble :', { weight: 400 })
    + text(PAGE_W / 2, 268, 3.6, 'le dino tient debout comme une petite tente.', { weight: 400 });
}

// ---- Memory ----

/** Les paires du memory selon l'âge : images identiques, quantité ↔ chiffre, ou mot ↔ image. */
export function memoryPairs(age: number, rng: Rng): { mode: 'same' | 'count' | 'word'; pairs: [Card, Card][] } {
  const count = age <= 3 ? 6 : age <= 4 ? 8 : 10;
  if (age <= 4) {
    return { mode: 'same', pairs: easyConcepts(rng, count).map((c) => [{ image: c.id }, { image: c.id }]) };
  }
  if (age === 5) {
    const fruit = shuffle([...FRUITS], rng);
    return {
      mode: 'count',
      pairs: Array.from({ length: count }, (_, i) => [{ digit: i + 1 }, { repeat: { image: `food-${fruit[i % fruit.length]}`, count: i + 1 } }]),
    };
  }
  return {
    mode: 'word',
    pairs: easyConcepts(rng, count, age <= 6 ? 6 : 8).map((c) => [{ image: c.id }, { word: age <= 6 ? c.fr.word.toUpperCase() : c.fr.word }]),
  };
}

export interface Card { image?: string; digit?: number; word?: string; repeat?: { image: string; count: number } }

function drawCard(card: Card, x: number, y: number, s: number): string {
  let out = `<rect x="${n(x + 1)}" y="${n(y + 1)}" width="${n(s - 2)}" height="${n(s - 2)}" rx="4" fill="#fff" stroke="${INK}" stroke-width="0.7"/>`;
  if (card.image) out += image(card.image, x + s * 0.17, y + s * 0.17, s * 0.66);
  if (card.digit !== undefined) out += text(x + s / 2, y + s * 0.68, s * 0.5, String(card.digit));
  if (card.word) out += text(x + s / 2, y + s * 0.58, Math.min(s * 0.22, (s * 1.5) / card.word.length), card.word);
  if (card.repeat) {
    const k = card.repeat.count;
    const per = k <= 3 ? k : k <= 6 ? 3 : 4;
    const lines = Math.ceil(k / per);
    const is = Math.min((s * 0.8) / per, (s * 0.8) / lines);
    for (let i = 0; i < k; i++) {
      const row = Math.floor(i / per);
      const inRow = Math.min(per, k - row * per);
      const col = i % per;
      out += image(card.repeat.image, x + s / 2 + (col - inRow / 2) * is, y + s / 2 + (row - lines / 2) * is, is * 0.92);
    }
  }
  return out;
}

export const MEMORY: PrintKind = {
  id: 'memory',
  family: 'game',
  title: 'Memory',
  said: 'un memory',
  icon: 'pr-memory',
  minAge: 3,
  envelope: true,
  build(ctx, rng) {
    const { mode, pairs } = memoryPairs(ctx.age, rng);
    const cards = shuffle(pairs.flat(), rng);
    const cols = cards.length <= 12 ? 3 : 4;
    const rows = Math.ceil(cards.length / cols);
    const s = Math.min(180 / cols, 230 / rows);
    const x0 = (PAGE_W - cols * s) / 2;
    const y0 = 36;
    let fronts = '';
    let backs = '';
    const c = colorOf(ctx.color);
    cards.forEach((card, i) => {
      const [x, y] = [x0 + (i % cols) * s, y0 + Math.floor(i / cols) * s];
      fronts += drawCard(card, x, y, s) + cutRect(x, y, s, s);
      // Dos : la même place en miroir, pour une impression recto verso.
      const bx = x0 + (cols - 1 - (i % cols)) * s;
      backs += `<rect x="${n(bx + 1)}" y="${n(y + 1)}" width="${n(s - 2)}" height="${n(s - 2)}" rx="4" fill="${c.skin}" stroke="${INK}" stroke-width="0.7"/>`
        + `<rect x="${n(bx + 4)}" y="${n(y + 4)}" width="${n(s - 8)}" height="${n(s - 8)}" rx="3" fill="none" stroke="#fff" stroke-width="0.8" stroke-dasharray="2 2"/>`
        + headAt({ color: ctx.color }, bx + s / 2, y + s / 2, s * 0.62);
    });
    const goal = mode === 'same' ? 'Retrouve les paires d\'images !'
      : mode === 'count' ? 'Associe chaque nombre au bon nombre de fruits !' : 'Associe chaque mot à son image !';
    return {
      title: mode === 'same' ? 'Memory des images' : mode === 'count' ? 'Memory des nombres' : 'Memory des mots',
      pages: [
        page(text(PAGE_W / 2, 27, 6, goal) + fronts + scissors(x0 - 4, y0 - 2, 6, 0), { footer: footerOf(ctx) }),
        page(text(PAGE_W / 2, 27, 5, 'Le dos des cartes (à imprimer au verso, ou à coller)', { fill: GREY }) + backs, { footer: footerOf(ctx) }),
      ],
      advice: {
        skills: mode === 'same' ? ['Mémoire visuelle', 'Vocabulaire (nommer chaque image)', 'Attendre son tour']
          : mode === 'count' ? ['Associer un chiffre et une quantité (1 à 10)', 'Compter des objets sans en oublier', 'Mémoire']
            : ['Lecture de mots simples', 'Associer un mot écrit et une image', 'Mémoire'],
        talk: mode === 'word'
          ? 'Quand il retourne un mot, aidez-le à le lire en suivant les syllabes du doigt, puis cherchez l\'image ensemble.'
          : 'À chaque carte retournée, faites-lui dire à voix haute ce qu\'il voit (ou combien il y en a) : ça aide à se souvenir.',
        further: 'Commencez avec la moitié des paires, cartes visibles, puis cachées. Variante : le « jeu de Kim » (on enlève une carte, il devine laquelle).',
        material: 'Ciseaux. Pour des cartes solides : imprimez le dos au verso (recto verso, bord long), ou collez les deux pages sur du carton.',
      },
    };
  },
};

// ---- Loto ----

export const LOTO: PrintKind = {
  id: 'loto',
  family: 'game',
  title: 'Loto',
  said: 'un loto',
  icon: 'pr-loto',
  minAge: 3,
  envelope: true,
  build(ctx, rng) {
    const level = ctx.gameLevel('LO-6');
    const images = ctx.age <= 3;
    const max = images ? 0 : ctx.age <= 4 ? 10 : ctx.age <= 5 ? (level >= 10 ? 30 : 20) : ctx.age <= 6 ? 30 : 50;
    const pool: Card[] = images
      ? easyConcepts(rng, 12).map((c) => ({ image: c.id }))
      : Array.from({ length: max }, (_, i) => ({ digit: i + 1 }));
    const [gc, gr] = images ? [3, 2] : [3, 3];
    const players = familyDinos(ctx, 4, rng);
    const [bw, bh] = [88, images ? 86 : 110];
    let boards = '';
    players.forEach((p, i) => {
      const [x, y] = [15 + (i % 2) * (bw + 4), 34 + Math.floor(i / 2) * (bh + 8)];
      const picks = shuffle([...pool], rng).slice(0, gc * gr);
      const cell = (bw - 8) / gc;
      boards += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="5" fill="${colorOf(p.color).belly}" stroke="${INK}" stroke-width="0.8"/>`
        + headAt({ color: p.color }, x + 12, y + 10, 16) + text(x + 24, y + 13, 5, p.name || `Joueur ${i + 1}`, { anchor: 'start' });
      picks.forEach((card, k) => {
        const [cx, cy] = [x + 4 + (k % gc) * cell, y + 22 + Math.floor(k / gc) * cell];
        boards += `<rect x="${n(cx + 1)}" y="${n(cy + 1)}" width="${n(cell - 2)}" height="${n(cell - 2)}" rx="3" fill="#fff" stroke="${INK}" stroke-width="0.6"/>`;
        if (card.image) boards += image(card.image, cx + cell * 0.15, cy + cell * 0.15, cell * 0.7);
        else boards += text(cx + cell / 2, cy + cell * 0.66, cell * 0.45, String(card.digit))
          + (ctx.age <= 4 && card.digit! <= 6 ? pips(card.digit!, cx + cell / 2, cy + cell * 0.88, cell * 0.22, GREY) : '');
      });
    });
    // Page 2 : les cartes à tirer (avec des calculs pour les grands) et des jetons.
    const cs = 26;
    const perRow = 7;
    let calls = '';
    pool.forEach((card, i) => {
      const [x, y] = [14 + (i % perRow) * cs, 34 + Math.floor(i / perRow) * cs];
      calls += cutRect(x, y, cs, cs, 2);
      if (card.image) calls += image(card.image, x + 4, y + 4, cs - 8);
      else if (ctx.age >= 7) {
        const a = 1 + Math.floor(rng() * Math.min(9, card.digit! - 1 || 1));
        const label = card.digit! > 1 ? `${card.digit! - a} + ${a}` : '1';
        calls += text(x + cs / 2, y + cs * 0.62, 6, label);
      } else calls += text(x + cs / 2, y + cs * 0.68, 11, String(card.digit));
    });
    const tokensY = 34 + Math.ceil(pool.length / perRow) * cs + 10;
    let tokens = '';
    const fruits = shuffle([...FRUITS], rng);
    const tokenCount = Math.min(36, Math.floor((272 - tokensY) / 16) * 11);
    for (let i = 0; i < tokenCount; i++) {
      const [x, y] = [22 + (i % 11) * 16.5, tokensY + 8 + Math.floor(i / 11) * 16];
      tokens += `<circle cx="${n(x)}" cy="${n(y)}" r="7" fill="#fff" stroke="${GREY}" stroke-width="0.4" stroke-dasharray="1.5 1"/>`
        + image(`food-${fruits[i % 4]}`, x - 5, y - 5, 10);
    }
    return {
      title: images ? 'Loto des images' : `Loto des nombres (1 à ${max})`,
      pages: [
        page(text(PAGE_W / 2, 27, 6, 'Le loto des dinos') + boards + scissors(10, 32, 6, 0), { footer: footerOf(ctx) }),
        page(text(PAGE_W / 2, 27, 5.5, ctx.age >= 7 ? 'Les cartes à tirer (calcule le nombre !)' : 'Les cartes à tirer')
          + calls + text(PAGE_W / 2, tokensY + 1, 4.5, 'Les jetons') + tokens, { footer: footerOf(ctx) }),
      ],
      advice: {
        skills: images ? ['Vocabulaire : nommer les images', 'Écoute et attention', 'Jouer à plusieurs']
          : ['Reconnaître les nombres écrits' + (max > 10 ? ` jusqu'à ${max}` : ''), ctx.age >= 7 ? 'Calcul mental (additions)' : 'Écouter un nombre et le retrouver', 'Jouer à plusieurs'],
        talk: images
          ? 'Tirez une carte, montrez-la et nommez-la ensemble : qui a cette image sur sa planche ?'
          : 'Annoncez le nombre à voix haute sans le montrer : l\'enfant cherche sur sa planche. Pour aider, montrez la carte.'
            + (ctx.age >= 7 ? ' Avec les calculs, c\'est l\'enfant qui tire et qui calcule pour tout le monde !' : ''),
        further: 'Laissez l\'enfant être le meneur de jeu : c\'est lui qui tire et annonce les cartes.',
        material: 'Ciseaux. Les jetons peuvent être remplacés par des pâtes ou des boutons.',
      },
    };
  },
};

// ---- Dominos ----

type Half = { kind: 'fruit'; fruit: string } | { kind: 'dots' | 'digit' | 'sum'; value: number };

export const DOMINOES: PrintKind = {
  id: 'dominoes',
  family: 'game',
  title: 'Dominos',
  said: 'des dominos',
  icon: 'pr-dominoes',
  minAge: 3,
  envelope: true,
  build(ctx, rng) {
    const young = ctx.age <= 4;
    const values = young ? 6 : 7;
    const fruits = shuffle([...FRUITS], rng).slice(0, 6);
    const tiles: [number, number][] = [];
    for (let a = 0; a < values; a++) for (let b = a; b < values; b++) tiles.push([a, b]);
    const half = (v: number): Half => {
      if (young) return { kind: 'fruit', fruit: fruits[v] };
      const forms: Half['kind'][] = ctx.age <= 5 ? ['dots', 'digit'] : ctx.age <= 6 ? ['dots', 'digit', 'digit'] : ['dots', 'digit', 'sum'];
      const kind = forms[Math.floor(rng() * forms.length)] as 'dots' | 'digit' | 'sum';
      return { kind: kind === 'sum' && v < 2 ? 'digit' : kind, value: v };
    };
    const drawHalf = (h: Half, x: number, y: number, s: number) => {
      if (h.kind === 'fruit') return image(`food-${h.fruit}`, x + s * 0.15, y + s * 0.15, s * 0.7);
      if (h.kind === 'dots') return pips(h.value, x + s / 2, y + s / 2, s * 0.9);
      if (h.kind === 'digit') return text(x + s / 2, y + s * 0.7, s * 0.55, String(h.value));
      const a = 1 + Math.floor(rng() * (h.value - 1));
      return text(x + s / 2, y + s * 0.62, s * 0.3, `${a}+${h.value - a}`);
    };
    const [tw, th] = [58, 23.5];
    let out = '';
    shuffle(tiles, rng).forEach(([a, b], i) => {
      const [x, y] = [18 + (i % 3) * (tw + 2), 34 + Math.floor(i / 3) * (th + 0.5)];
      out += `<rect x="${n(x + 0.8)}" y="${n(y + 0.8)}" width="${n(tw - 1.6)}" height="${n(th - 1.6)}" rx="3" fill="#fff" stroke="${INK}" stroke-width="0.7"/>`
        + `<path d="M${n(x + tw / 2)} ${n(y + 3)} V${n(y + th - 3)}" stroke="${INK}" stroke-width="0.5"/>`
        + drawHalf(half(a), x + 3, y + 0.5, th - 1) + drawHalf(half(b), x + tw / 2 + 3, y + 0.5, th - 1)
        + cutRect(x, y, tw, th);
    });
    return {
      title: young ? 'Dominos des fruits' : 'Dominos des nombres',
      pages: [page(text(PAGE_W / 2, 27, 6, young ? 'Les dominos des fruits' : 'Les dominos des nombres') + out
        + scissors(14, 32, 6, 0), { footer: footerOf(ctx) })],
      advice: {
        skills: young ? ['Associer des images identiques', 'Jouer chacun son tour']
          : ['Reconnaître une quantité d\'un coup d\'œil (constellations du dé)', 'Associer quantité, chiffre' + (ctx.age >= 7 ? ' et calcul' : ''), 'Stratégie simple'],
        talk: young
          ? 'Distribuez 4 dominos chacun. On pose un domino qui a le même fruit qu\'un bout de la chaîne ; sinon on pioche.'
          : 'Un bout avec 3 points se colle à un « 3 » écrit' + (ctx.age >= 7 ? ' ou à « 1+2 »' : '') + '. Demandez-lui de justifier : « pourquoi ça va ensemble ? ».',
        further: 'Rangez les dominos du plus petit au plus grand, ou cherchez tous ceux qui font « 6 » en tout.',
        material: 'Ciseaux, et du carton fin pour des dominos solides.',
      },
    };
  },
};

// ---- Diplôme ----

/** Niveaux du dino qui donnent un diplôme. */
export const DIPLOMA_LEVELS = [5, 10, 15, 20, 25, 30, 35, 40];

export const DIPLOMA: PrintKind = {
  id: 'diploma',
  family: 'award',
  title: 'Diplôme',
  said: 'un diplôme',
  icon: 'pr-diploma',
  minAge: 3,
  envelope: false,
  build(ctx) {
    const level = ctx.param ?? ctx.level;
    const c = colorOf(ctx.color);
    const star = (x: number, y: number, r: number) => {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr = i % 2 ? r * 0.45 : r;
        return `${n(x + rr * Math.cos(a))},${n(y + rr * Math.sin(a))}`;
      }).join(' ');
      return `<polygon points="${pts}" fill="#ffd23f" stroke="${INK}" stroke-width="0.7" stroke-linejoin="round"/>`;
    };
    const border = `<rect x="14" y="14" width="182" height="269" rx="8" fill="none" stroke="${c.dark}" stroke-width="2.5"/>`
      + `<rect x="18" y="18" width="174" height="261" rx="6" fill="none" stroke="${c.spike}" stroke-width="1" stroke-dasharray="3 2"/>`;
    const seal = `<circle cx="160" cy="226" r="17" fill="${c.spike}" stroke="${INK}" stroke-width="0.8"/>`
      + `<circle cx="160" cy="226" r="13" fill="none" stroke="#fff" stroke-width="0.8" stroke-dasharray="1.5 1.2"/>`
      + text(160, 223, 4, 'NIVEAU', { fill: '#fff' }) + text(160, 233, 9, String(level), { fill: '#fff' });
    const foot = `<g transform="translate(52 236)" fill="${c.skin}" stroke="${INK}" stroke-width="0.7">
      <ellipse cx="0" cy="6" rx="8" ry="7"/><ellipse cx="-8" cy="-5" rx="3" ry="4.5"/><ellipse cx="0" cy="-8" rx="3" ry="4.5"/><ellipse cx="8" cy="-5" rx="3" ry="4.5"/></g>`;
    const body = border
      + star(40, 40, 7) + star(170, 40, 7)
      + text(PAGE_W / 2, 48, 16, 'DIPLÔME', { fill: c.dark })
      + text(PAGE_W / 2, 62, 6, 'du super dresseur de dino', { weight: 400 })
      + text(PAGE_W / 2, 80, 7, ctx.name ? `Bravo ${ctx.name} !` : 'Bravo !')
      + dinoAt({ ...lookOf(ctx, false), eyes: 'happy', mouth: 'open' }, PAGE_W / 2, 186, 92)
      + text(PAGE_W / 2, 198, 5, `Ton dino ${c.name} a grandi jusqu'au niveau ${level} !`, { weight: 400 })
      + text(PAGE_W / 2, 206, 5, 'Tu as bien joué, bien appris, et tu l\'as bien nourri.', { weight: 400 })
      + seal + foot
      + text(52, 254, 3.6, 'La patte du dino', { weight: 400 })
      + text(105, 268, 3.6, `Le ${new Date(ctx.at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, { weight: 400 })
      + text(105, 240, 3.6, 'Signature des parents :', { weight: 400 })
      + `<path d="M80 252 H130" stroke="${GREY}" stroke-width="0.4"/>`;
    return {
      title: `Diplôme du niveau ${level}`,
      pages: [page(body, { frame: false })],
      advice: {
        skills: ['Fierté et confiance en soi', 'Reconnaître ses progrès'],
        talk: `Remettez-lui le diplôme solennellement ! Demandez-lui ce qu'il a préféré apprendre avec son dino, et ce qu'il trouve encore difficile.`,
        further: 'Affichez-le dans sa chambre, avec la date : il pourra voir tous ses diplômes s\'aligner.',
        material: 'Une belle feuille (papier épais) si vous en avez.',
      },
    };
  },
};
