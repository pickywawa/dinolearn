## DinoLearn 0.8.0 — le memory, les histoires et le vestiaire

### Nouveaux jeux
- **Memory** (dès 3 ans) : retourner les cartes deux par deux pour retrouver les paires ; le dino dit
  le nom de chaque image. 6 cartes au début, puis 8, 12, 16 et jusqu'à 20 au niveau CP. Une série,
  c'est 3 plateaux ; le fruit est gagné sans trop d'erreurs.
- **Memory en anglais** (dès 5 ans) : le même jeu, et chaque image retournée est dite en anglais.
- **Écoute l'histoire** (dès 3 ans) : le dino raconte une petite histoire puis pose une question ;
  on touche l'image de la réponse. 52 histoires, de 3 phrases (3 ans) à 8 phrases (niveau CP), avec des
  pièges : d'autres choses entendues dans l'histoire, l'ordre (« en premier », « à la fin »), la
  négation (« n'a PAS pris »), compter et calculer.

### Le vestiaire
- Un cadeau ne se met plus tout seul : quand le dino grandit, l'enfant va au vestiaire, choisit son
  cadeau, puis **habille lui-même son dino** en faisant glisser l'objet sur lui.
- Pour enlever un objet, on le fait glisser du dino vers le côté.

### Le décor
- Chaque série a un **décor tiré au hasard** : fougères, palmiers, cailloux, montagnes au loin, et
  parfois un **caméléon** qui roule des yeux, sort la langue et change de couleur (touche-le !).

### L'accueil
- Le bouton « choisir son jeu » est **masqué par défaut** : l'enfant joue avec la planète, qui mélange
  tous les jeux. Les parents peuvent le réactiver (espace parents, section Jeux) ; il donne aussi
  accès aux jeux à voix haute.

### Installer / tester
- En ligne : https://pickywawa.github.io/dinolearn/
- Archive `dinolearn-web-v0.8.0.zip` : le jeu compilé, pour tout hébergement web statique (sans les
  packs de reconnaissance vocale : `npm run voice-packs` pour les ajouter).
- En local : `cd web && npm install && npm run dev`.

### Limites connues
- La vibration ne marche pas sur iPhone (Safari ne la propose pas aux pages web).
- La reconnaissance vocale est moins sûre avec les plus petits et dans le bruit : le jeu passe alors aux
  cartes. Les prénoms rares ne sont pas reconnus : le parent les écrit dans la fiche.
- La voix du dino dépend des voix installées sur l'appareil.
- Les profils et la progression restent sur l'appareil.
