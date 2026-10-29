## DinoLearn 0.2.0 — jeu web mobile (Phaser 3 + TypeScript)

Première version jouable dans le navigateur d'un téléphone ou d'une tablette, pour les 3–7 ans.

### Contenu
- **Le dino guide tout** : il présente chaque bulle en la montrant du bras, une main animée tapote
  l'endroit à toucher, relances automatiques si l'enfant ne fait rien. Aucun texte à lire.
- **Deux jeux** :
  - *Anglais* : le mot est dit en anglais, l'enfant touche la bonne image ;
  - *Monde* : « Montre-moi le lapin ! ».
- 85 mots illustrés (pack SVG withicons « Plush », MIT), 6 à 7 niveaux par jeu.
- Tutoriel à la première partie, indice après 2 erreurs, séries de 6 à 10 questions selon l'âge.
- Récompenses (étoiles, aliments), nourrissage par glisser-déposer, dino qui grandit
  (limite de nourriture par jour).
- Difficulté adaptative : niveau du dino, âge et réussite des 100 dernières réponses ;
  une question réussie n'est plus reposée.
- Voix du dino par la synthèse vocale de l'appareil (easy-speech), bruitages ZzFX.

### Installer / tester
- Archive `dinolearn-web-v0.2.0.zip` : le jeu compilé, à déposer sur n'importe quel hébergement
  web statique.
- Ou en local : `cd web && npm install && npm run dev`.

### Limites connues
- La voix dépend des voix installées sur l'appareil ; certaines vues web intégrées (dont
  l'aperçu dans l'appli Claude) n'ont pas de synthèse vocale.
- Pas encore d'espace parents (l'âge se règle avec `?age=6` dans l'adresse).
