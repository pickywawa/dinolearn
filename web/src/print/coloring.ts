import { Rng, shuffle } from '../domain/models';
import { colorOf, toLineArt } from './dino';
import { detailFor, footerOf, lookOf, uid } from './common';
import { drawScene, paleImages, pickDifferences, sceneElements } from './scene';
import { INK, LIGHT, PAGE_W, hollowText, n, ofName, page, text } from './svg';
import { PrintKind } from './types';

/** Coloriage : le dino de l'enfant, habillé, dans un paysage préhistorique, et son prénom en lettres creuses. */
export const COLORING: PrintKind = {
  id: 'coloring',
  family: 'color',
  title: 'Coloriage de son dino',
  said: 'un coloriage de moi',
  icon: 'pr-coloring',
  minAge: 3,
  envelope: true,
  build(ctx, rng) {
    const detail = detailFor(ctx.age);
    const [x, y, w, h] = [12, 42, 186, 240];
    const els = sceneElements(w, h, { look: lookOf(ctx, true), detail }, rng);
    const clip = uid('clip', rng);
    const scene = paleImages(toLineArt(drawScene(els)));
    const name = ctx.name ? hollowText(PAGE_W / 2, 33, ctx.name.length > 9 ? 17 : 22, ctx.name.toUpperCase()) : '';
    const body = `${name}<clipPath id="${clip}"><rect x="0" y="0" width="${w}" height="${h}" rx="5"/></clipPath>`
      + `<g transform="translate(${x} ${y})"><g clip-path="url(#${clip})">${scene}</g>`
      + `<rect width="${w}" height="${h}" rx="5" fill="none" stroke="${INK}" stroke-width="1"/></g>`;
    return {
      title: ofName(ctx.name, 'Le dino'),
      pages: [page(body, { footer: footerOf(ctx) })],
      advice: {
        skills: ['Motricité fine : tenir le crayon, colorier sans trop dépasser', 'Couleurs et attention'],
        talk: `Demandez-lui de quelle couleur est son dino dans le jeu (${colorOf(ctx.color).name}), et s'il veut le garder `
          + 'comme ça ou en inventer un autre. Montrez les lettres de son prénom une par une.',
        further: 'Affichez le dessin près de l\'endroit où il joue : il pourra le montrer à son dino. '
          + (ctx.age <= 4 ? 'À cet âge, dépasser est normal : on félicite l\'effort, pas la précision.' : 'Proposez de colorier le fond aussi, sans laisser de blanc.'),
        material: 'Crayons de couleur ou feutres.',
      },
    };
  },
};

// ---- Coloriage magique : une grille de cases numérotées ----

/** Dessins en pixels (16 colonnes) ; chaque lettre est une couleur, « . » reste blanc. */
const PIXEL_ART: Record<string, { name: string; rows: string[] }> = {
  dino: {
    name: 'un dino',
    rows: [
      '................',
      '..........KKKK..',
      '.........KKKKKK.',
      '.........KKEKKKK',
      '.........KKKKKKK',
      '........SKKKMMM.',
      '.......SKKKKK...',
      '......SKKKKKKK..',
      '.....SKKKBBKK...',
      '....SKKKKBBBK...',
      '...SKKKKKBBBK...',
      '..SKKKKKKBBK....',
      '.KKKKKKKKKK.....',
      'KK....KK..KK....',
      '......KK..KK....',
      'GGGGGGGGGGGGGGGG',
    ],
  },
  volcano: {
    name: 'un volcan',
    rows: [
      '.....R..R.......',
      '......RR..R.....',
      '.......R.R......',
      '......RRRR......',
      '.....VRRRRV.....',
      '.....VVRRVV.....',
      '....VVVRVVVV....',
      '....VVVRVVVV....',
      '...VVVVVVRVVV...',
      '...VVVVVVRVVV...',
      '..VVVVVVVVVVVV..',
      '..VVVVVVVVVVVV..',
      '.VVVVVVVVVVVVVV.',
      '.VVVVVVVVVVVVVV.',
      'GGGGGGGGGGGGGGGG',
      'GGGGGGGGGGGGGGGG',
    ],
  },
  egg: {
    name: 'un œuf de dino',
    rows: [
      '................',
      '......WWWW......',
      '.....WWWWWW.....',
      '....WWPWWWWW....',
      '....WWWWWWPW....',
      '...WWWWWWWWWW...',
      '...WPWWWWWWWW...',
      '...WWWWWPWWWW...',
      '...WWWWWWWWPW...',
      '...WWPWWWWWWW...',
      '....WWWWWWWW....',
      '..NNWWWWPWWWNN..',
      '.NNNNWWWWWWNNNN.',
      '.NNNNNNNNNNNNNN.',
      '..NNNNNNNNNNNN..',
      '................',
    ],
  },
};

