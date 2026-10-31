## DinoLearn 0.11.0 — Tout se mélange sur la planète

### La planète
- Une série de la planète mélange maintenant **tous les modes de jeu, question par question** :
  questions à cartes, plateaux de **memory**, **tracés** et questions **à voix haute** s'enchaînent dans
  la même série (au lieu d'une série entière d'un seul mode).

### Les tracés
- On commence toujours par les plus simples (traits, ronds), puis ça devient plus dur au fil des
  réussites. **À 3 ans, on reste sur des formes simples, sur pointillés.**

### L'éclosion
- **Sans reconnaissance vocale**, le dino ne parle plus de prénom et ne fait plus choisir d'âge : après
  sa présentation, il demande simplement de passer le téléphone à un parent.
- Avec la reconnaissance vocale, il demande toujours le prénom et l'âge ; s'il ne comprend pas, ce sont
  les parents qui les écrivent (plus de gâteaux à toucher).
- Le **code parent ne se tape qu'une seule fois** (en cas d'oubli : « Code oublié ? »).
- L'œuf d'un **deuxième enfant** ne relance plus toute la présentation : le dino le salue par son prénom.

### Navigation privée
- Les packs de reconnaissance vocale ne peuvent pas s'installer en navigation privée (le navigateur
  garde trop peu de place). Le jeu ne tente plus le téléchargement, et l'espace parents explique
  pourquoi ; les questions à voix haute se jouent alors au doigt.

### Toujours là
- Les enveloppes surprises et les fiches à imprimer, le vestiaire, l'alternance des enfants, le temps
  de jeu réglable avec − et +.

### Installer / tester
- En ligne : https://pickywawa.github.io/dinolearn/
- Archive `dinolearn-web-v0.11.0.zip` : le jeu compilé, pour tout hébergement web statique (sans les
  packs de reconnaissance vocale : `npm run voice-packs` pour les ajouter).
- En local : `cd web && npm install && npm run dev`.

### Limites connues
- En navigation privée, la reconnaissance vocale n'est pas disponible (le navigateur ne garde pas les packs).
- À l'impression, choisir « Taille réelle » (ou 100 %) et désactiver les en-têtes du navigateur.
- La vibration ne marche pas sur iPhone (Safari ne la propose pas aux pages web).
- La reconnaissance vocale est moins sûre avec les plus petits et dans le bruit : le jeu passe alors aux
  cartes. Les prénoms rares ne sont pas reconnus : le parent les écrit dans la fiche.
- La voix du dino dépend des voix installées sur l'appareil.
- Les profils et la progression restent sur l'appareil.
