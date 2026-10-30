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
    'Salut, champion ! Je t\'attendais !',
    'Hourra, mon copain est là !',
    'Bonjour ! J\'ai rêvé de fruits toute la nuit !',
  ],
  'home.play': [
    'Touche le gros bouton vert : je te pose des questions de tous les jeux !',
    'On joue ? Touche le gros bouton vert !',
    'Le gros bouton vert, c\'est pour jouer ! Vas-y, touche-le !',
    'Prêt pour l\'aventure ? Touche le gros bouton vert !',
  ],
  'home.categories': ['Et pour choisir ton jeu, touche le petit bouton.'],
  'random.go': [
    'Surprise ! C\'est parti !',
    'Allez, on joue !',
    'Youpi, on joue !',
    'En route pour l\'aventure !',
    'Attention… c\'est parti !',
  ],
  'home.choose': ['Choisis un jeu ! Touche une grosse bulle.'],
  'home.EN-1': ['Le drapeau : des mots en anglais !'],
  'home.MO-1': ['La planète : montre-moi les choses du monde !'],
  'home.MO-2': ['La loupe : des devinettes !'],
  'home.LO-1': ['Le puzzle : trouve l\'intrus !'],
  'home.LO-2': ['Le boulier : on compte !'],
  'home.MO-3': ['L\'ombre : à qui est cette ombre ?'],
  'home.LO-3': ['Les flèches : quelle est la suite ?'],
  'home.LO-4': ['La balance : où y en a-t-il le plus ?'],
  'home.LO-5': ['Les chiffres : on calcule !'],
  'home.FR-1': ['Le drapeau français : les sons des mots !'],
  'home.EN-2': ['Le dix : les nombres en anglais !'],
  'home.MO-4': ['La poignée de main : qu\'est-ce qui va ensemble ?'],
  'home.MO-5': ['La règle : qui est le plus grand, en vrai ?'],
  'home.LO-6': ['Les chiffres : trouve le bon nombre !'],
  'home.FR-2': ['Les mains : on tape les syllabes !'],
  'home.FR-3': ['Le livre : on apprend à lire des mots !'],
  'home.FR-4': ['Les lettres : trouve les lettres et les syllabes !'],
  'home.FR-5': ['Les yeux : lis le mot, et trouve l\'image !'],
  'home.FR-6': ['La bulle : trouve le mot qui manque !'],
  'home.FR-7': ['La feuille : complète la phrase avec le bon mot écrit !'],
  'home.LO-7': ['La palette : les formes et les couleurs !'],
  'home.LO-8': ['Le réveil : quelle heure est-il ?'],
  'home.LO-9': ['Le billet : on compte les sous !'],
  'intro.MIX': [
    'On mélange tous les jeux ! Écoute bien chaque question.',
    'Surprise : une question de chaque jeu ! Écoute bien.',
    'Aujourd\'hui, c\'est le grand mélange ! Ouvre bien tes oreilles.',
    'Des questions de partout ! Tu es prêt ? Moi oui !',
  ],
  'short.EN-1': ['En anglais !', 'Un mot anglais !'],
  'short.MO-1': ['Montre-moi !'],
  'short.MO-2': ['Une devinette !'],
  'short.MO-3': ['Une ombre !'],
  'short.LO-1': ['Trouve l\'intrus !'],
  'short.LO-2': ['On compte !'],
  'short.LO-3': ['La suite !'],
  'short.LO-4': ['Le plus ou le moins !'],
  'short.LO-5': ['Un calcul !', 'On calcule !'],
  'short.FR-1': ['Écoute bien les sons !', 'Les sons des mots !'],
  'short.EN-2': ['Un nombre en anglais !', 'Numbers !'],
  'short.MO-4': ['Qu\'est-ce qui va ensemble ?'],
  'short.MO-5': ['Le plus grand ou le plus petit !'],
  'short.LO-6': ['Trouve le nombre !'],
  'short.FR-2': ['Tape les syllabes !'],
  'short.FR-3': ['Lis le mot !', 'On lit !'],
  'short.FR-4': ['Les lettres !', 'Lis bien !'],
  'short.FR-5': ['Lis le mot !', 'Qu\'est-ce qui est écrit ?'],
  'short.FR-6': ['Le mot qui manque !', 'Une phrase à trou !'],
  'short.FR-7': ['Complète la phrase !'],
  'short.LO-7': ['Les formes !', 'Formes et couleurs !'],
  'short.LO-8': ['Quelle heure est-il ?', 'L\'heure !'],
  'short.LO-9': ['On compte les sous !', 'La monnaie !'],
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
    'Hello ! On parle anglais ! Écoute, et touche la bonne image.',
    'C\'est l\'heure de l\'anglais ! Écoute bien le mot.',
  ],
  'intro.MO-1': [
    'Écoute bien, et touche ce que je te demande !',
    'Je vais te demander quelque chose. Touche la bonne image !',
    'On fait le tour du monde ! Trouve ce que je te demande.',
    'Ouvre grand tes yeux, et touche ce que je dis !',
  ],
  'intro.MO-2': [
    'C\'est l\'heure des devinettes ! Écoute bien, et touche la bonne image !',
    'Je te pose une devinette. Trouve la bonne image !',
    'Devine, devine ! Écoute bien mes indices.',
    'J\'ai des devinettes plein la tête ! Tu les trouves ?',
  ],
  'intro.LO-1': [
    'Regarde bien les images. Une seule n\'est pas de la même famille : trouve l\'intrus !',
    'Un intrus s\'est caché ! Trouve l\'image qui n\'est pas comme les autres.',
    'Chut… un intrus se cache. Tu le trouves ?',
  ],
  'intro.LO-2': [
    'On va compter ! Compte les fruits, et touche le bon nombre !',
    'Un, deux, trois… on compte ensemble ! Touche le bon nombre.',
    'Les fruits sont là ! Compte-les bien avec ton doigt.',
  ],
  'intro.MO-3': [
    'Regarde bien cette ombre noire. Trouve à qui elle appartient !',
    'Oh, une ombre mystérieuse ! À qui est-elle ?',
    'Les ombres jouent à cache-cache ! Trouve qui se cache derrière.',
  ],
  'intro.LO-3': [
    'Regarde bien la suite, et trouve ce qui vient après !',
    'Une suite ! Qu\'est-ce qui vient ensuite ? Réfléchis bien.',
    'Regarde comment ça recommence, et trouve la suite !',
  ],
  'intro.LO-4': [
    'Regarde bien les cartes. Trouve celle que je te demande !',
    'Compare bien les cartes ! Laquelle je cherche ?',
  ],
  'intro.LO-5': [
    'On va calculer ! Écoute bien, et touche le bon nombre !',
    'C\'est l\'heure des calculs ! Tu peux compter sur tes doigts.',
    'Plus, moins… on calcule ! Écoute bien.',
  ],
  'intro.FR-1': [
    'On joue avec les sons des mots ! Écoute bien, et touche la bonne image.',
    'Écoute bien le mot, et cherche celui qui sonne pareil !',
  ],
  'intro.EN-2': [
    'Je dis un nombre en anglais. Touche le bon nombre !',
    'One, two, three ! On compte en anglais ! Écoute bien.',
  ],
  'intro.MO-4': [
    'Certaines choses vont ensemble, comme la clé et le cadenas. Trouve ce qui va ensemble !',
    'Regarde bien l\'image, et trouve son copain !',
  ],
  'intro.MO-5': [
    'Sur les images, tout a la même taille. Mais en vrai ? Trouve celui que je demande !',
    'Attention, c\'est un piège : pense à la vraie taille des choses !',
  ],
  'intro.LO-6': ['Je dis un nombre. Trouve-le parmi les cartes !', 'Écoute bien le nombre, et touche la bonne carte !'],
  'intro.FR-2': [
    'On tape dans les mains pour chaque morceau du mot ! Pa-pi-llon : trois tapes !',
    'Les syllabes, ce sont les morceaux des mots. On les compte en tapant dans les mains !',
  ],
  'intro.FR-3': [
    'On apprend à lire ! Je dis un mot, et tu touches le mot écrit.',
    'Regarde bien les lettres de chaque mot, et trouve celui que je dis !',
  ],
  'intro.FR-4': [
    'On joue avec les lettres ! Écoute bien, et touche la bonne.',
    'Les lettres, c\'est le début de la lecture ! Trouve celle que je dis.',
  ],
  'intro.FR-5': [
    'Cette fois, je ne dis rien : c\'est toi qui lis ! Lis le mot, et touche la bonne image.',
    'Un mot est écrit. Lis-le dans ta tête, et trouve son image !',
  ],
  'intro.FR-6': [
    'Je dis une phrase, mais il manque un mot ! Touche l\'image du mot qui manque.',
    'Oh non, j\'ai oublié un mot dans ma phrase ! Tu m\'aides à le retrouver ?',
  ],
  'intro.FR-7': [
    'Il manque un mot dans la phrase. Lis bien les mots, et touche le bon !',
    'Une phrase à trou ! Trouve le mot écrit qui va dedans.',
  ],
  'intro.LO-7': [
    'On joue avec les formes et les couleurs ! Écoute bien, et touche la bonne forme.',
    'Ronds, carrés, triangles… et plein de couleurs ! Trouve celle que je dis.',
  ],
  'intro.LO-8': [
    'Regarde bien les horloges ! La petite aiguille montre l\'heure, la grande les minutes.',
    'Tic-tac ! Trouve l\'horloge qui montre l\'heure que je dis.',
  ],
  'intro.LO-9': [
    'On joue à la marchande ! Compte les pièces, et trouve la bonne somme.',
    'Des pièces et des billets ! Trouve la carte où il y a ce que je dis.',
  ],
  tutorial: ['Regarde, je te montre ! On touche la bonne image, comme ça !'],
  tutorial_your_turn: ['À toi maintenant !'],
  correct: [
    'Bravo !',
    'Exactement !',
    'Trop fort !',
    'Tu as l\'œil !',
    'Super !',
    'Bien joué !',
    'Ouiii !',
    'Génial !',
    'Champion !',
    'Tu es un as !',
    'C\'est ça !',
    'Parfait !',
    'Waouh !',
    'Tu es trop fort !',
    'Magnifique !',
    'Dans le mille !',
  ],
  wrong: [
    'Oups ! Essaie encore !',
    'Hmm, regarde bien…',
    'Pas celle-là ! Cherche encore !',
    'Presque ! Encore un essai !',
    'Ce n\'est pas grave, réessaie !',
    'Hmm, non… Réfléchis encore un peu.',
    'Oh, raté ! Tu vas trouver !',
    'Pas tout à fait ! Encore une fois !',
  ],
  hint: [
    'Je t\'aide : touche celle qui brille !',
    'Regarde, c\'est celle que je montre !',
    'Psst ! C\'est celle qui brille !',
  ],
  streak: [
    'Et de trois ! Tu es en feu !',
    'Trois d\'affilée ! Incroyable !',
    'Trois de suite ! Rien ne t\'arrête !',
    'Trois bonnes réponses ! Je suis épaté !',
  ],
  idle: [
    'Tu es là ? Touche une carte !',
    'Je t\'attends ! Touche une carte !',
    'Hé ho ! Choisis une carte !',
    'Prends ton temps, puis touche une carte.',
  ],
  touch_me: ['Pour réécouter, touche-moi !'],
  review_due: [
    'Celle-là, on l\'a déjà vue ensemble. Tu te souviens ?',
    'Une question de révision ! Je suis sûr que tu sais.',
    'On révise ! Celle-ci était difficile l\'autre jour.',
  ],
  review: [
    'Tu connais déjà tout ici ! On révise ?',
    'Tu as tout appris ! On révise un peu ?',
  ],
  series_perfect: [
    'Waouh, tout juste ! Tu es une vraie star !',
    'Sans faute ! Je danse de joie !',
    'Parfait ! Même un ptérodactyle n\'aurait pas fait mieux !',
  ],
  series_great: [
    'Incroyable ! Presque tout juste !',
    'Quel talent !',
    'Super partie ! Je suis fier de toi !',
  ],
  series_good: [
    'Très bien joué ! Tu progresses vite !',
    'Bravo, tu en as trouvé plein !',
    'Belle partie ! Tu deviens fort !',
  ],
  series_ok: [
    'Bien joué ! On continue à s\'entraîner ?',
    'C\'est bien ! Chaque partie te fait progresser !',
    'Pas mal du tout ! On réessaie ?',
  ],
  series_encourage: [
    'C\'était difficile, hein ? Moi aussi j\'apprends !',
    'Ce n\'est pas grave ! On apprend en jouant !',
    'Même les grands dinosaures se trompent ! On recommence ?',
    'C\'était dur ! La prochaine fois, ce sera plus facile.',
  ],
  'end.feed': [
    'Regarde ce panier de fruits ! Touche le panier pour me les donner !',
    'Miam ! Donne-moi le panier : touche-le !',
  ],
  'end.feed_again': ['J\'ai faim ! Touche le panier de fruits !'],
  'end.nothing': ['Pas de fruit cette fois. On rejoue pour en gagner ?'],
  'end.again': ['Touche le gros bouton vert pour rejouer !', 'On rejoue ? Touche le bouton vert !'],
  'fruit.won': ['Un fruit pour moi !', 'Miam, un fruit !'],
  eating: [
    'Miam miam !',
    'Croc ! Délicieux !',
    'Hmmm, c\'est bon !',
    'Encore, s\'il te plaît !',
    'Slurp ! Trop bon !',
    'Miam, mon préféré !',
    'Crounch ! Merci !',
  ],
  full: ['J\'ai le ventre tout plein ! Je garde le reste pour plus tard !'],
  level_up: [
    'Oh ! Je grandis ! Merci de bien t\'occuper de moi !',
    'Regarde, je suis plus grand !',
    'Waouh, j\'ai encore grandi ! C\'est grâce à toi !',
  ],
  tickle: [
    'Hihi, ça chatouille !',
    'Hahaha ! Arrête !',
    'Hihihi !',
    'Oh non, pas les chatouilles !',
    'Hihi ! Encore !',
  ],
  start: ['Touche-moi pour me réveiller !'],
  parent_code: [
    'Avant de jouer, va chercher papa ou maman ! Ils doivent choisir un code secret pour moi.',
  ],
  parent_code_done: ['Merci ! Maintenant, on peut jouer ensemble !'],
  'wardrobe.intro': [
    'Fais glisser un objet jusqu\'à moi pour me le mettre !',
    'Habille-moi ! Prends un objet avec ton doigt, et pose-le sur moi.',
  ],
  'wardrobe.drag': ['Garde ton doigt sur l\'objet, et fais-le glisser jusqu\'à moi !'],
  'wardrobe.off': ['D\'accord, je l\'enlève !', 'Hop, enlevé !'],
  'wardrobe.empty': ['Mon armoire est vide ! Quand je grandis, tu gagnes un objet pour moi.'],
  'home.wardrobe': ['Le chapeau, c\'est pour m\'habiller !'],
  'gift.waiting': ['J\'ai grandi ! Touche le cadeau pour choisir un objet pour moi !'],
  'night.last': [
    'Oh là là, il commence à être tard… On fait une dernière série, et après, dodo ?',
    'Ouaaah… j\'ai sommeil. Allez, une toute dernière série !',
  ],
  'night.goodnight': [
    'C\'était la dernière série ! Merci pour cette belle journée. Bonne nuit !',
    'Bravo ! Maintenant, je vais faire de beaux rêves. Bonne nuit, à demain !',
  ],
  'night.sleep': ['Chut… je dors. Zzz… À demain !'],
  bedtime: [
    'On a bien joué aujourd\'hui ! Maintenant, je vais faire dodo. On rejoue demain ?',
    'C\'est l\'heure de me reposer ! À demain, mon copain !',
  ],
  streak5: [
    'Cinq d\'affilée ! Tu es un génie !',
    'Cinq de suite ! Je n\'en reviens pas !',
    'Cinq ! Tu es plus fort qu\'un T-rex !',
  ],
  correct_after_try: [
    'Tu as trouvé ! Tu vois, il fallait chercher !',
    'Voilà ! Tu n\'as pas abandonné, bravo !',
    'Bien vu ! Tu as réussi !',
  ],
  halfway: [
    'Déjà la moitié ! Continue !',
    'On est à la moitié ! Tu te débrouilles très bien !',
    'La moitié ! Encore quelques questions !',
  ],
  last_question: [
    'Dernière question !',
    'Et maintenant, la toute dernière !',
    'Allez, une dernière !',
  ],
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
