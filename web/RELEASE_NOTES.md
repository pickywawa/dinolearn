## DinoLearn 0.12.0 — La nouvelle voix du dino

### Une vraie voix pour le dino
- Le dino parle avec une **voix naturelle** (Piper, voix française UPMC « Jessica »), calculée sur
  l'appareil à chaque phrase : la même sur tous les téléphones, sans Internet une fois téléchargée.
- Elle est **plus aiguë sans être accélérée** (× 1,40), comme choisi sur la page d'essai.
- Les mots des jeux d'anglais sont dits par une **voix anglaise** (Alba).
- Les phrases déjà dites sont gardées en mémoire, et la suivante se prépare pendant que le dino parle.
- Tant que la voix n'est pas téléchargée, le dino garde la voix du téléphone.

### Au premier lancement
- Une fenêtre demande la **langue** et propose, tous cochés et avec leur taille :
  la **voix du dino** (≈ 106 Mo), la **voix anglaise** (≈ 63 Mo) et la **reconnaissance vocale**
  (≈ 42 Mo en français, + 41 Mo en anglais).
- Les téléchargements se font **en parallèle**, avec le **temps restant estimé en direct**. On peut
  fermer la fenêtre et jouer pendant ce temps.
- La fenêtre ne revient plus. Tout se retrouve dans l'espace parents, section **« Voix et
  téléchargements »**, d'où l'on peut aussi lancer les téléchargements.
- Seul le français a aujourd'hui tous ses contenus : les autres langues sont annoncées « bientôt ».

### Installer / tester
- En ligne : https://pickywawa.github.io/dinolearn/
- Archive `dinolearn-web-v0.12.0.zip` : le jeu compilé, pour tout hébergement web statique (sans les
  packs de reconnaissance vocale : `npm run voice-packs` pour les ajouter).
- En local : `cd web && npm install && npm run dev`.

### Limites connues
- Avec la voix du dino, la voix ne monte pas à la fin des questions (limite des voix Piper).
- Sur un téléphone ancien, la toute première phrase peut prendre quelques secondes (préparation de la voix).
- En navigation privée, la reconnaissance vocale n'est pas disponible (le navigateur ne garde pas les packs).
- À l'impression, choisir « Taille réelle » (ou 100 %) et désactiver les en-têtes du navigateur.
- La vibration ne marche pas sur iPhone (Safari ne la propose pas aux pages web).
- La reconnaissance vocale est moins sûre avec les plus petits et dans le bruit : le jeu passe alors aux
  cartes. Les prénoms rares ne sont pas reconnus : le parent les écrit dans la fiche.
- La voix du dino dépend des voix installées sur l'appareil.
- Les profils et la progression restent sur l'appareil.
