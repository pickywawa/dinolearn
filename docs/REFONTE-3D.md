# Refonte graphique 3D — plan

Branche : `animation-claude`. Référence visuelle : les maquettes « L'Île des Questions »
(dino chibi brillant, île volcanique, panneaux en bois, gros boutons arrondis).

## Objectifs

1. **Dino en vraie 3D** dans un jeu qui reste en 2D (Phaser) : animé, habillé avec les
   objets de la garde-robe, qu'on peut faire tourner du doigt.
2. **Couleur aléatoire conservée** : les 10 couleurs actuelles (`DINO_COLORS`), tirées à
   l'éclosion, appliquées aux matériaux 3D (peau, ombre, piquants, ventre).
3. **Décors refaits** : île avec volcan, cascade, jungle, en plans superposés (parallaxe).
4. **Interface refaite** dans le style des maquettes (titres sur panneau de bois, boutons
   « bonbon », cartes de réponses, bulles).
5. **Jeu en paysage uniquement.**
6. **Rien ne change dans le contenu** : mêmes modes de jeu (série, mémoire, tracé,
   jeux oraux…), mêmes questions, même progression. `src/content`, `src/domain`,
   `src/core` (hors affichage) ne sont pas touchés.

## Choix techniques

| Sujet | Choix | Pourquoi |
|---|---|---|
| Moteur du dino | **Three.js** (npm) | 3D en temps réel indispensable : 10 couleurs × 23 objets × rotation libre, impossible à pré-rendre. |
| Intégration dans Phaser | Un seul `WebGLRenderer` Three.js hors écran, copié chaque image dans une `CanvasTexture` Phaser | Le dino reste un objet Phaser normal (profondeur, tweens, clics, UI par-dessus et décor derrière). |
| Création du modèle | **Blender en script** (`pip install bpy`, sans écran), génère `dino.glb` | Je peux tout produire et régénérer ici, sans logiciel graphique. Les sites de modèles (Quaternius, Kenney, Poly Pizza) sont bloqués par le réseau de cet environnement. |
| Rendu | Matériau « toon » (`MeshToonMaterial`) + reflet doux + contour (coque inversée) | Look « jouet brillant » des maquettes, lisible sur petit écran. |
| Visage | Gros yeux 3D (iris, reflets) + paupières et bouches en *morph targets* | Clignements, yeux heureux, bouche qui suit la voix mot à mot (comme aujourd'hui). |
| Décors | Rendus Blender en couches PNG/WebP (ciel, volcan, île, jungle avant-plan) + effets Phaser (fumée, eau, nuages, particules) | Cohérent avec le dino, léger à l'exécution. |
| UI | Kit de composants Phaser dessinés par code (dégradés, ombres, bords arrondis) + police arrondie (`@fontsource/baloo-2` ou `fredoka`) | Pas d'images à dessiner à la main, tout se règle par code. |

### Le modèle 3D (généré par `tools/blender/build_dino.py`)

- Proportions chibi : grosse tête (≈ 45 % de la hauteur), corps en poire, petits bras,
  pieds ronds, queue courte, rangée de piquants, joues roses, ventre clair.
- Formes lisses par surfaces de subdivision et métaballes converties en maillage, puis
  décimées (cible ≈ 8 à 12 k triangles).
- **Squelette** : racine, bassin, colonne, cou, tête, mâchoire, bras G/D (2 os), jambes
  G/D, queue (3 os), plus des **points d'attache** (`socket_head`, `socket_eyes`,
  `socket_neck`, `socket_back`, `socket_hand`) pour les objets.
- **Matériaux séparés** `skin`, `skinDark`, `spike`, `belly`, `cheek`, `eye` : la couleur
  est changée en direct dans Three.js, un seul modèle pour les 10 couleurs.
- **Animations** (clips glTF), qui reprennent les réactions actuelles de `DinoReaction` :
  `idle` (respiration), `talk`, `happy`, `cheer`, `dance`, `oops`, `think`, `eat`,
  `levelUp`, `tickle`, `wave`, `spin`, `yawn`, `roar`, `lookAround`, `hop`, `beg`, `sleep`,
  `point` (montre où toucher), `hatch` (sort de l'œuf).
- **L'œuf** à pois est modélisé aussi, en deux moitiés pour l'éclosion.

### Les objets de la garde-robe (`tools/blender/build_items.py`)

Les 23 objets de `src/content/items.ts` sont refaits en 3D (casquette, haut-de-forme,
couronne, lunettes, écharpe, cape, ailes, ballon, baguette…) dans `items.glb`, un nœud
par objet. Chacun est accroché au point d'attache de son emplacement (`head`, `eyes`,
`neck`, `back`, `hand`), donc il suit les animations. Les règles actuelles (un objet par
emplacement, retirer en faisant glisser) sont gardées : il suffit de remplacer les
coordonnées 2D `x/y/w` par l'attache 3D.

