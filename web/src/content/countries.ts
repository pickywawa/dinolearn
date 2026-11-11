import { has, isFr, lang, t } from '../i18n';
import { langInfo, type Lang } from '../domain/langs';
import { CURRENCIES } from '../domain/currencies';
import { Rng, shuffle } from '../domain/models';
import type { Choice } from './games';

/**
 * Le pays de l'enfant (choisi par les parents) et ce que le jeu « Mon pays »
 * sait de lui. Les images : drapeaux `flag-xx` (circle-flags), objets `cty-…`
 * (Noto, et OpenMoji pour la tour Eiffel et quelques monuments), ou concepts.
 *
 * Les textes en français servent au jeu d'origine (et au jeu à voix haute, en
 * français). Dans les autres langues, les phrases viennent des catalogues
 * (clés `cty.*`), avec le nom du pays traduit, la date de la fête nationale et
 * le nom de la monnaie donnés par le navigateur (Intl), et les villes écrites
 * dans la langue de l'enfant quand on les connaît.
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
  /** Capitale et villes, en français. */
  capital: string;
  cities: string[];
  /** Capitale puis villes, écrites dans d'autres langues (l'anglais sert aux langues en alphabet latin). */
  local: Partial<Record<Lang, string[]>>;
  /** Symboles : [image, nom]. */
  symbols: [string, string][];
  /** Spécialités : [image, nom]. */
  foods: [string, string][];
  /** Images à ne pas montrer en piège (elles font aussi penser à ce pays). */
  avoid?: string[];
  /** Fête nationale : « le quatorze juillet », et [mois, jour]. */
  nationalDay?: string;
  day?: [number, number];
  /** Billet de la monnaie (sauf si le jeu n'a pas d'image) : [image, nom, code ISO]. */
  currency?: [string, string, string];
  /** Un monument, un paysage, une fête ou un sport célèbre : [image, question, réponse, leurres]. */
  landmark?: [string, string, string, string[]];
  /** Ce que montre le monument, pour la question dans les autres langues. */
  landmarkKind?: 'place' | 'sport' | 'thing';
  /** Les habitants (« les Français », puis le féminin) : jeu à voix haute. */
  people: string[];
  /** Langues parlées dans le pays. */
  languages: string[];
}

const EURO: [string, string, string] = ['cty-euro', 'l\'euro', 'EUR'];
const MONUMENTS = ['cty-eiffel-tower', 'cty-statue-of-liberty', 'cty-pyramid', 'cty-tokyo-tower', 'cty-moai'];
const SPORTS = ['cty-ice-hockey', 'cty-basketball', 'cty-tennis', 'cty-american-football', 'cty-cricket-game', 'cty-soccer-ball'];
const PARTIES = ['cty-christmas-tree', 'cty-jack-o-lantern', 'snowman', 'balloon'];
const others = (list: string[], not: string) => list.filter((x) => x !== not);
const sport = (country: string, how: string, name: string, image: string): [string, string, string, string[]] =>
  [image, `${country}, le sport préféré se joue ${how}. Lequel ?`, name, others(SPORTS, image)];

