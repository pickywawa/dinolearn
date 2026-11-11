## DinoLearn 0.23.0 — Nouvel espace parents

- Espace parents réorganisé en quatre onglets, plus compact et pensé pour le téléphone : **Profil**, **Progrès**, **Jeux**, **Réglages**. Les enfants sont en haut (un toucher pour changer, « + » pour en ajouter).
- Profil : la fiche de l'enfant se modifie directement (prénom, âge, pays, temps de jeu, heure du coucher), sans passer par un bouton « Modifier ».
- Niveau du dino : boutons − et + au lieu du curseur, qu'on pouvait changer sans le vouloir en faisant défiler la page.
- Textes raccourcis et clarifiés ; le bouton « Missions » se règle dans l'onglet Jeux.
- Correction : « les États-Unis » s'affichait « s États-Unis » dans la liste des pays.

## DinoLearn 0.22.0 — Accueil traduit, séries variées, présentation plus riche, sons plus doux

- Les boutons de l'accueil (Jouer, Missions, Mon Dino, Paramètres) et « Rejouer » sont traduits dans les 20 langues.
- Séries au hasard : chaque question vient d'un jeu différent.
- La présentation du dino au premier lancement est plus complète (il vient de naître, les jeux, les fruits, les cadeaux, « Mon Dino », le droit à l'erreur), et un petit bouton « Passer » en bas à droite permet d'aller directement au prénom.
- Sons : un seul bruit de mastication pour tout un panier de fruits (deux pour un long repas), un vrai bruit de rot à l'accueil au lieu du rugissement synthétique, plus de bruit avant le rire quand on chatouille le dino, un seul bruit quand il gobe une mouche, et plus de petits « pops » quand il applaudit.

## DinoLearn 0.21.2 — Packs de reconnaissance vocale sur HuggingFace

- Les packs de reconnaissance vocale sont maintenant hébergés sur HuggingFace (comme les voix du dino) au lieu d'être embarqués dans le site à chaque mise en ligne : le site passe d'environ 760 Mo à environ 50 Mo par déploiement (quota de stockage GitHub).
- Un seul téléchargement par pack : le jeu le télécharge (barre de progression) et le passe directement au moteur de reconnaissance.
- Les packs déjà installés restent valables : rien à retélécharger après la mise à jour.

## DinoLearn 0.21.1 — Nouvelle icône, démarrage d'un seul tenant, premier lancement fluide

- Nouvelle icône (Android, iOS, site) et nouvel écran de démarrage : l'écran de chargement est la grande image de DinoLearn. Sur Android, l'écran de démarrage du système reste affiché jusqu'à ce qu'elle soit prête (plus d'écran vide entre les deux) ; sur iOS, c'est la même image dès l'ouverture.
- Nouvelle barre de chargement, avec ce qui se télécharge écrit dedans.
- La musique démarre dès l'écran de chargement.
- Le jeu attend toujours la voix du dino et la reconnaissance vocale de la langue avant de démarrer (en cas de problème : message, et un toucher pour réessayer). La voix et la reconnaissance de la langue apprise en plus se téléchargent ensuite, en arrière-plan, une fois à l'accueil : moins d'attente au premier lancement.
- La voix du dino est calculée à part (worker) : l'animation ne se fige plus quand il parle, ni quand il demande le prénom et l'âge.
- L'œuf, les explications, le prénom et l'âge se passent sur une seule page ; le dino sort de l'œuf directement sur sa motte, à sa place de l'accueil, puis les boutons de l'accueil apparaissent autour de lui.
- Fiche de bienvenue des parents compacte (prénom et âge sur une ligne, pays et coucher en listes déroulantes) et clavier du code parent sur deux colonnes : tout tient sur un téléphone sans défiler.

## DinoLearn 0.20.0 — 20 langues et 54 pays

- 8 nouvelles langues : indonésien, vietnamien, turc, persan, polonais, ukrainien, coréen et népalais. Jeux à voix haute aussi en vietnamien, turc, persan, polonais, ukrainien et coréen.
- « Mon pays » existe maintenant dans toutes les langues et pour 54 pays : drapeau, drapeaux qui se ressemblent, voisins, symbole, spécialités, fête nationale, monnaie, lieu ou sport célèbre, et capitale à lire.
- Le jeu de l'argent marche avec la monnaie de chaque pays : pièces et billets dessinés avec leurs couleurs et leur symbole (dollar, roupie, yuan, naira, won…).
- Tracé des lettres dans d'autres écritures : cyrillique (russe, ukrainien), caractères chinois simples, hangeul coréen, lettres arabes et persanes ; chiffres pour le hindi, le bengali et le népalais.
- Les jeux à voix haute sont masqués dans les langues sans reconnaissance vocale (arabe, ourdou, bengali, indonésien, népalais).

## DinoLearn 0.19.1 — Reconnaissance vocale en portugais

- Le pack de reconnaissance vocale portugais est maintenant publié (son modèle a une organisation différente des autres).

## DinoLearn 0.19.0 — DinoLearn parle 12 langues

- Nouvelles langues : anglais, espagnol, italien, allemand, portugais, russe, chinois mandarin, hindi, arabe, ourdou et bengali, en plus du français.
- La langue est choisie automatiquement au premier lancement selon le téléphone, et se change dans l'espace parents (Voix et téléchargements). Seuls les packs de la langue choisie sont téléchargés.
- Le dino a une voix naturelle dans chaque langue. La langue apprise en plus est l'anglais, ou l'espagnol pour les anglophones.
- Jeux à voix haute en français, anglais, espagnol, italien, allemand, portugais, russe, chinois et hindi. En arabe, ourdou et bengali (pas de reconnaissance vocale légère), ces jeux sont masqués.
- Disponibles dans toutes les langues : images du monde, ombres, ce qui va ensemble, le plus grand, l'intrus, compter, suites, plus et moins, calculs, nombres, formes et couleurs, l'heure, memory, tracés, et les jeux de la langue apprise. L'argent (euros) n'est proposé que dans les pays de la zone euro ; le tracé des lettres seulement en alphabet latin.
- Les jeux de lecture, de sons et de devinettes, la catégorie « Mon pays » et les fiches à imprimer restent en français pour l'instant.
- Arabe et ourdou affichés de droite à gauche.

## DinoLearn 0.18.1 — Le chargement ne bloque plus

- Correction : le chargement restait bloqué à 98 % (appli Android et site), à cause de l'image de la bouée absente de la version publiée. L'image est désormais générée avec les autres, et un test vérifie toutes les images du vestiaire.
- Une image manquante ne bloque plus jamais le jeu : elle est simplement ignorée.
- « Réessayer » n'apparaît plus pendant le téléchargement des packs de langue, seulement si le jeu ne peut vraiment pas démarrer, avec la raison sous la barre.
- Si le réseau se fige pendant le téléchargement des packs (45 s sans progrès), le jeu démarre quand même ; le téléchargement continue ou reprendra au lancement suivant.
- Clés de signature Android retirées du dépôt public (rangées dans les secrets GitHub).

## DinoLearn 0.18.0 — L'appli Android et iOS

- DinoLearn existe maintenant en appli Android et iOS (Capacitor). L'APK Android est joint à chaque release GitHub pour tester sans passer par Google Play.
- Tout le jeu est embarqué et fonctionne hors ligne, moteur de voix compris ; seuls les packs de langue se téléchargent au premier lancement.
- Dans l'appli : paysage verrouillé, plein écran (décor jusque sous l'encoche de la caméra), son même en mode silencieux sur iPhone, micro déclaré pour les jeux à voix haute.
- Fiches à imprimer : dans l'appli, un PDF est enregistré dans Documents/DinoLearn (Android) ou proposé au partage (iOS, pour imprimer ou enregistrer).
- Politique de confidentialité ajoutée (espace parents → Données, et en ligne pour les stores).
- Sur le site aussi, le moteur de voix est désormais servi avec le jeu (plus de CDN externe).

## DinoLearn 0.17.0 — Un vestiaire bien ajusté

- Tous les objets du vestiaire sont replacés pour ne plus rentrer dans le dino, même pendant les animations.
- Haut-de-forme, chapeau de diplômé et couronne posés sur les cornes, devant la collerette ; casque de pompier plus bas sur les côtés.
- Lunettes recentrées sur les yeux ; lunettes de plongée avec une sangle qui fait le tour de la tête.
- Nœud papillon et médaille contre la poitrine, collier plus petit sous le menton.
- Capes plus longues, drapées sur le dos : elles se soulèvent quand la queue ou un bras passe dessous. Ailes contre le dos, qui se replient au passage d'un bras.
- Le ballon reste droit au-dessus de la main ; baguette, sucette et tournesol s'écartent du corps pendant les gestes.
- Le nounours s'assoit par terre, à côté du pied droit.
- Nouvelle bouée de piscine autour du ventre, à la place de l'écharpe (une écharpe déjà gagnée devient la bouée).
- Boutons protégés des encoches d'écran, décors d'accueil plus légers, chargement plus court.

## DinoLearn 0.16.1 — Une arrivée plus douce au chargement

- Le dino arrive en marchant de profil, bien plus lentement, puis se tourne vers l’enfant avant de danser.
- Pendant la danse, les yeux font un simple clignement (plus de paupières qui se ferment de travers).
- Le titre « Chargement… » est un peu plus haut sur le panneau.
- Barre de chargement redessinée : remplissage vert rayé bien calé dans la pierre, arrondi aux deux bouts, sans liseré.

## DinoLearn 0.16.0 — Les packs de langue dans l’écran de chargement

- Plus de fenêtre à cases à cocher au démarrage : les packs de la langue de l’appli (voix du dino, voix anglaise, reconnaissance vocale si l’appareil sait écouter) se téléchargent directement pendant le chargement, en parallèle.
- Le premier lancement est donc plus long ; à droite du pourcentage, on voit ce qui se télécharge (« pack français, pack anglais, reconnaissance vocale ») puis l’installation de la reconnaissance vocale.
- Sans réseau, le jeu démarre quand même et retente au lancement suivant. Les packs restent gérables dans l’espace parents.
- Le titre « Chargement… » suit maintenant l’arrondi du panneau de bois.

## DinoLearn 0.15.2 — Le vrai dino pendant le chargement

- Retour du modèle 3D du jeu, chargé en priorité, avec course d’arrivée puis danse au centre.
- Titre de chargement arrondi, contour brun et ombre en relief.
- Vérification sur un chargement ralenti.

## DinoLearn 0.15.1 — Un nouvel écran de chargement

- Nouvelle clairière HD avec nuages séparés et animés.
- Le dino de la planche d’illustrations arrive au centre dès le début et danse pendant le chargement.
- Panneau de bois et barre de pierre issus des éléments fournis, avec remplissage vert et pourcentage réel.
- Le titre reste du texte indépendant, prêt à être traduit.
- Un chargement interrompu propose de réessayer.

## DinoLearn 0.15.0 — Un décor vivant et un accueil simplifié

- Décor animé sur l’accueil et l’éclosion, avec feuillages indépendants, eau à intensité maximale, fumée lente et nuages mobiles.
- Raccords de nuages adoucis pour éviter les coupures pendant le défilement.
- Œuf redessiné, fissures en relief et craquements synthétisés variés.
- Les mouches tournent autour du dino et repartent librement. Répliques espacées, avec des commentaires sur le décor et la faim.
- Étoile de niveau animée et centrée, ouvrant un résumé simple de la progression.
- Accueil allégé avec suppression des boutons audio et Progression. Les consignes nomment le bouton vert.
- Mots à lire prononcés séparément et plus lentement, avec la voix du navigateur et les voix téléchargées.

## DinoLearn 0.14.0 — Calcul de tête, vrais bruitages, questions revues

- **Deux nouveaux jeux de calcul sans images** (dès 5 ans, une fois le calcul en images maîtrisé) :
  le **calcul dicté** (le dino dit le calcul, on touche le résultat parmi 4) et le **calcul à voix
  haute** (on répond au micro, s'il est activé).
- **De vrais bruitages** quand le dino mange les fruits, gobe une mouche, rote ou pète
  (enregistrements libres de droits, CC0).
- **Les cris d'animaux** dits par le dino durent plus longtemps (« meuh », « ouaf ouaf »,
  « cocorico »…).
- **Moins de memory** dans les séries au hasard (au plus un par série).
- **Installer l'appli** est proposé dès l'ouverture sur téléphone, en paysage comme en portrait.
- **Plein écran sans bandes** sur les côtés, dans le navigateur comme dans l'appli.
- **Toutes les questions relues** : les indices ne donnent plus la réponse (nombres en anglais,
  histoires, « c'est un oiseau »…), indices des formes adaptés à la consigne, paires plus claires dans
  « Ça va ensemble », horloge mieux étagée (les quarts et les minutes plus tard).
- **Difficulté selon l'âge** : départ plus haut pour les grands (7 ans commence au niveau CP), et un
  plafond pour les petits (pas de questions de CP à 3 ou 4 ans).

## DinoLearn 0.13.2 — Installer le jeu sur le téléphone

- **Au démarrage sur téléphone ou tablette**, le jeu propose de s'installer comme une appli
  (bouton « Installer » sur Android ; sur iPhone, les deux gestes à faire dans Safari).
  « Plus tard » le repropose au prochain lancement, « Ne plus demander » ne le propose plus.
- **En appli installée**, l'écran est verrouillé en paysage dès l'ouverture.

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
