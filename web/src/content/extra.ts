/**
 * Données des jeux « Ça va ensemble », « Le plus grand », « Les syllabes »
 * et « Numbers ».
 */

/**
 * Ça va ensemble : [image montrée, réponse, niveau, explication, images à ne
 * jamais proposer en plus (elles pourraient aussi aller avec)].
 */
export const PAIRS: [string, string, number, string, string[]?][] = [
  ['dog', 'bone', 1, 'Le chien adore ronger un os.', ['tooth', 'cat']],
  ['bee', 'honey', 1, 'L\'abeille fabrique le miel.', ['flower']],
  ['foot', 'shoe', 1, 'On met la chaussure au pied.', ['socks']],
  ['rain', 'umbrella', 1, 'Quand il pleut, on ouvre le parapluie.', ['cloud']],
  ['cow', 'milk', 2, 'La vache nous donne du lait.', ['cheese']],
  ['hen', 'egg', 2, 'La poule pond des œufs.'],
  ['key', 'lock', 2, 'La clé ouvre le cadenas.', ['door']],
  ['hand', 'gloves', 2, 'On met les gants sur les mains.', ['ring']],
  ['eye', 'glasses', 3, 'Les lunettes aident les yeux à bien voir.'],
  ['toothbrush', 'tooth', 3, 'On se brosse les dents avec la brosse à dents.', ['mouth', 'tongue']],
  ['snowflake', 'snowman', 3, 'Avec la neige, on fait un bonhomme de neige.', ['sled']],
  ['rabbit', 'carrot', 4, 'Le lapin adore croquer des carottes.', ['cat:veg', 'cat:fruit']],
  ['monkey', 'banana', 4, 'Le singe adore les bananes.', ['tree', 'cat:fruit']],
  ['fire_engine', 'fire', 5, 'Le camion de pompiers vient éteindre le feu.', ['drop', 'ladder', 'house']],
  ['candle', 'cake', 5, 'On met des bougies sur le gâteau d\'anniversaire.', ['fire']],
  ['sled', 'snowflake', 5, 'La luge glisse sur la neige.', ['snowman', 'mountain']],
  ['boat', 'anchor', 6, 'Le bateau jette l\'ancre pour s\'arrêter.', ['lighthouse', 'island', 'fish']],
  ['flower', 'bee', 6, 'L\'abeille butine les fleurs.', ['butterfly', 'ladybug']],
  ['lighthouse', 'boat', 7, 'Le phare guide les bateaux la nuit.', ['canoe', 'island']],
  ['door', 'key', 7, 'On ferme la porte à clé.', ['lock', 'house', 'window']],
  ['telescope', 'star', 8, 'On regarde les étoiles avec un télescope.', ['moon', 'comet', 'sun', 'satellite', 'rocket']],
  ['camel', 'cactus', 8, 'Le chameau et le cactus vivent dans le désert.', ['sun']],
  ['parachute', 'plane', 9, 'On saute en parachute depuis un avion.', ['helicopter', 'bird', 'cloud']],
  ['saw', 'tree', 9, 'La scie coupe le bois des arbres.', ['axe', 'leaf']],
  ['milk', 'cheese', 10, 'Avec le lait, on fabrique le fromage.', ['cow', 'goat', 'bottle', 'ice_cream', 'pancakes', 'cake', 'croissant', 'cookie']],
  ['nose', 'flower', 10, 'On sent le parfum des fleurs avec le nez.', ['blossom', 'sunflower']],
  ['wolf', 'moon', 11, 'Le loup hurle à la lune.', ['star']],
  ['sun', 'sunflower', 11, 'Le tournesol se tourne vers le soleil.', ['flower', 'blossom']],
  ['potato', 'fries', 12, 'Avec les pommes de terre, on fait des frites.', ['cat:veg']],
  ['tomato', 'pizza', 13, 'Sur la pizza, on met de la sauce tomate.', ['spaghetti', 'sandwich', 'cat:veg']],
  ['rocket', 'moon', 14, 'La fusée a emmené des astronautes sur la Lune.', ['star', 'satellite', 'comet', 'sun']],
  ['beaver', 'tree', 15, 'Le castor coupe les arbres avec ses grandes dents.', ['leaf']],
  ['oyster', 'ring', 16, 'L\'huître fabrique des perles, pour faire des bijoux.', ['medal']],
  ['polar_bear', 'snowflake', 17, 'L\'ours blanc vit dans la neige et la glace.', ['snowman', 'sled', 'mountain', 'cloud']],
  ['hourglass', 'clock', 18, 'Le sablier et le réveil mesurent tous les deux le temps.', ['bell', 'sun', 'moon']],
  ['lightning', 'cloud', 19, 'L\'éclair sort des gros nuages d\'orage.', ['rain', 'tornado', 'sun', 'rainbow']],
  ['microscope', 'ant', 20, 'Le microscope montre en grand les toutes petites choses, comme la fourmi.', ['mosquito', 'beetle', 'cricket', 'ladybug', 'bee', 'spider', 'snowflake', 'drop']],
];

