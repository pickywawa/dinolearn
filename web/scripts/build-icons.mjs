// Extrait les illustrations utilisées vers public/img/, une image par fichier :
// - questions, fruits et décor : Noto (Google, Apache 2.0), dessins détaillés et réalistes ;
// - boutons d'interface : withicons « Plush » (MIT) ; drapeaux : circle-flags (MIT).
// Les images ne sont pas incluses dans le bundle JS : le jeu les charge à la demande.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { getIconData, iconToHTML, iconToSVG } from '@iconify/utils';

const require = createRequire(import.meta.url);
const noto = require('@iconify-json/noto/icons.json');
const plush = require('@iconify-json/withicons-plush/icons.json');
const flags = require('@iconify-json/circle-flags/icons.json');
const openmoji = require('@iconify-json/openmoji/icons.json');

const OUT = new URL('../public/img/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const UI_ICONS = ['play', 'home', 'ear', 'star', 'sparkles', 'globe', 'cloud', 'cake'];
const FRUITS = [
  'red-apple', 'banana', 'strawberry', 'cherries', 'grapes', 'tangerine', 'pear', 'lemon',
  'watermelon', 'peach', 'pineapple', 'kiwi-fruit', 'mango', 'blueberries', 'melon',
  'green-apple', 'coconut',
];
const DECOR = ['palm-tree', 'sauropod', 't-rex', 'herb', 'butterfly', 'fly', 'bird', 'sun', 'rainbow'];
const FLAGS = [
  'gb', 'fr', 'be', 'ch', 'ca', 'lu', 'it', 'ie', 'nl', 'de', 'es', 'us', 'jp', 'br', 'cn', 'mx', 'at', 'ro', 'pe', 'dk',
  'ru', 'td', 'li', 'in', 'sn', 'lb', 'to', 'au', 'eg', 'gr', 'ma', 'pt',
];

function write(name, set, icon) {
  const data = getIconData(set, icon);
  if (!data) throw new Error(`Icône introuvable : ${icon}`);
  const svg = iconToSVG(data, { width: 256, height: 256 });
  writeFileSync(new URL(`${name}.svg`, OUT), iconToHTML(svg.body, svg.attributes));
}

/** Tache de peinture au style « plush » pour les couleurs. */
function colorBlob(name, color) {
  const outline = color === '#2B2B33' ? '#55556a' : '#2d3354';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <path d="M128 28c30 0 44 22 66 26s40 30 30 62 10 46-8 70-46 22-64 36-50 10-70-6-52-20-50-52-20-46 0-72 30-22 48-40 22-24 48-24z"
    fill="${color}" stroke="${outline}" stroke-width="10" stroke-linejoin="round"/>
  <ellipse cx="96" cy="88" rx="26" ry="16" fill="#fff" opacity="0.45" transform="rotate(-30 96 88)"/>
  <circle cx="200" cy="200" r="12" fill="${color}" stroke="${outline}" stroke-width="6"/>
</svg>`;
  writeFileSync(new URL(`${name}.svg`, OUT), svg);
}

const INK = '#2d3354';
const NAV_ICONS = {
  // Cible rouge et blanche, fléchette verte plantée au centre.
  'ui-missions': `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs><radialGradient id="r" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ff6b6b"/><stop offset="1" stop-color="#d81e2c"/></radialGradient></defs>
  <circle cx="118" cy="140" r="100" fill="url(#r)" stroke="${INK}" stroke-width="9"/>
  <circle cx="118" cy="140" r="74" fill="#fff"/>
  <circle cx="118" cy="140" r="52" fill="url(#r)"/>
  <circle cx="118" cy="140" r="28" fill="#fff"/>
  <circle cx="118" cy="140" r="12" fill="#d81e2c"/>
  <path d="M60 78a80 80 0 0 1 60-26" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".55"/>
  <path d="M118 140L204 54" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
  <path d="M118 140L204 54" stroke="#2fa84f" stroke-width="8" stroke-linecap="round"/>
  <path d="M196 30l12 28 28 12-22 10-16 6-6 16-10 22-12-28 26-26z" fill="#4cc93a" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
</svg>`,
  // T-shirt jaune-orangé.
  'ui-mydino': `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd84a"/><stop offset="1" stop-color="#ff9a1f"/></linearGradient></defs>
  <path d="M92 34c8 18 64 18 72 0l58 26 26 58-40 16-12-22v118H60V112l-12 22-40-16 26-58z" fill="url(#t)" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>
  <path d="M92 34c8 18 64 18 72 0" fill="none" stroke="#e07a00" stroke-width="10"/>
  <path d="M74 72l-26 12M182 72l26 12" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".5"/>
  <path d="M84 120v100" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".35"/>
</svg>`,
  // Trois barres qui montent : verte, bleue, bleu foncé.
  'ui-progress': `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7ee35a"/><stop offset="1" stop-color="#2fa82c"/></linearGradient>
    <linearGradient id="b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6cc4ff"/><stop offset="1" stop-color="#1f7fe0"/></linearGradient>
    <linearGradient id="d" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4aa2ff"/><stop offset="1" stop-color="#1557c0"/></linearGradient>
  </defs>
  <rect x="22" y="140" width="56" height="96" rx="16" fill="url(#g)" stroke="${INK}" stroke-width="9"/>
  <rect x="100" y="86" width="56" height="150" rx="16" fill="url(#b)" stroke="${INK}" stroke-width="9"/>
  <rect x="178" y="22" width="56" height="214" rx="16" fill="url(#d)" stroke="${INK}" stroke-width="9"/>
  <path d="M36 156v50M114 102v90M192 38v140" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".45"/>
</svg>`,
  // Engrenage bleu-gris.
  'ui-settings': `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb4ff"/><stop offset="1" stop-color="#4a63c9"/></linearGradient></defs>
  <path d="${(() => {
    // Engrenage à 8 dents : contour calculé.
    const pts = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      for (const [da, r] of [[-0.2, 92], [-0.13, 118], [0.13, 118], [0.2, 92]]) {
        pts.push([128 + Math.cos(a + da) * r, 128 + Math.sin(a + da) * r]);
      }
    }
    return 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z';
  })()}" fill="url(#s)" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>
  <circle cx="128" cy="128" r="38" fill="#eef3ff" stroke="${INK}" stroke-width="10"/>
  <path d="M70 84a72 72 0 0 1 50-30" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".5"/>
</svg>`,
};

const { concepts } = JSON.parse(
  readFileSync(new URL('../src/content/concepts.json', import.meta.url), 'utf8'),
);
for (const c of concepts) {
  if (c.icon.startsWith('color:')) colorBlob(c.id, c.icon.slice(6));
  else write(c.id, noto, c.icon);
}
for (const fruit of FRUITS) write(`food-${fruit}`, noto, fruit);
write('food-cake', noto, 'shortcake');
for (const icon of DECOR) write(`decor-${icon}`, noto, icon);
// Bulles des jeux de l'accueil.
write('riddle', noto, 'magnifying-glass-tilted-left');
write('oddoneout', noto, 'puzzle-piece');
write('counting', noto, 'abacus');
write('ui-basket', noto, 'basket');
write('shadow', noto, 'busts-in-silhouette');
write('sequence', noto, 'repeat-button');
write('most', noto, 'balance-scale');
write('calc', noto, 'heavy-plus-sign');
write('calc-listen', noto, 'ear');
write('vo-calc', noto, 'speaking-head');
write('numbers', noto, 'input-numbers');
write('together', noto, 'handshake');
write('bigger', noto, 'straight-ruler');
write('en-numbers', noto, 'keycap-10');
write('syllables', noto, 'clapping-hands');
write('read', noto, 'open-book');
write('letters', noto, 'input-latin-uppercase');
write('ui-parents', noto, 'locked');
write('ui-lock', noto, 'locked-with-key');
write('read-picture', noto, 'eyes');
write('missing-word', noto, 'speech-balloon');
write('missing-word-read', noto, 'memo');
write('story', noto, 'books');
write('memory', noto, 'flower-playing-cards');
write('memory-en', noto, 'joker');
write('shapes', noto, 'artist-palette');
write('clock', noto, 'alarm-clock');
write('money', noto, 'euro-banknote');
write('ui-music', noto, 'musical-note');
write('ui-music-off', noto, 'muted-speaker');
write('ui-moon', noto, 'crescent-moon');
write('trace-shapes', noto, 'crayon');
write('trace-letters', noto, 'writing-hand');
write('ui-eraser', noto, 'sponge');
// Objets à collectionner pour le dino (accessoires), et deux capes dessinées ici.
const ACCESSORIES = [
  'top-hat', 'billed-cap', 'crown', 'womans-hat', 'graduation-cap', 'rescue-workers-helmet', 'headphone', 'hibiscus',
  'glasses', 'sunglasses', 'goggles', 'ribbon', 'scarf', 'sports-medal', 'prayer-beads', 'wing', 'balloon',
  'magic-wand', 'lollipop', 'sunflower', 'teddy-bear',
];
for (const icon of ACCESSORIES) write(`acc-${icon}`, noto, icon);
function cape(name, color, dark, star) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <path d="M84 26 Q128 44 172 26 L234 226 Q128 252 22 226 Z" fill="${color}" stroke="#2d3354" stroke-width="7" stroke-linejoin="round"/>
  <path d="M98 40 Q86 140 60 222 M158 40 Q170 140 196 222" fill="none" stroke="${dark}" stroke-width="6" stroke-linecap="round" opacity=".6"/>
  <path d="M70 22 Q128 52 186 22 Q190 40 176 46 Q128 66 80 46 Q66 40 70 22 Z" fill="${dark}" stroke="#2d3354" stroke-width="6" stroke-linejoin="round"/>
  ${star ? '<path d="M128 120 l10 22 24 3 -18 16 5 24 -21 -12 -21 12 5 -24 -18 -16 24 -3 z" fill="#ffd23f" stroke="#2d3354" stroke-width="4" stroke-linejoin="round"/>' : ''}
</svg>`;
  writeFileSync(new URL(`${name}.svg`, OUT), svg);
}
cape('acc-cape-red', '#e5484d', '#a8262b', false);
cape('acc-cape-blue', '#3b5bdb', '#243a9e', true);
// Jeu « Mon pays » : spécialités, fêtes, monnaies, monuments (OpenMoji, CC BY-SA 4.0, pour les monuments).
const COUNTRY_ICONS = {
  'baguette-bread': 'baguette-bread', waffle: 'waffle', 'chocolate-bar': 'chocolate-bar', fondue: 'fondue',
  'maple-leaf': 'maple-leaf', fireworks: 'fireworks', 'christmas-tree': 'christmas-tree', 'jack-o-lantern': 'jack-o-lantern',
  'snow-capped-mountain': 'snow-capped-mountain', beach: 'beach-with-umbrella', desert: 'desert', euro: 'euro-banknote',
  dollar: 'dollar-banknote', yen: 'yen-banknote', pound: 'pound-banknote', taco: 'taco', sushi: 'sushi', burrito: 'burrito',
  'curry-rice': 'curry-rice', dumpling: 'dumpling', 'ice-hockey': 'ice-hockey', moai: 'moai', basketball: 'basketball',
  tennis: 'tennis', 'american-football': 'american-football', 'tokyo-tower': 'tokyo-tower',
};
for (const [name, icon] of Object.entries(COUNTRY_ICONS)) write(`cty-${name}`, noto, icon);
write('cty-eiffel-tower', openmoji, 'eiffel-tower');
write('cty-statue-of-liberty', openmoji, 'statue-of-liberty');
write('cty-pyramid', openmoji, 'great-pyramid-of-giza');
write('my-country', noto, 'world-map');
write('ui-wardrobe', noto, 'top-hat');
write('ui-gift', noto, 'wrapped-gift');
// Barre de navigation de l'accueil : icônes dessinées à la main (style « jouet » brillant de la maquette).
for (const [name, svg] of Object.entries(NAV_ICONS)) writeFileSync(new URL(`${name}.svg`, OUT), svg);
for (const icon of UI_ICONS) write(`ui-${icon}`, plush, icon);
for (const flag of FLAGS) write(`flag-${flag}`, flags, flag);

