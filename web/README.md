# DinoLearn — version web (Phaser 3 + TypeScript)

Jeu jouable directement dans le navigateur d'un téléphone ou d'une tablette (portrait ou paysage).

## Ce que contient cette version
- **Le dino guide tout** : il présente chaque bulle en la montrant du bras, une main animée tapote
  l'endroit à toucher, les boutons à toucher pulsent. Relances automatiques en cas d'inactivité.
- **Menus réduits au minimum** : un œuf à toucher (débloque le son), le choix de l'âge (un gâteau
  par âge, avec ses bougies), puis l'accueil : un **gros bouton vert** lance une série **tout
  mélangée** (chaque question vient d'un jeu au hasard), un **petit bouton** (mosaïque) ouvre le
  choix d'un jeu précis. Aucun texte.
- **Décor préhistorique animé et interactif** : volcan qui fume et entre en éruption (aussi quand on
  le touche), ptérodactyle qui fait un looping, diplodocus au loin, bébé T-rex qui sort de derrière
  la colline, papillons, palmier et fougères. Le dino salue, bâille, rugit, regarde autour de lui,
  saute, fait une pirouette pour un sans-faute.
- **38 jeux** (dont 12 à voix haute), 20 niveaux de difficulté : 1–10 maternelle, 11–20 niveau CP (dino niveaux 21 à 40,
  avec 6 images, des leurres piégeux et des nombres jusqu'à 100). Certains jeux n'apparaissent qu'à
  partir d'un âge : anglais, calcul, lecture, sons et syllabes dès 5 ans ; suites, nombres et tailles dès 4 ans.
  - **Anglais — Écoute et touche** : le mot est dit deux fois par une voix britannique (2 images, 4 au CP) ;
  - **Anglais — Numbers** : les nombres en anglais, de « one » à « ninety-nine » (pièges thirteen / thirty) ;
  - **Monde — Montre-moi** : « Montre-moi le hérisson ! » ;
  - **Monde — Devinettes** : des cris d'animaux aux énigmes à plusieurs indices (près de 200 devinettes) ;
  - **Monde — Les ombres** : à qui est cette ombre ?
  - **Monde — Ça va ensemble** : la clé et le cadenas, l'abeille et le miel, le phare et le bateau… ;
  - **Monde — Le plus grand** : en vrai, qui est le plus grand (ou le plus petit) ? Les images ont toutes
    la même taille ;
  - **Français — Les sons** : qu'est-ce qui rime avec « bateau » ? qu'est-ce qui commence comme « chapeau » ?
  - **Français — Les syllabes** : on tape dans les mains (« pa-pi-llon : trois ») ; au CP, quel mot a
    trois syllabes ?
  - **Français — Lis le mot** : « Trouve le mot MAMAN » ; 70 mots, en CAPITALES puis en écriture
    attachée (police scolaire Playwrite France Moderne), avec des leurres de plus en plus ressemblants ;
  - **Français — Les lettres** : les lettres (capitales, minuscules, attaché ; pièges b/d/p/q), puis les
    syllabes (MA, LI… puis CHOU, MOI, PAN) ;
  - **Français — Lis et touche l'image** : le mot est écrit sans être dit (CAPITALES puis attaché),
    il faut le lire pour trouver son image ;
  - **Français — La phrase à trou** : « Le soir, je dors dans mon… » → l'image du lit (dès 3 ans) ;
    variante dès 5 ans : la phrase est aussi écrite et on choisit le mot écrit ;
  - **Monde — Mon pays** (dès 5 ans) : le pays choisi par les parents (France, Belgique, Suisse, Canada,
    Luxembourg) : drapeau (puis drapeaux qui se ressemblent), symboles, spécialités, fête nationale, monnaie,
    monument (tour Eiffel…), l'Hexagone, la capitale (écrite, à lire), les pays voisins ;
  - **Écriture — Trace les formes / les lettres et les chiffres** : avec le doigt, sur des pointillés
    (départ numéroté), puis sur des points légers, puis tout seul à côté d'un modèle. Le tracé est
    corrigé avec tolérance (couverture du modèle, précision, pas de gribouillis ; le sens ne compte pas) ;
    après deux essais, le dino montre comment faire ;
  - **Logique — L'intrus** : une seule image n'est pas de la même famille (mots ambigus exclus) ;
  - **Logique — Formes et couleurs** : « le triangle bleu », puis les pièges (même forme, autre
    couleur), les tailles (« le petit cœur rouge ») et « le carré qui n'est pas bleu » ;
  - **Logique — L'heure** : plusieurs réveils à aiguilles, touche celui qui montre « trois heures et
    demie » (heures pile, demies, quarts, minutes de 5 en 5, puis « quinze heures trente ») ;
  - **Logique — La monnaie** : des cartes de pièces et billets en euros, trouve celle qui fait la somme
    dite par le dino (de 1 € à 30 €, puis centimes et sommes mêlées) ;
  - **Logique — Combien ?** : compter de 1 à 20, avec d'autres fruits mélangés aux niveaux difficiles ;
  - **Logique — Les nombres** : « Touche le nombre soixante-douze » (pièges 27 / 72) ;
  - **Logique — La suite** : suites de fruits (AB… ABCCB), puis de nombres (2, 4, 6… ; 100, 90, 80…) ;
  - **Logique — Le plus, le moins** : des tas de fruits, puis des nombres écrits (24 ou 42 ?) ;
  - **Logique — Calcul** : additions et soustractions en images, puis écrites, compléments à 10,
    passage de la dizaine.
- **12 jeux à voix haute** (micro autorisé dans l'espace parents) : l'enfant répond en parlant, en touchant
  un gros bouton micro. La reconnaissance vocale ([Vosk](https://alphacephei.com/vosk/) en WebAssembly) se fait
  **entièrement sur l'appareil** : rien n'est enregistré ni envoyé. Elle ne choisit qu'entre quelques mots
  (la bonne réponse, les mauvaises réponses plausibles, « bruit »), ce qui la rend fiable même avec une voix
  d'enfant. Un « pas entendu » ne compte jamais comme une erreur ; après deux essais, les cartes reviennent
  et l'enfant répond au doigt. Les jeux sont rangés derrière une bulle micro dans le choix des jeux :
  - **Comment ça s'appelle ?** (dès 3 ans) : l'image s'affiche, l'enfant dit son nom ; après une erreur, le
    dino le dit et l'enfant répète ;
  - **Say it in English!** : dire le mot en anglais (« Répète après moi : dog ») ;
  - **Lis à voix haute** : lire un mot écrit (CAPITALES, minuscules, attaché) ;
  - **Devinettes à voix haute**, par thème : les animaux, les métiers, le sport, l'espace, les saisons et la
    météo, les formes et les couleurs, les pays et les peuples du monde (habitants, langues), mon pays
    (capitale, habitants, langues, spécialités, fête nationale, voisins), la nature.
  Un pack de reconnaissance par langue (≈ 40 Mo), facultatif, se télécharge depuis l'espace parents.
- **Révision espacée** : une question ratée revient le lendemain, puis 3 jours plus tard, puis une
  semaine plus tard (le dino dit « Celle-là, on l'a déjà vue ensemble ! ») ; réussie les trois fois,
  elle est acquise. L'espace parents montre quand chaque question reviendra.
- **Indices** : après une erreur, quand l'enfant hésite, ou tout de suite si le jeu est difficile pour
  lui en ce moment (« Indice : c'est un animal de la ferme », « Indice : qui fait meuh ? »).
- **Toucher le dino** pendant un jeu lui fait répéter la question.
- **Niveau du dino** affiché sur l'accueil (étoile).
- **Mode nuit** : après l'heure du coucher choisie par les parents, le ciel devient nuit, le dino bâille
  et propose une dernière série, puis il dit bonne nuit et dort jusqu'au matin (le code parent permet de
  jouer encore).
- **Musique de fond** douce, créée par le jeu (aucun fichier), qui se fait discrète quand le dino parle ;
  bouton note de musique sur l'accueil et réglage dans l'espace parents.
- **Code parent** : créé au premier lancement (le dino demande à l'enfant d'aller chercher un parent),
  avec le temps de jeu et le pays de l'enfant ; il protège l'espace parents et débloque le jeu quand le temps du jour est fini (+15 min, +30 min ou
  illimité aujourd'hui). « Code oublié ? » : nouveau code après une question pour adulte.
- **Collection** : à chaque niveau gagné, l'enfant choisit un cadeau parmi 4 objets (23 : chapeaux,
  casquette, couronne, lunettes, nœud papillon, écharpe, capes, ailes, ballon, baguette magique…). Le dino
  les porte partout. Le chapeau en haut de l'accueil ouvre le dressing : le dino en gros plan, on fait
  glisser un objet sur lui pour le lui mettre (un chapeau remplace la casquette…), on touche un objet
  porté pour l'enlever.
- **Espace parents** : rester appuyé sur le cadenas de l'accueil, puis glisser vers le haut (un texte
  explique le geste), puis taper le code parent. On y règle l'âge, le niveau du dino (1 à 40) et le niveau de chaque jeu, on
  active ou désactive des jeux, on fixe un temps de jeu par jour (le dino va ensuite se coucher), on
  suit la progression par jeu, le temps de jeu de la semaine et les questions à retravailler, on coupe
  les bruitages, on teste la voix et on peut tout recommencer. Tout reste sur l'appareil.
- **Tutoriel** à la première partie : le dino fait la première question à la place de l'enfant.
- **Série** de 6 à 10 questions. La barre de progression montre un fruit différent par question,
  gagné si la réponse est trouvée du premier coup (+ un gâteau pour un sans-faute). Indice après
  2 erreurs (la bonne carte brille et le dino la montre).
- **Fin de série** : les fruits gagnés tombent dans un panier ; l'enfant touche (ou glisse) le
  panier vers le dino, qui mange tous les fruits ; la jauge sur son ventre se remplit et il grandit.
  Il peut manger l'équivalent d'une dizaine de séries par jour ; au-delà, les fruits sont gardés.
- **Logique du domaine** des spécifications §5–7 (difficulté adaptative, questions maîtrisées
  jamais reposées, révision, XP, plafond quotidien) dans `src/domain/`, testée avec Vitest.

## Bibliothèques
| Besoin | Bibliothèque |
|--------|--------------|
| Moteur de jeu, animations (tweens, particules) | [Phaser 3](https://phaser.io) |
| Voix (synthèse vocale du navigateur, compatible iOS/Android) | [easy-speech](https://github.com/leaonline/easy-speech) — voix du dino naturelle, à peine plus aiguë (pitch 1.2) ; la bouche ne bouge que pendant le son, mot par mot |
| Reconnaissance vocale sur l'appareil (jeux à voix haute) | [vosk-browser](https://github.com/ccoreilly/vosk-browser) (Apache 2.0) et les petits modèles [Vosk](https://alphacephei.com/vosk/models) français et anglais (Apache 2.0) |
| Effets sonores générés (aucun fichier audio) | [ZzFX](https://github.com/KilledByAPixel/ZzFX) |
| Illustrations SVG (questions, fruits, décor) | [Noto](https://github.com/googlefonts/noto-emoji) (Google, Apache 2.0) via Iconify |
| Monuments (tour Eiffel, statue de la Liberté, pyramide) | [OpenMoji](https://openmoji.org) (HfG Schwäbisch Gmünd, CC BY-SA 4.0) via Iconify |
| Drapeaux | [circle-flags](https://github.com/HatScripts/circle-flags) (MIT) via Iconify |
| Boutons, drapeaux | [withicons « Plush »](https://github.com/withevergrow/withicons) (MIT), [circle-flags](https://github.com/HatScripts/circle-flags) (MIT) |

Le dinosaure et le décor (volcan, fougères, ptérodactyle) sont dessinés en SVG (`src/dino/parts.ts`)
et animés avec les tweens et particules de Phaser : respiration, clignements, bouche qui suit la voix,
bras qui pointe, sauts, danse, mastication.

Les images ne sont **pas** dans le code JavaScript : `npm run icons` extrait chaque illustration
utilisée vers `public/img/` et le jeu les charge à la demande, série par série.

## Lancer
```bash
cd web
npm install
npm run dev        # serveur local, accessible depuis le téléphone sur le même Wi-Fi (adresse « Network »)
npm test           # tests du domaine et du déroulé de série
npm run build      # version de production dans dist/
npm run voice-packs  # (facultatif) packs de reconnaissance vocale dans public/voice/ (≈ 80 Mo, non versionnés)
```

Les packs de reconnaissance vocale ne sont pas dans le dépôt : le déploiement GitHub Pages les
télécharge (modèles officiels Vosk) et les sert à côté du jeu. Sans eux, les jeux à voix haute se
jouent au doigt.

L'âge (3 à 7 ans) se choisit au premier lancement et se change avec le petit gâteau de l'accueil ;
il règle la difficulté de départ et la longueur des séries (`?age=6` dans l'adresse fonctionne aussi).

## Mise en ligne
Le workflow `.github/workflows/deploy-web.yml` publie automatiquement le jeu sur **GitHub Pages** à
chaque push. À activer une fois : *Settings → Pages → Source : GitHub Actions*.

## Limites connues
- La voix dépend des voix installées sur l'appareil (excellente sur iPhone et Android récents ;
  sans voix française, le jeu continue mais le dino est muet).
- Sur iPhone, désactiver le mode silencieux si on n'entend rien.
- Jeux à voix haute : la reconnaissance est moins sûre avec les plus petits (prononciation encore
  approximative) et dans le bruit ; le jeu passe alors aux cartes. L'archive des releases ne contient
  pas les packs vocaux (`npm run voice-packs` pour un autre hébergement).
