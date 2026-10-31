import { FRUITS, Rng, shuffle } from '../domain/models';
import { colorOf, dinoAt, dinoHead, headAt, puppetPieces } from './dino';
import { footerOf, lookOf, uid } from './common';
import { drawScene, paleImages, sceneElements } from './scene';
import { GREY, INK, LIGHT, PAGE_W, hollowText, image, n, page, scissors, text } from './svg';
import { PrintContext, PrintKind } from './types';

/** Une pièce entourée d'une marge grise : on découpe sur le bord extérieur du gris. */
const withHalo = (inner: string, width: number) =>
  `<g class="halo" style="stroke-width:${width}px">${inner.replace(/<image[^>]*\/>/g, '')}</g>${inner}`;

/** Consignes numérotées en bas de page. */
function steps(x: number, y: number, lines: string[], size = 3.8) {
  return lines.map((l, i) => text(x, y + i * size * 1.5, size, `${i + 1}. ${l}`, { anchor: 'start', weight: 400 })).join('');
}

/** Quelques lignes de texte, sans numéros. */
const notes = (x: number, y: number, lines: string[], size = 4) =>
  lines.map((l, i) => (l ? text(x, y + i * size * 1.5, size, l, { anchor: 'start', weight: 400 }) : '')).join('');

const colorStep = (ctx: PrintContext) => (ctx.lineArt ? 'Colorie ton dino.' : 'Demande à un adulte de t\'aider à découper.');

// ---- Masque ----

export const MASK: PrintKind = {
  id: 'mask',
  family: 'cut',
  title: 'Masque de dino',
  said: 'un masque de dino',
  icon: 'pr-mask',
  minAge: 3,
  envelope: true,
  lineArtOption: true,
  build(ctx) {
    const k = 0.53;
    const [cx, oy] = [PAGE_W / 2, 44 + 246.5 * k];
    // Sans objets : un chapeau dépasserait de la feuille et compliquerait le découpage.
    const look = { ...lookOf(ctx), worn: [] };
    const head = dinoHead(look, { eyes: false });
    const eyes = [-52, 52].map((ex) =>
      `<ellipse cx="${ex}" cy="-110" rx="27" ry="31" fill="#fff" stroke="${GREY}" stroke-width="2" stroke-dasharray="7 5"/>`).join('');
    const holes = [-1, 1].map((s) => `<circle cx="${s * 125}" cy="-120" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/>`).join('');
    const body = text(PAGE_W / 2, 26, 7, ctx.lineArt ? 'Colorie, découpe, et deviens un dino !' : 'Découpe, et deviens un dino !')
      + `<g transform="translate(${cx} ${n(oy)}) scale(${k})">${withHalo(head, 18)}${eyes}${holes}</g>`
      + scissors(cx - 70, oy - 44, 8, 0)
      + text(cx + 125 * k, oy - 120 * k - 5, 3, 'élastique', { fill: GREY, weight: 400 })
      + text(cx - 125 * k, oy - 120 * k - 5, 3, 'élastique', { fill: GREY, weight: 400 })
      + text(cx, oy - 110 * k + 1, 2.8, 'à découper', { fill: GREY, weight: 400 })
      + steps(22, 214, [
        colorStep(ctx),
        'Un adulte découpe le masque en suivant le bord gris.',
        'Il découpe aussi les deux yeux (les ronds en pointillés).',
        'Perce les deux petits ronds et attache un élastique.',
        'Rugis comme un vrai dino !',
      ]);
    return {
      title: 'Masque de dino',
      pages: [page(body, { footer: footerOf(ctx) })],
      advice: {
        skills: ['Motricité fine : colorier, puis découper avec un adulte', 'Jeu symbolique : faire semblant, inventer une histoire', 'Exprimer des émotions (le dino est content, fâché, il a peur…)'],
        talk: 'Une fois le masque mis, jouez au dino : comment il marche, ce qu\'il mange, comment il dit bonjour. '
          + 'Demandez-lui de faire un dino content, puis un dino fâché.',
        further: 'Collez le masque sur du carton fin pour qu\'il dure plus longtemps. Un deuxième masque pour vous, et c\'est une vraie pièce de théâtre !',
        material: 'Ciseaux (adulte), élastique ou ficelle, éventuellement du carton fin et de la colle.',
      },
    };
  },
};

// ---- Puzzle ----

type Pt = [number, number];

