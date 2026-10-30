/**
 * Données du jeu « Les sons » (Français, niveau grande section → CP) :
 * des familles de mots qui finissent pareil (rimes) et qui commencent pareil
 * (première syllabe). Les mots sont des concepts illustrés. Un mot absent
 * d'une famille n'est jamais proposé comme leurre pour cette sorte de
 * question, pour éviter les rimes « accidentelles ».
 */

/** Rimes : [son de fin, concepts]. Les grandes familles d'abord (plus faciles). */
export const RHYMES: [string, string[]][] = [
  ['o', ['boat', 'cake', 'hat', 'hammer', 'castle', 'bird', 'bucket', 'paintbrush', 'camel', 'piano', 'bike', 'motorbike', 'yoyo', 'snail', 'badger']],
  ['on', ['ball', 'pig', 'sheep', 'lion', 'plane', 'fish', 'butterfly', 'hedgehog', 'mushroom', 'onion', 'violin', 'pencil', 'bison', 'scorpion']],
  ['an', ['elephant', 'tooth', 'snake', 'gloves', 'volcano', 'peacock', 'croissant', 'moose']],
  ['in', ['rabbit', 'bread', 'hand', 'train', 'dolphin', 'shark', 'penguin', 'grapes']],
  ['i', ['mouse', 'bed', 'kiwi', 'ant', 'broccoli', 'spaghetti', 'rain', 'umbrella']],
  ['ette', ['socks', 'glasses', 'trumpet', 'cap', 'shrimp', 'scooter']],
  ['ar', ['duck', 'lobster', 'fox', 'leopard', 'lighthouse', 'guitar']],
  ['é', ['key', 'nose', 'foot', 'rocket', 'spider']],
  ['a', ['panda', 'koala', 'llama', 'pizza', 'lock']],
  ['ou', ['owl', 'wolf', 'kangaroo']],
  ['euil', ['leaf', 'squirrel', 'eye']],
  ['or', ['beaver', 'dinosaur']],
  ['aise', ['strawberry', 'chair']],
  ['age', ['cheese', 'cloud']],
  ['elle', ['ladder', 'ladybug']],
  ['ol', ['compass', 'sunflower']],
  ['eille', ['bee', 'ear']],
];

/** Débuts de mots : [première syllabe, concepts]. */
export const ONSETS: [string, string[]][] = [
  ['a', ['plane', 'pineapple', 'spider', 'bee', 'tree', 'donkey', 'avocado']],
  ['ca', ['duck', 'carrot', 'cap', 'lock', 'beaver', 'cactus', 'canoe', 'peanuts']],
  ['ba', ['boat', 'banana', 'whale', 'broom', 'ball', 'ring']],
  ['é', ['elephant', 'star', 'ladder', 'squirrel', 'lightning']],
  ['pa', ['panda', 'butterfly', 'umbrella', 'parachute', 'watermelon']],
  ['cha', ['cat', 'hat', 'camel', 'castle']],
  ['ma', ['hammer', 'mammoth', 'corn']],
  ['co', ['pig', 'ladybug', 'rooster']],
  ['mou', ['sheep', 'mosquito', 'skunk']],
  ['li', ['bed', 'lion', 'book']],
  ['lu', ['moon', 'glasses', 'sled']],
  ['bou', ['mouth', 'candle', 'compass']],
  ['chau', ['socks', 'shoe', 'bat']],
  ['o', ['orange', 'ear', 'orangutan']],
  ['poi', ['fish', 'pear']],
  ['tou', ['screwdriver', 'sunflower']],
  ['tor', ['turtle', 'tornado']],
  ['pin', ['paintbrush', 'penguin']],
];
