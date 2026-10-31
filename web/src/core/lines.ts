import { Rng } from '../domain/models';

/**
 * Répliques du dino (spécifications §17.2). Le dino explique toujours
 * QUOI toucher : chaque consigne nomme l'objet que la main désigne.
 */
export const LINES: Record<string, string[]> = {
  hello: [
    'Coucou {name} ! C\'est moi, ton dino !',
    'Bonjour {name} ! On va bien s\'amuser ensemble !',
  ],
  welcome_back: [
    'Te revoilà, {name} ! Youpi !',
    'Coucou {name} ! J\'avais hâte de te voir !',
    'Ah, te voilà ! On s\'amuse ?',
    'Salut {name}, mon champion ! Je t\'attendais !',
    'Hourra, mon copain est là !',
    'Bonjour {name} ! J\'ai rêvé de fruits toute la nuit !',
  ],
  'home.play': [
    'Touche la planète Terre : on part faire le tour du monde des jeux !',
    'On joue ? Touche la planète !',
    'La planète qui tourne, c\'est pour jouer ! Vas-y, touche-la !',
    'Prêt pour l\'aventure, {name} ? Touche la planète !',
  ],
  'home.categories': ['Et pour choisir ton jeu, touche le petit bouton.'],
  'random.go': [
    'Surprise ! C\'est parti !',
    'Décollage ! On fait le tour du monde !',
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
  'home.FR-8': ['Les livres : écoute mes histoires !'],
  'home.LO-10': ['Les cartes : le memory !'],
  'home.EN-3': ['Le joker : le memory en anglais !'],
  'home.FR-7': ['La feuille : complète la phrase avec le bon mot écrit !'],
  'home.LO-7': ['La palette : les formes et les couleurs !'],
  'home.LO-8': ['Le réveil : quelle heure est-il ?'],
  'home.LO-9': ['Le billet : on compte les sous !'],
  'home.TR-1': ['Le crayon : on trace des formes !'],
  'home.TR-2': ['La main qui écrit : on trace des lettres et des chiffres !'],
  'home.MO-6': ['La carte : des questions sur ton pays !'],
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
  'short.LO-10': ['Le memory !'],
  'short.EN-3': ['Memory en anglais !'],
  'short.FR-8': ['Une histoire !', 'Écoute bien l\'histoire !'],
  'short.FR-7': ['Complète la phrase !'],
  'short.LO-7': ['Les formes !', 'Formes et couleurs !'],
  'short.LO-8': ['Quelle heure est-il ?', 'L\'heure !'],
  'short.LO-9': ['On compte les sous !', 'La monnaie !'],
  'short.TR-1': ['On trace !'],
  'short.TR-2': ['On écrit !'],
  'short.MO-6': ['Une question sur ton pays !'],
  'home.level': ['L\'étoile, c\'est mon niveau !'],
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
  'intro.LO-10': [
    'On joue au memory ! Retourne deux cartes : si ce sont les mêmes images, tu gagnes la paire !',
    'Le memory ! Touche une carte, puis une autre. Retiens bien où sont les images !',
  ],
  'intro.EN-3': [
    'Memory en anglais ! Quand tu retournes une carte, je dis le mot en anglais. Trouve les paires !',
    'On joue au memory, en anglais ! Écoute bien les mots, et trouve les paires.',
  ],
  'intro.FR-8': [
    'Je vais te raconter une petite histoire. Écoute bien, et après, je te pose une question !',
    'C\'est l\'heure de l\'histoire ! Ouvre grand tes oreilles : à la fin, il y a une question.',
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
  'intro.TR-1': [
    'On dessine avec le doigt ! Commence au point vert, et suis bien les pointillés.',
    'Prends ton doigt comme un crayon, et repasse sur les petits points !',
  ],
  'intro.TR-2': [
    'On apprend à écrire ! Commence au point vert numéro un, et suis les pointillés.',
    'Ton doigt est un crayon magique ! Repasse sur les points pour écrire.',
  ],
  'intro.MO-6': [
    'On parle de ton pays ! Écoute bien, et touche la bonne image.',
    'Tu connais bien ton pays ? Je te pose des questions !',
  ],
  'trace.start': ['Pose ton doigt sur le point vert, et suis les petits points !', 'Allez, dessine avec ton doigt !'],
  'trace.continue': ['Continue, tu y es presque !', 'Il manque encore un bout. Continue !'],
  'trace.retry': ['Presque ! On efface, et on recommence ?', 'Oups, ce n\'est pas tout à fait ça. Essaie encore !'],
  tutorial: ['Regarde, je te montre ! On touche la bonne image, comme ça !'],
  tutorial_your_turn: ['À toi maintenant !'],
  correct: [
    'Bravo {name} !',
    'Bien joué, {name} !',
    'Exactement !',
    'Trop fort !',
    'Tu as l\'œil !',
    'Super !',
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
    'Waouh, tout juste ! Tu es une vraie star, {name} !',
    'Sans faute ! Je danse de joie !',
    'Parfait ! Même un ptérodactyle n\'aurait pas fait mieux !',
    'Bravo {name}, c\'est un sans-faute !',
  ],
  series_great: [
    'Incroyable ! Presque tout juste !',
    'Quel talent, {name} !',
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
  'end.nothing': ['Pas de fruit cette fois. On rejoue pour en gagner ?'],
  'end.again': ['Touche le bouton vert pour rejouer !', 'On rejoue ? Touche le bouton vert !'],
  'fly.caught': ['Slurp ! Une mouche !', 'Miam, croustillante !', 'Hop, attrapée !', 'Bzzz… plus de mouche !'],
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
  'wardrobe.off': ['D\'accord, je l\'enlève !', 'Hop, enlevé !', 'Oh, tu me l\'enlèves ?'],
  'wardrobe.empty': ['Mon armoire est vide ! Quand je grandis, tu gagnes un objet pour moi.'],
  'home.wardrobe': ['Le chapeau, c\'est pour m\'habiller !'],
  'gift.waiting': ['J\'ai grandi ! Touche le cadeau pour choisir un objet pour moi !'],
  'gift.go': ['J\'ai grandi ! Viens dans mon armoire : un cadeau t\'attend !', 'Un cadeau ! Allons vite dans mon armoire !'],
  'wardrobe.new': ['Fais-le glisser sur moi pour me le mettre !', 'Mets-le-moi : fais-le glisser jusqu\'à moi !'],
  'wardrobe.take_off': ['Pour m\'enlever un objet, fais-le glisser loin de moi.'],
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
  // ---- Jeux à voix haute ----
  'home.voice': ['Le micro : des jeux où tu réponds avec ta voix !'],
  'home.voice_choose': ['Ici, tu réponds en parlant ! Choisis un jeu.'],
  'intro.VO-1': [
    'Je te montre une image. Touche le micro, et dis-moi comment ça s\'appelle !',
    'On joue avec ta voix ! Regarde l\'image, touche le micro, et dis son nom bien fort.',
  ],
  'intro.VO-2': [
    'On parle anglais ! Touche le micro, et dis le mot en anglais.',
    'Hello ! Aujourd\'hui, c\'est toi qui parles anglais. Touche le micro, et vas-y !',
  ],
  'intro.VO-3': [
    'Un mot est écrit. Touche le micro, et lis-le moi à voix haute !',
    'C\'est toi qui lis ! Touche le micro, et dis le mot bien fort.',
  ],
  'intro.VO-4': ['Des devinettes sur les animaux ! Écoute bien, touche le micro, et donne-moi la réponse.'],
  'intro.VO-5': ['Des devinettes sur les métiers ! Écoute bien, touche le micro, et réponds-moi.'],
  'intro.VO-6': ['Des devinettes sur le sport ! Écoute bien, touche le micro, et dis-moi quel sport c\'est.'],
  'intro.VO-7': ['On part dans l\'espace ! Écoute ma devinette, touche le micro, et réponds-moi.'],
  'intro.VO-8': ['Les saisons et la météo ! Écoute bien, touche le micro, et réponds-moi.'],
  'intro.VO-9': ['Les formes et les couleurs ! Écoute bien, touche le micro, et réponds-moi.'],
  'intro.VO-10': ['On fait le tour du monde ! Écoute bien, touche le micro, et dis-moi la réponse.'],
  'intro.VO-11': ['Des questions sur ton pays ! Touche le micro, et réponds-moi.'],
  'intro.VO-12': ['Des devinettes sur la nature ! Écoute bien, touche le micro, et réponds-moi.'],
  'home.VO-1': ['La tête qui parle : dis-moi le nom des images !'],
  'home.VO-2': ['Le drapeau anglais : dis les mots en anglais !'],
  'home.VO-3': ['Le livre : lis les mots à voix haute !'],
  'home.VO-4': ['Le lion : des devinettes sur les animaux !'],
  'home.VO-5': ['Le pompier : des devinettes sur les métiers !'],
  'home.VO-6': ['Le ballon : des devinettes sur le sport !'],
  'home.VO-7': ['La fusée : des devinettes sur l\'espace !'],
  'home.VO-8': ['La feuille d\'automne : les saisons et la météo !'],
  'home.VO-9': ['La palette : les formes et les couleurs !'],
  'home.VO-10': ['La Terre : les pays et les peuples du monde !'],
  'home.VO-11': ['La carte : des questions sur ton pays !'],
  'home.VO-12': ['Le sapin : des devinettes sur la nature !'],
  'short.VO-1': ['Comment ça s\'appelle ?'],
  'short.VO-2': ['En anglais !'],
  'short.VO-3': ['Lis à voix haute !'],
  'short.VO-4': ['Un animal !'],
  'short.VO-5': ['Un métier !'],
  'short.VO-6': ['Un sport !'],
  'short.VO-7': ['L\'espace !'],
  'short.VO-8': ['La météo !'],
  'short.VO-9': ['Formes et couleurs !'],
  'short.VO-10': ['Le tour du monde !'],
  'short.VO-11': ['Ton pays !'],
  'short.VO-12': ['La nature !'],
  'voice.tap_mic': [
    'Touche le micro, et réponds-moi !',
    'À toi ! Touche le micro, et parle bien fort.',
    'Touche le micro, et dis-le moi !',
  ],
  'voice.listening': ['Je t\'écoute !', 'Vas-y, je t\'écoute !', 'J\'ouvre grand mes oreilles !'],
  'voice.unheard': [
    'Je n\'ai pas bien entendu. Touche le micro, et parle bien fort !',
    'Hmm, je n\'ai pas compris. Tu peux répéter, bien fort ?',
    'Oh, je n\'ai rien entendu ! Approche-toi, et parle plus fort.',
  ],
  'voice.wrong': ['Ce n\'est pas ça ! Essaie encore !', 'Hmm, non… Réfléchis encore !', 'Presque ! Essaie encore une fois !'],
  'voice.cards': [
    'Mes oreilles sont fatiguées ! Touche la bonne réponse avec ton doigt.',
    'On essaie autrement : touche la bonne réponse !',
  ],
  'voice.give_up': ['Le micro ne m\'entend pas bien. Pour la suite, on joue avec le doigt !'],
  'voice.loading': ['Attends, je débouche mes oreilles…', 'Une seconde, je prépare mes oreilles !'],
  'voice.no_mic': ['Oh, je n\'arrive pas à t\'entendre. On joue avec le doigt !'],
  // ---- L'œuf et la présentation (premier lancement) ----
  'egg.1': ['Toc toc ! Il y a quelqu\'un ?', 'Oh ! Ça bouge là-dedans !'],
  'egg.2': ['Encore ! Aide-moi à sortir !', 'Continue, la coquille craque !'],
  'egg.3': ['Presque ! Encore un petit coup !', 'Allez, encore une fois !'],
  'egg.hatched': ['Coucou !', 'Ouf ! Me voilà !'],
  // {color} : la couleur du dino (« vert », « violet »…).
  'hello.1': ['Bonjour {name} ! Je viens de sortir de mon œuf ! Je suis ton dino, un bébé dinosaure tout {color} !'],
  'hello.2': ['Je suis encore tout petit… et le monde est si grand ! J\'ai plein de choses à découvrir.'],
  'hello.3': ['Tu veux bien être mon ami, et m\'aider à grandir ?'],
  'hello.4': ['Ensemble, on va jouer à plein de jeux : les animaux, les couleurs, les lettres, les nombres, et même l\'anglais !'],
  'hello.5': ['À chaque bonne réponse, tu gagnes un fruit.'],
  'hello.6': ['Et après, tu me donnes les fruits à manger. Miam ! Plus je mange, plus je grandis !'],
  'hello.7': ['Quand je grandis, tu gagnes des cadeaux pour m\'habiller : des chapeaux, des lunettes, et même des capes de super-héros !'],
  'hello.8': ['Mon rêve, c\'est de devenir le plus grand dinosaure du monde ! Avec toi, je suis sûr qu\'on va y arriver !'],
  'hello.name': ['Mais d\'abord, dis-moi : comment tu t\'appelles ? Touche le micro, et dis ton prénom bien fort !'],
  'hello.name_again': ['Je n\'ai pas bien entendu. Touche le micro, et redis-moi ton prénom !'],
  'hello.name_ok': ['Enchanté, {name} ! Quel joli prénom !', 'Bonjour, {name} ! J\'adore ton prénom !'],
  'hello.name_later': ['Tu me diras ton prénom plus tard : ton papa ou ta maman va l\'écrire pour moi !'],
  'hello.age': ['Et toi, {name}, tu as quel âge ? Touche le micro, et dis-le moi !'],
  'hello.age_again': ['Je n\'ai pas bien entendu. Tu as quel âge ? Touche le micro !'],
  'hello.age_cakes': ['Alors touche le gâteau avec ton âge !'],
  'hello.mic_allow': ['Si un message apparaît sur l\'écran, demande à un grand de toucher « Autoriser » !'],
  'hello.parent': [
    'Maintenant, va donner le téléphone à ton papa ou à ta maman ! Ils vont choisir un code secret, rien que pour moi.',
  ],
  welcome_first: ['Voilà ma maison, {name} ! On va bien s\'amuser !', 'Bienvenue chez moi, {name} !'],
  // ---- Le repas ----
  burp: ['Oups ! Pardon !', 'Hihi… excusez-moi !', 'Oh ! Ça m\'a échappé ! Pardon !', 'Pardon… c\'était trop bon !'],
  fart: ['Oups… pardon !', 'Hihi, c\'est pas moi !', 'Oh là là… c\'est les fruits ! Pardon !',
    'Pardon ! Mon ventre fait des bruits rigolos !'],
  'hunger.growl': ['Oh, tu entends ? Mon ventre gargouille ! Donne-moi le panier !', 'Grrr… c\'est mon ventre qui a faim !'],
  'hunger.look': ['Mmmh… ces fruits ont l\'air délicieux… Touche le panier !', 'Je ne pense qu\'à ces fruits… Tu me les donnes ?'],
  'hunger.beg': ['S\'il te plaît, s\'il te plaît ! Donne-moi le panier !', 'Allez, {name}, s\'il te plaît ! J\'ai faim !'],
  'hunger.gape': ['Regarde, j\'ouvre grand la bouche : aaaah ! Mets les fruits dedans !'],
  'hunger.sad': ['J\'ai trop faim… je vais tomber dans les pommes ! Touche le panier !', 'Mon ventre est tout vide… Tu me donnes à manger ?'],
  'child.turn': [
    'C\'est à toi, {name} ! On joue ensemble ?',
    'Coucou {name} ! À ton tour de jouer !',
    '{name}, c\'est ton tour ! Je suis prêt !',
  ],
  'child.ask_name': [
    'Coucou ! Va chercher papa ou maman : ils doivent me dire ton prénom !',
  ],
  // Âge dit (ou choisi avec les gâteaux) pendant la présentation.
  'age.ask': ['Quel âge as-tu ? Touche le gâteau avec ton âge !'],
  'age.3': ['Trois ans ! Super !'],
  'age.4': ['Quatre ans ! Super !'],
  'age.5': ['Cinq ans ! Génial !'],
  'age.6': ['Six ans ! Génial !'],
  'age.7': ['Sept ans ! Waouh !'],
};

/**
 * Met le prénom de l'enfant dans une réplique (« Bravo {name} ! ») ; sans
 * prénom connu, il disparaît avec sa virgule (« Bravo ! »).
 */
export function withName(line: string, name: string): string {
  return name ? line.replace(/\{name\}/g, name) : line.replace(/,? ?\{name\}/g, '');
}

/** Choisit une variante sans répéter les dernières (spécifications §3.4). */
export class LinePicker {
  private history = new Map<string, number[]>();

  /** Prénom de l'enfant, glissé à la place de « {name} » dans les répliques. */
  name: () => string = () => '';

  constructor(private rng: Rng, private lines = LINES) {}

  pick(group: string): string {
    return withName(this.pickRaw(group), this.name());
  }

  private pickRaw(group: string): string {
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