export const COUNTRIES: Country[] = [
  // ---- Pays francophones ----
  {
    code: 'fr', name: 'la France', of: 'de la France', in: 'en France',
    people: ['les Français', 'Françaises'], languages: ['le français'],
    flagTraps: ['nl', 'ru', 'it', 'ie', 'lu'], neighbours: ['be', 'ch', 'de', 'it', 'es', 'lu'],
    capital: 'Paris', cities: ['Lyon', 'Marseille', 'Nice', 'Bordeaux', 'Lille'],
    local: { en: ['Paris', 'Lyon', 'Marseille', 'Nice', 'Bordeaux', 'Lille'] },
    symbols: [['rooster', 'le coq']],
    foods: [['cty-baguette-bread', 'la baguette'], ['croissant', 'le croissant'], ['cheese', 'le fromage']],
    nationalDay: 'le quatorze juillet', day: [7, 14], currency: EURO,
    landmark: ['cty-eiffel-tower', 'Quel monument célèbre se trouve à Paris ?', 'la tour Eiffel', others(MONUMENTS, 'cty-eiffel-tower')],
    landmarkKind: 'place',
  },
  {
    code: 'be', name: 'la Belgique', of: 'de la Belgique', in: 'en Belgique',
    people: ['les Belges'], languages: ['le français', 'néerlandais', 'flamand', 'allemand'],
    flagTraps: ['de', 'ro', 'td', 'fr'], neighbours: ['fr', 'nl', 'de', 'lu'],
    capital: 'Bruxelles', cities: ['Anvers', 'Liège', 'Gand', 'Namur', 'Bruges'],
    local: {
      en: ['Brussels', 'Antwerp', 'Liège', 'Ghent', 'Namur', 'Bruges'],
      de: ['Brüssel', 'Antwerpen', 'Lüttich', 'Gent', 'Namur', 'Brügge'],
    },
    symbols: [['lion', 'le lion']],
    foods: [['fries', 'les frites'], ['cty-waffle', 'la gaufre'], ['cty-chocolate-bar', 'le chocolat']],
    nationalDay: 'le vingt et un juillet', day: [7, 21], currency: EURO,
  },
  {
    code: 'ch', name: 'la Suisse', of: 'de la Suisse', in: 'en Suisse',
    people: ['les Suisses', 'Suissesses'], languages: ['le français', 'allemand', 'italien', 'romanche'],
    flagTraps: ['dk', 'at', 'to', 'gb'], neighbours: ['fr', 'de', 'it', 'at', 'li'],
    capital: 'Berne', cities: ['Zurich', 'Genève', 'Bâle', 'Lausanne', 'Lugano'],
    local: {
      en: ['Bern', 'Zurich', 'Geneva', 'Basel', 'Lausanne', 'Lugano'],
      de: ['Bern', 'Zürich', 'Genf', 'Basel', 'Lausanne', 'Lugano'],
      it: ['Berna', 'Zurigo', 'Ginevra', 'Basilea', 'Losanna', 'Lugano'],
    },
    symbols: [['cow', 'la vache']],
    foods: [['cty-fondue', 'la fondue'], ['cty-chocolate-bar', 'le chocolat'], ['cheese', 'le fromage']],
    nationalDay: 'le premier août', day: [8, 1], currency: ['money', 'le franc suisse', 'CHF'],
    landmark: ['cty-snow-capped-mountain', 'En Suisse, il y a de très hautes montagnes pleines de neige : les Alpes. Lesquelles ?',
      'les Alpes', ['cty-desert', 'cty-beach', 'volcano', 'island']],
    landmarkKind: 'place',
  },
  {
    code: 'ca', name: 'le Canada', of: 'du Canada', in: 'au Canada',
    people: ['les Canadiens', 'Canadiennes'], languages: ['le français', 'anglais'],
    flagTraps: ['pe', 'at', 'lb', 'dk'], neighbours: ['us'],
    capital: 'Ottawa', cities: ['Montréal', 'Toronto', 'Québec', 'Vancouver', 'Calgary'],
    local: { en: ['Ottawa', 'Montreal', 'Toronto', 'Quebec City', 'Vancouver', 'Calgary'] },
    symbols: [['cty-maple-leaf', 'la feuille d\'érable'], ['beaver', 'le castor']],
    foods: [['pancakes', 'les crêpes au sirop d\'érable'], ['fries', 'la poutine, des frites avec du fromage']],
    nationalDay: 'le premier juillet', day: [7, 1], currency: ['cty-dollar', 'le dollar', 'CAD'],
    landmark: ['cty-ice-hockey', 'Au Canada, le sport préféré se joue sur la glace, avec une crosse. Lequel ?',
      'le hockey sur glace', ['cty-basketball', 'cty-tennis', 'ball', 'cty-american-football']],
    landmarkKind: 'sport',
  },
  {
    code: 'lu', name: 'le Luxembourg', of: 'du Luxembourg', in: 'au Luxembourg',
    people: ['les Luxembourgeois', 'Luxembourgeoises'], languages: ['le luxembourgeois', 'français', 'allemand'],
    flagTraps: ['nl', 'fr', 'ru', 'ro'], neighbours: ['fr', 'be', 'de'],
    capital: 'Luxembourg', cities: ['Esch', 'Diekirch', 'Ettelbruck', 'Echternach', 'Wiltz'],
    local: {
      en: ['Luxembourg', 'Esch', 'Diekirch', 'Ettelbruck', 'Echternach', 'Wiltz'],
      de: ['Luxemburg', 'Esch', 'Diekirch', 'Ettelbrück', 'Echternach', 'Wiltz'],
    },
    symbols: [['lion', 'le lion rouge']],
    foods: [],
    nationalDay: 'le vingt-trois juin', day: [6, 23], currency: EURO,
    landmark: ['castle', 'Le Luxembourg est plein de vieux bâtiments avec des tours. Lesquels ?', 'les châteaux forts',
      ['cty-pyramid', 'cty-tokyo-tower', 'cty-statue-of-liberty', 'cty-moai']],
    landmarkKind: 'place',
  },
  // ---- Grands pays (priorité 1) ----
  {
    code: 'us', name: 'les États-Unis', of: 'des États-Unis', in: 'aux États-Unis',
    people: ['les Américains', 'Américaines'], languages: ['l\'anglais', 'espagnol'],
    flagTraps: ['lr', 'my', 'cu', 'pr'], neighbours: ['ca', 'mx'],
    capital: 'Washington', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'],
    local: {
      en: ['Washington', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'],
      es: ['Washington', 'Nueva York', 'Los Ángeles', 'Chicago', 'Houston', 'Miami'],
    },
    symbols: [['eagle', 'l\'aigle']],
    foods: [['cty-hamburger', 'le hamburger'], ['cty-hot-dog', 'le hot-dog'], ['pancakes', 'les pancakes']],
    avoid: ['cty-taco', 'cty-burrito'],
    nationalDay: 'le quatre juillet', day: [7, 4], currency: ['cty-dollar', 'le dollar', 'USD'],
    landmark: ['cty-statue-of-liberty', 'Quelle statue célèbre accueille les bateaux à New York ?', 'la statue de la Liberté',
      others(MONUMENTS, 'cty-statue-of-liberty')],
    landmarkKind: 'place',
  },
  {
    code: 'gb', name: 'le Royaume-Uni', of: 'du Royaume-Uni', in: 'au Royaume-Uni',
    people: ['les Britanniques', 'Anglais', 'Anglaises'], languages: ['l\'anglais'],
    flagTraps: ['au', 'nz', 'fj', 'us'], neighbours: ['ie', 'fr'],
    capital: 'Londres', cities: ['Manchester', 'Birmingham', 'Liverpool', 'Édimbourg', 'Glasgow'],
    local: { en: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Edinburgh', 'Glasgow'] },
    symbols: [['lion', 'le lion']],
    foods: [['cty-teacup-without-handle', 'le thé'], ['fries', 'le fish and chips'], ['sandwich', 'le sandwich']],
    avoid: ['cty-curry-rice'],
    currency: ['cty-pound', 'la livre sterling', 'GBP'],
    landmark: sport('Au Royaume-Uni', 'avec un ballon, au pied', 'le football', 'cty-soccer-ball'),
    landmarkKind: 'sport',
  },
  {
    code: 'cn', name: 'la Chine', of: 'de la Chine', in: 'en Chine',
    people: ['les Chinois', 'Chinoises'], languages: ['le chinois', 'mandarin'],
    flagTraps: ['vn', 'tr', 'kg', 'ma'], neighbours: ['ru', 'in', 'pk', 'mn', 'vn', 'np', 'kz', 'kp'],
    capital: 'Pékin', cities: ['Shanghai', 'Canton', 'Shenzhen', 'Chengdu', 'Wuhan'],
    local: {
      en: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Wuhan'],
      zh: ['北京', '上海', '广州', '深圳', '成都', '武汉'],
    },
    symbols: [['panda', 'le panda'], ['cty-dragon', 'le dragon']],
    foods: [['cty-dumpling', 'les raviolis'], ['cty-steaming-bowl', 'les nouilles'], ['cty-moon-cake', 'le gâteau de lune']],
    avoid: ['cty-sushi'],
    nationalDay: 'le premier octobre', day: [10, 1], currency: ['money', 'le yuan', 'CNY'],
    landmark: ['cty-red-paper-lantern', 'Pour le Nouvel An chinois, on accroche des décorations rouges qui brillent. Lesquelles ?',
      'les lanternes rouges', PARTIES],
    landmarkKind: 'thing',
  },
  {
    code: 'in', name: 'l\'Inde', of: 'de l\'Inde', in: 'en Inde',
    people: ['les Indiens', 'Indiennes'], languages: ['l\'hindi', 'anglais'],
    flagTraps: ['ne', 'ie', 'ci', 'it'], neighbours: ['pk', 'cn', 'np', 'bd', 'bt', 'mm'],
    capital: 'New Delhi', cities: ['Bombay', 'Calcutta', 'Chennai', 'Bangalore', 'Jaipur'],
    local: {
      en: ['New Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore', 'Jaipur'],
      hi: ['नई दिल्ली', 'मुंबई', 'कोलकाता', 'चेन्नई', 'बेंगलुरु', 'जयपुर'],
    },
    symbols: [['tiger', 'le tigre'], ['peacock', 'le paon']],
    foods: [['cty-curry-rice', 'le curry'], ['cty-flatbread', 'le naan'], ['mango', 'la mangue']],
    nationalDay: 'le quinze août', day: [8, 15], currency: ['money', 'la roupie', 'INR'],
    landmark: sport('En Inde', 'avec une batte et une balle', 'le cricket', 'cty-cricket-game'),
    landmarkKind: 'sport',
  },
  {
    code: 'br', name: 'le Brésil', of: 'du Brésil', in: 'au Brésil',
    people: ['les Brésiliens', 'Brésiliennes'], languages: ['le portugais'],
    flagTraps: ['bo', 'ga', 'jm', 'za'], neighbours: ['ar', 'uy', 'py', 'bo', 'pe', 'co', 've'],
    capital: 'Brasilia', cities: ['São Paulo', 'Rio de Janeiro', 'Salvador', 'Fortaleza', 'Recife'],
    local: {
      en: ['Brasília', 'São Paulo', 'Rio de Janeiro', 'Salvador', 'Fortaleza', 'Recife'],
      pt: ['Brasília', 'São Paulo', 'Rio de Janeiro', 'Salvador', 'Fortaleza', 'Recife'],
    },
    symbols: [['parrot', 'le perroquet']],
    foods: [['pineapple', 'l\'ananas'], ['coconut', 'la noix de coco']],
    nationalDay: 'le sept septembre', day: [9, 7], currency: ['money', 'le réal', 'BRL'],
    landmark: sport('Au Brésil', 'avec un ballon, au pied', 'le football', 'cty-soccer-ball'),
    landmarkKind: 'sport',
  },
  {
    code: 'mx', name: 'le Mexique', of: 'du Mexique', in: 'au Mexique',
    people: ['les Mexicains', 'Mexicaines'], languages: ['l\'espagnol'],
    flagTraps: ['it', 'ie', 'ir', 'hu'], neighbours: ['us', 'gt', 'bz'],
    capital: 'Mexico', cities: ['Guadalajara', 'Monterrey', 'Puebla', 'Cancún', 'Tijuana'],
    local: {
      en: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Cancún', 'Tijuana'],
      es: ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Cancún', 'Tijuana'],
    },
    symbols: [['eagle', 'l\'aigle'], ['cactus', 'le cactus']],
    foods: [['cty-taco', 'les tacos'], ['cty-burrito', 'le burrito'], ['avocado', 'le guacamole']],
    nationalDay: 'le seize septembre', day: [9, 16], currency: ['money', 'le peso', 'MXN'],
    landmark: ['cty-pinata', 'Au Mexique, pour les fêtes, les enfants tapent dedans pour faire tomber des bonbons. Qu\'est-ce que c\'est ?',
      'la piñata', PARTIES],
    landmarkKind: 'thing',
  },
  // ---- Priorité 2 ----
  {
    code: 'de', name: 'l\'Allemagne', of: 'de l\'Allemagne', in: 'en Allemagne',
    people: ['les Allemands', 'Allemandes'], languages: ['l\'allemand'],
    flagTraps: ['be', 'ug', 'am', 'lt'], neighbours: ['fr', 'be', 'nl', 'lu', 'ch', 'at', 'dk', 'pl', 'cz'],
    capital: 'Berlin', cities: ['Hambourg', 'Munich', 'Cologne', 'Francfort', 'Stuttgart'],
    local: {
      en: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart'],
      de: ['Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt', 'Stuttgart'],
    },
    symbols: [['eagle', 'l\'aigle']],
    foods: [['cty-pretzel', 'le bretzel'], ['cty-hot-dog', 'la saucisse']],
    nationalDay: 'le trois octobre', day: [10, 3], currency: EURO,
    landmark: ['castle', 'En Allemagne, il y a de célèbres bâtiments avec des tours, en haut des montagnes. Lesquels ?',
      'les châteaux', ['cty-pyramid', 'cty-tokyo-tower', 'cty-statue-of-liberty', 'cty-moai']],
    landmarkKind: 'place',
  },
  {
    code: 'es', name: 'l\'Espagne', of: 'de l\'Espagne', in: 'en Espagne',
    people: ['les Espagnols', 'Espagnoles'], languages: ['l\'espagnol', 'catalan'],
    flagTraps: ['co', 'ad', 'ro', 'be'], neighbours: ['fr', 'pt', 'ad'],
    capital: 'Madrid', cities: ['Barcelone', 'Valence', 'Séville', 'Bilbao', 'Malaga'],
    local: {
      en: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao', 'Malaga'],
      es: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga'],
    },
    symbols: [],
    foods: [['cty-shallow-pan-of-food', 'la paella'], ['cty-olive', 'les olives']],
    nationalDay: 'le douze octobre', day: [10, 12], currency: EURO,
    landmark: sport('En Espagne', 'avec un ballon, au pied', 'le football', 'cty-soccer-ball'),
    landmarkKind: 'sport',
  },
  {
    code: 'it', name: 'l\'Italie', of: 'de l\'Italie', in: 'en Italie',
    people: ['les Italiens', 'Italiennes'], languages: ['l\'italien'],
    flagTraps: ['mx', 'ie', 'ci', 'hu'], neighbours: ['fr', 'ch', 'at', 'si', 'sm'],
    capital: 'Rome', cities: ['Milan', 'Naples', 'Turin', 'Florence', 'Venise'],
    local: {
      en: ['Rome', 'Milan', 'Naples', 'Turin', 'Florence', 'Venice'],
      it: ['Roma', 'Milano', 'Napoli', 'Torino', 'Firenze', 'Venezia'],
    },
    symbols: [['wolf', 'la louve']],
    foods: [['pizza', 'la pizza'], ['spaghetti', 'les spaghettis'], ['ice_cream', 'la glace']],
    nationalDay: 'le deux juin', day: [6, 2], currency: EURO,
    landmark: ['volcano', 'En Italie, il y a des montagnes qui crachent du feu. Lesquelles ?', 'les volcans',
      ['cty-desert', 'cty-pyramid', 'cty-tokyo-tower', 'cty-statue-of-liberty']],
    landmarkKind: 'place',
  },
  {
    code: 'ru', name: 'la Russie', of: 'de la Russie', in: 'en Russie',
    people: ['les Russes'], languages: ['le russe'],
    flagTraps: ['nl', 'fr', 'sk', 'si'], neighbours: ['fi', 'ua', 'by', 'kz', 'cn', 'mn', 'no', 'ee'],
    capital: 'Moscou', cities: ['Saint-Pétersbourg', 'Novossibirsk', 'Kazan', 'Sotchi', 'Vladivostok'],
    local: {
      en: ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Kazan', 'Sochi', 'Vladivostok'],
      ru: ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Казань', 'Сочи', 'Владивосток'],
    },
    symbols: [['bear', 'l\'ours']],
    foods: [['pancakes', 'les blinis'], ['cty-dumpling', 'les pelmenis']],
    nationalDay: 'le douze juin', day: [6, 12], currency: ['money', 'le rouble', 'RUB'],
    landmark: sport('En Russie', 'sur la glace, avec une crosse', 'le hockey sur glace', 'cty-ice-hockey'),
    landmarkKind: 'sport',
  },
  {
    code: 'pk', name: 'le Pakistan', of: 'du Pakistan', in: 'au Pakistan',
    people: ['les Pakistanais', 'Pakistanaises'], languages: ['l\'ourdou', 'anglais'],
    flagTraps: ['dz', 'tr', 'mr', 'km'], neighbours: ['in', 'cn', 'af', 'ir'],
    capital: 'Islamabad', cities: ['Karachi', 'Lahore', 'Peshawar', 'Multan', 'Quetta'],
    local: {
      en: ['Islamabad', 'Karachi', 'Lahore', 'Peshawar', 'Multan', 'Quetta'],
      ur: ['اسلام آباد', 'کراچی', 'لاہور', 'پشاور', 'ملتان', 'کوئٹہ'],
    },
    symbols: [['cty-crescent-moon', 'le croissant de lune']],
    foods: [['cty-curry-rice', 'le biryani'], ['cty-flatbread', 'le naan'], ['mango', 'la mangue']],
    nationalDay: 'le quatorze août', day: [8, 14], currency: ['money', 'la roupie', 'PKR'],
    landmark: sport('Au Pakistan', 'avec une batte et une balle', 'le cricket', 'cty-cricket-game'),
    landmarkKind: 'sport',
  },
  {
    code: 'bd', name: 'le Bangladesh', of: 'du Bangladesh', in: 'au Bangladesh',
    people: ['les Bangladais', 'Bangladaises'], languages: ['le bengali'],
    flagTraps: ['jp', 'pw', 'ly', 'mv'], neighbours: ['in', 'mm'],
    capital: 'Dacca', cities: ['Chittagong', 'Khulna', 'Sylhet', 'Rajshahi', 'Barisal'],
    local: {
      en: ['Dhaka', 'Chittagong', 'Khulna', 'Sylhet', 'Rajshahi', 'Barisal'],
      bn: ['ঢাকা', 'চট্টগ্রাম', 'খুলনা', 'সিলেট', 'রাজশাহী', 'বরিশাল'],
    },
    symbols: [['tiger', 'le tigre du Bengale']],
    foods: [['cty-cooked-rice', 'le riz'], ['fish', 'le poisson']],
    nationalDay: 'le vingt-six mars', day: [3, 26], currency: ['money', 'le taka', 'BDT'],
    landmark: sport('Au Bangladesh', 'avec une batte et une balle', 'le cricket', 'cty-cricket-game'),
    landmarkKind: 'sport',
  },
  {
    code: 'eg', name: 'l\'Égypte', of: 'de l\'Égypte', in: 'en Égypte',
    people: ['les Égyptiens', 'Égyptiennes'], languages: ['l\'arabe'],
    flagTraps: ['iq', 'sy', 'ye', 'sd'], neighbours: ['ly', 'sd'],
    capital: 'Le Caire', cities: ['Alexandrie', 'Gizeh', 'Louxor', 'Assouan', 'Port-Saïd'],
    local: {
      en: ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan', 'Port Said'],
      ar: ['القاهرة', 'الإسكندرية', 'الجيزة', 'الأقصر', 'أسوان', 'بورسعيد'],
    },
    symbols: [['eagle', 'l\'aigle']],
    foods: [['cty-falafel', 'les falafels'], ['cty-flatbread', 'le pain plat']],
    avoid: ['camel'],
    nationalDay: 'le vingt-trois juillet', day: [7, 23], currency: ['money', 'la livre égyptienne', 'EGP'],
    landmark: ['cty-pyramid', 'En Égypte, il y a des monuments très anciens, en forme de triangle. Lesquels ?', 'les pyramides',
      others(MONUMENTS, 'cty-pyramid')],
    landmarkKind: 'place',
  },
  {
    code: 'sa', name: 'l\'Arabie saoudite', of: 'de l\'Arabie saoudite', in: 'en Arabie saoudite',
    people: ['les Saoudiens', 'Saoudiennes'], languages: ['l\'arabe'],
    flagTraps: ['ly', 'pk', 'dz', 'mr'], neighbours: ['jo', 'iq', 'kw', 'ye', 'om', 'ae', 'qa'],
    capital: 'Riyad', cities: ['Djeddah', 'La Mecque', 'Médine', 'Dammam', 'Taïf'],
    local: {
      en: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Taif'],
      ar: ['الرياض', 'جدة', 'مكة', 'المدينة', 'الدمام', 'الطائف'],
    },
    symbols: [['camel', 'le chameau'], ['cty-palm-tree', 'le palmier']],
    foods: [['cty-cooked-rice', 'la kabsa, du riz avec du poulet']],
    avoid: ['cty-falafel'],
    nationalDay: 'le vingt-trois septembre', day: [9, 23], currency: ['money', 'le riyal', 'SAR'],
    landmark: ['cty-desert', 'En Arabie saoudite, il y a beaucoup de sable et très peu d\'eau. Où est-on ?', 'le désert',
      ['cty-snow-capped-mountain', 'island', 'volcano', 'castle']],
    landmarkKind: 'place',
  },
  // ---- Priorité 3 ----
  {
    code: 'at', name: 'l\'Autriche', of: 'de l\'Autriche', in: 'en Autriche',
    people: ['les Autrichiens', 'Autrichiennes'], languages: ['l\'allemand'],
    flagTraps: ['lv', 'pe', 'ca', 'lb'], neighbours: ['de', 'ch', 'it', 'cz', 'sk', 'hu', 'si', 'li'],
    capital: 'Vienne', cities: ['Graz', 'Linz', 'Salzbourg', 'Innsbruck', 'Klagenfurt'],
    local: {
      en: ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt'],
      de: ['Wien', 'Graz', 'Linz', 'Salzburg', 'Innsbruck', 'Klagenfurt'],
    },
    symbols: [['eagle', 'l\'aigle']],
    foods: [['cake', 'la Sachertorte, un gâteau au chocolat'], ['cty-pretzel', 'le bretzel']],
    nationalDay: 'le vingt-six octobre', day: [10, 26], currency: EURO,
    landmark: ['cty-snow-capped-mountain', 'En Autriche, il y a de très hautes montagnes pleines de neige : les Alpes. Lesquelles ?',
      'les Alpes', ['cty-desert', 'cty-beach', 'volcano', 'island']],
    landmarkKind: 'place',
  },
  {
    code: 'pt', name: 'le Portugal', of: 'du Portugal', in: 'au Portugal',
    people: ['les Portugais', 'Portugaises'], languages: ['le portugais'],
    flagTraps: ['es', 'md', 'bo', 'gw'], neighbours: ['es'],
    capital: 'Lisbonne', cities: ['Porto', 'Braga', 'Coimbra', 'Faro', 'Aveiro'],
    local: {
      en: ['Lisbon', 'Porto', 'Braga', 'Coimbra', 'Faro', 'Aveiro'],
      pt: ['Lisboa', 'Porto', 'Braga', 'Coimbra', 'Faro', 'Aveiro'],
    },
    symbols: [['rooster', 'le coq de Barcelos']],
    foods: [['cty-custard', 'le pastel de nata'], ['fish', 'la morue']],
    nationalDay: 'le dix juin', day: [6, 10], currency: EURO,
    landmark: ['cty-beach', 'Le Portugal est au bord de l\'océan, avec de grandes étendues de sable. Lesquelles ?', 'les plages',
      ['cty-desert', 'cty-snow-capped-mountain', 'volcano', 'castle']],
    landmarkKind: 'place',
  },
  {
    code: 'ma', name: 'le Maroc', of: 'du Maroc', in: 'au Maroc',
    people: ['les Marocains', 'Marocaines'], languages: ['l\'arabe', 'berbère', 'français'],
    flagTraps: ['vn', 'tr', 'al', 'kg'], neighbours: ['dz', 'mr', 'es'],
    capital: 'Rabat', cities: ['Casablanca', 'Marrakech', 'Fès', 'Tanger', 'Agadir'],
    local: {
      en: ['Rabat', 'Casablanca', 'Marrakesh', 'Fez', 'Tangier', 'Agadir'],
      ar: ['الرباط', 'الدار البيضاء', 'مراكش', 'فاس', 'طنجة', 'أكادير'],
    },
    symbols: [['lion', 'le lion de l\'Atlas']],
    foods: [['cty-teapot', 'le thé à la menthe'], ['orange', 'les oranges']],
    avoid: ['camel'],
    nationalDay: 'le trente juillet', day: [7, 30], currency: ['money', 'le dirham', 'MAD'],
    landmark: ['cty-desert', 'Au sud du Maroc, il y a un immense désert de sable : le Sahara. Lequel est-ce ?', 'le désert',
      ['island', 'volcano', 'castle', 'cty-tokyo-tower']],
    landmarkKind: 'place',
  },
  // ---- Pays dont la langue est déjà gérée ----
  {
    code: 'ng', name: 'le Nigeria', of: 'du Nigeria', in: 'au Nigeria',
    people: ['les Nigérians', 'Nigérianes'], languages: ['l\'anglais', 'haoussa', 'yoruba', 'igbo'],
    flagTraps: ['ie', 'ci', 'it', 'mx'], neighbours: ['bj', 'ne', 'td', 'cm'],
    capital: 'Abuja', cities: ['Lagos', 'Kano', 'Ibadan', 'Port Harcourt', 'Benin City'],
    local: { en: ['Abuja', 'Lagos', 'Kano', 'Ibadan', 'Port Harcourt', 'Benin City'] },
    symbols: [['eagle', 'l\'aigle']],
    foods: [['cty-cooked-rice', 'le riz jollof'], ['banana', 'les bananes plantains']],
    nationalDay: 'le premier octobre', day: [10, 1], currency: ['money', 'le naira', 'NGN'],
    landmark: sport('Au Nigeria', 'avec un ballon, au pied', 'le football', 'cty-soccer-ball'), landmarkKind: 'sport',
  },
  {
    code: 'ph', name: 'les Philippines', of: 'des Philippines', in: 'aux Philippines',
    people: ['les Philippins', 'Philippines'], languages: ['le filipino', 'anglais'],
    flagTraps: ['cz', 'cu', 'pr', 'ss'], neighbours: ['id', 'my', 'vn', 'tw'],
    capital: 'Manille', cities: ['Quezon City', 'Davao', 'Cebu', 'Zamboanga', 'Baguio'],
    local: { en: ['Manila', 'Quezon City', 'Davao', 'Cebu', 'Zamboanga', 'Baguio'] },
    symbols: [['eagle', 'l\'aigle des Philippines']],
    foods: [['cty-cooked-rice', 'le riz'], ['mango', 'la mangue']],
    nationalDay: 'le douze juin', day: [6, 12], currency: ['money', 'le peso', 'PHP'],
    landmark: sport('Aux Philippines', 'avec un ballon et un panier', 'le basket', 'cty-basketball'), landmarkKind: 'sport',
  },
  {
    code: 'cd', name: 'la RD Congo', of: 'de la RD Congo', in: 'en RD Congo',
    people: ['les Congolais', 'Congolaises'], languages: ['le français', 'lingala', 'swahili'],
    flagTraps: ['cg', 'tz', 'ss', 'sb'], neighbours: ['cg', 'cf', 'ss', 'ug', 'rw', 'bi', 'tz', 'zm', 'ao'],
    capital: 'Kinshasa', cities: ['Lubumbashi', 'Mbuji-Mayi', 'Kisangani', 'Goma', 'Bukavu'],
    local: { en: ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kisangani', 'Goma', 'Bukavu'] },
    symbols: [['leopard', 'le léopard'], ['gorilla', 'le gorille']],
    foods: [['banana', 'les bananes plantains'], ['fish', 'le poisson du fleuve']],
    nationalDay: 'le trente juin', day: [6, 30], currency: ['money', 'le franc congolais', 'CDF'],
    landmark: ['tree', 'En RD Congo, il y a une immense forêt pleine d\'arbres et d\'animaux. Laquelle ?', 'la forêt équatoriale',
      ['cty-desert', 'cty-snow-capped-mountain', 'cty-beach', 'island']],
    landmarkKind: 'place',
  },
  {
    code: 'tz', name: 'la Tanzanie', of: 'de la Tanzanie', in: 'en Tanzanie',
    people: ['les Tanzaniens', 'Tanzaniennes'], languages: ['le swahili', 'anglais'],
    flagTraps: ['cd', 'sc', 'sb', 'na'], neighbours: ['ke', 'ug', 'rw', 'bi', 'cd', 'zm', 'mw', 'mz'],
    capital: 'Dodoma', cities: ['Dar es Salaam', 'Mwanza', 'Arusha', 'Zanzibar', 'Mbeya'],
    local: { en: ['Dodoma', 'Dar es Salaam', 'Mwanza', 'Arusha', 'Zanzibar', 'Mbeya'] },
    symbols: [['giraffe', 'la girafe']],
    foods: [['banana', 'les bananes'], ['coconut', 'la noix de coco']],
    avoid: ['zebra'],
    nationalDay: 'le neuf décembre', day: [12, 9], currency: ['money', 'le shilling tanzanien', 'TZS'],
    landmark: ['cty-snow-capped-mountain', 'En Tanzanie, il y a la plus haute montagne d\'Afrique, avec de la neige tout en haut. Laquelle ?',
      'le Kilimandjaro', ['cty-desert', 'cty-beach', 'castle', 'island']],
    landmarkKind: 'place',
  },
  {
    code: 'za', name: 'l\'Afrique du Sud', of: 'de l\'Afrique du Sud', in: 'en Afrique du Sud',
    people: ['les Sud-Africains', 'Sud-Africaines'], languages: ['l\'anglais', 'zoulou', 'afrikaans', 'xhosa'],
    flagTraps: ['gy', 'ss', 'jm', 'vu'], neighbours: ['na', 'bw', 'zw', 'mz', 'sz', 'ls'],
    capital: 'Pretoria', cities: ['Johannesburg', 'Le Cap', 'Durban', 'Bloemfontein', 'Soweto'],
    local: { en: ['Pretoria', 'Johannesburg', 'Cape Town', 'Durban', 'Bloemfontein', 'Soweto'] },
    symbols: [['lion', 'le lion']],
    foods: [['corn', 'le pap, une purée de maïs']],
    avoid: ['giraffe', 'zebra'],
    nationalDay: 'le vingt-sept avril', day: [4, 27], currency: ['money', 'le rand', 'ZAR'],
    landmark: ['cty-rugby-football', 'En Afrique du Sud, un sport très aimé se joue avec un ballon ovale. Lequel ?', 'le rugby',
      ['cty-ice-hockey', 'cty-tennis', 'cty-basketball', 'cty-cricket-game']],
    landmarkKind: 'sport',
  },
  {
    code: 'co', name: 'la Colombie', of: 'de la Colombie', in: 'en Colombie',
    people: ['les Colombiens', 'Colombiennes'], languages: ['l\'espagnol'],
    flagTraps: ['ec', 've', 'am', 'ro'], neighbours: ['ve', 'br', 'pe', 'ec', 'pa'],
    capital: 'Bogota', cities: ['Medellín', 'Cali', 'Barranquilla', 'Carthagène', 'Bucaramanga'],
    local: {
      en: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga'],
      es: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga'],
    },
    symbols: [],
    foods: [['cty-hot-beverage', 'le café'], ['avocado', 'l\'avocat'], ['banana', 'les bananes']],
    nationalDay: 'le vingt juillet', day: [7, 20], currency: ['money', 'le peso colombien', 'COP'],
    landmark: sport('En Colombie', 'avec un ballon, au pied', 'le football', 'cty-soccer-ball'), landmarkKind: 'sport',
  },
  {
    code: 'ar', name: 'l\'Argentine', of: 'de l\'Argentine', in: 'en Argentine',
    people: ['les Argentins', 'Argentines'], languages: ['l\'espagnol'],
    flagTraps: ['uy', 'sv', 'ni', 'hn'], neighbours: ['cl', 'bo', 'py', 'br', 'uy'],
    capital: 'Buenos Aires', cities: ['Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Mar del Plata'],
    local: {
      en: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Mar del Plata'],
      es: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Mar del Plata'],
    },
    symbols: [['sun', 'le soleil de Mai']],
    foods: [['cty-cut-of-meat', 'la viande grillée'], ['cty-mate', 'le maté']],
    nationalDay: 'le neuf juillet', day: [7, 9], currency: ['money', 'le peso argentin', 'ARS'],
    landmark: sport('En Argentine', 'avec un ballon, au pied', 'le football', 'cty-soccer-ball'), landmarkKind: 'sport',
  },
  {
    code: 'sd', name: 'le Soudan', of: 'du Soudan', in: 'au Soudan',
    people: ['les Soudanais', 'Soudanaises'], languages: ['l\'arabe', 'anglais'],
    flagTraps: ['jo', 'ps', 'kw', 'ae'], neighbours: ['eg', 'ly', 'td', 'cf', 'ss', 'et', 'er'],
    capital: 'Khartoum', cities: ['Omdourman', 'Port-Soudan', 'Kassala', 'El-Obeid', 'Wad Madani'],
    local: {
      en: ['Khartoum', 'Omdurman', 'Port Sudan', 'Kassala', 'El-Obeid', 'Wad Madani'],
      ar: ['الخرطوم', 'أم درمان', 'بورتسودان', 'كسلا', 'الأبيض', 'ود مدني'],
    },
    symbols: [['camel', 'le chameau']],
    foods: [['cty-falafel', 'les falafels'], ['cty-flatbread', 'le pain kisra']],
    nationalDay: 'le premier janvier', day: [1, 1], currency: ['money', 'la livre soudanaise', 'SDG'],
    landmark: ['cty-pyramid', 'Au Soudan, il y a des monuments très anciens en forme de triangle, encore plus nombreux qu\'en Égypte. Lesquels ?',
      'les pyramides', others(MONUMENTS, 'cty-pyramid')],
    landmarkKind: 'place',
  },
  {
    code: 'dz', name: 'l\'Algérie', of: 'de l\'Algérie', in: 'en Algérie',
    people: ['les Algériens', 'Algériennes'], languages: ['l\'arabe', 'berbère', 'français'],
    flagTraps: ['pk', 'mr', 'tr', 'tn'], neighbours: ['ma', 'tn', 'ly', 'ne', 'ml', 'mr'],
    capital: 'Alger', cities: ['Oran', 'Constantine', 'Annaba', 'Blida', 'Sétif'],
    local: {
      en: ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Sétif'],
      ar: ['الجزائر', 'وهران', 'قسنطينة', 'عنابة', 'البليدة', 'سطيف'],
    },
    symbols: [['fox', 'le fennec']],
    foods: [['cty-flatbread', 'la galette'], ['cty-teapot', 'le thé à la menthe']],
    avoid: ['camel'],
    nationalDay: 'le cinq juillet', day: [7, 5], currency: ['money', 'le dinar algérien', 'DZD'],
    landmark: ['cty-desert', 'Une grande partie de l\'Algérie est couverte d\'un immense désert de sable : le Sahara. Lequel est-ce ?', 'le désert',
      ['island', 'volcano', 'castle', 'cty-tokyo-tower']],
    landmarkKind: 'place',
  },
  {
    code: 'iq', name: 'l\'Irak', of: 'de l\'Irak', in: 'en Irak',
    people: ['les Irakiens', 'Irakiennes'], languages: ['l\'arabe', 'kurde'],
    flagTraps: ['eg', 'sy', 'ye', 'sd'], neighbours: ['tr', 'ir', 'kw', 'sa', 'jo', 'sy'],
    capital: 'Bagdad', cities: ['Bassora', 'Mossoul', 'Erbil', 'Kirkouk', 'Nadjaf'],
    local: {
      en: ['Baghdad', 'Basra', 'Mosul', 'Erbil', 'Kirkuk', 'Najaf'],
      ar: ['بغداد', 'البصرة', 'الموصل', 'أربيل', 'كركوك', 'النجف'],
    },
    symbols: [['eagle', 'l\'aigle']],
    foods: [['cty-flatbread', 'le pain'], ['cty-teacup-without-handle', 'le thé']],
    nationalDay: 'le trois octobre', day: [10, 3], currency: ['money', 'le dinar irakien', 'IQD'],
    landmark: ['cty-palm-tree', 'En Irak, il y a de grandes forêts d\'arbres qui donnent des dattes. Lesquels ?', 'les palmiers',
      ['cty-christmas-tree', 'cty-snow-capped-mountain', 'cty-beach', 'castle']],
    landmarkKind: 'place',
  },
  {
    code: 'ke', name: 'le Kenya', of: 'du Kenya', in: 'au Kenya',
    people: ['les Kényans', 'Kényanes'], languages: ['le swahili', 'anglais'],
    flagTraps: ['mw', 'ss', 'af', 'ly'], neighbours: ['tz', 'ug', 'ss', 'et', 'so'],
    capital: 'Nairobi', cities: ['Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Malindi'],
    local: { en: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Malindi'] },
    symbols: [['lion', 'le lion']],
    foods: [['corn', 'l\'ugali, une purée de maïs'], ['cty-teacup-without-handle', 'le thé']],
    avoid: ['giraffe', 'zebra'],
    nationalDay: 'le douze décembre', day: [12, 12], currency: ['money', 'le shilling kényan', 'KES'],
  },
  {
    code: 'ug', name: 'l\'Ouganda', of: 'de l\'Ouganda', in: 'en Ouganda',
    people: ['les Ougandais', 'Ougandaises'], languages: ['l\'anglais', 'swahili', 'luganda'],
    flagTraps: ['de', 'be', 'ke', 'zw'], neighbours: ['ke', 'tz', 'rw', 'cd', 'ss'],
    capital: 'Kampala', cities: ['Entebbe', 'Gulu', 'Mbarara', 'Jinja', 'Mbale'],
    local: { en: ['Kampala', 'Entebbe', 'Gulu', 'Mbarara', 'Jinja', 'Mbale'] },
    symbols: [['gorilla', 'le gorille des montagnes']],
    foods: [['banana', 'le matoke, des bananes cuites']],
    nationalDay: 'le neuf octobre', day: [10, 9], currency: ['money', 'le shilling ougandais', 'UGX'],
  },
  {
    code: 'ci', name: 'la Côte d\'Ivoire', of: 'de la Côte d\'Ivoire', in: 'en Côte d\'Ivoire',
    people: ['les Ivoiriens', 'Ivoiriennes'], languages: ['le français'],
    flagTraps: ['ie', 'it', 'ne', 'in'], neighbours: ['lr', 'gn', 'ml', 'bf', 'gh'],
    capital: 'Yamoussoukro', cities: ['Abidjan', 'Bouaké', 'Daloa', 'San-Pédro', 'Korhogo'],
    local: { en: ['Yamoussoukro', 'Abidjan', 'Bouaké', 'Daloa', 'San-Pédro', 'Korhogo'] },
    symbols: [['elephant', 'l\'éléphant']],
    foods: [['cty-chocolate-bar', 'le chocolat'], ['banana', 'l\'alloco, des bananes frites']],
    nationalDay: 'le sept août', day: [8, 7], currency: ['money', 'le franc CFA', 'XOF'],
    landmark: sport('En Côte d\'Ivoire', 'avec un ballon, au pied', 'le football', 'cty-soccer-ball'), landmarkKind: 'sport',
  },
  {
    code: 'cm', name: 'le Cameroun', of: 'du Cameroun', in: 'au Cameroun',
    people: ['les Camerounais', 'Camerounaises'], languages: ['le français', 'anglais'],
    flagTraps: ['sn', 'ml', 'gn', 'gh'], neighbours: ['ng', 'td', 'cf', 'gq', 'ga', 'cg'],
    capital: 'Yaoundé', cities: ['Douala', 'Garoua', 'Bamenda', 'Bafoussam', 'Maroua'],
    local: { en: ['Yaoundé', 'Douala', 'Garoua', 'Bamenda', 'Bafoussam', 'Maroua'] },
    symbols: [['lion', 'le lion']],
    foods: [['banana', 'les bananes plantains'], ['fish', 'le poisson braisé']],
    nationalDay: 'le vingt mai', day: [5, 20], currency: ['money', 'le franc CFA', 'XAF'],
    landmark: sport('Au Cameroun', 'avec un ballon, au pied', 'le football', 'cty-soccer-ball'), landmarkKind: 'sport',
  },
  // ---- Nouvelle langue : l'indonésien ----
  {
    code: 'id', name: 'l\'Indonésie', of: 'de l\'Indonésie', in: 'en Indonésie',
    people: ['les Indonésiens', 'Indonésiennes'], languages: ['l\'indonésien'],
    flagTraps: ['mc', 'pl', 'sg', 'at'], neighbours: ['my', 'tl', 'pg'],
    capital: 'Jakarta', cities: ['Surabaya', 'Bandung', 'Medan', 'Semarang', 'Denpasar'],
    local: { en: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Denpasar'] },
    symbols: [['eagle', 'le garuda, un aigle']],
    foods: [['cty-cooked-rice', 'le nasi goreng, du riz frit'], ['coconut', 'la noix de coco']],
    nationalDay: 'le dix-sept août', day: [8, 17], currency: ['money', 'la roupie indonésienne', 'IDR'],
    landmark: ['volcano', 'En Indonésie, il y a beaucoup de montagnes qui crachent du feu. Lesquelles ?', 'les volcans',
      ['cty-desert', 'cty-snow-capped-mountain', 'castle', 'cty-tokyo-tower']],
    landmarkKind: 'place',
  },
  // ---- Nouvelles langues : vietnamien, turc, persan, polonais, ukrainien ; et Thaïlande, Yémen, Angola ----
  {
    code: 'vn', name: 'le Viêt Nam', of: 'du Viêt Nam', in: 'au Viêt Nam',
    people: ['les Vietnamiens', 'Vietnamiennes'], languages: ['le vietnamien'],
    flagTraps: ['cn', 'so', 'ma', 'kg'], neighbours: ['cn', 'la', 'kh'],
    capital: 'Hanoï', cities: ['Hô Chi Minh-Ville', 'Haïphong', 'Da Nang', 'Hué', 'Cân Tho'],
    local: {
      en: ['Hanoi', 'Ho Chi Minh City', 'Hai Phong', 'Da Nang', 'Hue', 'Can Tho'],
      vi: ['Hà Nội', 'Hồ Chí Minh', 'Hải Phòng', 'Đà Nẵng', 'Huế', 'Cần Thơ'],
    },
    symbols: [['ox', 'le buffle']],
    foods: [['cty-steaming-bowl', 'la soupe phở'], ['cty-cooked-rice', 'le riz']],
    avoid: ['cty-dumpling', 'cty-moon-cake'],
    nationalDay: 'le deux septembre', day: [9, 2], currency: ['money', 'le dông', 'VND'],
    landmark: ['cty-red-paper-lantern', 'Pour la fête de la mi-automne, les enfants vietnamiens se promènent avec des décorations qui brillent. Lesquelles ?',
      'les lanternes', PARTIES],
    landmarkKind: 'thing',
  },
  {
    code: 'tr', name: 'la Turquie', of: 'de la Turquie', in: 'en Turquie',
    people: ['les Turcs', 'Turques'], languages: ['le turc'],
    flagTraps: ['tn', 'dz', 'pk', 'mv'], neighbours: ['gr', 'bg', 'ge', 'am', 'ir', 'iq', 'sy', 'az'],
    capital: 'Ankara', cities: ['Istanbul', 'Izmir', 'Bursa', 'Antalya', 'Konya'],
    local: {
      en: ['Ankara', 'Istanbul', 'Izmir', 'Bursa', 'Antalya', 'Konya'],
      tr: ['Ankara', 'İstanbul', 'İzmir', 'Bursa', 'Antalya', 'Konya'],
    },
    symbols: [['cty-crescent-moon', 'le croissant de lune']],
    foods: [['cty-teacup-without-handle', 'le thé'], ['cty-cut-of-meat', 'le kebab'], ['cty-flatbread', 'le pide']],
    nationalDay: 'le vingt-neuf octobre', day: [10, 29], currency: ['money', 'la livre turque', 'TRY'],
  },
  {
    code: 'ir', name: 'l\'Iran', of: 'de l\'Iran', in: 'en Iran',
    people: ['les Iraniens', 'Iraniennes'], languages: ['le persan'],
    flagTraps: ['tj', 'hu', 'bg', 'it'], neighbours: ['iq', 'tr', 'am', 'az', 'tm', 'af', 'pk'],
    capital: 'Téhéran', cities: ['Machhad', 'Ispahan', 'Tabriz', 'Chiraz', 'Karadj'],
    local: {
      en: ['Tehran', 'Mashhad', 'Isfahan', 'Tabriz', 'Shiraz', 'Karaj'],
      fa: ['تهران', 'مشهد', 'اصفهان', 'تبریز', 'شیراز', 'کرج'],
    },
    symbols: [['lion', 'le lion']],
    foods: [['cty-cooked-rice', 'le riz au safran'], ['cty-teacup-without-handle', 'le thé']],
    currency: ['money', 'le rial', 'IRR'],
  },
  {
    code: 'pl', name: 'la Pologne', of: 'de la Pologne', in: 'en Pologne',
    people: ['les Polonais', 'Polonaises'], languages: ['le polonais'],
    flagTraps: ['id', 'mc', 'at', 'sg'], neighbours: ['de', 'cz', 'sk', 'ua', 'by', 'lt', 'ru'],
    capital: 'Varsovie', cities: ['Cracovie', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk'],
    local: {
      en: ['Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk'],
      pl: ['Warszawa', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk'],
    },
    symbols: [['eagle', 'l\'aigle blanc'], ['bison', 'le bison']],
    foods: [['cty-dumpling', 'les pierogis'], ['bread', 'le pain']],
    avoid: ['cty-moon-cake'],
    nationalDay: 'le onze novembre', day: [11, 11], currency: ['money', 'le zloty', 'PLN'],
    landmark: ['castle', 'En Pologne, il y a de grands bâtiments très anciens avec des tours et des remparts. Lesquels ?', 'les châteaux',
      ['cty-pyramid', 'cty-tokyo-tower', 'cty-statue-of-liberty', 'cty-moai']],
    landmarkKind: 'place',
  },
  {
    code: 'ua', name: 'l\'Ukraine', of: 'de l\'Ukraine', in: 'en Ukraine',
    people: ['les Ukrainiens', 'Ukrainiennes'], languages: ['l\'ukrainien'],
    flagTraps: ['se', 'kz', 'pw', 'bs'], neighbours: ['pl', 'sk', 'hu', 'ro', 'md', 'by', 'ru'],
    capital: 'Kiev', cities: ['Kharkiv', 'Odessa', 'Lviv', 'Dnipro', 'Zaporijia'],
    local: {
      en: ['Kyiv', 'Kharkiv', 'Odesa', 'Lviv', 'Dnipro', 'Zaporizhzhia'],
      uk: ['Київ', 'Харків', 'Одеса', 'Львів', 'Дніпро', 'Запоріжжя'],
    },
    symbols: [['sunflower', 'le tournesol']],
    foods: [['cty-dumpling', 'les varenykys'], ['bread', 'le pain']],
    avoid: ['cty-moon-cake'],
    nationalDay: 'le vingt-quatre août', day: [8, 24], currency: ['money', 'la hryvnia', 'UAH'],
  },
  {
    code: 'th', name: 'la Thaïlande', of: 'de la Thaïlande', in: 'en Thaïlande',
    people: ['les Thaïlandais', 'Thaïlandaises'], languages: ['le thaï'],
    flagTraps: ['cr', 'kp', 'nl', 'fr'], neighbours: ['mm', 'la', 'kh', 'my'],
    capital: 'Bangkok', cities: ['Chiang Mai', 'Phuket', 'Pattaya', 'Ayutthaya', 'Khon Kaen'],
    local: { en: ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Ayutthaya', 'Khon Kaen'] },
    symbols: [['elephant', 'l\'éléphant']],
    foods: [['cty-steaming-bowl', 'la soupe tom yam'], ['mango', 'le riz gluant à la mangue']],
    avoid: ['cty-dumpling', 'cty-moon-cake'],
    nationalDay: 'le cinq décembre', day: [12, 5], currency: ['money', 'le baht', 'THB'],
    landmark: ['cty-beach', 'En Thaïlande, il y a des îles avec du sable blanc et une mer bien chaude. Où va-t-on se baigner ?', 'la plage',
      ['cty-desert', 'cty-snow-capped-mountain', 'castle', 'volcano']],
    landmarkKind: 'place',
  },
  {
    code: 'ye', name: 'le Yémen', of: 'du Yémen', in: 'au Yémen',
    people: ['les Yéménites'], languages: ['l\'arabe'],
    flagTraps: ['eg', 'sy', 'iq', 'sd'], neighbours: ['sa', 'om'],
    capital: 'Sanaa', cities: ['Aden', 'Taëz', 'Hodeïda', 'Ibb', 'Moukalla'],
    local: {
      en: ['Sanaa', 'Aden', 'Taiz', 'Hodeidah', 'Ibb', 'Mukalla'],
      ar: ['صنعاء', 'عدن', 'تعز', 'الحديدة', 'إب', 'المكلا'],
    },
    symbols: [['eagle', 'l\'aigle']],
    foods: [['honey', 'le miel'], ['cty-hot-beverage', 'le café'], ['cty-flatbread', 'le pain']],
    nationalDay: 'le vingt-deux mai', day: [5, 22], currency: ['money', 'le rial yéménite', 'YER'],
  },
  {
    code: 'ao', name: 'l\'Angola', of: 'de l\'Angola', in: 'en Angola',
    people: ['les Angolais', 'Angolaises'], languages: ['le portugais'],
    flagTraps: ['ye', 'eg', 'iq', 'ly'], neighbours: ['cd', 'cg', 'zm', 'na'],
    capital: 'Luanda', cities: ['Huambo', 'Lobito', 'Benguela', 'Lubango', 'Malanje'],
    local: {
      en: ['Luanda', 'Huambo', 'Lobito', 'Benguela', 'Lubango', 'Malanje'],
      pt: ['Luanda', 'Huambo', 'Lobito', 'Benguela', 'Lubango', 'Malanje'],
    },
    symbols: [],
    foods: [['fish', 'le poisson grillé'], ['banana', 'les bananes']],
    nationalDay: 'le onze novembre', day: [11, 11], currency: ['money', 'le kwanza', 'AOA'],
    landmark: sport('En Angola', 'avec un ballon et un panier', 'le basket', 'cty-basketball'), landmarkKind: 'sport',
  },
  // ---- Ghana, Mozambique, Pérou, Madagascar, Venezuela, Syrie, Afghanistan, Népal, Corée du Sud ----
  {
    code: 'gh', name: 'le Ghana', of: 'du Ghana', in: 'au Ghana',
    people: ['les Ghanéens', 'Ghanéennes'], languages: ['l\'anglais', 'twi'],
    flagTraps: ['bo', 'gn', 'cm', 'sn'], neighbours: ['ci', 'bf', 'tg'],
    capital: 'Accra', cities: ['Kumasi', 'Tamale', 'Takoradi', 'Cape Coast', 'Tema'],
    local: { en: ['Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Cape Coast', 'Tema'] },
    symbols: [['eagle', 'l\'aigle']],
    foods: [['cty-chocolate-bar', 'le chocolat'], ['cty-cooked-rice', 'le riz jollof']],
    nationalDay: 'le six mars', day: [3, 6], currency: ['money', 'le cedi', 'GHS'],
    landmark: sport('Au Ghana', 'avec un ballon, au pied', 'le football', 'cty-soccer-ball'), landmarkKind: 'sport',
  },
  {
    code: 'mz', name: 'le Mozambique', of: 'du Mozambique', in: 'au Mozambique',
    people: ['les Mozambicains', 'Mozambicaines'], languages: ['le portugais'],
    flagTraps: ['zw', 'ss', 'tz', 'za'], neighbours: ['tz', 'mw', 'zm', 'zw', 'za', 'sz'],
    capital: 'Maputo', cities: ['Beira', 'Nampula', 'Quelimane', 'Tete', 'Pemba'],
    local: {
      en: ['Maputo', 'Beira', 'Nampula', 'Quelimane', 'Tete', 'Pemba'],
      pt: ['Maputo', 'Beira', 'Nampula', 'Quelimane', 'Tete', 'Pemba'],
    },
    symbols: [],
    foods: [['shrimp', 'les crevettes'], ['coconut', 'la noix de coco']],
    nationalDay: 'le vingt-cinq juin', day: [6, 25], currency: ['money', 'le metical', 'MZN'],
    landmark: ['cty-beach', 'Le Mozambique a une très longue côte, avec du sable et une mer chaude. Où va-t-on se baigner ?', 'la plage',
      ['cty-desert', 'cty-snow-capped-mountain', 'castle', 'volcano']],
    landmarkKind: 'place',
  },
  {
    code: 'pe', name: 'le Pérou', of: 'du Pérou', in: 'au Pérou',
    people: ['les Péruviens', 'Péruviennes'], languages: ['l\'espagnol', 'quechua'],
    flagTraps: ['ca', 'at', 'lb', 'lv'], neighbours: ['ec', 'co', 'br', 'bo', 'cl'],
    capital: 'Lima', cities: ['Arequipa', 'Cuzco', 'Trujillo', 'Chiclayo', 'Iquitos'],
    local: {
      en: ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Chiclayo', 'Iquitos'],
      es: ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Chiclayo', 'Iquitos'],
    },
    symbols: [['llama', 'le lama']],
    foods: [['potato', 'la pomme de terre'], ['corn', 'le maïs']],
    nationalDay: 'le vingt-huit juillet', day: [7, 28], currency: ['money', 'le sol', 'PEN'],
    landmark: ['cty-snow-capped-mountain', 'Au Pérou, il y a de très hautes montagnes : les Andes. Lesquelles ?', 'les Andes',
      ['cty-desert', 'cty-beach', 'volcano', 'island']],
    landmarkKind: 'place',
  },
  {
    code: 'mg', name: 'Madagascar', of: 'de Madagascar', in: 'à Madagascar',
    people: ['les Malgaches'], languages: ['le malgache', 'français'],
    flagTraps: ['bg', 'by', 'hu', 'bd'], neighbours: ['mz', 'km', 'mu', 'sc'],
    capital: 'Antananarivo', cities: ['Toamasina', 'Antsirabe', 'Mahajanga', 'Fianarantsoa', 'Toliara'],
    local: { en: ['Antananarivo', 'Toamasina', 'Antsirabe', 'Mahajanga', 'Fianarantsoa', 'Toliara'] },
    symbols: [],
    foods: [['cty-cooked-rice', 'le riz'], ['banana', 'les bananes']],
    nationalDay: 'le vingt-six juin', day: [6, 26], currency: ['money', 'l\'ariary', 'MGA'],
    landmark: ['tree', 'À Madagascar, il y a des arbres géants au tronc énorme : les baobabs. Lesquels ?', 'les baobabs',
      ['cty-snow-capped-mountain', 'castle', 'cty-moai', 'cty-eiffel-tower']],
    landmarkKind: 'place',
  },
  {
    code: 've', name: 'le Venezuela', of: 'du Venezuela', in: 'au Venezuela',
    people: ['les Vénézuéliens', 'Vénézuéliennes'], languages: ['l\'espagnol'],
    flagTraps: ['co', 'ec', 'ro', 'ad'], neighbours: ['co', 'br', 'gy'],
    capital: 'Caracas', cities: ['Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Guayana'],
    local: {
      en: ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Guayana'],
      es: ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Guayana'],
    },
    symbols: [],
    foods: [['corn', 'l\'arepa, une galette de maïs'], ['cty-chocolate-bar', 'le chocolat']],
    nationalDay: 'le cinq juillet', day: [7, 5], currency: ['money', 'le bolivar', 'VES'],
  },
  {
    code: 'sy', name: 'la Syrie', of: 'de la Syrie', in: 'en Syrie',
    people: ['les Syriens', 'Syriennes'], languages: ['l\'arabe'],
    flagTraps: ['eg', 'iq', 'ye', 'sd'], neighbours: ['tr', 'iq', 'jo', 'lb'],
    capital: 'Damas', cities: ['Alep', 'Homs', 'Lattaquié', 'Hama', 'Deir ez-Zor'],
    local: {
      en: ['Damascus', 'Aleppo', 'Homs', 'Latakia', 'Hama', 'Deir ez-Zor'],
      ar: ['دمشق', 'حلب', 'حمص', 'اللاذقية', 'حماة', 'دير الزور'],
    },
    symbols: [['eagle', 'l\'aigle']],
    foods: [['cty-falafel', 'les falafels'], ['cty-flatbread', 'le pain']],
    nationalDay: 'le dix-sept avril', day: [4, 17], currency: ['money', 'la livre syrienne', 'SYP'],
    landmark: ['castle', 'En Syrie, il y a de très vieux châteaux forts en pierre, sur les collines. Lesquels ?', 'les châteaux forts',
      ['cty-tokyo-tower', 'cty-statue-of-liberty', 'cty-moai', 'cty-eiffel-tower']],
    landmarkKind: 'place',
  },
  {
    code: 'af', name: 'l\'Afghanistan', of: 'de l\'Afghanistan', in: 'en Afghanistan',
    people: ['les Afghans', 'Afghanes'], languages: ['le dari', 'pachto'],
    flagTraps: ['be', 'de', 'ug', 'md'], neighbours: ['ir', 'tm', 'uz', 'tj', 'cn', 'pk'],
    capital: 'Kaboul', cities: ['Kandahar', 'Hérat', 'Mazar-e Charif', 'Jalalabad', 'Kunduz'],
    local: {
      en: ['Kabul', 'Kandahar', 'Herat', 'Mazar-i-Sharif', 'Jalalabad', 'Kunduz'],
      fa: ['کابل', 'قندهار', 'هرات', 'مزار شریف', 'جلال‌آباد', 'کندز'],
    },
    symbols: [],
    foods: [['cty-cooked-rice', 'le riz kabuli'], ['cty-flatbread', 'le naan']],
    nationalDay: 'le dix-neuf août', day: [8, 19], currency: ['money', 'l\'afghani', 'AFN'],
    landmark: ['cty-snow-capped-mountain', 'En Afghanistan, il y a de très hautes montagnes pleines de neige. Lesquelles ?', 'les montagnes',
      ['cty-beach', 'volcano', 'island', 'castle']],
    landmarkKind: 'place',
  },
  {
    code: 'np', name: 'le Népal', of: 'du Népal', in: 'au Népal',
    people: ['les Népalais', 'Népalaises'], languages: ['le népalais'],
    flagTraps: ['bt', 'in', 'bd', 'lk'], neighbours: ['in', 'cn'],
    capital: 'Katmandou', cities: ['Pokhara', 'Lalitpur', 'Biratnagar', 'Bharatpur', 'Birgunj'],
    local: {
      en: ['Kathmandu', 'Pokhara', 'Lalitpur', 'Biratnagar', 'Bharatpur', 'Birgunj'],
      ne: ['काठमाडौं', 'पोखरा', 'ललितपुर', 'विराटनगर', 'भरतपुर', 'वीरगञ्ज'],
    },
    symbols: [['cow', 'la vache']],
    foods: [['cty-dumpling', 'les momos'], ['cty-cooked-rice', 'le dal bhat']],
    avoid: ['cty-moon-cake'],
    nationalDay: 'le vingt septembre', day: [9, 20], currency: ['money', 'la roupie népalaise', 'NPR'],
    landmark: ['cty-snow-capped-mountain', 'Au Népal se trouve la plus haute montagne du monde, l\'Everest. Laquelle est-ce ?', 'l\'Everest',
      ['cty-desert', 'cty-beach', 'volcano', 'island']],
    landmarkKind: 'place',
  },
  {
    code: 'kr', name: 'la Corée du Sud', of: 'de la Corée du Sud', in: 'en Corée du Sud',
    people: ['les Coréens', 'Coréennes'], languages: ['le coréen'],
    flagTraps: ['jp', 'kp', 'mn', 'tw'], neighbours: ['kp', 'jp', 'cn'],
    capital: 'Séoul', cities: ['Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju'],
    local: {
      en: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju'],
      ko: ['서울', '부산', '인천', '대구', '대전', '광주'],
    },
    symbols: [['tiger', 'le tigre']],
    foods: [['cty-cooked-rice', 'le bibimbap'], ['cty-steaming-bowl', 'les nouilles']],
    avoid: ['cty-dumpling', 'cty-moon-cake', 'cty-sushi'],
    nationalDay: 'le trois octobre', day: [10, 3], currency: ['money', 'le won', 'KRW'],
  },
];

/** Drapeaux lointains et bien différents (leurres faciles). */
export const FAR_FLAGS = ['jp', 'br', 'us', 'cn', 'mx', 'in', 'sn', 'gb', 'au', 'za'];
export const OTHER_ANIMALS = ['kangaroo', 'panda', 'camel', 'penguin', 'koala', 'giraffe', 'zebra'];
export const FOREIGN_FOODS = ['cty-taco', 'cty-sushi', 'cty-burrito', 'cty-curry-rice', 'cty-dumpling', 'cty-hamburger',
  'cty-pretzel', 'cty-falafel', 'cty-moon-cake'];
export const CELEBRATIONS = ['cty-christmas-tree', 'cty-jack-o-lantern', 'snowman', 'egg'];
export const BANKNOTES = ['cty-euro', 'cty-dollar', 'cty-yen', 'cty-pound'];

/** Pays de l'enfant (réglé par l'appli au démarrage et depuis l'espace parents). */
let current = 'fr';
export const setCountry = (code: string) => { current = code; };
export const currentCountry = (): Country | undefined => COUNTRIES.find((c) => c.code === current);

/** Nom d'un pays dans la langue de l'application : le catalogue s'il le donne, sinon le navigateur (Intl). */
export function regionName(code: string, language: Lang = lang()): string {
  if (has(`country.${code}`)) return t(`country.${code}`);
  try {
    return new Intl.DisplayNames([langInfo(language).locale], { type: 'region' }).of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

/** Nom d'un pays sans article (« France », « Canada »), dans la langue de l'application. */
export function countryLabel(code: string): string {
  const fr = COUNTRIES.find((c) => c.code === code)?.name.replace(/^(?:les |la |le |l')/, '') ?? code;
  return isFr() ? fr : regionName(code);
}

/** Capitale puis villes, écrites dans la langue de l'application (anglais pour l'alphabet latin), si on les a. */
export function citiesIn(c: Country, language: Lang = lang()): string[] | undefined {
  if (language === 'fr') return [c.capital, ...c.cities];
  return c.local[language] ?? (langInfo(language).latin ? c.local.en : undefined);
}

/** Date de la fête nationale dans la langue de l'application (« 4 July », « 4 de julio »…). */
export function nationalDate(c: Country, language: Lang = lang()): string | undefined {
  if (!c.day) return undefined;
  const [month, day] = c.day;
  return new Intl.DateTimeFormat(langInfo(language).locale, { day: 'numeric', month: 'long', timeZone: 'UTC' })
    .format(new Date(Date.UTC(2024, month - 1, day)));
}

/** Nom de la monnaie dans la langue de l'application (« euro », « US dollar »…). */
export function currencyName(c: Country, language: Lang = lang()): string | undefined {
  if (!c.currency) return undefined;
  try {
    return new Intl.DisplayNames([langInfo(language).locale], { type: 'currency' }).of(c.currency[2]);
  } catch {
    return undefined;
  }
}

/** Monnaies montrées en piège à côté de celle du pays. */
const OTHER_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR'];

/**
 * Cartes de la question « Avec quel argent paie-t-on ? » : l'image du billet s'il y en
 * a une (euro, dollar, livre), sinon un billet dessiné avec le symbole de la monnaie.
 */
export function currencyCards(c: Country, rng: Rng): { answer: Choice; distractors: Choice[] } {
  const [image, , code] = c.currency!;
  if (image !== 'money') {
    const img = (key: string): Choice => ({ id: key, image: key });
    return { answer: img(image), distractors: shuffle(BANKNOTES.filter((x) => x !== image), rng).slice(0, 3).map(img) };
  }
  const note = (cur: string): Choice => {
    const notes = Object.keys(CURRENCIES[cur].notes).map(Number);
    return { id: `cur:${cur}`, money: [notes[Math.min(1, notes.length - 1)]], currency: cur };
  };
  return { answer: note(code), distractors: shuffle(OTHER_CURRENCIES.filter((x) => x !== code), rng).slice(0, 3).map(note) };
}
