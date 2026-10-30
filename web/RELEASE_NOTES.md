## DinoLearn 0.3.0 — plus difficile, plus réaliste, plus vivant

### Nouveautés
- **Images plus réalistes** : illustrations Noto (Google, Apache 2.0) pour les questions, les fruits
  et le décor ; les animaux et objets se reconnaissent beaucoup mieux.
- **Questions plus difficiles** : toujours **4 réponses**, **179 mots sur 10 niveaux** (écureuil,
  mouffette, phare, boussole, camion de pompiers…). Les mauvaises réponses se rapprochent de la
  bonne avec le niveau : autre famille, puis même famille, puis même sous-famille
  (un dauphin parmi des animaux marins).
- **Choix de l'âge au démarrage** : un gâteau par âge (3 à 7 ans) avec ses bougies ; l'âge règle le
  niveau de départ et la longueur des séries. Modifiable avec le petit gâteau de l'accueil.
- **Fruits à gagner** : la barre de progression montre un fruit différent par question, gagné si la
  réponse est trouvée du premier coup (+ un gâteau pour un sans-faute).
- **Nourrir le dino en fin de série** : l'enfant glisse ses fruits jusqu'à la bouche du dino, qui les
  mange ; la jauge sur son ventre se remplit et il grandit. Le panier et le garde-manger sont supprimés.
- **Décor préhistorique animé** sur les écrans de départ et d'accueil : volcan qui fume et entre en
  éruption, ptérodactyle qui vole, diplodocus qui marche, palmier et fougères qui se balancent.

### Installer / tester
- En ligne : https://pickywawa.github.io/dinolearn/
- Archive `dinolearn-web-v0.3.0.zip` : le jeu compilé, pour tout hébergement web statique.
- En local : `cd web && npm install && npm run dev`.

### Limites connues
- La voix dépend des voix installées sur l'appareil ; certaines vues web intégrées (dont l'aperçu
  dans l'appli Claude) n'ont pas de synthèse vocale.
- Pas encore d'espace parents.