interface Crayon { name: string; hex: string }

/** Nom de crayon pour les couleurs des piquants. */
const SPIKE_NAMES: Record<string, string> = {
  '#ff9f43': 'orange', '#ffd23f': 'jaune', '#8e6cff': 'violet', '#43b649': 'vert', '#ff6b6b': 'rouge',
  '#ff8fa3': 'rose', '#7bd45a': 'vert',
};

/** Couleur de chaque lettre ; deux lettres n'ont jamais le même nom de crayon. */
function crayons(art: string, color: number): Record<string, Crayon> {
  const c = colorOf(color);
  const used = new Set<string>();
  const take = (...choices: Crayon[]) => {
    const pick = choices.find((x) => !used.has(x.name)) ?? choices[choices.length - 1];
    used.add(pick.name);
    return pick;
  };
  const out: Record<string, Crayon> = {};
  if (art === 'dino') {
    out.K = take({ name: c.name, hex: c.skin });
    out.E = take({ name: 'noir', hex: '#2d3354' });
    out.S = take({ name: SPIKE_NAMES[c.spike] ?? 'orange', hex: c.spike }, { name: 'orange', hex: '#ff9f43' }, { name: 'rouge', hex: '#ff6b6b' });
    out.B = take({ name: 'jaune', hex: '#ffe066' }, { name: 'rose', hex: '#ff9fcd' }, { name: 'blanc', hex: '#ffffff' });
    out.M = take({ name: 'rouge', hex: '#e5484d' }, { name: 'rose', hex: '#ff9fcd' }, { name: 'violet', hex: '#8e6cff' });
    out.G = take({ name: 'vert', hex: '#43b649' }, { name: 'marron', hex: '#9a6a40' });
  } else if (art === 'volcano') {
    out.R = take({ name: 'rouge', hex: '#e5484d' });
    out.V = take({ name: 'marron', hex: '#9a6a40' });
    out.G = take({ name: 'vert', hex: '#43b649' });
  } else {
    out.W = take({ name: 'jaune', hex: '#ffe066' });
    out.P = take({ name: c.name, hex: c.skin }, { name: 'bleu', hex: '#62aef2' });
    out.N = take({ name: 'marron', hex: '#9a6a40' });
  }
  return out;
}

/** Ce qui est écrit dans une case pour le code `code` : le nombre, ou un calcul qui donne ce nombre. */
export function cellLabel(code: number, mode: 'number' | 'add' | 'addsub', rng: Rng): string {
  if (mode === 'number') return String(code);
  if (mode === 'addsub' && rng() < 0.4) {
    const b = 1 + Math.floor(rng() * 5);
    return `${code + b}−${b}`;
  }
  // Pas de « 0 + 4 » : les deux nombres valent au moins 1.
  const a = code < 2 ? 0 : 1 + Math.floor(rng() * (code - 1));
  return `${a}+${code - a}`;
}

