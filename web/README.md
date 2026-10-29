# DinoLearn — version web (Phaser 3 + TypeScript)

Jeu jouable directement dans le navigateur d'un téléphone ou d'une tablette (portrait ou paysage).

## Ce que contient cette version
- **Le dino guide tout** : il présente chaque bulle en la montrant du bras, une main animée tapote
  l'endroit à toucher, les boutons à toucher pulsent. Relances automatiques en cas d'inactivité.
- **Menus réduits au minimum** : un œuf à toucher (débloque le son), puis 2 grosses bulles
  (anglais 🇬🇧, monde 🌍) et le panier quand il y a à manger. Aucun texte.
- **2 jeux** (gabarit « écoute et touche ») :
  - **EN-1** : le mot est dit en anglais, l'enfant touche la bonne image (7 niveaux, 85 mots) ;
  - **MO-1 « Montre-moi »** : « Montre-moi le lapin ! » (6 niveaux).
- **Tutoriel** à la première partie : le dino fait la première question à la place de l'enfant.
- **Série** de 6 à 10 questions, empreintes de progression, indice après 2 erreurs (la bonne
  carte brille et le dino la montre), récompenses, nourrissage par glisser-déposer, croissance.
- **Logique du domaine** des spécifications §5–7 (difficulté adaptative, questions maîtrisées
  jamais reposées, révision, XP, plafond quotidien) dans `src/domain/`, testée avec Vitest.

## Bibliothèques
| Besoin | Bibliothèque |
|--------|--------------|
| Moteur de jeu, animations (tweens, particules) | [Phaser 3](https://phaser.io) |
| Voix (synthèse vocale du navigateur, compatible iOS/Android) | [easy-speech](https://github.com/leaonline/easy-speech) — voix du dino aiguë (pitch 1.75) pour un rendu rigolo |
| Effets sonores générés (aucun fichier audio) | [ZzFX](https://github.com/KilledByAPixel/ZzFX) |
| Illustrations SVG | [withicons « Plush »](https://github.com/withevergrow/withicons) (MIT) via Iconify, drapeaux [circle-flags](https://github.com/HatScripts/circle-flags) (MIT) |

Le dinosaure est dessiné en pièces SVG (`src/dino/parts.ts`) assemblées et animées avec les tweens
de Phaser : respiration, clignements, bouche synchronisée sur la voix, bras qui pointe, sauts, danse.

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

Pour tester un autre âge (règle la difficulté et la longueur des séries) : ajouter `?age=6` à l'adresse.

## Mise en ligne
Le workflow `.github/workflows/deploy-web.yml` publie automatiquement le jeu sur **GitHub Pages** à
chaque push. À activer une fois : *Settings → Pages → Source : GitHub Actions*.

## Limites connues
- La voix dépend des voix installées sur l'appareil (excellente sur iPhone et Android récents ;
  sans voix française, le jeu continue mais le dino est muet).
- Sur iPhone, désactiver le mode silencieux si on n'entend rien.
