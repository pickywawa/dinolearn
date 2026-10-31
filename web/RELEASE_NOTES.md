## DinoLearn 0.9.0 — Des fiches à imprimer, avec son dino

### Pour l'enfant : une enveloppe surprise chaque jour
- Quand le **temps de jeu du jour** est fini (ou le soir, avant que le dino s'endorme), le dino offre
  **trois enveloppes surprises**. L'image sur chacune montre ce qu'elle contient ; l'enfant en choisit
  une, elle s'ouvre et la fiche en sort : « Demande à papa ou maman de l'imprimer ! »
- Une enveloppe par jour. Sans limite de temps ni heure du coucher, elle arrive après 4 séries.
- Un **diplôme** à imprimer tous les 5 niveaux du dino.

### 16 fiches, toujours avec le dino de l'enfant
Chaque fiche est dessinée par le jeu, au format A4, avec **son dino** (sa couleur, ses objets) et son
prénom, et s'adapte à son âge et à ses progrès dans les jeux.
- **Coloriages** : son dino dans un paysage préhistorique ; coloriage magique (chiffres, puis calculs).
- **Réflexion** : labyrinthe (de 4×5 à 14×18 cases), points à relier (de 10 à 40 points), jeu des
  différences (de 3 à 7).
- **Écriture** : graphisme, son prénom à repasser, les chiffres et les lettres ratées dans les jeux.
- **À découper** : masque, puzzle (de 6 à 30 pièces, avec plateau pour les petits), dino articulé,
  marionnettes à doigts, couronne à son prénom.
- **Jeux de société** : jeu de l'oie du dino (avec le dé à monter et les dinos de la famille comme
  pions), memory, loto, dominos — des images pour les petits, puis des quantités, des nombres, des mots
  et des calculs.

### Pour les parents
- Nouvelle section **« À imprimer »** dans l'espace parents : les fiches gagnées, les nouvelles en
  premier.
- Pour chaque fiche, des **conseils** : ce qu'elle fait travailler, comment en parler pendant
  l'activité, comment prolonger sans écran, le matériel, et la solution.
- Boutons **Imprimer** (A4), **Version à colorier** (fiches à découper), **Autre version**, **Supprimer**.

### Installer / tester
- En ligne : https://pickywawa.github.io/dinolearn/
- Archive `dinolearn-web-v0.9.0.zip` : le jeu compilé, pour tout hébergement web statique (sans les
  packs de reconnaissance vocale : `npm run voice-packs` pour les ajouter).
- En local : `cd web && npm install && npm run dev`.

### Limites connues
- À l'impression, choisir « Taille réelle » (ou 100 %) et désactiver les en-têtes du navigateur.
- La vibration ne marche pas sur iPhone (Safari ne la propose pas aux pages web).
- La reconnaissance vocale est moins sûre avec les plus petits et dans le bruit : le jeu passe alors aux
  cartes. Les prénoms rares ne sont pas reconnus : le parent les écrit dans la fiche.
- La voix du dino dépend des voix installées sur l'appareil.
- Les profils et la progression restent sur l'appareil.