/** Un bord de pièce de puzzle de A à B avec une languette (vers la normale si `dir` = 1, de l'autre côté si -1). */
export function jigsawEdge(a: Pt, b: Pt, dir: number): string {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const len = Math.hypot(dx, dy);
  const [nx, ny] = [-dy / len, dx / len];
  const p = (u: number, v: number) => `${n(a[0] + dx * u + nx * v * len * dir * 0.85)} ${n(a[1] + dy * u + ny * v * len * dir * 0.85)}`;
  return `M${p(0, 0)} L${p(0.34, 0)} C${p(0.4, 0)} ${p(0.42, 0.04)} ${p(0.38, 0.1)} C${p(0.33, 0.18)} ${p(0.4, 0.26)} ${p(0.5, 0.26)} `
    + `C${p(0.6, 0.26)} ${p(0.67, 0.18)} ${p(0.62, 0.1)} C${p(0.58, 0.04)} ${p(0.6, 0)} ${p(0.66, 0)} L${p(1, 0)}`;
}

/** Grille du puzzle selon l'âge : 6 pièces à 3 ans, 30 à 7 ans. */
export const puzzleGrid = (age: number): [number, number] =>
  ([[2, 3], [3, 3], [3, 4], [4, 5], [5, 6]] as [number, number][])[Math.max(0, Math.min(4, age - 3))];

export function jigsawLines(cols: number, rows: number, w: number, h: number, rng: Rng): string {
  let d = '';
  for (let r = 1; r < rows; r++) {
    for (let c = 0; c < cols; c++) d += jigsawEdge([(c * w) / cols, (r * h) / rows], [((c + 1) * w) / cols, (r * h) / rows], rng() < 0.5 ? 1 : -1) + ' ';
  }
  for (let c = 1; c < cols; c++) {
    for (let r = 0; r < rows; r++) d += jigsawEdge([(c * w) / cols, (r * h) / rows], [(c * w) / cols, ((r + 1) * h) / rows], rng() < 0.5 ? 1 : -1) + ' ';
  }
  return d;
}

export const PUZZLE: PrintKind = {
  id: 'puzzle',
  family: 'cut',
  title: 'Puzzle à découper',
  said: 'un puzzle',
  icon: 'pr-puzzle',
  minAge: 3,
  envelope: true,
  lineArtOption: true,
  build(ctx, rng) {
    const [cols, rows] = puzzleGrid(ctx.age);
    const [x, y, w, h] = [15, 34, 180, 240];
    const els = sceneElements(w, h, { look: lookOf(ctx), detail: ctx.age <= 4 ? 2 : 3 }, rng);
    let scene = drawScene(els);
    if (ctx.lineArt) scene = paleImages(scene);
    const lines = jigsawLines(cols, rows, w, h, rng);
    const clip = uid('clip', rng);
    const picture = (inner: string, ink: string) =>
      `<g transform="translate(${x} ${y})"><clipPath id="${clip}"><rect width="${w}" height="${h}"/></clipPath>`
      + `<g clip-path="url(#${clip})">${inner}</g>`
      + `<path d="${lines}" fill="none" stroke="${ink}" stroke-width="0.9"/>`
      + `<rect width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="0.8"/></g>`;
    const pages = [page(text(PAGE_W / 2, 27, 6.5, `Mon puzzle de ${cols * rows} pièces`)
      + picture(ctx.lineArt ? scene.replace(/<image /g, '<image filter="url(#pale)" ') : scene, ctx.lineArt ? INK : '#ffffff')
      + (ctx.lineArt ? '' : `<g transform="translate(${x} ${y})"><path d="${lines}" fill="none" stroke="${INK}" stroke-width="0.4" stroke-dasharray="1.4 1"/></g>`)
      + scissors(x - 3, y - 3, 6, 45), { footer: footerOf(ctx) })];
    // Pour les petits : un plateau avec l'image en très pâle et les contours des pièces.
    if (ctx.age <= 4) {
      pages.push(page(text(PAGE_W / 2, 27, 6.5, 'Le plateau : pose les pièces au bon endroit !')
        + `<g opacity="0.22">${picture(scene, INK)}</g>`
        + `<g transform="translate(${x} ${y})"><path d="${lines}" fill="none" stroke="${GREY}" stroke-width="0.6"/>`
        + `<rect width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="1"/></g>`, { footer: footerOf(ctx) }));
    }
    return {
      title: `Puzzle de ${cols * rows} pièces`,
      pages,
      advice: {
        skills: ['Observation des formes et des couleurs', 'Repérage dans l\'espace (en haut, au bord, dans le coin)', 'Patience et persévérance'],
        talk: 'Commencez par les pièces du bord (elles ont un côté droit), puis les coins. Demandez-lui ce qu\'il voit sur la pièce : '
          + '« un bout de queue, c\'est en bas à droite ! ».',
        further: ctx.age <= 4
          ? 'Le plateau (page 2) aide beaucoup : on pose chaque pièce sur son ombre. Collez la page 1 sur du carton avant de découper.'
          : 'Collez l\'image sur du carton avant de découper : le puzzle durera plus longtemps. Rangez les pièces dans une enveloppe.',
        material: 'Ciseaux (adulte), colle et carton fin (boîte de céréales).',
      },
    };
  },
};

