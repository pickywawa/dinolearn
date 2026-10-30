## DinoLearn 0.7.0 — l'œuf à casser, les jeux à voix haute et la planète

### L'éclosion et la présentation
- **L'œuf tremble** : il faut le toucher 4 fois. À chaque toucher, il se fissure un peu plus et le
  téléphone vibre ; puis la coquille s'ouvre en deux (vibrations) et le bébé dino en sort.
- **Le dino se présente** : il explique comment l'enfant va l'aider (jouer à plein de jeux, gagner des
  fruits, le nourrir pour qu'il grandisse, l'habiller ; « Mon rêve, c'est de devenir le plus grand
  dinosaure du monde ! »), en montrant les jeux, le panier de fruits et les cadeaux.
- Au premier lancement, il demande ensuite à l'enfant **son prénom et son âge, à voix haute** (sans micro,
  l'âge se choisit avec des gâteaux), puis de **donner le téléphone à un parent** : la fiche de l'enfant
  est déjà remplie, le parent la corrige si besoin et crée son code. Un nouvel enfant ajouté plus tard
  casse lui aussi son œuf et voit la présentation.

### L'accueil
- La **planète Terre** remplace le gros bouton vert : elle tourne doucement, ses volcans fument, et
  la toucher lance une série tout mélangée (les volcans crachent de la lave).
- **Le ciel s'anime** : météorites, oiseaux, et parfois le soleil, ou la pluie suivie d'un arc-en-ciel.
  La nuit : des étoiles filantes.
- **Des mouches** viennent tourner autour du dino : si l'une passe tout près, il l'attrape d'un coup de
  langue.
- **Espace parents** : un simple toucher sur le nouveau cadenas en haut à gauche, puis le code (plus
  d'appui long ni de glissé). Le bouton de la musique quitte l'accueil (réglage dans l'espace parents).

### Le repas
- Après un bon repas, le dino **rote ou pète** (le téléphone vibre) et s'excuse : « Oups, pardon ! ».
- S'il attend trop son panier, il **réclame**, chaque fois autrement : ventre qui gargouille, il lorgne
  les fruits, il supplie, il ouvre grand la bouche…

### 12 jeux à voix haute
- L'enfant répond **en parlant**, en touchant un gros bouton micro : **Comment ça s'appelle ?** (dès
  3 ans), **Say it in English!**, **Lis à voix haute**, et des **devinettes par thème** (animaux, métiers,
  sport, espace, saisons et météo, formes et couleurs, pays et peuples, mon pays, nature).
- La reconnaissance vocale se fait **entièrement sur l'appareil** : la voix n'est ni enregistrée, ni
  envoyée. Le micro s'autorise dans la fiche de l'enfant ou l'espace parents ; un pack par langue
  (≈ 40 Mo, français et anglais) se télécharge une fois.
- Un « pas entendu » ne compte jamais comme une erreur ; après deux essais, l'enfant répond au doigt.

### Installer / tester
- En ligne : https://pickywawa.github.io/dinolearn/
- Archive `dinolearn-web-v0.7.0.zip` : le jeu compilé, pour tout hébergement web statique (sans les
  packs de reconnaissance vocale : `npm run voice-packs` pour les ajouter).
- En local : `cd web && npm install && npm run dev`.

### Limites connues
- La vibration ne marche pas sur iPhone (Safari ne la propose pas aux pages web).
- La reconnaissance vocale est moins sûre avec les plus petits et dans le bruit : le jeu passe alors aux
  cartes. Les prénoms rares ne sont pas reconnus : le parent les écrit dans la fiche.
- La voix du dino dépend des voix installées sur l'appareil.
- Les profils et la progression restent sur l'appareil.
