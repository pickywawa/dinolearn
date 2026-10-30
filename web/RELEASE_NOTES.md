## DinoLearn 0.6.0 — 26 jeux, lecture et écriture, plusieurs enfants

### Pour la famille
- **Plusieurs enfants** : au premier lancement, un parent crée un code à 4 chiffres puis la fiche de
  l'enfant (prénom, âge, pays, temps de jeu, heure du coucher). L'enfant fait éclore son œuf : un dino
  d'une couleur au hasard parmi 10, plus ou moins grand selon son âge, qui l'appelle par son prénom.
  On ajoute d'autres enfants dans l'espace parents ; les séries peuvent **alterner** entre eux.
- **Espace parents** (appui long sur le cadenas puis glisser vers le haut, puis le code) : fiche de
  chaque enfant, niveau du dino et de chaque jeu, jeux activés, suivi, questions à réviser, sons.
- **Temps de jeu par jour** : le jeu se bloque une fois le temps atteint ; le code ajoute du temps.
- **Mode nuit** : après l'heure du coucher, une dernière série, puis le dino s'endort.
- **Musique de fond** douce, avec un bouton pour la couper.
- L'écran de choix de l'âge et le gâteau de l'accueil disparaissent : l'âge est dans la fiche.

### Nouveaux jeux (26 en tout, 20 niveaux chacun, jusqu'au niveau CP)
- **Lecture** : Lis le mot (capitales puis écriture attachée), Lis et touche l'image, Les lettres
  et syllabes, La phrase à trou (en images dès 3 ans, en mots écrits dès 5 ans), Les sons, Les syllabes.
- **Écriture** : Trace les formes, Trace les lettres et les chiffres — sur pointillés, puis points
  légers, puis tout seul ; correction tolérante, et le dino montre comment faire.
- **Logique** : Calcul, Les nombres, Formes et couleurs, L'heure (réveils à aiguilles), La monnaie.
- **Monde** : Ça va ensemble, Le plus grand, Mon pays (drapeau, monuments, spécialités… pour la
  France, la Belgique, la Suisse, le Canada ou le Luxembourg).
- **Anglais** : Numbers.
- Les jeux plus avancés (anglais, calcul, lecture…) n'apparaissent qu'à partir de 4 ou 5 ans.

### Le dino
- Voix plus naturelle et moins aiguë ; la bouche ne bouge que pendant le son, mot par mot.
- **Collection** : à chaque niveau, un cadeau à choisir parmi 4 objets (chapeaux, lunettes, capes,
  ailes…) ; le **dressing** permet de l'habiller en faisant glisser les objets sur lui.
- Niveaux 1 à 40 ; de nouvelles répliques, avec le prénom de l'enfant.
- **Révision espacée** : une question ratée revient le lendemain, puis 3 jours et 7 jours plus tard.

### Installer / tester
- En ligne : https://pickywawa.github.io/dinolearn/
- Archive `dinolearn-web-v0.6.0.zip` : le jeu compilé, pour tout hébergement web statique.
- En local : `cd web && npm install && npm run dev`.

### Limites connues
- La voix dépend des voix installées sur l'appareil ; certaines vues web intégrées (dont l'aperçu
  dans l'appli Claude) n'ont pas de synthèse vocale.
- Les profils et la progression restent sur l'appareil.