console.log(`${concepts.length} concepts, ${FRUITS.length + 1} aliments, ${UI_ICONS.length} icônes → public/img/`);
// Jeux à voix haute : bulles, et images `or-<nom Noto>` des devinettes (relevées dans le code des contenus).
write('vo-micro', noto, 'studio-microphone');
write('vo-name', noto, 'speaking-head');
const oralSources = ['oral.ts', 'voiceGames.ts'].map((f) => readFileSync(new URL(`../src/content/${f}`, import.meta.url), 'utf8'));
for (const icon of new Set(oralSources.join('\n').match(/(?<='or-)[a-z0-9-]+(?=')/g))) write(`or-${icon}`, noto, icon);
// Fiches à imprimer : l'image de chaque enveloppe, et l'enveloppe elle-même.
const PRINT_ICONS = {
  coloring: 'crayon', magic: 'artist-palette', maze: 'footprints', dots: 'pencil', differences: 'magnifying-glass-tilted-right',
  writing: 'writing-hand', mask: 'performing-arts', puzzle: 'puzzle-piece', puppet: 'sauropod', finger: 'hand-with-fingers-splayed',
  crown: 'crown', goose: 'game-die', memory: 'flower-playing-cards', loto: 'ticket', dominoes: 'input-numbers', diploma: 'scroll',
};
for (const [name, icon] of Object.entries(PRINT_ICONS)) write(`pr-${name}`, noto, icon);
write('ui-envelope', noto, 'envelope');
write('ui-printer', noto, 'printer');
