## DinoLearn 0.13.1 — Plein écran en paysage

- **Sur Android**, au premier toucher, le jeu passe en plein écran (sans les barres du navigateur)
  et se verrouille en paysage, même si le téléphone est tenu droit.
- **Installable comme une appli** (« Ajouter à l'écran d'accueil ») : il s'ouvre ensuite directement
  en plein écran paysage, avec l'icône du dino.
- **Sur iPhone** (Safari ne permet pas de forcer le paysage), le message « Tourne ta tablette »
  rappelle qu'ajouté à l'écran d'accueil, le jeu s'ouvre sans les barres de Safari.

## DinoLearn 0.13.0 — Le dino en 3D sur l'île au volcan

- **Un nouveau dino en 3D**, sculpté puis animé : une trentaine d'animations (il saute de joie,
  applaudit, danse, réfléchit, mange, bâille, fait un clin d'œil, s'endort…), une bouche qui suit la
  voix, des clignements et des yeux rieurs. Il garde la couleur tirée à l'éclosion (10 couleurs) et
  porte les objets de la garde-robe.
- **Une nouvelle interface** : l'île au volcan, des décors peints pour chaque écran, des boutons et
  des icônes dessinés dans le même style.
- **Plus d'écran de démarrage** : à l'ouverture, le dino dort sur sa motte de terre à l'accueil ; on
  le touche pour le réveiller, puis les boutons apparaissent.
- **Fiche de l'enfant** : nouvelle case « Choix des missions » (cochée par défaut). Décochée, l'enfant
  ne joue qu'aux séries au hasard du bouton « Jouer ».
- **Les syllabes** : plus de questions sur les mots d'une seule syllabe.
- Décors compressés (≈ 0,9 Mo pour tous les écrans).

## DinoLearn 0.12.3 — Réessayer tout de suite

- Après une mauvaise réponse, l'enfant peut **retoucher une carte presque aussitôt** (au bout d'un
  tiers de seconde), sans attendre que le dino ait fini de parler : s'il touche pendant l'indice, le
  dino s'arrête net.

## DinoLearn 0.12.2 — Les silences et les bruits d'animaux

- **Les silences sont respectés** : le dino marque une vraie pause après les « … » et entre les phrases
  (la voix les sautait).
- **Les onomatopées sont dites comme des sons**, plus lettre par lettre : l'abeille fait « beu-zzz »,
  le serpent « sssi », le dino qui dort ronfle, « Psst », « Grrr », « Mmmh », « Hihi », « hi-han » et le
  cheval sont corrigés.

## DinoLearn 0.12.1 — La voix anglaise aussi aiguë

- Les mots anglais sont dits avec la même voix aiguë que le dino (× 1,40, sans accélérer).

## Rappel de la 0.12.0 — La nouvelle voix du dino

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
- Archive `dinolearn-web-v0.12.3.zip` : le jeu compilé, pour tout hébergement web statique (sans les
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
