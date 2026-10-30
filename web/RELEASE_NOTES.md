## DinoLearn 0.5.0 — questions mélangées, indices, 8 jeux

### Nouveautés
- **Questions au hasard** : le gros bouton vert lance une série « tout mélangé » — chaque question
  vient d'un jeu différent (jamais deux fois le même de suite) ; le dino annonce le jeu à chaque
  changement. Chaque jeu garde son propre niveau.
- **3 nouveaux jeux** :
  - **Les ombres** (Monde) : retrouver l'objet à partir de sa silhouette ;
  - **La suite** (Logique) : trouver le fruit qui continue le motif (de AB jusqu'à ABCCB) ;
  - **Le plus / le moins** (Logique) : quel tas a le plus de fruits, puis le moins.
- **Indices** : après une erreur, une hésitation, ou si les dernières réponses étaient difficiles,
  le dino donne la famille (« c'est un fruit… ») puis une devinette.
- **Plus difficile** : 71 nouveaux mots (niveaux 7 à 10), 35 nouvelles devinettes, fruits
  mélangés dans « Combien ? » à partir du niveau 7.
- **L'intrus** sans ambiguïté : familles revues, mots ambigus exclus.
- **Le dino mange 5 fois plus** avant d'être rassasié.
- **Voix anglaise** britannique, lente.
- **Animations** : le dino tourne, bâille, rugit, saute, fait coucou ; à l'accueil, le volcan
  entre en éruption, le grand dino rugit et le ptérodactyle fait une boucle quand on les touche,
  plus un bébé T-rex et des papillons.

### Installer / tester
- En ligne : https://pickywawa.github.io/dinolearn/
- Archive `dinolearn-web-v0.5.0.zip` : le jeu compilé, pour tout hébergement web statique.
- En local : `cd web && npm install && npm run dev`.

### Limites connues
- La voix dépend des voix installées sur l'appareil ; certaines vues web intégrées (dont l'aperçu
  dans l'appli Claude) n'ont pas de synthèse vocale.
- Pas encore d'espace parents.
