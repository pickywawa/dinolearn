import { shuffle } from '../domain/models';

/**
 * Objets à collectionner pour habiller le dino (un cadeau à choisir parmi 4
 * à chaque niveau gagné). Un seul objet par emplacement : un chapeau remplace
 * la casquette, des lunettes remplacent d'autres lunettes…
 * Position : dans la tête (`head`, origine au bas de la tête) ou dans le corps
 * (`rig`, origine entre les pieds), en unités du dino (hauteur ≈ 500).
 */
export type Slot = 'head' | 'eyes' | 'neck' | 'back' | 'hand';

export interface Item {
  id: string;
  /** Nom dit par le dino, avec son article. */
  name: string;
  slot: Slot;
  parent: 'head' | 'rig';
  x: number;
  y: number;
  /** Largeur affichée. */
  w: number;
  angle?: number;
  /** Image en double, en miroir (les ailes). */
  mirror?: number;
}

export const ITEMS: Item[] = [
  { id: 'top-hat', name: 'le chapeau haut-de-forme', slot: 'head', parent: 'head', x: 0, y: -262, w: 170 },
  { id: 'billed-cap', name: 'la casquette', slot: 'head', parent: 'head', x: 12, y: -236, w: 210, angle: -8 },
  { id: 'crown', name: 'la couronne', slot: 'head', parent: 'head', x: 0, y: -246, w: 150 },
  { id: 'womans-hat', name: 'le chapeau de paille', slot: 'head', parent: 'head', x: 0, y: -236, w: 250 },
  { id: 'graduation-cap', name: 'le chapeau de diplômé', slot: 'head', parent: 'head', x: 0, y: -246, w: 210 },
  { id: 'rescue-workers-helmet', name: 'le casque de pompier', slot: 'head', parent: 'head', x: 0, y: -236, w: 210 },
  { id: 'headphone', name: 'le casque de musique', slot: 'head', parent: 'head', x: 0, y: -150, w: 330 },
  { id: 'hibiscus', name: 'la fleur', slot: 'head', parent: 'head', x: 92, y: -188, w: 95, angle: 15 },
  { id: 'glasses', name: 'les lunettes', slot: 'eyes', parent: 'head', x: 0, y: -110, w: 240 },
  { id: 'sunglasses', name: 'les lunettes de soleil', slot: 'eyes', parent: 'head', x: 0, y: -108, w: 245 },
  { id: 'goggles', name: 'les lunettes de plongée', slot: 'eyes', parent: 'head', x: 0, y: -110, w: 255 },
  { id: 'ribbon', name: 'le nœud papillon', slot: 'neck', parent: 'rig', x: 0, y: -200, w: 105 },
  { id: 'scarf', name: 'l\'écharpe', slot: 'neck', parent: 'rig', x: 0, y: -178, w: 190 },
  { id: 'sports-medal', name: 'la médaille', slot: 'neck', parent: 'rig', x: 0, y: -168, w: 95 },
  { id: 'prayer-beads', name: 'le collier', slot: 'neck', parent: 'rig', x: 0, y: -190, w: 150 },
  { id: 'cape-red', name: 'la cape de super-héros', slot: 'back', parent: 'rig', x: 0, y: -150, w: 300 },
  { id: 'cape-blue', name: 'la cape de magicien', slot: 'back', parent: 'rig', x: 0, y: -150, w: 300 },
  { id: 'wing', name: 'les ailes', slot: 'back', parent: 'rig', x: 125, y: -205, w: 150, mirror: -125 },
  { id: 'balloon', name: 'le ballon', slot: 'hand', parent: 'rig', x: 150, y: -255, w: 125 },
  { id: 'magic-wand', name: 'la baguette magique', slot: 'hand', parent: 'rig', x: 138, y: -112, w: 105 },
  { id: 'lollipop', name: 'la sucette', slot: 'hand', parent: 'rig', x: 140, y: -128, w: 100 },
  { id: 'sunflower', name: 'le tournesol', slot: 'hand', parent: 'rig', x: 142, y: -140, w: 120 },
  { id: 'teddy-bear', name: 'le nounours', slot: 'hand', parent: 'rig', x: 140, y: -105, w: 110 },
];

export const itemById = (id: string) => ITEMS.find((i) => i.id === id);

/** Objets du même emplacement : ceux que `id` remplace. */
export const sameSlot = (id: string) => {
  const slot = itemById(id)?.slot;
  return ITEMS.filter((i) => i.slot === slot && i.id !== id).map((i) => i.id);
};

export const itemTexture = (id: string) => `acc-${id}`;

/** Quatre objets pas encore gagnés, d'emplacements différents si possible. */
export function giftChoices(owned: readonly string[], rng: () => number): Item[] {
  const left = shuffle(ITEMS.filter((i) => !owned.includes(i.id)), rng);
  const picked: Item[] = [];
  for (const item of left) if (picked.length < 4 && !picked.some((p) => p.slot === item.slot)) picked.push(item);
  for (const item of left) if (picked.length < 4 && !picked.includes(item)) picked.push(item);
  return picked;
}
