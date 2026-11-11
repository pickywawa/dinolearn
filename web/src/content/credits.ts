/**
 * Crédits et licences de tout ce que DinoLearn embarque ou télécharge (écran « Crédits et
 * licences » de l'espace parents). Les noms et licences restent tels quels dans toutes les
 * langues ; seuls les titres des rubriques sont traduits.
 * À tenir à jour quand on ajoute une bibliothèque, une voix, une police ou des images.
 */

export interface Credit {
  name: string;
  author?: string;
  license: string;
  source: string;
}

export interface CreditGroup {
  /** Clé du titre (« p.credits.<id> ») et titre français. */
  id: string;
  fr: string;
  items: Credit[];
}

/** Voix du dino (modèles Piper, entraînés sur ces jeux de données) : licence de chaque voix. */
const VOICES: [string, string, string][] = [
  ['fr_FR-upmc-medium', 'CC BY-SA 4.0', 'UPMC (Université Pierre et Marie Curie)'],
  ['en_GB-alba-medium', 'CC BY 4.0', 'Alba (CSTR, University of Edinburgh)'],
  ['es_MX-claude-high', 'Apache 2.0', 'Claude'],
  ['it_IT-paola-medium', 'CC0', 'Paola Persico'],
  ['de_DE-thorsten-medium', 'CC0', 'Thorsten Müller'],
  ['pt_BR-faber-medium', 'CC0', 'Faber'],
  ['ru_RU-denis-medium', 'CC0', 'OHF Voice'],
  ['zh_CN-huayan-medium', 'licence non précisée par l\'auteur', 'HuaYan TTS'],
  ['hi_IN-priyamvada-medium', 'CC BY-NC-SA 4.0', 'Priyamvada'],
  ['ar_JO-kareem-medium', 'licence non précisée par l\'auteur', 'Kareem (arabicttstrain)'],
  ['ur_PK-aegis_female-medium', 'MIT', 'Aegis'],
  ['bn_BD-google-medium', 'CC BY-SA 4.0', 'Google'],
  ['id_ID-news_tts-medium', 'voir la source', 'News TTS'],
  ['vi_VN-vais1000-medium', 'CC BY 4.0', 'VAIS-1000'],
  ['tr_TR-dfki-medium', 'CC BY-NC-SA 4.0', 'DFKI'],
  ['fa_IR-amir-medium', 'CC0', 'Datacula'],
  ['pl_PL-gosia-medium', 'CC0', 'Gosia'],
  ['uk_UA-tetiana-high', 'Apache 2.0', 'Tetiana'],
  ['ko_KR-kss-medium', 'CC BY-NC-SA 4.0', 'KSS (Kyubyong Park)'],
  ['ne_NP-chitwan-medium', 'CC0', 'Chitwan'],
];

export const CREDITS: CreditGroup[] = [
  {
    id: 'voices', fr: 'Voix du dino',
    items: [
      { name: 'Piper', author: 'Michael Hansen / Open Home Foundation', license: 'MIT', source: 'github.com/rhasspy/piper' },
      ...VOICES.map(([id, license, author]) => ({ name: id, author, license, source: 'huggingface.co/rhasspy/piper-voices' })),
      { name: 'piper-tts-web', author: 'Mintplex Labs', license: 'MIT', source: 'github.com/Mintplex-Labs/piper-tts-web' },
      { name: 'eSpeak NG (prononciation)', license: 'GPL-3.0', source: 'github.com/espeak-ng/espeak-ng' },
      { name: 'ONNX Runtime Web', author: 'Microsoft', license: 'MIT', source: 'github.com/microsoft/onnxruntime' },
    ],
  },
  {
    id: 'asr', fr: 'Reconnaissance vocale',
    items: [
      { name: 'Vosk (modèles « small »)', author: 'Alpha Cephei', license: 'Apache 2.0', source: 'alphacephei.com/vosk/models' },
      { name: 'vosk-browser', author: 'Ciaran O\'Reilly', license: 'Apache 2.0', source: 'github.com/ccoreilly/vosk-browser' },
    ],
  },
  {
    id: 'code', fr: 'Moteur du jeu',
    items: [
      { name: 'Phaser', author: 'Phaser Studio', license: 'MIT', source: 'phaser.io' },
      { name: 'three.js', license: 'MIT', source: 'threejs.org' },
      { name: 'Capacitor', author: 'Ionic', license: 'MIT', source: 'capacitorjs.com' },
      { name: 'ZzFX', author: 'Frank Force', license: 'MIT', source: 'github.com/KilledByAPixel/ZzFX' },
      { name: 'EasySpeech', author: 'Jan Küster', license: 'MIT', source: 'github.com/leaonline/easy-speech' },
      { name: 'jsPDF', license: 'MIT', source: 'github.com/parallax/jsPDF' },
      { name: 'html2canvas', author: 'Niklas von Hertzen', license: 'MIT', source: 'html2canvas.hertzen.com' },
    ],
  },
  {
    id: 'images', fr: 'Images et polices',
    items: [
      { name: 'Noto Emoji', author: 'Google', license: 'Apache 2.0', source: 'github.com/googlefonts/noto-emoji' },
      { name: 'OpenMoji', license: 'CC BY-SA 4.0', source: 'openmoji.org' },
      { name: 'circle-flags', author: 'HatScripts', license: 'MIT', source: 'github.com/HatScripts/circle-flags' },
      { name: 'Plush icons', author: 'withicons', license: 'MIT', source: 'iconify.design' },
      { name: 'Baloo 2', author: 'Ek Type', license: 'SIL OFL 1.1', source: 'fonts.google.com/specimen/Baloo+2' },
      { name: 'Andika', author: 'SIL International', license: 'SIL OFL 1.1', source: 'software.sil.org/andika' },
      { name: 'Playwrite FR Moderne', author: 'TypeTogether', license: 'SIL OFL 1.1', source: 'fonts.google.com' },
    ],
  },
  {
    id: 'sounds', fr: 'Bruitages',
    items: [
      { name: '7 Eating Crunches', license: 'CC0', source: 'opengameart.org/content/7-eating-crunches' },
      { name: '80 CC0 creature SFX', author: 'rubberduck', license: 'CC0', source: 'opengameart.org/content/80-cc0-creature-sfx' },
      { name: 'Gastric distress', author: 'LFA', license: 'CC0', source: 'opengameart.org/content/gastric-distress' },
      { name: '8 wet squish, slurp impacts', license: 'CC0', source: 'opengameart.org/content/8-wet-squish-slurp-impacts' },
    ],
  },
];