/** Taille réelle approximative (en cm), pour « Le plus grand ». */
export const SIZES: Record<string, number> = {
  // Animaux
  ant: 0.5, mosquito: 0.5, ladybug: 0.7, bee: 1.5, spider: 2, beetle: 3, snail: 4, butterfly: 6, shrimp: 8,
  frog: 8, mouse: 10, worm: 15, bird: 15, fish: 20, crab: 20, hedgehog: 25, rabbit: 40, squirrel: 40, parrot: 40,
  jellyfish: 40, cat: 45, hen: 45, lobster: 45, duck: 50, owl: 50, monkey: 60, rooster: 60, dog: 70, fox: 70,
  penguin: 70, koala: 75, eagle: 90, turkey: 100, turtle: 100, octopus: 100, sheep: 120, goat: 120, wolf: 130,
  swan: 140, flamingo: 140, pig: 150, kangaroo: 150, panda: 150, donkey: 150, gorilla: 170, seal: 180, llama: 180,
  deer: 180, snake: 200, peacock: 200, lion: 220, horse: 220, bear: 230, cow: 230, zebra: 230, tiger: 250,
  dolphin: 250, polar_bear: 250, camel: 300, bison: 300, crocodile: 400, hippo: 400, shark: 400, rhino: 380,
  mammoth: 400, giraffe: 500, elephant: 600, whale: 2500,
  // Objets, aliments, lieux
  strawberry: 3, cherry: 2, key: 6, egg: 6, kiwi: 6, apple: 8, lemon: 8, mushroom: 8, pear: 10, glasses: 14,
  grapes: 15, candle: 15, clock: 15, coconut: 15, spoon: 18, scissors: 18, banana: 18, carrot: 18, pencil: 17,
  ball: 22, book: 25, cake: 25, shoe: 28, hat: 30, hammer: 30, pineapple: 30, pizza: 30, watermelon: 35,
  teddy: 40, drum: 50, trumpet: 50, violin: 60, chair: 90, umbrella: 90, guitar: 100, scooter: 100, sled: 100,
  broom: 140, piano: 150, bike: 170, bed: 200, tent: 200, motorbike: 200, ladder: 300, car: 400, tractor: 400,
  boat: 800, house: 1000, tree: 1000, bus: 1200, helicopter: 1500, castle: 3000, lighthouse: 3000, plane: 3500,
  train: 5000, rocket: 5000, mountain: 300000,
};

/** Nombre de syllabes à l'oral (on tape dans les mains), mots sans ambiguïté. */
export const SYLLABLES: Record<number, string[]> = {
  1: ['cat', 'bed', 'bread', 'nose', 'wolf', 'train', 'bus', 'key', 'hand', 'foot', 'bear', 'milk', 'egg', 'rooster',
    'tooth', 'deer', 'garlic', 'peacock', 'bucket'],
  2: ['rabbit', 'boat', 'pig', 'sheep', 'duck', 'fish', 'cake', 'bike', 'motorbike', 'panda', 'kiwi', 'hat', 'owl',
    'fox', 'shark', 'dolphin', 'hammer', 'pencil', 'ball', 'castle', 'bird', 'camel', 'penguin', 'drum', 'sun',
    'tractor', 'paintbrush', 'croissant', 'bison', 'mammoth', 'polar_bear'],
  3: ['elephant', 'butterfly', 'kangaroo', 'hedgehog', 'snail', 'pineapple', 'umbrella', 'parrot', 'squirrel', 'kite',
    'screwdriver', 'broccoli', 'mushroom', 'rainbow', 'sunflower', 'avocado', 'spaghetti'],
  4: ['rhino', 'orangutan', 'raccoon', 'coconut', 'helicopter', 'hippo'],
};

/** Nombres en anglais (1 à 100). */
const EN_UNITS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export function enNumber(n: number): string {
  if (n < 20) return EN_UNITS[n];
  if (n === 100) return 'one hundred';
  const unit = n % 10;
  return unit === 0 ? EN_TENS[n / 10] : `${EN_TENS[Math.floor(n / 10)]}-${EN_UNITS[unit]}`;
}
