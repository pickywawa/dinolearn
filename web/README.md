# DinoLearn — version web (Phaser 3 + TypeScript)

Jeu jouable directement dans le navigateur d'un téléphone ou d'une tablette (portrait ou paysage).

## Ce que contient cette version
- **Le dino guide tout** : il présente chaque bulle en la montrant du bras, une main animée tapote
  l'endroit à toucher, les boutons à toucher pulsent. Relances automatiques en cas d'inactivité.
- **Menus réduits au minimum** : un œuf à toucher (débloque le son), le choix de l'âge (un gâteau
  par âge, avec ses bougies), puis l'accueil : un **gros bouton vert** lance un jeu au hasard, un
  **petit bouton** (mosaïque) ouvre le choix des jeux. Aucun texte.
- **Décor préhistorique animé** : volcan qui fume et entre en éruption, ptérodactyle qui traverse le
  ciel, diplodocus qui marche au loin, palmier et fougères qui se balancent.
- **5 jeux** (4 réponses, 2 pour l'anglais) :
  - **Anglais — Écoute et touche** : le mot est dit deux fois, lentement, en anglais ; l'enfant
    touche la bonne image parmi **2** ;
  - **Monde — Montre-moi** : « Montre-moi le hérisson ! », leurres de la même sous-famille dès le niveau 2 ;
  - **Monde — Devinettes** : des cris d'animaux (« Qui fait meuh ? ») aux énigmes
    (« J'ai huit bras et je vis dans la mer ») ;
  - **Logique — L'intrus** : trois images de la même famille et un intrus (facile : un fruit parmi
    des véhicules ; difficile : un légume parmi des fruits) ;
  - **Logique — Combien ?** : compter de 1 à 10 fruits et toucher le bon nombre (chiffre + points) ;
    aux niveaux difficiles, les nombres proposés sont tout proches.
  180 mots sur 10 niveaux.
- **Toucher le dino** pendant un jeu lui fait répéter la question.
- **Niveau du dino** affiché sur l'accueil (étoile), réglable avec − et + pour tester.
- **Tutoriel** à la première partie : le dino fait la première question à la place de l'enfant.
- **Série** de 6 à 10 questions. La barre de progression montre un fruit différent par question,
  gagné si la réponse est trouvée du premier coup (+ un gâteau pour un sans-faute). Indice après
  2 erreurs (la bonne carte brille et le dino la montre).
- **Fin de série** : les fruits gagnés tombent dans un panier ; l'enfant touche (ou glisse) le
  panier vers le dino, qui mange tous les fruits ; la jauge sur son ventre se remplit et il grandit. Au-delà de la limite quotidienne, les fruits sont gardés
  pour la fois suivante.
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