export const MAGIC: PrintKind = {
  id: 'magic',
  family: 'color',
  title: 'Coloriage magique',
  said: 'un coloriage magique',
  icon: 'pr-magic',
  minAge: 4,
  envelope: true,
  build(ctx, rng) {
    const calc = ctx.gameLevel('LO-5');
    const mode = ctx.age <= 5 && calc < 8 ? 'number' : ctx.age <= 6 && calc < 14 ? 'add' : 'addsub';
    const artId = shuffle(Object.keys(PIXEL_ART), rng)[0];
    const art = PIXEL_ART[artId];
    const palette = crayons(artId, ctx.color);
    const letters = Object.keys(palette);
    // Codes : 1, 2, 3… pour les petits ; avec les calculs, des nombres plus grands, mélangés.
    const pool = mode === 'number' ? letters.map((_, i) => i + 1)
      : shuffle(Array.from({ length: mode === 'add' ? 8 : 12 }, (_, i) => i + 2), rng).slice(0, letters.length);
    const codes = Object.fromEntries(letters.map((l, i) => [l, pool[i]]));
    const cols = 16;
    const cell = 11;
    const x0 = (PAGE_W - cols * cell) / 2;
    const y0 = 36;
    let grid = '';
    art.rows.forEach((row, r) => {
      [...row].forEach((ch, c) => {
        const x = x0 + c * cell;
        const y = y0 + r * cell;
        grid += `<rect x="${n(x)}" y="${n(y)}" width="${cell}" height="${cell}" fill="#fff" stroke="${ch === '.' ? LIGHT : INK}" stroke-width="${ch === '.' ? 0.25 : 0.35}"/>`;
        if (ch !== '.') {
          const label = cellLabel(codes[ch], mode, rng);
          grid += text(x + cell / 2, y + cell / 2 + 1.4, label.length > 3 ? 3.1 : label.length > 1 ? 3.6 : 4.4, label, { weight: 400 });
        }
      });
    });
    const legendY = y0 + art.rows.length * cell + 10;
    const perRow = 3;
    const legend = letters.map((l, i) => {
      const lx = 22 + (i % perRow) * 60;
      const ly = legendY + Math.floor(i / perRow) * 13;
      return `<circle cx="${lx}" cy="${ly}" r="4" fill="${palette[l].hex}" stroke="${INK}" stroke-width="0.5"/>`
        + text(lx + 7, ly + 1.8, 5, `${codes[l]} = ${palette[l].name}`, { anchor: 'start' });
    }).join('');
    const body = text(PAGE_W / 2, 26, 6, mode === 'number' ? 'Colorie chaque case avec la couleur de son nombre !'
      : 'Calcule, puis colorie la case avec la couleur du résultat !', { weight: 400 })
      + grid + legend;
    const solution = letters.map((l) => `${codes[l]} = ${palette[l].name}`).join(', ');
    return {
      title: `Coloriage magique : ${art.name}`,
      pages: [page(body, { footer: footerOf(ctx) })],
      advice: {
        skills: mode === 'number'
          ? ['Reconnaître les chiffres', 'Associer un nombre et une couleur', 'Motricité fine (colorier une petite case)']
          : ['Calcul mental (additions' + (mode === 'addsub' ? ' et soustractions' : '') + ')', 'Associer un résultat à une couleur', 'Persévérance'],
        talk: 'Avant de commencer, lisez la légende ensemble et préparez les crayons. Le dessin apparaît petit à petit : '
          + 'demandez-lui ce qu\'il devine avant la fin !',
        further: mode === 'number'
          ? 'Faites-lui colorier d\'abord tous les « 1 », puis tous les « 2 » : c\'est plus facile que case par case.'
          : 'Il peut s\'aider de ses doigts ou de petits objets pour compter. Écrivez le résultat au crayon de papier dans la case avant de colorier.',
        material: 'Crayons de couleur (feutres fins pour les petites cases).',
        solution: `On voit ${art.name}. Couleurs : ${solution}.`,
      },
    };
  },
};

// ---- Jeu des différences ----

export const DIFFERENCES: PrintKind = {
  id: 'differences',
  family: 'puzzle',
  title: 'Jeu des différences',
  said: 'un jeu des différences',
  icon: 'pr-differences',
  minAge: 3,
  envelope: true,
  build(ctx, rng) {
    const count = ctx.age <= 3 ? 3 : ctx.age <= 4 ? 4 : ctx.age <= 5 ? 5 : 7;
    const detail = detailFor(ctx.age);
    const [w, h] = [186, 112];
    const els = sceneElements(w, h, { look: lookOf(ctx, false), detail }, rng);
    const diffs = pickDifferences(els, count, rng);
    const changed = new Set(diffs.map((d) => d.id));
    const frame = (y: number, inner: string) => {
      const clip = uid('clip', rng);
      return `<clipPath id="${clip}"><rect width="${w}" height="${h}" rx="4"/></clipPath>`
        + `<g transform="translate(12 ${y})"><g clip-path="url(#${clip})">${inner}</g>`
        + `<rect width="${w}" height="${h}" rx="4" fill="none" stroke="${INK}" stroke-width="1"/></g>`;
    };
    const boxes = Array.from({ length: count }, (_, i) =>
      `<circle cx="${n(PAGE_W / 2 + (i - (count - 1) / 2) * 13)}" cy="273" r="4.5" fill="#fff" stroke="${INK}" stroke-width="0.6"/>`).join('');
    const body = text(PAGE_W / 2, 27, 7, `Trouve les ${count} différences !`)
      + frame(33, drawScene(els)) + frame(151, drawScene(els, changed))
      + text(PAGE_W / 2, 267, 4, 'Coche un rond à chaque différence trouvée :', { weight: 400 })
      + boxes;
    const solution = diffs.map((d) => (d.alt ? d.altLabel ?? d.label : `${d.label} (disparu)`)).join(', ');
    return {
      title: 'Jeu des différences',
      pages: [page(body, { footer: footerOf(ctx) })],
      advice: {
        skills: ['Attention et observation', 'Comparer deux images méthodiquement', 'Vocabulaire (dire ce qui a changé)'],
        talk: 'Proposez-lui de regarder « par morceaux » : d\'abord le ciel, puis le dino, puis le sol. Quand il trouve, '
          + 'demandez-lui de dire ce qui a changé avec une phrase (« le ptérodactyle a baissé les ailes »).',
        further: 'Jouez au jeu des différences dans la pièce : il ferme les yeux, vous changez un objet de place, il cherche.',
        material: 'Un crayon pour entourer les différences.',
        solution: `Dans l'image du bas : ${solution}.`,
      },
    };
  },
};
