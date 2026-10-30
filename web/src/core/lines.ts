import { Rng } from '../domain/models';

/**
 * Répliques du dino (spécifications §17.2). Le dino explique toujours
 * QUOI toucher : chaque consigne nomme l'objet que la main désigne.
 */
export const LINES: Record<string, string[]> = {
  hello: [
    'Coucou ! C\'est moi, Dino !',
    'Bonjour ! Je suis Dino, ton copain dinosaure !',
  ],
  welcome_back: [
    'Te revoilà ! Youpi !',
    'Coucou ! J\'avais hâte de te voir !',
    'Ah, te voilà ! On s\'amuse ?',
  ],
  'home.choose': ['Choisis un jeu ! Touche une grosse bulle.'],
  'home.english': ['Le drapeau, c\'est pour jouer en anglais !'],
  'home.world': ['La planète, c\'est pour découvrir le monde !'],
  'home.age': ['Le gâteau, c\'est pour changer ton âge.'],
  'age.ask': ['Quel âge as-tu ? Touche le gâteau avec ton âge !'],
  'age.3': ['Trois ans ! Super !'],
  'age.4': ['Quatre ans ! Super !'],
  'age.5': ['Cinq ans ! Génial !'],
  'age.6': ['Six ans ! Génial !'],
  'age.7': ['Sept ans ! Waouh !'],
  'intro.EN-1': [
    'Je dis un mot en anglais. Touche la bonne image !',
    'Écoute bien le mot anglais, et touche la bonne image !',
  ],
  'intro.MO-1': [
    'Écoute bien, et touche ce que je te demande !',
    'Je vais te demander quelque chose. Touche la bonne image !',
  ],
  tutorial: ['Regarde, je te montre ! On touche la bonne image, comme ça !'],
  tutorial_your_turn: ['À toi maintenant !'],
  correct: ['Bravo !', 'Exactement !', 'Trop fort !', 'Tu as l\'œil !', 'Super !', 'Bien joué !', 'Ouiii !', 'Génial !'],
  wrong: [
    'Oups ! Essaie encore !',
    'Hmm, regarde bien…',
    'Pas celle-là ! Cherche encore !',
    'Presque ! Encore un essai !',
  ],
  hint: ['Je t\'aide : touche celle qui brille !', 'Regarde, c\'est celle que je montre !'],
  streak: ['Et de trois ! Tu es en feu !', 'Trois d\'affilée ! Incroyable !'],
  idle: ['Tu es là ? Touche une image !', 'Je t\'attends ! Touche une image !'],
  ear: ['Pour réécouter, touche l\'oreille !'],
  review: ['Tu connais déjà tout ici ! On révise ?'],
  series_perfect: ['Waouh, tout juste ! Tu es une vraie star !', 'Sans faute ! Je danse de joie !'],
  series_great: ['Incroyable ! Presque tout juste !', 'Quel talent !'],
  series_good: ['Très bien joué ! Tu progresses vite !', 'Bravo, tu en as trouvé plein !'],
  series_ok: ['Bien joué ! On continue à s\'entraîner ?', 'C\'est bien ! Chaque partie te fait progresser !'],
  series_encourage: [
    'C\'était difficile, hein ? Moi aussi j\'apprends !',
    'Ce n\'est pas grave ! On apprend en jouant !',
  ],
  'end.feed': [
    'Regarde tous ces fruits ! Prends-en un, et glisse-le dans ma bouche !',
    'Miam ! Donne-moi tes fruits : glisse-les jusqu\'à ma bouche !',
  ],
  'end.feed_again': ['Encore un ! Glisse-le dans ma bouche !'],
  'end.nothing': ['Pas de fruit cette fois. On rejoue pour en gagner ?'],
  'end.again': ['Touche le gros bouton vert pour rejouer !', 'On rejoue ? Touche le bouton vert !'],
  'fruit.won': ['Un fruit pour moi !', 'Miam, un fruit !'],
  eating: ['Miam miam !', 'Croc ! Délicieux !', 'Hmmm, c\'est bon !', 'Encore, s\'il te plaît !'],
  full: ['J\'ai le ventre tout plein ! Je garde le reste pour plus tard !'],
  level_up: ['Oh ! Je grandis ! Merci de bien t\'occuper de moi !', 'Regarde, je suis plus grand !'],
  tickle: ['Hihi, ça chatouille !', 'Hahaha ! Arrête !', 'Hihihi !'],
  start: ['Touche-moi pour me réveiller !'],
};

/** Choisit une variante sans répéter les dernières (spécifications §3.4). */
export class LinePicker {
  private history = new Map<string, number[]>();

  constructor(private rng: Rng, private lines = LINES) {}

  pick(group: string): string {
    const variants = this.lines[group];
    if (!variants?.length) return '';
    const history = this.history.get(group) ?? [];
    const avoid = new Set(history.slice(0, Math.min(5, variants.length - 1)));
    const allowed = variants.map((_, i) => i).filter((i) => !avoid.has(i));
    const index = allowed[Math.floor(this.rng() * allowed.length)];
    this.history.set(group, [index, ...history].slice(0, 5));
    return variants[index];
  }
}