### Classe `Dino3D`

Même interface publique que `src/dino/Dino.ts` (`react()`, `dress()`, `accessoryAt()`,
`sleep()`, `setHeight()`, `mouthWorldPoint()`, synchro voix `onTalk`/`onBoundary`…), pour
que les 9 scènes qui font `new Dino(...)` ne changent presque pas. En plus :

- `spin()` / rotation au doigt (glisser horizontal = tourner le dino, avec inertie) ;
- `lookAt(x, y)` : la tête suit le doigt ou la bonne réponse ;
- rendu à 30 images/s en attente, 60 pendant une animation, pause quand l'onglet est caché.

Le dino 2D actuel reste en **secours** si WebGL n'est pas disponible.

## Écrans (paysage, d'après les maquettes)

| Écran actuel | Nouveau rendu |
|---|---|
| `StartScene` (œuf, éclosion) | Œuf 3D sur la plage de l'île, éclosion animée, couleur tirée au hasard |
| `HelloScene` (prénom) | Dino 3D qui salue, panneau en bois |
| `HomeScene` | Titre sur panneau, gros bouton « Jouer », boutons ronds en bas (choix des jeux, garde-robe, parents) ; dino à gauche, volcan et cascade au fond |
| `ChooseScene` | Grille de grosses tuiles colorées avec icône (une par jeu existant) |
| `GameScene` / `MemoryScene` / `TraceScene` | Dino à gauche avec bulle de question, cartes de réponses à droite, barre de progression en pastilles ; mêmes questions et même logique |
| Bonne / mauvaise réponse | Bannière « Bravo ! », dino qui saute ; « Ce n'est pas grave », dino qui montre la bonne réponse |
| `EndScene` | Trophée/étoile, confettis, dino qui danse |
| `WardrobeScene` | « Mon Dino – Vestiaire » : dino 3D qu'on fait tourner, grille d'objets, flèches |

Les écrans des maquettes qui **n'existent pas** dans le jeu (carte de l'île avec niveaux,
missions, coffre) ne sont **pas** ajoutés pour l'instant (voir questions).

## Paysage uniquement

- `main.ts` : taille logique toujours paysage (720 px de haut, largeur selon le format,
  ratio de 1,33 à 2,3).
- En portrait : écran « Tourne ta tablette » avec le dino qui tourne, et
  `screen.orientation.lock('landscape')` quand c'est possible (plein écran ou appli
  installée, `orientation: landscape` dans le manifeste).
- Suppression des variantes portrait des scènes (`isPortrait`, ~67 occurrences).

## Étapes

1. **Socle** : branche, Three.js, pont Three→Phaser, `Dino3D` avec un dino provisoire en
   formes simples ; paysage forcé. → *capture de vérification*
2. **Modèle Blender** : script du dino + squelette + matériaux, export `dino.glb`, rendu
   toon et contour. → *rendus de contrôle sous plusieurs angles, envoyés pour validation*
3. **Animations** : les ~20 clips, branchés sur `react()` ; visage (yeux, bouche, synchro
   voix). → *petites vidéos ffmpeg des animations*
4. **Garde-robe 3D** : les 23 objets, attaches, glisser pour retirer, rotation au doigt.
5. **Décors** : île volcanique en couches + effets (fumée du volcan, cascade, nuages,
   lucioles), version nuit pour le coucher.
6. **Kit UI + écrans** : refonte de chaque scène dans l'ordre Accueil → Choix → Jeu →
   Fin → Vestiaire → Œuf/Prénom → panneaux parents.
7. **Finitions** : performances sur tablette modeste (taille de texture, images/s,
   poids du `.glb` compressé), secours sans WebGL, tests (`vitest`, `tsc`), captures de
   tous les écrans, mise à jour du README.

Chaque étape fait l'objet d'un commit poussé sur `animation-claude`, avec des captures
pour que tu valides avant de continuer.

## Risques

- **Qualité du modèle** : je le construis par script, pas en le sculptant. On obtiendra
  un dino chibi propre et cohérent, mais moins « peint » que les maquettes. Si le résultat
  ne suffit pas : autoriser les sites de modèles CC0, ou fournir un `.glb`/`.blend` fait
  par un graphiste, que je réutiliserai avec les mêmes animations et attaches.
- **Performances** : Three.js ajoute ~150 Ko gzip. La copie de texture à chaque image
  est maîtrisée en limitant la taille rendue (~512 px) et les images/s.
- **Décors peints** : sans génération d'images, ils seront rendus en 3D style cartoon,
  ou à partir d'images que tu fournis.
