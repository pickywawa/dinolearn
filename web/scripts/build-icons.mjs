// Extrait les illustrations utilisées du pack SVG « withicons Plush » (MIT)
// et des drapeaux « circle-flags » (MIT) vers public/img/, une image par fichier.
// Les images ne sont pas incluses dans le bundle JS : le jeu les charge à la demande.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { getIconData, iconToHTML, iconToSVG } from '@iconify/utils';

const require = createRequire(import.meta.url);
const plush = require('@iconify-json/withicons-plush/icons.json');
const flags = require('@iconify-json/circle-flags/icons.json');

const OUT = new URL('../public/img/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const UI_ICONS = [
  'play', 'home', 'shopping-basket', 'ear', 'star', 'sparkles', 'heart', 'globe',
  'party-popper', 'cloud', 'sun', 'leaf', 'apple', 'cherry', 'citrus', 'cake', 'paw-print',
];
const FLAGS = ['gb'];

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

const { concepts } = JSON.parse(
  readFileSync(new URL('../src/content/concepts.json', import.meta.url), 'utf8'),
);
for (const c of concepts) {
  if (c.icon.startsWith('color:')) colorBlob(c.id, c.icon.slice(6));
  else write(c.id, plush, c.icon);
}
for (const icon of UI_ICONS) write(`ui-${icon}`, plush, icon);
for (const flag of FLAGS) write(`flag-${flag}`, flags, flag);

console.log(`${concepts.length} concepts, ${UI_ICONS.length} icônes, ${FLAGS.length} drapeaux → public/img/`);
