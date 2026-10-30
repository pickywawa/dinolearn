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
  'home.play': [
    'Touche le gros bouton vert : je te pose des questions de tous les jeux !',
    'On joue ? Touche le gros bouton vert !',
  ],
  'home.categories': ['Et pour choisir ton jeu, touche le petit bouton.'],
  'random.go': ['Surprise ! C\'est parti !', 'Allez, on joue !', 'Youpi, on joue !'],
  'home.choose': ['Choisis un jeu ! Touche une grosse bulle.'],
  'home.EN-1': ['Le drapeau : des mots en anglais !'],
  'home.MO-1': ['La planète : montre-moi les choses du monde !'],
  'home.MO-2': ['La loupe : des devinettes !'],
  'home.LO-1': ['Le puzzle : trouve l\'intrus !'],
  'home.LO-2': ['Le boulier : on compte !'],
  'home.MO-3': ['L\'ombre : à qui est cette ombre ?'],
  'home.LO-3': ['Les flèches : quelle est la suite ?'],
  'home.LO-4': ['La balance : où y en a-t-il le plus ?'],
  'intro.MIX': [
    'On mélange tous les jeux ! Écoute bien chaque question.',
    'Surprise : une question de chaque jeu ! Écoute bien.',
  ],
  'short.EN-1': ['En anglais !', 'Un mot anglais !'],
  'short.MO-1': ['Montre-moi !'],
  'short.MO-2': ['Une devinette !'],
  'short.MO-3': ['Une ombre !'],
  'short.LO-1': ['Trouve l\'intrus !'],
  'short.LO-2': ['On compte !'],
  'short.LO-3': ['La suite !'],
  'short.LO-4': ['Le plus ou le moins !'],
  'home.level': ['L\'étoile, c\'est mon niveau !'],
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
  'intro.MO-2': [
    'C\'est l\'heure des devinettes ! Écoute bien, et touche la bonne image !',
    'Je te pose une devinette. Trouve la bonne image !',
  ],
  'intro.LO-1': [
    'Regarde bien les images. Une seule n\'est pas de la même famille : trouve l\'intrus !',
  ],
  'intro.LO-2': [
    'On va compter ! Compte les fruits, et touche le bon nombre !',
  ],
  'intro.MO-3': ['Regarde bien cette ombre noire. Trouve à qui elle appartient !'],
  'intro.LO-3': ['Regarde bien la suite de fruits, et trouve celui qui vient après !'],
  'intro.LO-4': ['Regarde bien les cartes, et compte les fruits. Où y en a-t-il le plus ?'],
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
  idle: ['Tu es là ? Touche une carte !', 'Je t\'attends ! Touche une carte !'],
  touch_me: ['Pour réécouter, touche-moi !'],
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
    'Regarde ce panier de fruits ! Touche le panier pour me les donner !',
    'Miam ! Donne-moi le panier : touche-le !',
  ],
  'end.feed_again': ['J\'ai faim ! Touche le panier de fruits !'],
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