// ---- Dino articulé ----

export const PUPPET: PrintKind = {
  id: 'puppet',
  family: 'cut',
  title: 'Dino articulé',
  said: 'un dino articulé à fabriquer',
  icon: 'pr-puppet',
  minAge: 4,
  envelope: true,
  lineArtOption: true,
  build(ctx) {
    const k = 0.33;
    const pieces = puppetPieces({ ...lookOf(ctx), worn: [] });
    const at: Record<string, Pt> = {
      head: [14, 32], tail: [128, 42], body: [16, 138], armL: [118, 138], armR: [150, 138], legL: [112, 192], legR: [154, 192],
    };
    let body = text(PAGE_W / 2, 26, 6.5, 'Mon dino articulé');
    for (const p of pieces) {
      const [px, py] = at[p.id];
      const pivots = p.pivots.map(([qx, qy]) =>
        `<circle cx="${n(qx)}" cy="${n(qy)}" r="9" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M${n(qx - 5)} ${n(qy)} h10 M${n(qx)} ${n(qy - 5)} v10" stroke="${INK}" stroke-width="2.5"/>`).join('');
      body += `<g transform="translate(${px} ${py}) scale(${k})">${withHalo(p.body, 16)}${pivots}</g>`;
    }
    body += scissors(10, 30, 7, 0)
      + dinoAt({ color: ctx.color, lineArt: ctx.lineArt }, 168, 282, 48)
      + text(168, 230, 3.4, 'Une fois assemblé :', { weight: 400 })
      + steps(16, 236, [
        colorStep(ctx),
        'Un adulte découpe les 7 pièces en suivant le bord gris.',
        'Il perce les ronds ⊕ avec la pointe d\'un crayon.',
        'Pose chaque pièce sur le corps, rond sur rond,',
        'et attache-la avec une attache parisienne.',
      ], 3.6);
    return {
      title: 'Dino articulé',
      pages: [page(body, { footer: footerOf(ctx) })],
      advice: {
        skills: ['Motricité fine (découper, assembler, attacher)', 'Suivre des étapes dans l\'ordre', 'Le schéma corporel : tête, corps, bras, pattes, queue'],
        talk: 'Nommez chaque pièce ensemble avant de l\'attacher. Une fois fini, faites-lui bouger les bras et la queue : '
          + '« Ton dino dit bonjour ? Il danse ? »',
        further: 'Fixez le dino au mur avec de la pâte adhésive : l\'enfant change sa pose chaque matin pour dire comment il se sent.',
        material: '7 attaches parisiennes (papeterie), ciseaux, éventuellement du carton fin.',
      },
    };
  },
};

// ---- Marionnette à doigts ----

export const FINGER: PrintKind = {
  id: 'finger',
  family: 'cut',
  title: 'Marionnettes à doigts',
  said: 'des marionnettes à doigts',
  icon: 'pr-finger',
  minAge: 3,
  envelope: true,
  lineArtOption: true,
  build(ctx, rng) {
    const k = 0.22;
    const friend = shuffle([...Array(10).keys()].filter((c) => c !== ctx.color), rng)[0];
    const puppet = (color: number, worn: readonly string[], x: number, y: number, name: string) => {
      const look = { color, worn, lineArt: ctx.lineArt, legs: false };
      const holes = [-1, 1].map((s) =>
        `<circle cx="${s * 50}" cy="-62" r="34" fill="#fff" stroke="${GREY}" stroke-width="4" stroke-dasharray="10 7"/>`).join('');
      // Le dino dessiné via `dinoAt` : on reprend son contenu pour ajouter la marge grise.
      const inner = dinoAt(look, 0, 0, 500).replace(/^<g transform="[^"]*">/, '').replace(/<\/g>$/, '');
      return `<g transform="translate(${x} ${y}) scale(${k})">${withHalo(inner, 16)}${holes}</g>`
        + text(x, y + 9, 3.6, name, { fill: GREY, weight: 400 });
    };
    const body = text(160, 40, 6, 'Mes marionnettes', { anchor: 'middle' }) + text(160, 48, 6, 'à doigts')
      + puppet(ctx.color, ctx.worn, 62, 146, ctx.name ? `le dino de ${ctx.name}` : 'mon dino')
      + puppet(friend, [], 62, 276, `son copain ${colorOf(friend).name}`)
      + scissors(12, 20, 7, 0)
      + notes(128, 70, [
        ctx.lineArt ? 'Colorie les dinos.' : 'Choisis ton dino !',
        'Un adulte découpe',
        'chaque dino en suivant',
        'le bord gris, puis',
        'les deux ronds.',
        '',
        'Passe deux doigts',
        'dans les trous :',
        'ce sont ses pattes !',
        '',
        'Fais-les marcher,',
        'courir et danser !',
      ]);
    return {
      title: 'Marionnettes à doigts',
      pages: [page(body, { footer: footerOf(ctx) })],
      advice: {
        skills: ['Langage oral : inventer et raconter une histoire', 'Coordination des doigts', 'Jeu à deux (chacun sa marionnette)'],
        talk: 'Prenez chacun une marionnette et inventez un dialogue : les deux dinos se rencontrent, cherchent à manger, '
          + 'vont au volcan… Laissez-le mener l\'histoire et posez des questions (« et après ? »).',
        further: 'Fabriquez un petit théâtre avec une boîte à chaussures retournée.',
        material: 'Ciseaux (adulte), carton fin pour les rendre plus solides.',
      },
    };
  },
};

