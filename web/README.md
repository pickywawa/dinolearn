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
- **15 jeux**, 20 niveaux de difficulté : 1–10 maternelle, 11–20 niveau CP (dino niveaux 21 à 40,
  avec 6 images, des leurres piégeux et des nombres jusqu'à 100). Certains jeux n'apparaissent qu'à
  partir d'un âge : anglais, calcul, sons et syllabes dès 5 ans ; suites, nombres et tailles dès 4 ans.
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
  - **Logique — L'intrus** : une seule image n'est pas de la même famille (mots ambigus exclus) ;
  - **Logique — Combien ?** : compter de 1 à 20, avec d'autres fruits mélangés aux niveaux difficiles ;
  - **Logique — Les nombres** : « Touche le nombre soixante-douze » (pièges 27 / 72) ;
  - **Logique — La suite** : suites de fruits (AB… ABCCB), puis de nombres (2, 4, 6… ; 100, 90, 80…) ;
  - **Logique — Le plus, le moins** : des tas de fruits, puis des nombres écrits (24 ou 42 ?) ;
  - **Logique — Calcul** : additions et soustractions en images, puis écrites, compléments à 10,
    passage de la dizaine.
- **Indices** : après une erreur, quand l'enfant hésite, ou tout de suite si le jeu est difficile pour
  lui en ce moment (« Indice : c'est un animal de la ferme », « Indice : qui fait meuh ? »).
- **Toucher le dino** pendant un jeu lui fait répéter la question.
- **Niveau du dino** affiché sur l'accueil (étoile), réglable avec − et + pour tester.
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
| Effets sonores générés (aucun fichier audio) | [ZzFX](https://github.com/KilledByAPixel/ZzFX) |
| Illustrations SVG (questions, fruits, décor) | [Noto](https://github.com/googlefonts/noto-emoji) (Google, Apache 2.0) via Iconify |
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
```

L'âge (3 à 7 ans) se choisit au premier lancement et se change avec le petit gâteau de l'accueil ;
il règle la difficulté de départ et la longueur des séries (`?age=6` dans l'adresse fonctionne aussi).

## Mise en ligne
Le workflow `.github/workflows/deploy-web.yml` publie automatiquement le jeu sur **GitHub Pages** à
chaque push. À activer une fois : *Settings → Pages → Source : GitHub Actions*.

## Limites connues
- La voix dépend des voix installées sur l'appareil (excellente sur iPhone et Android récents ;
  sans voix française, le jeu continue mais le dino est muet).
- Sur iPhone, désactiver le mode silencieux si on n'entend rien.
