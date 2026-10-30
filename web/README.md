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
- **8 jeux** (4 réponses, 2 pour l'anglais), 250 mots sur 10 niveaux :
  - **Anglais — Écoute et touche** : le mot est dit deux fois, lentement, par une voix britannique ;
  - **Monde — Montre-moi** : « Montre-moi le hérisson ! » ;
  - **Monde — Devinettes** : des cris d'animaux aux énigmes (plus de 150 devinettes) ;
  - **Monde — Les ombres** : à qui est cette ombre ?
  - **Logique — L'intrus** : trois images de la même famille et un intrus (mots ambigus exclus) ;
  - **Logique — Combien ?** : compter de 1 à 10 ; aux niveaux difficiles, d'autres fruits sont mélangés ;
  - **Logique — La suite** : quel fruit vient après (AB, AAB, ABC… jusqu'à ABCCB) ;
  - **Logique — Le plus, le moins** : où y a-t-il le plus (ou le moins) de fruits ?
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
| Voix (synthèse vocale du navigateur, compatible iOS/Android) | [easy-speech](https://github.com/leaonline/easy-speech) — voix du dino aiguë (pitch 1.75) pour un rendu rigolo |
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
