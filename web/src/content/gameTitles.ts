/** Nom de chaque jeu (« Catégorie — Nom »), pour l'espace parents et les tuiles du choix des jeux. */
export const TITLES: Record<string, string> = {
  'EN-1': 'Anglais — Écoute et touche', 'EN-2': 'Anglais — Numbers', 'MO-1': 'Monde — Montre-moi',
  'MO-2': 'Monde — Devinettes', 'MO-3': 'Monde — Les ombres', 'MO-4': 'Monde — Ça va ensemble',
  'MO-5': 'Monde — Le plus grand', 'FR-1': 'Français — Les sons', 'FR-2': 'Français — Les syllabes',
  'FR-3': 'Français — Lis le mot', 'FR-4': 'Français — Les lettres', 'LO-1': 'Logique — L\'intrus',
  'LO-2': 'Logique — Combien ?', 'LO-3': 'Logique — La suite', 'LO-4': 'Logique — Le plus, le moins',
  'LO-5': 'Logique — Calcul', 'LO-6': 'Logique — Les nombres', 'LO-7': 'Logique — Formes et couleurs',
  'LO-8': 'Logique — L\'heure', 'LO-9': 'Logique — La monnaie',
  'MO-6': 'Monde — Mon pays', 'TR-1': 'Écriture — Trace les formes', 'TR-2': 'Écriture — Trace les lettres et les chiffres',
  'FR-5': 'Français — Lis et touche l\'image', 'FR-6': 'Français — La phrase à trou (images)',
  'FR-7': 'Français — La phrase à trou (mots écrits)', 'FR-8': 'Français — Écoute l\'histoire',
  'LO-10': 'Logique — Memory', 'EN-3': 'Anglais — Memory en anglais',
  'VO-1': 'Voix haute — Comment ça s\'appelle ?', 'VO-2': 'Voix haute — Say it in English!',
  'VO-3': 'Voix haute — Lis à voix haute', 'VO-4': 'Voix haute — Devinettes : les animaux',
  'VO-5': 'Voix haute — Devinettes : les métiers', 'VO-6': 'Voix haute — Devinettes : le sport',
  'VO-7': 'Voix haute — Devinettes : l\'espace', 'VO-8': 'Voix haute — Les saisons et la météo',
  'VO-9': 'Voix haute — Les formes et les couleurs', 'VO-10': 'Voix haute — Pays et peuples du monde',
  'VO-11': 'Voix haute — Mon pays', 'VO-12': 'Voix haute — Devinettes : la nature',
};

/** Noms courts qui tiennent sur une tuile, quand le nom complet est trop long. */
const SHORT: Record<string, string> = {
  'EN-1': 'Écoute (anglais)', 'EN-3': 'Memory anglais', 'FR-5': 'Lis et touche', 'FR-6': 'Phrase à trou',
  'FR-7': 'Phrase à lire', 'FR-8': 'L\'histoire', 'TR-2': 'Trace les lettres', 'LO-4': 'Plus ou moins',
  'LO-7': 'Formes', 'MO-4': 'Ça va ensemble',
};

/** Nom court d'un jeu (sans la catégorie) : « L'intrus », « Combien ? »… */
export const shortTitle = (id: string) => SHORT[id] ?? (TITLES[id] ?? id).split(' — ').pop() ?? id;
