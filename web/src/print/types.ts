import { Rng } from '../domain/models';

/** Ce qu'il faut savoir de l'enfant pour fabriquer une fiche à son image et à son niveau. */
export interface PrintContext {
  name: string;
  age: number;
  /** Couleur de son dino (0 à 9). */
  color: number;
  /** Objets portés par son dino. */
  worn: readonly string[];
  /** Niveau du dino. */
  level: number;
  /** Couleurs des dinos de la famille (pions du jeu de l'oie, en-têtes du loto). */
  family: { name: string; color: number }[];
  /** Niveau de difficulté atteint dans un jeu (1 à 20), d'après l'âge s'il n'a pas encore été joué. */
  gameLevel: (gameId: string) => number;
  /** Lettres capitales à retravailler (ratées dans les jeux de lettres). */
  weakLetters: string[];
  /** Date de la fiche (ms). */
  at: number;
  /** Version à colorier (sans couleurs) quand la fiche le permet. */
  lineArt: boolean;
  /** Paramètre propre à la fiche (niveau du diplôme). */
  param?: number;
}

/** Conseils pour les parents, affichés à côté de l'aperçu. */
export interface Advice {
  /** Ce que la fiche fait travailler. */
  skills: string[];
  /** Comment en parler avec l'enfant pendant l'activité. */
  talk: string;
  /** Pour prolonger sans écran. */
  further: string;
  /** Matériel. */
  material?: string;
  /** Solution, pour les parents. */
  solution?: string;
  /** Solution dessinée (labyrinthe), affichée dans l'aperçu seulement. */
  solutionSvg?: string;
}

export interface PrintSheet {
  title: string;
  /** Pages A4, en SVG. */
  pages: string[];
  advice: Advice;
}

export type Family = 'color' | 'puzzle' | 'write' | 'cut' | 'game' | 'award';

export interface PrintKind {
  id: string;
  family: Family;
  /** Nom pour les parents. */
  title: string;
  /** Ce que dit le dino quand l'enfant ouvre l'enveloppe : « un coloriage de ton dino ». */
  said: string;
  /** Image de l'enveloppe (public/img). */
  icon: string;
  minAge: number;
  /** Peut sortir d'une enveloppe (le diplôme, lui, se gagne en grandissant). */
  envelope: boolean;
  /** Une version à colorier existe (bouton dans l'aperçu). */
  lineArtOption?: boolean;
  build(ctx: PrintContext, rng: Rng): PrintSheet;
}
