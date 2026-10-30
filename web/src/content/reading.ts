/**
 * Données des jeux de lecture (à partir de 5 ans) : des mots à lire, des
 * lettres et des syllabes. Chaque mot existe en CAPITALES (plus facile) et en
 * écriture attachée (cursive, six niveaux plus haut).
 */

/** Mots à lire : [mot, concept illustré (ou ''), niveau en capitales]. Des mots simples aux mots longs. */
export const READ_WORDS: [string, string, number][] = [
  ['maman', '', 1], ['papa', '', 1], ['moto', 'motorbike', 1], ['vélo', 'bike', 1], ['lune', 'moon', 1],
  ['lit', 'bed', 2], ['nez', 'nose', 2], ['chat', 'cat', 2], ['papi', '', 2], ['mamie', '', 2],
  ['lama', 'llama', 3], ['robe', 'dress', 3], ['pomme', 'apple', 3], ['bébé', '', 3], ['ami', '', 3],
  ['lapin', 'rabbit', 4], ['lion', 'lion', 4], ['ours', 'bear', 4], ['tomate', 'tomato', 4], ['banane', 'banana', 4],
  ['bateau', 'boat', 5], ['gâteau', 'cake', 5], ['cochon', 'pig', 5], ['mouton', 'sheep', 5], ['poule', 'hen', 5],
  ['canard', 'duck', 6], ['fusée', 'rocket', 6], ['avion', 'plane', 6], ['soleil', 'sun', 6], ['fleur', 'flower', 6],
  ['tortue', 'turtle', 7], ['girafe', 'giraffe', 7], ['cheval', 'horse', 7], ['poisson', 'fish', 7], ['vache', 'cow', 7],
  ['chapeau', 'hat', 8], ['maison', 'house', 8], ['voiture', 'car', 8], ['ballon', 'ball', 8], ['étoile', 'star', 8],
  ['crocodile', 'crocodile', 9], ['éléphant', 'elephant', 9], ['papillon', 'butterfly', 9], ['escargot', 'snail', 9],
  ['citron', 'lemon', 9],
  ['chien', 'dog', 10], ['oiseau', 'bird', 10], ['train', 'train', 10], ['livre', 'book', 10], ['fraise', 'strawberry', 10],
  ['renard', 'fox', 11], ['tigre', 'tiger', 11], ['zèbre', 'zebra', 11], ['singe', 'monkey', 11], ['loup', 'wolf', 11],
  ['requin', 'shark', 12], ['dauphin', 'dolphin', 12], ['parapluie', 'umbrella', 12], ['hibou', 'owl', 12],
  ['ananas', 'pineapple', 12],
  ['grenouille', 'frog', 13], ['abeille', 'bee', 13], ['araignée', 'spider', 13], ['écureuil', 'squirrel', 13],
  ['chaussure', 'shoe', 13],
  ['hélicoptère', 'helicopter', 14], ['kangourou', 'kangaroo', 14], ['champignon', 'mushroom', 14],
  ['coccinelle', 'ladybug', 14], ['tracteur', 'tractor', 14],
];

/** Lettres en capitales, par niveau (les voyelles d'abord). */
export const LETTER_LEVELS: [string, number][] = [
  ['A', 1], ['O', 1], ['I', 1], ['E', 2], ['U', 2], ['L', 2], ['M', 2], ['P', 3], ['T', 3], ['R', 3], ['S', 3],
  ['N', 4], ['B', 4], ['D', 4], ['V', 4], ['C', 5], ['F', 5], ['G', 5], ['J', 5],
  ['H', 6], ['K', 6], ['Q', 6], ['W', 6], ['X', 6], ['Y', 6], ['Z', 6],
];

/** Nom des lettres, pour que la voix les dise bien. */
export const LETTER_NAMES: Record<string, string> = {
  A: 'a', B: 'bé', C: 'cé', D: 'dé', E: 'e', F: 'effe', G: 'gé', H: 'hache', I: 'i', J: 'ji', K: 'ka', L: 'elle',
  M: 'emme', N: 'enne', O: 'o', P: 'pé', Q: 'cu', R: 'erre', S: 'esse', T: 'té', U: 'u', V: 'vé', W: 'double vé',
  X: 'ixe', Y: 'i grec', Z: 'zède',
};

/** Lettres qui se ressemblent (surtout en minuscules et en attaché). */
export const LOOKALIKE_LETTERS = [
  'BDPQ', 'MNUH', 'ECOA', 'FTL', 'IJL', 'VWY', 'HK', 'SZ', 'GQ', 'RN',
];

/**
 * Syllabes à lire : [syllabe écrite, comment la dire, niveau en capitales].
 * D'abord consonne + voyelle (MA, LI…), puis les sons à deux lettres (OU, ON, OI, CH…).
 */
export const SYLLABLES_TO_READ: [string, string, number][] = [
  ['ma', 'ma', 8], ['pa', 'pa', 8], ['la', 'la', 8], ['li', 'li', 8], ['mo', 'mo', 8],
  ['lo', 'lo', 9], ['pi', 'pi', 9], ['ri', 'ri', 9], ['ra', 'ra', 9], ['to', 'to', 9],
  ['lu', 'lu', 10], ['mi', 'mi', 10], ['ti', 'ti', 10], ['fa', 'fa', 10], ['nu', 'nu', 10],
  ['vé', 'vé', 11], ['ro', 'ro', 11], ['su', 'su', 11], ['bo', 'bo', 11], ['da', 'da', 11],
  ['chou', 'chou', 15], ['mou', 'mou', 15], ['pou', 'pou', 15], ['lou', 'lou', 16], ['cha', 'cha', 16],
  ['mon', 'mon', 16], ['son', 'son', 17], ['ton', 'ton', 17], ['moi', 'moi', 17], ['roi', 'roi', 17],
  ['toi', 'toi', 18], ['pan', 'pan', 18], ['ban', 'ban', 18], ['chi', 'chi', 19], ['cho', 'cho', 19],
];
