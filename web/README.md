# DinoLearn — version web (Phaser 3 + TypeScript)

Jeu éducatif pour les enfants de 3 à 7 ans qui ne savent pas encore lire, jouable directement dans
le navigateur d'un téléphone ou d'une tablette (portrait ou paysage). Tout passe par la voix et les
images, autour d'un dino qui parle, guide, encourage et grandit quand on le nourrit.

En ligne : https://pickywawa.github.io/dinolearn/

## Pour l'enfant
- **Le dino guide tout** : il présente chaque bouton en le montrant du bras, une main animée tapote
  l'endroit à toucher, les boutons à toucher pulsent, et il relance l'enfant s'il hésite. Toucher le
  dino pendant un jeu lui fait répéter la question. Il appelle l'enfant par son prénom.
- **Menus réduits au minimum, sans texte** : un œuf à faire éclore, puis l'accueil :
  - la **planète Terre**, qui tourne doucement avec ses volcans qui fument, lance une série **tout
    mélangée** (chaque question vient d'un jeu au hasard) ;
  - un **petit bouton** (mosaïque) ouvre le choix d'un jeu précis (les jeux à voix haute sont derrière
    une bulle micro) — masqué par défaut, il s'active dans l'espace parents ;
  - le **chapeau** ouvre le dressing du dino, le **cadeau** apparaît quand un objet est à choisir ;
  - avec plusieurs enfants, la **tête du dino** de l'enfant suivant passe la main.
- **L'éclosion** : l'œuf tremble ; il faut le toucher 4 fois pour le faire éclore : il se fissure un
  peu plus à chaque toucher (le téléphone vibre), puis la coquille s'ouvre en deux (vibrations) et un
  dino d'une couleur au hasard parmi 10 en sort, plus ou moins grand selon l'âge de l'enfant.
