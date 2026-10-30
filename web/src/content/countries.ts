/**
 * Le pays de l'enfant (choisi par les parents) et ce que le jeu « Mon pays »
 * sait de lui. Les images : drapeaux `flag-xx` (circle-flags), objets `cty-…`
 * (Noto, et OpenMoji pour la tour Eiffel et quelques monuments), ou concepts.
 */
export interface Country {
  code: string;
  /** « la France », « le Canada ». */
  name: string;
  /** « de la France », « du Canada ». */
  of: string;
  /** « en France », « au Canada ». */
  in: string;
  /** Drapeaux qui ressemblent au sien (pièges). */
  flagTraps: string[];
  neighbours: string[];
  capital: string;
  cities: string[];
  /** Symboles : [image, nom]. */
  symbols: [string, string][];
  /** Spécialités : [image, nom]. */
  foods: [string, string][];
  /** Fête nationale : « le quatorze juillet ». */
  nationalDay: string;
  /** Billet de la monnaie (sauf si le jeu n'a pas d'image). */
  currency?: [string, string];
  /** Un monument ou un paysage célèbre : [image, question, réponse, leurres]. */
  landmark?: [string, string, string, string[]];
}

export const COUNTRIES: Country[] = [
  {
    code: 'fr', name: 'la France', of: 'de la France', in: 'en France',
    flagTraps: ['nl', 'ru', 'it', 'ie', 'lu'], neighbours: ['be', 'ch', 'de', 'it', 'es', 'lu'],
    capital: 'Paris', cities: ['Lyon', 'Marseille', 'Nice', 'Bordeaux', 'Lille'],
    symbols: [['rooster', 'le coq']],
    foods: [['cty-baguette-bread', 'la baguette'], ['croissant', 'le croissant'], ['cheese', 'le fromage']],
    nationalDay: 'le quatorze juillet', currency: ['cty-euro', 'l\'euro'],
    landmark: ['cty-eiffel-tower', 'Quel monument célèbre se trouve à Paris ?', 'la tour Eiffel',
      ['cty-statue-of-liberty', 'cty-pyramid', 'cty-tokyo-tower', 'cty-moai']],
  },
  {
    code: 'be', name: 'la Belgique', of: 'de la Belgique', in: 'en Belgique',
    flagTraps: ['de', 'ro', 'td', 'fr'], neighbours: ['fr', 'nl', 'de', 'lu'],
    capital: 'Bruxelles', cities: ['Anvers', 'Liège', 'Gand', 'Namur', 'Bruges'],
    symbols: [['lion', 'le lion']],
    foods: [['fries', 'les frites'], ['cty-waffle', 'la gaufre'], ['cty-chocolate-bar', 'le chocolat']],
    nationalDay: 'le vingt et un juillet', currency: ['cty-euro', 'l\'euro'],
  },
  {
    code: 'ch', name: 'la Suisse', of: 'de la Suisse', in: 'en Suisse',
    flagTraps: ['dk', 'at', 'to', 'gb'], neighbours: ['fr', 'de', 'it', 'at', 'li'],
    capital: 'Berne', cities: ['Zurich', 'Genève', 'Bâle', 'Lausanne', 'Lugano'],
    symbols: [['cow', 'la vache']],
    foods: [['cty-fondue', 'la fondue'], ['cty-chocolate-bar', 'le chocolat'], ['cheese', 'le fromage']],
    nationalDay: 'le premier août',
    landmark: ['cty-snow-capped-mountain', 'En Suisse, il y a de très hautes montagnes pleines de neige : les Alpes. Lesquelles ?',
      'les Alpes', ['cty-desert', 'cty-beach', 'volcano', 'island']],
  },
  {
    code: 'ca', name: 'le Canada', of: 'du Canada', in: 'au Canada',
    flagTraps: ['pe', 'at', 'lb', 'dk'], neighbours: ['us'],
    capital: 'Ottawa', cities: ['Montréal', 'Toronto', 'Québec', 'Vancouver', 'Calgary'],
    symbols: [['cty-maple-leaf', 'la feuille d\'érable'], ['beaver', 'le castor']],
    foods: [['pancakes', 'les crêpes au sirop d\'érable'], ['fries', 'la poutine, des frites avec du fromage']],
    nationalDay: 'le premier juillet', currency: ['cty-dollar', 'le dollar'],
    landmark: ['cty-ice-hockey', 'Au Canada, le sport préféré se joue sur la glace, avec une crosse. Lequel ?',
      'le hockey sur glace', ['cty-basketball', 'cty-tennis', 'ball', 'cty-american-football']],
  },
  {
    code: 'lu', name: 'le Luxembourg', of: 'du Luxembourg', in: 'au Luxembourg',
    flagTraps: ['nl', 'fr', 'ru', 'ro'], neighbours: ['fr', 'be', 'de'],
    capital: 'Luxembourg', cities: ['Esch', 'Diekirch', 'Ettelbruck', 'Echternach', 'Wiltz'],
    symbols: [['lion', 'le lion rouge']],
    foods: [],
    nationalDay: 'le vingt-trois juin', currency: ['cty-euro', 'l\'euro'],
    landmark: ['castle', 'Le Luxembourg est plein de vieux bâtiments avec des tours. Lesquels ?', 'les châteaux forts',
      ['cty-pyramid', 'cty-tokyo-tower', 'cty-statue-of-liberty', 'cty-moai']],
  },
];

/** Drapeaux lointains et bien différents (leurres faciles). */
export const FAR_FLAGS = ['jp', 'br', 'us', 'cn', 'mx', 'in', 'sn', 'gb'];
export const OTHER_ANIMALS = ['kangaroo', 'panda', 'camel', 'penguin', 'elephant', 'giraffe'];
export const FOREIGN_FOODS = ['cty-taco', 'cty-sushi', 'cty-burrito', 'cty-curry-rice', 'cty-dumpling'];
export const CELEBRATIONS = ['cty-christmas-tree', 'cty-jack-o-lantern', 'snowman', 'egg'];
export const BANKNOTES = ['cty-euro', 'cty-dollar', 'cty-yen', 'cty-pound'];

/** Pays de l'enfant (réglé par l'appli au démarrage et depuis l'espace parents). */
let current = 'fr';
export const setCountry = (code: string) => { current = code; };
export const currentCountry = (): Country | undefined => COUNTRIES.find((c) => c.code === current);
