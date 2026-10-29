# DinoLearn — prototype V0.1 (Flutter)

Prototype du jeu décrit dans [`../docs/SPECIFICATIONS.md`](../docs/SPECIFICATIONS.md).

## Contenu du prototype
- **Dino animé** (dessin vectoriel `CustomPainter`) : respiration, clignements, bouche synchronisée
  sur la voix, réactions (joie, danse, « oups », réflexion, manger, grandir, chatouilles).
  Le contrôleur (`lib/dino/dino_controller.dart`) a la même interface que la future state machine Rive.
- **Voix** : synthèse vocale de l'appareil (`flutter_tts`), voix française pour le dino, voix anglaise
  pour les mots. Répliques variées sans répétition (`lib/audio/voice_lines.dart`).
- **Navigation sans lecture** : accueil avec 4 îles (seule l'île Anglais est ouverte), dé Surprise,
  panier, cadenas parents ; boutons retour et oreille sur chaque écran.
- **Jeu EN-1 « Écoute et touche »** (gabarit `audio_to_image`) : 40 concepts sur 3 niveaux
  (animaux, couleurs, fruits / jouets / animaux sauvages).
- **Série** de 6 à 10 questions selon l'âge, progression en empreintes, carte grisée en cas d'erreur,
  indice après 2 erreurs, relances après 8 s et 15 s d'inactivité.
- **Bilan** : étoiles, réaction du dino, aliments gagnés ; boutons Encore / Nourrir / Accueil.
- **Garde-manger** : toucher ou glisser un aliment vers le dino ; jauge de croissance sur son ventre,
  plafond quotidien, passage de niveau.
- **Logique du domaine** (`lib/domain/`) conforme aux spécifications §5–7 : difficulté adaptative,
  questions maîtrisées jamais reposées, questions à retravailler, mode révision, récompenses, XP.
- **Espace parents** minimal : verrou (chiffres écrits en lettres), âge, suivi, réinitialisation.

## Images
Les images de contenu **ne sont pas embarquées** : elles sont téléchargées (Twemoji via jsDelivr pour
le prototype) puis mises en cache sur l'appareil. Seules les icônes d'interface sont dans
`assets/ui/`. Pour pointer vers un autre serveur :

```bash
flutter run --dart-define=CONTENT_BASE_URL=https://mon-cdn.example/images/
```

Illustrations : [Twemoji](https://github.com/jdecked/twemoji) © Twitter, Inc. et contributeurs, CC-BY 4.0.

## Lancer
```bash
cd app
flutter pub get
flutter run            # appareil Android / iOS branché, ou -d chrome
flutter test           # tests du domaine et du déroulé de série
```

## Prochaines étapes (vers la V1)
- Remplacer le dino dessiné par l'animation Rive et la synthèse vocale par des voix enregistrées.
- Passer la persistance à Drift/SQLite, ajouter les profils multiples.
- Ajouter les autres mini-jeux du MVP (EN-2, FR-1, FR-2, LO-1…3, MO-1, MO-2) et les contenus sur 10 niveaux.