- **La présentation** : le bébé dino se présente et explique comment l'enfant va l'aider (jouer, gagner
  des fruits, le nourrir pour qu'il grandisse, l'habiller ; « Mon rêve, c'est de devenir le plus grand
  dinosaure du monde ! »). Au premier lancement, il demande ensuite à l'enfant **son prénom et son âge,
  à voix haute** (gros bouton micro ; sans micro, l'âge se choisit avec des gâteaux), puis de donner le
  téléphone à un parent : la fiche de l'enfant est **déjà remplie**, le parent corrige si besoin et
  crée son code.
- **Un dino vivant** : il respire, cligne des yeux, parle (la bouche suit la voix, mot par mot),
  salue, bâille, rugit, saute, danse, fait une pirouette pour un sans-faute.
- **Décor préhistorique interactif** : volcan qui fume et entre en éruption quand on le touche,
  ptérodactyle qui fait un looping, diplodocus qui rugit, bébé T-rex, papillons, fougères. Dans le ciel
  de l'accueil passent des météorites et des oiseaux ; parfois le soleil se montre, ou un nuage apporte
  la pluie, suivie d'un arc-en-ciel. Le soir, ciel de nuit avec la lune et des étoiles filantes.
- **Les mouches** : de temps en temps, une mouche vient tourner autour du dino ; si elle passe tout
  près de sa bouche, il l'attrape d'un coup de langue (« Slurp ! »). On peut aussi la chasser du doigt.
- **Séries** de 6 à 10 questions. Une barre de fruits montre l'avancée ; chaque fruit est gagné si la
  réponse est trouvée du premier coup (+ un gâteau pour un sans-faute).
- **Fin de série** : les fruits tombent dans un panier, l'enfant le donne au dino qui mange tout ; il
  grandit (niveaux 1 à 40) et, à chaque niveau, l'enfant choisit **un cadeau parmi 4 objets**. Après
  un bon repas, il rote ou il pète (le téléphone vibre) et s'excuse (« Oups, pardon ! »). S'il attend
  trop son panier, il réclame, chaque fois autrement : ventre qui gargouille, il lorgne les fruits,
  supplie, ouvre grand la bouche…
- **Collection et dressing** : 23 objets (chapeaux, casquette, couronne, lunettes, nœud papillon,
  écharpe, capes, ailes, ballon, baguette magique…), portés partout. Le cadeau se choisit au dressing,
  et le dino ne le met pas tout seul : c'est l'enfant qui l'habille, en faisant glisser un objet sur
  lui (un chapeau remplace la casquette), et qui le déshabille en faisant glisser un objet porté loin
  de lui.
- **Décor des séries** : à chaque série, un décor tiré au hasard — fougères, palmiers, cailloux,
  montagnes au loin, et parfois un caméléon qui roule des yeux, sort la langue et change de couleur.
- **Indices** : après une erreur, quand l'enfant hésite, ou tout de suite si le jeu est difficile pour
  lui en ce moment ; après deux erreurs, la bonne carte brille et le dino la montre.
- **Musique de fond** douce, créée par le jeu, qui se fait discrète quand le dino parle.

## Les 41 jeux
Chaque jeu a 20 niveaux : 1–10 maternelle, 11–20 niveau CP (6 images, leurres piégeux, nombres
jusqu'à 100). La difficulté s'adapte toute seule ; certains jeux n'apparaissent qu'à partir d'un âge.

| Catégorie | Jeu | Dès | En bref |
|---|---|---|---|
| Anglais | Écoute et touche | 5 ans | le mot anglais, dit deux fois par une voix britannique ; 2 images, puis 4 |
| Anglais | Numbers | 5 ans | les nombres de « one » à « ninety-nine » (pièges thirteen / thirty) |
| Monde | Montre-moi | 3 ans | « Montre-moi le hérisson ! » (250 mots) |
| Monde | Devinettes | 3 ans | des cris d'animaux aux énigmes à plusieurs indices (près de 200) |
| Monde | Les ombres | 3 ans | à qui est cette ombre ? |
| Monde | Ça va ensemble | 3 ans | la clé et le cadenas, l'abeille et le miel, le phare et le bateau… |
| Monde | Le plus grand | 4 ans | en vrai, qui est le plus grand (ou le plus petit) ? |
| Monde | Mon pays | 5 ans | le pays de l'enfant : drapeau, symboles, spécialités, fête nationale, monnaie, monument, capitale, voisins |
| Français | La phrase à trou | 3 ans | « Le soir, je dors dans mon… » → l'image du lit |
| Français | La phrase à trou (mots écrits) | 5 ans | la même chose, en choisissant le mot écrit |
| Français | Écoute l'histoire | 3 ans | le dino raconte une histoire (3 phrases, puis jusqu'à 8) et pose une question ; pièges : choses entendues dans l'histoire, « en premier », « n'a PAS », compter |
| Français | Les sons | 5 ans | qu'est-ce qui rime avec « bateau » ? qui commence comme « chapeau » ? |
| Français | Les syllabes | 5 ans | on tape dans les mains (« pa-pi-llon : trois ») |
| Français | Lis le mot | 5 ans | « Trouve le mot MAMAN » : 70 mots en CAPITALES puis en écriture attachée |
| Français | Lis et touche l'image | 5 ans | le mot est écrit sans être dit : il faut le lire |
| Français | Les lettres | 5 ans | lettres (capitales, minuscules, attaché ; pièges b/d/p/q), puis syllabes |
| Écriture | Trace les formes | 3 ans | sur des pointillés, puis des points légers, puis tout seul |
| Écriture | Trace les lettres et les chiffres | 4 ans | les 26 capitales et les 10 chiffres, de la même façon |
| Logique | L'intrus | 3 ans | une seule image n'est pas de la même famille |
| Logique | Formes et couleurs | 3 ans | « le triangle bleu », « le petit cœur rouge », « le carré qui n'est pas bleu » |
| Logique | Combien ? | 3 ans | compter de 1 à 20, avec des fruits intrus |
| Logique | Le plus, le moins | 3 ans | des tas de fruits, puis des nombres écrits (24 ou 42 ?) |
| Logique | La suite | 4 ans | suites de fruits, puis de nombres (2, 4, 6… ; 100, 90, 80…) |
| Logique | Les nombres | 4 ans | « Touche le nombre soixante-douze » (pièges 27 / 72) |
| Logique | Calcul | 5 ans | additions et soustractions en images, puis écrites, compléments à 10 |
| Logique | L'heure | 5 ans | trouve le réveil qui montre « trois heures et demie », puis « quinze heures trente » |
| Logique | Memory | 3 ans | retrouver les paires d'images (le dino dit leur nom) : 6 cartes au début, jusqu'à 20 |
| Anglais | Memory en anglais | 5 ans | le memory, et chaque image retournée est dite en anglais |
| Logique | La monnaie | 5 ans | trouve les pièces et billets qui font « deux euros cinquante » |
| Voix haute | Comment ça s'appelle ? | 3 ans | l'image s'affiche, l'enfant dit son nom (après une erreur, il répète après le dino) |
| Voix haute | Say it in English! | 5 ans | dire le mot en anglais (« Répète après moi : dog ») |
| Voix haute | Lis à voix haute | 5 ans | lire un mot écrit (capitales, minuscules, attaché) |
| Voix haute | Devinettes à voix haute (9 thèmes) | 5 ans | animaux, métiers, sport, espace, saisons et météo, formes et couleurs, pays et peuples, mon pays, nature |

**Jeux à voix haute** : l'enfant touche un gros bouton micro et répond en parlant. La reconnaissance
vocale ([Vosk](https://alphacephei.com/vosk/) en WebAssembly) se fait **entièrement sur l'appareil** :
rien n'est enregistré ni envoyé, et le micro ne s'allume que pendant l'écoute. Elle ne choisit
qu'entre quelques mots (la bonne réponse, les mauvaises réponses plausibles, un « bruit »), ce qui la
rend fiable même avec une voix d'enfant. Un « pas entendu » ne compte jamais comme une erreur ; après
deux essais, les cartes reviennent et l'enfant répond au doigt. Un pack de reconnaissance par langue
(≈ 40 Mo, français et anglais) se télécharge une fois ; le français commence à se télécharger dès
l'éclosion du premier œuf, pour que l'enfant puisse dire son prénom au dino.

**Correction des tracés** (`src/domain/trace.ts`) : le modèle et le tracé sont découpés en points
tous les 1 % ; il faut couvrir 93 % du modèle, que 90 % du tracé soit près du modèle (à moins d'un
doigt environ) et ne pas gribouiller (pas plus de 2,5 fois la longueur du modèle). Sans pointillés,
le dessin est recadré sur le modèle (même centre, même taille). Le sens et l'ordre des traits ne
comptent pas. Après deux essais, la main du dino montre le tracé.

## Progression
- **Difficulté adaptative** : selon l'âge, le niveau du dino et la réussite sur les 100 dernières
  réponses (± 1 niveau par série) ; les questions réussies ne sont jamais reposées.
- **Révision espacée** : une question ratée revient le lendemain, puis 3 jours plus tard, puis une
  semaine plus tard (« Celle-là, on l'a déjà vue ensemble ! ») ; réussie les trois fois, elle est
  acquise.
- Le dino peut manger l'équivalent d'une dizaine de séries par jour ; au-delà, les fruits sont gardés.

## Fiches à imprimer (récompense de fin de journée)
Quand le temps de jeu du jour est fini (ou le soir, avant que le dino s'endorme), le dino offre
**trois enveloppes surprises**. Chacune montre ce qu'elle contient (un crayon, un dé, des ciseaux…)
et l'enfant en choisit une. Elle s'ouvre, la fiche en sort, et le dino dit de demander à un grand de
l'imprimer. Une enveloppe par jour ; sans limite de temps ni heure du coucher, elle arrive après
4 séries dans la journée. Un **diplôme** arrive aussi tous les 5 niveaux du dino.

Toutes les fiches sont **dessinées par le code** (`src/print/`), en SVG au format A4, avec **le dino
de l'enfant** (sa couleur, ses objets), son prénom, et un contenu adapté à son âge et à ses progrès
dans les jeux. La même graine redonne la même fiche ; « Autre version » en tire une nouvelle.

| Famille | Fiche | Ce qui change avec l'âge et les progrès |
|---|---|---|
| Coloriage | Coloriage de son dino, dans un paysage préhistorique, prénom en lettres creuses | plus de détails à colorier |
| Coloriage | Coloriage magique (dès 4 ans) : grille en pixels (dino, volcan, œuf) | chiffres, puis additions, puis soustractions (selon le jeu Calcul) |
| Réflexion | Labyrinthe : aider le dino à retrouver son œuf, ses fruits, son copain | de 4 × 5 à 14 × 18 cases ; solution pour les parents |
| Réflexion | Points à relier : étoile, maison, poisson, cœur, diplodocus | de 10 à 40 points (plus selon le jeu Les nombres) |
| Réflexion | Jeu des différences : la même scène deux fois | de 3 à 7 différences ; solution pour les parents |
| Écriture | Graphisme (3 ans), puis son prénom à repasser, les chiffres et les lettres ratées dans les jeux | modèle avec point de départ et ordre des traits, pointillés, puis seul |
| Découpage | Masque, puzzle (avec plateau pour les petits), dino articulé (attaches parisiennes), marionnettes à doigts, couronne à son nom | 6 à 30 pièces de puzzle ; version à colorier |
| Jeux | Jeu de l'oie du dino (dé à monter, pions des dinos de la famille), memory, loto, dominos | images → quantités → nombres → mots et calculs |
| Diplôme | Tous les 5 niveaux du dino | — |

Dans l'espace parents, l'onglet **À imprimer** liste les fiches (les nouvelles en premier, avec une
pastille). L'aperçu donne pour chaque fiche des **conseils** : ce qu'elle fait travailler, comment en
parler pendant l'activité, comment prolonger sans écran, le matériel, et la solution. Les boutons :
**Imprimer** (A4, seules les pages sortent), **Version à colorier** (fiches à découper), **Autre
version**, **Supprimer**.

## Pour les parents
- **Premier lancement** : après l'éclosion et la présentation, le dino demande à l'enfant d'aller
  chercher un parent, qui vérifie la **fiche de l'enfant** déjà remplie (prénom, âge, pays, temps de
  jeu par jour, heure du coucher, micro) puis crée un **code à 4 chiffres**.
- **Espace parents** : toucher le cadenas en haut à gauche de l'accueil, puis taper le code. Un onglet
  par enfant :
  - modifier la fiche, **ajouter un enfant** (il ouvrira son œuf en sortant) ou en supprimer un ;
  - **alterner les séries** entre les enfants (« Bravo Léa ! Maintenant, c'est au tour de Tom ! ») ;
  - niveau du dino (1 à 40) et niveau de départ de chaque jeu (ou automatique), jeux activés ;
  - temps de jeu par jour et graphique de la semaine, heure du coucher ;
  - suivi par jeu (réponses, réussite, questions acquises) et questions à réviser avec leur date ;
  - les **fiches à imprimer** gagnées par l'enfant, avec un aperçu et des conseils ;
  - micro (jeux à voix haute) et packs de reconnaissance vocale ;
  - bruitages (et vibrations), musique, test de la voix, changement du code, tout recommencer.
- **Temps de jeu** : une fois atteint, l'enfant finit sa série puis le jeu se bloque ; le code ajoute
  15 ou 30 minutes ou débloque la journée.
- **Mode nuit** : après l'heure du coucher, le dino bâille, propose une dernière série, dit bonne nuit
  et dort jusqu'au matin (le code permet de jouer encore).
- « **Code oublié ?** » : nouveau code après une question pour adulte.
- Tout est enregistré **uniquement sur l'appareil** ; aucune donnée n'est envoyée.

## Bibliothèques et crédits
| Besoin | Bibliothèque |
|--------|--------------|
| Moteur de jeu, animations (tweens, particules) | [Phaser 3](https://phaser.io) |
| Voix (synthèse vocale du navigateur, iOS/Android) | [easy-speech](https://github.com/leaonline/easy-speech) |
| Reconnaissance vocale sur l'appareil | [vosk-browser](https://github.com/ccoreilly/vosk-browser) et les petits modèles [Vosk](https://alphacephei.com/vosk/models) français et anglais (Apache 2.0) |
| Effets sonores générés (aucun fichier audio) | [ZzFX](https://github.com/KilledByAPixel/ZzFX) ; musique générée avec Web Audio |
| Illustrations (questions, fruits, objets, décor) | [Noto](https://github.com/googlefonts/noto-emoji) (Google, Apache 2.0) via Iconify |
| Monuments (tour Eiffel, statue de la Liberté, pyramide) | [OpenMoji](https://openmoji.org) (HfG Schwäbisch Gmünd, CC BY-SA 4.0) via Iconify |
| Drapeaux | [circle-flags](https://github.com/HatScripts/circle-flags) (MIT) via Iconify |
| Boutons | [withicons « Plush »](https://github.com/withevergrow/withicons) (MIT) via Iconify |
| Polices de lecture | [Andika](https://software.sil.org/andika/) (SIL, OFL) ; [Playwrite France Moderne](https://github.com/TypeTogether/Playwrite) (TypeTogether, OFL) pour l'écriture attachée |

Le dinosaure (10 couleurs) et le décor sont dessinés en SVG (`src/dino/parts.ts`) et animés avec
Phaser. Les images ne sont **pas** dans le code JavaScript : `npm run icons` extrait chaque
illustration utilisée vers `public/img/`, et le jeu les charge à la demande.

## Organisation du code
- `src/domain/` : logique pure et testée (difficulté, sélection et révision des questions,
  récompenses, croissance du dino, correction des tracés).
- `src/content/` : contenus des jeux (mots, devinettes, phrases, pays, modèles de tracé…) et
  construction des questions.
- `src/core/` : profils des enfants, progression, voix, répliques, sons, musique.
- `src/print/` : les fiches à imprimer (une page A4 en SVG par fonction, le dino sur papier, le
  décor, les conseils) ; `src/domain/printables.ts` : quand gagner une enveloppe, lesquelles proposer.
- `src/scenes/` et `src/ui/` : écrans Phaser, enveloppes, espace parents, aperçu avant impression et
  clavier du code (HTML).

## Lancer
```bash
cd web
npm install
npm run dev        # serveur local, accessible depuis le téléphone sur le même Wi-Fi (adresse « Network »)
npm run icons && npm test   # tests (Vitest) ; ils vérifient aussi que les images existent
npm run build      # version de production dans dist/
npm run voice-packs  # (facultatif) packs de reconnaissance vocale dans public/voice/ (≈ 80 Mo, non versionnés)
```

Les packs de reconnaissance vocale ne sont pas dans le dépôt : le déploiement GitHub Pages les
télécharge (modèles officiels Vosk) et les sert à côté du jeu. Sans eux, les jeux à voix haute se
jouent au doigt.

## Mise en ligne
- `.github/workflows/deploy-web.yml` publie le jeu sur **GitHub Pages** à chaque push, avec les packs
  de reconnaissance vocale (à activer une fois : *Settings → Pages → Source : GitHub Actions*).
- `.github/workflows/release.yml` crée la release (tag `v<version>` et archive du jeu) quand
  `web/RELEASE_NOTES.md` change.

## Limites connues
- La voix dépend des voix installées sur l'appareil (excellente sur iPhone et Android récents ;
  sans voix française, le jeu continue mais le dino est muet). Certaines vues web intégrées (dont
  l'aperçu dans l'appli Claude) n'ont pas de synthèse vocale.
- Sur iPhone, désactiver le mode silencieux si on n'entend rien.
- Les profils restent sur l'appareil : changer de téléphone recommence la partie.
- La vibration ne marche pas sur iPhone (Safari ne la propose pas aux pages web).
- Jeux à voix haute : la reconnaissance est moins sûre avec les plus petits et dans le bruit ; le jeu
  passe alors aux cartes. L'archive des releases ne contient pas les packs vocaux
  (`npm run voice-packs` pour un autre hébergement).