// ---- Couronne ----

export const CROWN: PrintKind = {
  id: 'crown',
  family: 'cut',
  title: 'Couronne de dino',
  said: 'une couronne de dino',
  icon: 'pr-crown',
  minAge: 3,
  envelope: true,
  lineArtOption: true,
  build(ctx, rng) {
    const c = colorOf(ctx.color);
    const skin = ctx.lineArt ? '#fff' : c.skin;
    const spike = ctx.lineArt ? '#fff' : c.spike;
    const fruits = shuffle([...FRUITS], rng);
    const strip = (y: number, i: number) => {
      const [x0, x1, band, sh] = [14, 168, 40, 20];
      const top = y + sh;
      const m = 7;
      let d = `M${x0} ${top + band} L${x0} ${top}`;
      for (let s = 0; s < m; s++) {
        const a = x0 + ((x1 - x0) * s) / m;
        const b = x0 + ((x1 - x0) * (s + 1)) / m;
        d += ` L${n((a + b) / 2)} ${n(y + (s % 2 ? 4 : 0))} L${n(b)} ${top}`;
      }
      d += ` L${x1} ${top + band} Z`;
      const tab = i < 2
        ? `<path d="M${x1} ${top} h14 v${band} h-14" fill="${LIGHT}" stroke="${INK}" stroke-width="0.6"/>`
          + text(x1 + 7, top + band / 2 + 1.5, 3.2, 'colle', { fill: INK, weight: 400, extra: `transform="rotate(90 ${x1 + 7} ${top + band / 2})"` })
        : '';
      let deco = '';
      if (i === 0) {
        deco = headAt({ color: ctx.color, lineArt: ctx.lineArt }, 42, top + band / 2, 40)
          + (ctx.name ? hollowText(118, top + band / 2 + 6, ctx.name.length > 8 ? 12 : 16, ctx.name.toUpperCase()) : '');
      } else {
        for (let f = 0; f < 4; f++) {
          deco += image(`food-${fruits[(i * 4 + f) % fruits.length]}`, x0 + 12 + f * 38, top + 9, 22, 22, ctx.lineArt ? 'filter="url(#pale)"' : '');
        }
      }
      return `<path d="${d}" fill="${spike}"/>`
        + `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${band}" fill="${skin}"/>`
        + `<path d="M${x0} ${top + band - 7} H${x1}" stroke="${ctx.lineArt ? LIGHT : c.dark}" stroke-width="2"/>`
        + tab + deco
        + `<path d="${d}" fill="none" stroke="${INK}" stroke-width="0.8" stroke-linejoin="round"/>`
        + scissors(x0 - 4, top + band + 3, 5, 0);
    };
    const body = text(PAGE_W / 2, 26, 6.5, 'Ma couronne de dino')
      + strip(34, 0) + strip(104, 1) + strip(174, 2)
      + steps(18, 254, [
        colorStep(ctx),
        'Un adulte découpe les 3 bandes en suivant le trait noir.',
        'Colle les bandes bout à bout sur les zones grises « colle ».',
        'Ajuste à la taille de la tête et ferme avec du scotch.',
      ], 3.6);
    return {
      title: 'Couronne de dino',
      pages: [page(body, { footer: footerOf(ctx) })],
      advice: {
        skills: ['Motricité fine (colorier, coller)', 'Mesurer : ajuster la couronne à son tour de tête', 'Fierté : porter son œuvre'],
        talk: 'Comptez les piquants ensemble, et montrez les lettres de son prénom sur la bande de devant.',
        further: 'Parfait pour un anniversaire : imprimez-en une par invité (version à colorier) et faites un atelier couronnes.',
        material: 'Ciseaux, colle ou scotch.',
      },
    };
  },
};
