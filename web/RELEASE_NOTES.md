## DinoLearn 0.10.0 — Plus simple au démarrage, tous les jeux sur la planète

### La planète montre tous les jeux
- Le **memory** (et le memory en anglais), les **jeux de tracé** et les **jeux à voix haute** n'apparaissaient
  que derrière le bouton « choisir son jeu », masqué par défaut : on ne les voyait jamais. Désormais, la
  planète lance une fois sur trois un de ces jeux ; les autres fois, des questions de tous les jeux.
- Le dino ne dit plus que les questions sont « mélangées » : il dit juste « C'est parti ! ».

### Les cadeaux et l'alternance des enfants
- Quand le dino a grandi, l'enfant va au vestiaire choisir son cadeau. **Dès que le cadeau est mis au
  dino, on revient à l'accueil** ; si les enfants alternent, le dino passe la main à l'enfant suivant
  (« Bravo Léa ! Maintenant, c'est au tour de Tom ! »). Avant, on restait bloqué au vestiaire et
  l'alternance ne se faisait pas.

### La voix, activée par défaut
- Les **jeux à voix haute** sont activés par défaut (le parent peut les couper dans l'espace parents).
- Le **pack de reconnaissance français se télécharge dès l'ouverture du jeu** : quand l'enfant fait
  éclore son œuf, le dino peut entendre son prénom et son âge. Le pack anglais suit, depuis l'accueil.

### Une présentation plus courte
- Le bébé dino se présente en quelques phrases : on va jouer, chaque bonne réponse donne un fruit, il
  mange les fruits pour grandir, et il y a des récompenses.

### Le temps de jeu
- Le temps de jeu par jour se règle avec **−** et **+** (par 5 minutes) ou **Illimité**, de la même façon
  au premier lancement et dans l'espace parents. **15 minutes par défaut.**

### Toujours là (0.9.0)
- Les **enveloppes surprises** en fin de temps de jeu et les **16 fiches à imprimer** avec le dino de
  l'enfant (coloriages, labyrinthes, écriture, découpages, jeux de société, diplômes).

### Installer / tester
- En ligne : https://pickywawa.github.io/dinolearn/
- Archive `dinolearn-web-v0.10.0.zip` : le jeu compilé, pour tout hébergement web statique (sans les
  packs de reconnaissance vocale : `npm run voice-packs` pour les ajouter).
- En local : `cd web && npm install && npm run dev`.

### Limites connues
- À l'impression, choisir « Taille réelle » (ou 100 %) et désactiver les en-têtes du navigateur.
- La vibration ne marche pas sur iPhone (Safari ne la propose pas aux pages web).
- La reconnaissance vocale est moins sûre avec les plus petits et dans le bruit : le jeu passe alors aux
  cartes. Les prénoms rares ne sont pas reconnus : le parent les écrit dans la fiche.
- La voix du dino dépend des voix installées sur l'appareil.
- Les profils et la progression restent sur l'appareil.
