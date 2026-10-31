# DinoLearn — Spécifications fonctionnelles et techniques

> Version 1.0 — jeu mobile éducatif pour les 3–7 ans, entièrement guidé par la voix et l'image.

---

## Sommaire

1. [Vision et principes](#1-vision-et-principes)
2. [Choix technologique](#2-choix-technologique)
3. [Le dinosaure (mascotte)](#3-le-dinosaure-mascotte)
4. [Navigation sans lecture](#4-navigation-sans-lecture)
5. [Boucle de jeu : séries, récompenses, nourrissage](#5-boucle-de-jeu--séries-récompenses-nourrissage)
6. [Progression du dinosaure](#6-progression-du-dinosaure)
7. [Niveau de difficulté et sélection des questions](#7-niveau-de-difficulté-et-sélection-des-questions)
8. [Catalogue des mini-jeux](#8-catalogue-des-mini-jeux)
9. [Contenus : modèle de données, images, audio](#9-contenus--modèle-de-données-images-audio)
10. [Internationalisation](#10-internationalisation)
11. [Espace parents](#11-espace-parents)
12. [Architecture logicielle](#12-architecture-logicielle)
13. [Données locales et persistance](#13-données-locales-et-persistance)
14. [Confidentialité, sécurité et conformité stores](#14-confidentialité-sécurité-et-conformité-stores)
15. [Exigences non fonctionnelles](#15-exigences-non-fonctionnelles)
16. [Feuille de route](#16-feuille-de-route)
17. [Annexes](#17-annexes)

---

## 1. Vision et principes

**DinoLearn** est un ensemble de mini-jeux éducatifs animés par un dinosaure qui parle. L'enfant
répond à des séries de questions courtes ; ses réussites lui rapportent de la nourriture qu'il
donne au dinosaure, qui grandit au fil du temps.

### Public
- 3 à 7 ans, **non-lecteurs** (ou lecteurs débutants).
- Usage autonome sur téléphone ou tablette, en portrait et paysage (tablette).

### Principes de conception (non négociables)

| # | Principe | Conséquence concrète |
|---|----------|----------------------|
| P1 | **Zéro texte nécessaire** | Toute consigne est dite par la voix et/ou montrée par une animation. Aucun bouton ne porte de texte côté enfant. |
| P2 | **Purement éducatif** | Pas de publicité, pas d'achat accessible à l'enfant, pas de minuteur stressant, pas de mécanique de pression (pertes, punitions, notifications culpabilisantes). |
| P3 | **Bienveillance** | Une erreur n'est jamais sanctionnée : le dino encourage, la mauvaise réponse se grise, l'enfant réessaie. |
| P4 | **Gros, simple, prévisible** | Cibles tactiles ≥ 64 dp (≥ 88 dp pour les réponses), 4 choix maximum, même disposition partout. |
| P5 | **Le dino est partout** | Il guide, explique, félicite, réagit, mange, dort. C'est l'unique « personnage interface ». |
| P6 | **Léger** | Images et voix des contenus téléchargées à la demande et mises en cache ; l'application de base reste petite. |
| P7 | **Multilingue dès la conception** | Aucune chaîne ni aucun audio codé en dur ; la langue de l'app et la langue « étrangère » sont des paramètres. |

---

## 2. Choix technologique

> **Mise à jour (v0.2)** : le prototype jouable est développé en **Phaser 3 + TypeScript** (jeu web,
> testable directement dans le navigateur du téléphone, voir `web/`). Voix : synthèse vocale du
> navigateur via `easy-speech` ; dino animé avec les tweens Phaser ; illustrations SVG withicons
> « Plush ». Une application native pourra ensuite empaqueter ce jeu web (Capacitor) ou suivre
> l'option Flutter + Rive ci-dessous.

### 2.1 Recommandation initiale : **Flutter + Rive**

| Besoin | Solution retenue |
|--------|------------------|
| Une seule base de code iOS + Android (+ tablettes) | **Flutter** (Dart) |
| Dinosaure animé, qui parle, change de taille, mange, réagit | **Rive** (animations vectorielles à *state machine*, runtime Flutter officiel) |
| Petits jeux à glisser/déposer, particules, confettis | Widgets Flutter + `flutter_animate` ; **Flame** uniquement si un mini-jeu le justifie (labyrinthe, physique) |
| Audio (voix, effets, enchaînement de phrases) | `just_audio` (+ `audio_session`) |
| Images distantes avec cache disque | `cached_network_image` + `flutter_cache_manager` (cache dédié « contenus ») |
| Base locale (progression, historique des réponses) | **Drift** (SQLite typé) |
| État / injection de dépendances | **Riverpod** |
| Navigation | `go_router` |
| Contenus hébergés | Stockage objet + CDN (ex. Cloudflare R2 ou Firebase Hosting) servant des fichiers statiques JSON / WebP / Opus |

### 2.2 Pourquoi Flutter plutôt que…

| Alternative | Pourquoi pas en premier choix |
|-------------|-------------------------------|
| **Unity** | Excellent pour la 3D, mais lourd (binaire de base plus gros, démarrage plus lent), UI 2D plus laborieuse, surdimensionné pour des quiz illustrés. |
| **Godot** | Léger et bon en 2D, mais écosystème mobile (cache réseau, SQLite, accessibilité, intégrations stores) moins mûr. |
| **React Native / Expo** | Viable (Rive existe aussi), mais rendu et performance d'animation moins homogènes entre appareils d'entrée de gamme ; pont natif plus sensible. |
| **Natif (Swift + Kotlin)** | Double coût de développement et de maintenance pour aucun gain notable ici. |

Flutter dessine lui-même chaque pixel : rendu **identique** sur tous les appareils (important pour
des enfants qui s'habituent à une disposition), 60 fps sur appareils modestes, et Rive y offre la
meilleure intégration pour piloter le dinosaure depuis le code (entrées `talk`, `happy`, `eat`,
`size`…).

### 2.3 Outillage contenu (hors application)
- Contenus rédigés dans des **fichiers YAML/CSV versionnés** (un fichier par mini-jeu et par langue).
- Un **pipeline de build de contenu** (script Dart ou Python) :
  1. valide les fichiers (ids uniques, niveaux 1–10, distracteurs valides, images présentes) ;
  2. génère l'audio manquant par **synthèse vocale neuronale** (voix française enfantine/chaleureuse pour le dino, voix native anglaise pour les mots anglais) puis normalisation du volume ;
  3. optimise les images (WebP, 512 px max) ;
  4. produit les **manifestes JSON** et publie sur le CDN.

---

## 3. Le dinosaure (mascotte)

### 3.1 Identité
- Nom provisoire : **« Dino »** (nom définitif à choisir ; il doit être facile à prononcer dans toutes les langues).
- Style : vectoriel, rond, couleurs douces, grands yeux expressifs, jamais effrayant.
- Personnalisation légère : couleur de peau et accessoires débloqués avec les niveaux (§6.3).

### 3.2 Machine à états Rive

Le fichier `dino.riv` expose une *state machine* unique pilotée par l'application :

| Entrée Rive | Type | Effet |
|-------------|------|-------|
| `stage` | nombre 0–5 | Stade de croissance (œuf → géant), change silhouette et proportions |
| `talking` | booléen | Active la bouche parlante |
| `mouth` | nombre 0–1 | Ouverture de bouche (synchronisée sur l'amplitude audio en temps réel) |
| `happy` / `cheer` / `dance` | trigger | Réactions de réussite |
| `oops` / `think` | trigger | Réaction à une erreur (douce, jamais triste) |
| `point` | trigger + `pointX/pointY` | Désigne une zone de l'écran (aide, tutoriel) |
| `eat` / `chew` / `burp` | trigger | Nourrissage |
| `full` | booléen | Ventre plein (§5.5) |
| `sleepy` / `sleep` | booléen | Fin de temps de jeu, écran de nuit |
| `levelUp` | trigger | Animation de croissance |
| `idle_variant` | nombre | Animations d'attente (cligner, se gratter, bâiller, regarder un papillon) |
| `skin`, `hat`, `glasses`, `scarf` | nombre | Personnalisation |

**Synchronisation labiale** : l'amplitude du flux audio en lecture (RMS par tranches de 30 ms) est
convertie en `mouth`. Simple, robuste et indépendant de la langue. (Évolution possible : visèmes
générés par le TTS.)

### 3.3 Présences du dino dans l'application

| Écran | Forme du dino |
|-------|---------------|
| Écran de démarrage | Œuf qui tremble puis Dino qui sort la tête |
| Accueil | Dino en grand au centre, réagit au toucher (rire, chatouilles) |
| Choix de catégorie | Dino se tient près de l'île touchée et la présente |
| Mini-jeu | Dino en médaillon dans un coin, parle, réagit à chaque réponse |
| Fin de série | Dino plein écran, félicite / encourage, montre les récompenses |
| Nourrissage | Dino en grand avec la bouche ouverte, jauge de croissance sur son ventre |
| Bouton « retour » | Petite tête de Dino tournée vers la gauche |
| Chargement | Dino qui court dans un décor qui défile |
| Hors-ligne | Dino qui cherche avec une longue-vue |
| Espace parents | Dino avec lunettes et cravate (verrou parental) |
| Fin du temps de jeu | Dino en pyjama qui bâille puis s'endort |

### 3.4 Personnalité et voix
- Toujours positif, curieux, un peu farceur, jamais moqueur.
- Phrases courtes (≤ 12 mots), débit lent, vocabulaire simple.
- **Variété obligatoire** : chaque type de réplique possède au moins 15 variantes (§17.2) et
  l'application évite de répéter une variante utilisée lors des 5 dernières occurrences.

---

## 4. Navigation sans lecture

### 4.1 Règles d'interface
1. **Aucun mot à lire** côté enfant ; seuls des icônes, couleurs, illustrations et la voix.
2. Chaque écran s'ouvre par une **phrase du dino** qui explique quoi faire (« Choisis une île ! »).
3. Un bouton **« oreille »** permanent répète la dernière consigne.
4. Bouton **retour** toujours en haut à gauche (tête de Dino), bouton **oreille** en haut à droite.
5. Pas de geste complexe : appui simple et glisser-déposer uniquement. Pas d'appui long, pas de double-tap, pas de pincement.
6. **Inactivité 8 s** : le dino rappelle la consigne ; à 15 s, il pointe la zone à toucher (`point`).
7. Les touches accidentelles multiples sont ignorées (anti-rebond 400 ms ; un seul choix pris en compte pendant la lecture d'un feedback).
8. Retour système Android / geste iOS : renvoie à l'écran précédent, jamais de sortie de l'app sans confirmation visuelle (Dino qui fait « au revoir » + bouton porte).
9. Code couleur constant par catégorie (§4.3).

### 4.2 Arborescence

```
Démarrage
 └─ Choix du profil (avatars de dinos colorés)      ← affiché seulement s'il y a plusieurs profils
     └─ ACCUEIL (Dino au centre)
         ├─ 🎲 Surprise (catégorie + jeu aléatoires)
         ├─ 🏝 Île Anglais      ─┐
         ├─ 🏝 Île Français      │→ CATÉGORIE : icônes des mini-jeux + 🎲 jeu aléatoire de la catégorie
         ├─ 🏝 Île Logique       │      └─ MINI-JEU (série ≤ 10 questions)
         ├─ 🏝 Île Monde        ─┘           └─ FIN DE SÉRIE → [▶ Encore] [🍎 Nourrir] [🏠 Accueil]
         ├─ 🍎 Garde-manger → NOURRISSAGE
         ├─ 🦕 Mon Dino (garde-robe, album de croissance)
         └─ 🔒 Espace parents (verrou parental)
```

### 4.3 Écran d'accueil
- Dino au centre (réagit au toucher).
- Quatre **îles** autour, chacune avec une couleur et un emblème :
  - **Anglais** : bleu, drapeau stylisé + bulle « Hello ».
  - **Français** (langue de l'app) : rouge, livre ouvert avec lettres A B C.
  - **Logique** : violet, pièces de puzzle.
  - **Monde** : vert, globe avec un arbre et un animal.
- Un **gros dé** jaune : mode Surprise.
- Un **panier** de nourriture (avec pastille du nombre d'aliments en attente, représentée par des points, pas par un chiffre).
- Un **cadenas** discret en coin pour les parents.
- Au toucher d'une île, le dino nomme la catégorie (« L'île de l'anglais ! ») puis l'écran zoome dessus.

### 4.4 Écran de catégorie
- Les mini-jeux apparaissent comme des **cabanes / objets** sur l'île, chacun avec une icône parlante (ex. oreille + images pour « Écoute et touche »).
- Au premier toucher sur un jeu jamais joué : le dino explique le jeu en une phrase et montre une **démonstration animée** (main fantôme).
- Un dé de catégorie : mini-jeu aléatoire dans cette île.
- Les jeux non adaptés à l'âge/niveau ne sont pas cachés mais affichés plus petits (ils restent jouables).

### 4.5 Modes de jeu
| Mode | Comportement |
|------|--------------|
| **Ciblé** | L'enfant choisit l'île puis le mini-jeu. Les séries s'enchaînent sur ce mini-jeu. |
| **Catégorie aléatoire** | Dé d'une île : chaque série choisit un mini-jeu différent de l'île (jamais deux fois de suite le même). |
| **Surprise** | Dé de l'accueil : chaque série tire une île puis un jeu, pondéré pour équilibrer les catégories les moins jouées. |

Le parent peut désactiver certaines catégories ou certains jeux (§11).

---

## 5. Boucle de jeu : séries, récompenses, nourrissage

```
 Série (≤10 questions) → Bilan (étoiles) → Récompenses (aliments) → [Encore | Nourrir | Accueil]
                                                       │
                                       Garde-manger ───┴──→ Nourrir Dino → XP → Niveau ↑ → Croissance
```

**Le succès d'une série n'augmente jamais directement le niveau du dinosaure** : il donne des
aliments. Seul le fait de **nourrir** le dino fait progresser sa jauge.

### 5.1 Série
- Longueur : **10 questions maximum**. Par défaut : 6 questions pour les 3–4 ans, 8 pour 5 ans,
  10 pour 6–7 ans (réglable par le parent : 5 / 8 / 10).
- La série peut être quittée à tout moment (bouton retour) ; les réponses déjà données sont
  enregistrées, mais aucune récompense n'est donnée pour une série incomplète de moins de 3 questions.
  Une série interrompue après ≥ 3 questions donne des récompenses calculées au prorata.
- Une **barre de progression en pas** (petites empreintes de dino qui se colorent) indique
  l'avancement, sans chiffre.

### 5.2 Déroulé d'une question
1. Affichage des choix (apparition animée), puis le dino pose la question (audio).
2. Les choix deviennent touchables **dès le début** de la consigne (ne pas frustrer les rapides),
   sauf pour les jeux d'énumération (§8, EN-2) où ils le deviennent après l'énumération.
3. **Bonne réponse** : son joyeux, la carte grossit et rebondit, le dino réagit (`happy`),
   prononce une courte phrase (1 fois sur 3, pour garder le rythme) et répète le mot juste
   (renforcement).
4. **Mauvaise réponse** : petit son doux, la carte se grise et s'écarte, le dino dit une phrase
   d'encouragement et **répète la consigne**. L'enfant réessaie parmi les choix restants.
5. Après **2 erreurs** sur la même question, la bonne réponse se met à scintiller ; l'enfant la touche
   pour continuer (apprentissage sans échec).
6. **Comptabilisation** : seule une réussite **du premier coup** compte comme succès (pour les étoiles,
   le taux de réussite et la maîtrise de la question). Toute autre issue compte comme échec.

### 5.3 Bilan de série
- Calcul : `score = réussites_du_premier_coup / nombre_de_questions`.
- Étoiles :

| Score | Étoiles | Réaction du dino |
|-------|---------|------------------|
| ≥ 90 % | ★★★ | Fête (`dance`, confettis), réplique `series_perfect` / `series_great` |
| ≥ 70 % | ★★ | `cheer`, réplique `series_good` |
| ≥ 40 % | ★ | `happy`, réplique `series_ok` |
| < 40 % | aucune | `think` puis sourire, réplique `series_encourage` (jamais négatif) |

- Les étoiles apparaissent une par une avec son ; puis les aliments gagnés tombent dans le panier.

### 5.4 Récompenses (aliments)

| Aliment | Valeur (XP) | Rareté |
|---------|-------------|--------|
| 🌿 Feuille | 1 | commune |
| 🍎 Pomme | 2 | commune |
| 🫐 Baies | 4 | peu commune |
| 🍉 Pastèque | 6 | rare |
| ✨ Fruit d'or | 12 | très rare |

Gains par série (aliments **cumulés** par ligne applicable) :

| Condition | Aliments gagnés |
|-----------|-----------------|
| Série terminée (participation, toujours) | 🌿 ×1 |
| ★ | 🍎 ×1 |
| ★★ | 🫐 ×1 (en plus) |
| ★★★ | 🍉 ×1 (en plus) |
| Sans-faute ET niveau de difficulté ≥ 5 | 30 % de chance d'un ✨ |
| Niveau de difficulté 4–7 et ≥ ★★ | 🍎 ×1 (bonus) |
| Niveau de difficulté 8–10 et ≥ ★★ | 🫐 ×1 (bonus) |
| 1re série de la journée | 🌿 ×1 (bonus de bienvenue) |

Ordre de grandeur : une série ★★★ au niveau 5 ≈ 1 + 2 + 4 + 6 + 2 = **15 XP**, au niveau 1 ≈ 13 XP,
une série sans étoile ≈ 1 XP.

Variantes visuelles (même valeur) selon la catégorie jouée pour rendre les gains plus vivants :
ex. la Pomme devient poire, banane, orange… ; les aliments sont toujours végétariens et
reconnaissables.

### 5.5 Nourrissage
- Écran **Garde-manger** : les aliments en attente sont posés sur une nappe.
- L'enfant **glisse** un aliment jusqu'à la bouche du dino (la bouche s'ouvre quand l'aliment approche).
  Pour les 3 ans, un simple **toucher** sur l'aliment l'envoie aussi vers la bouche.
- Le dino mâche, la **jauge de croissance** (dessinée sur son ventre, sans chiffre) se remplit.
- **Ventre plein** : le dino peut manger **au maximum 40 XP par jour** (réglable par le parent :
  20 / 40 / 60). Au-delà, il dit « J'ai le ventre tout plein ! On garde le reste pour demain ? »
  et les aliments restent dans le garde-manger (rien n'est jamais perdu).
- Ce plafond quotidien est le principal frein à une progression trop rapide et encourage une
  pratique régulière et courte plutôt que de longues sessions.

---

## 6. Progression du dinosaure

### 6.1 Niveaux et XP
- **20 niveaux** de dinosaure.
- XP nécessaire pour passer du niveau `n` au niveau `n+1` :

  `XP(n) = 10 + round(8 × n^1.3)`

| Niveau | XP pour monter | Cumul |
|--------|----------------|-------|
| 1 → 2 | 18 | 18 |
| 2 → 3 | 30 | 48 |
| 3 → 4 | 43 | 91 |
| 5 → 6 | 75 | 225 |
| 10 → 11 | 170 | 875 |
| 15 → 16 | 280 | 2 049 |
| 19 → 20 | 378 | 3 412 |

- Rythme estimé : avec ~3 séries réussies par jour (≈ 35–40 XP), le niveau 20 est atteint en
  **environ 3 mois** de pratique régulière, et le plafond quotidien rend impossible de l'atteindre
  en moins de ~85 jours. Les premiers niveaux restent rapides (motivation), les suivants ralentissent.
- Tous les paramètres (formule, valeurs des aliments, plafond) sont des **constantes de configuration**
  pour ajuster l'équilibrage sans republier l'application (fichier `balance.json` du CDN, avec
  valeurs par défaut embarquées).

### 6.2 Stades de croissance

| Stade | Niveaux | Apparence |
|-------|---------|-----------|
| 0 · Œuf | tutoriel | Œuf qui bouge — éclôt à la fin du tutoriel |
| 1 · Bébé | 1–4 | Tout petit, grosse tête, pattes courtes |
| 2 · Petit | 5–8 | Plus grand, apprend à sauter |
| 3 · Junior | 9–12 | Crête/plaques qui poussent |
| 4 · Grand | 13–16 | Silhouette élancée, voix un peu plus grave (mêmes répliques, pitch différent) |
| 5 · Géant | 17–20 | Majestueux, ne tient plus en entier à l'écran (gag récurrent) |

À chaque passage de niveau : animation `levelUp` (le dino brille et grandit), réplique `level_up`,
photo automatique ajoutée à l'**album de croissance**.

### 6.3 Déblocages
Chaque niveau débloque **un élément cosmétique** (couleur, chapeau, lunettes, écharpe, motif) que
l'enfant peut équiper dans l'écran « Mon Dino ». Aucun déblocage n'est achetable.

### 6.4 Après le niveau 20
Le dino pond un **œuf d'une nouvelle espèce** (tricératops, diplodocus, ptérodactyle…). L'enfant
élève un nouveau dino ; les précédents restent visibles dans un **parc** (collection). Le niveau de
difficulté (§7) n'est pas remis à zéro : il repose sur un **niveau d'expérience global** égal au
niveau maximum atteint, pas sur le dino courant.

---

## 7. Niveau de difficulté et sélection des questions

### 7.1 Niveaux de questions
Chaque question de chaque mini-jeu porte un **niveau de difficulté de 1 à 10**.

Leviers de difficulté communs (à combiner selon le jeu) :
- fréquence / familiarité du vocabulaire ;
- proximité des distracteurs (catégorie différente → même catégorie → visuellement proches) ;
- nombre de choix (2 au niveau 1, 3 aux niveaux 2–3, 4 ensuite) ;
- longueur/complexité de la consigne ;
- abstraction (objet concret → concept, quantité, son).

### 7.2 Calcul du niveau de difficulté courant

Calculé **avant chaque série**, par profil et **par mini-jeu** :

1. **Niveau de base**, à partir du niveau d'expérience du dino `L` (1–20) et d'un décalage d'âge :

   `base = clamp(ceil(L / 2) + décalage_âge, 1, 10)`

   | Âge déclaré | 3 ans | 4 ans | 5 ans | 6 ans | 7 ans |
   |-------------|-------|-------|-------|-------|-------|
   | décalage | 0 | 0 | +1 | +2 | +3 |

2. **Taux de réussite** `T` = proportion de réussites du premier coup sur les **100 dernières
   réponses** de ce mini-jeu. S'il y a moins de 20 réponses dans ce mini-jeu, on utilise les 100
   dernières réponses de la **catégorie**, puis à défaut **toutes catégories** ; s'il y en a moins
   de 20 au total, `ajustement = 0`.

3. **Ajustement** :

   | T | ajustement |
   |---|------------|
   | ≥ 90 % | +2 |
   | 75–90 % | +1 |
   | 50–75 % | 0 |
   | 35–50 % | −1 |
   | < 35 % | −2 |

4. **Niveau cible** : `cible = clamp(base + ajustement, 1, 10)`.

5. **Lissage** : le niveau effectif d'un mini-jeu ne bouge que de **±1 par série** par rapport à la
   série précédente du même jeu (évite les sauts brusques).

Le niveau ainsi obtenu (`N`) n'est **jamais affiché** à l'enfant ; il est visible dans l'espace parents.

### 7.3 Sélection des questions d'une série

Pour une série de `k` questions au niveau `N` :

1. **Exclure** toutes les questions **maîtrisées** (réussies du premier coup au moins une fois) et
   celles posées dans les **2 dernières séries** de ce jeu.
2. **Répartition** :
   - ~20 % de **questions à retravailler** (échouées auparavant, dernière tentative datant d'au moins
     une série et de moins de 14 jours), tous niveaux ≤ N+1 ;
   - le reste tiré au sort avec pondération : **70 % niveau N, 20 % niveau N−1, 10 % niveau N+1**.
3. **Diversité** : pas deux questions consécutives portant sur le même concept ou la même bonne réponse ;
   la position de la bonne réponse est aléatoire et ne se répète pas plus de 2 fois de suite.
4. **Pool épuisé** : si le niveau N n'a plus assez de questions non maîtrisées, on élargit à N±1, N±2…
   Si **tout** le jeu est maîtrisé, on passe en **mode révision** : on repose les questions maîtrisées
   les plus anciennes (dernière réussite > 30 jours en priorité), et le dino l'annonce (« On révise
   tes champions ! »). Le jeu est alors marqué « terminé » (trophée) dans l'espace parents.
5. Les questions dont les ressources (image/audio) ne sont pas disponibles hors-ligne sont écartées.

### 7.4 Questions générées vs questions écrites
Deux sources de questions coexistent :
- **Questions écrites** (fichier de contenu, id stable) : ex. une suite logique précise.
- **Questions générées** à partir du **lexique de concepts** (§9.2) : pour « Écoute et touche »,
  chaque concept anglais de niveau N **est** une question (`id = jeu:concept`), les 3 distracteurs sont
  choisis à l'exécution selon les règles du niveau. La maîtrise est mémorisée par `id`.

### 7.5 Volume de contenu minimal

| Élément | Minimum par mini-jeu | Cible |
|---------|----------------------|-------|
| Questions par niveau | 30 | 50 |
| Questions totales (10 niveaux) | **300** | **500** |

Le lexique partagé (§9.2) permet d'atteindre ces volumes sans dupliquer images et audio : un même
concept « lama » sert à « Montre-moi », « Écoute et touche », « Le mot magique », « Bébés animaux », etc.

---

## 8. Catalogue des mini-jeux

Chaque fiche précise : principe, déroulé, écran, progression par niveau, nombre de questions.
Code : `CAT-n`. ⭐ = inclus dans la version 1.0 (MVP).

### 8.1 Catégorie Anglais (langue étrangère)

#### EN-1 ⭐ « Écoute et touche » (*Listen & Tap*)
- **Principe** : une voix anglaise native dit un mot ; l'enfant touche la bonne image parmi 4.
- **Consigne** (dino, en français la 1re fois de la série) : « Écoute bien le mot anglais et touche la
  bonne image ! » puis à chaque question, voix anglaise seule : « *Dog* ».
- **Après réponse juste** : le dino dit « *Dog*… chien ! » (lien entre les deux langues).
- **Écran** : 4 grandes cartes-images en grille 2×2 ; bouton oreille pour réentendre le mot.
- **Progression** :

| Niveau | Contenu |
|--------|---------|
| 1 | Animaux familiers, 2 choix (dog, cat) |
| 2 | Couleurs, 3 choix |
| 3 | Fruits, jouets, 4 choix, distracteurs d'autres catégories |
| 4 | Nombres 1–10 (images de quantités), parties du corps |
| 5 | Vêtements, maison, distracteurs de la même catégorie |
| 6 | Nourriture, véhicules, météo |
| 7 | Actions simples (*run, eat, sleep* – images d'actions) |
| 8 | Adjectifs (*big/small, hot/cold*) |
| 9 | Mots proches phonétiquement (*ship/sheep, cat/hat*) |
| 10 | Petites phrases (*The cat is under the table*) |

#### EN-2 ⭐ « Le mot magique » (*Find the English word*)
- **Principe** : le dino demande « Comment dit-on **chien** en anglais ? » ; 4 cartes portant chacune
  un mot anglais s'affichent. Le dino **énumère lentement** les 4 mots anglais ; **pendant qu'il
  prononce un mot, la carte correspondante est entourée** (cercle lumineux animé + légère
  pulsation). L'enfant touche ensuite la carte du bon mot.
- **Écran** : l'image du mot français en haut (support visuel : un chien), 4 cartes en ligne
  (paysage) ou 2×2 (portrait). Les cartes n'ont **pas d'image** (sinon la réponse serait évidente) :
  elles portent le mot écrit (exposition à l'écrit pour les 6–7 ans) et une **couleur/forme distincte**
  (rond rouge, carré bleu, triangle vert, étoile jaune) pour que les non-lecteurs puissent mémoriser la
  position et la forme associée au son.
- **Interaction** : les cartes sont verrouillées pendant l'énumération (choix légèrement transparents),
  puis s'activent. Le bouton oreille **rejoue l'énumération complète**. Débit : pause de 1,2 s entre
  les mots (1,6 s aux niveaux 1–3).
- **Progression** : identique au lexique de EN-1 ; aux niveaux 1–2, 2 mots ; 3 mots aux niveaux 3–4 ;
  4 ensuite ; aux niveaux 8–10, distracteurs phonétiquement proches.

#### EN-3 « Dino dit » (*Simon says*)
- **Principe** : « *Touch the red ball!* » — scène avec plusieurs objets de couleurs/tailles différentes ;
  l'enfant touche l'objet demandé.
- Niveau 1 : couleur seule (*red*). Niveau 5 : couleur + objet. Niveau 8 : taille + couleur + objet
  (*the small blue car*). Niveau 10 : deux consignes enchaînées.

#### EN-4 « Les paires qui parlent » (*Memory*)
- Jeu de mémoire : 4 à 12 cartes retournées ; certaines montrent une image, d'autres un haut-parleur
  qui dit le mot anglais. Il faut associer image ↔ son. Le niveau fait varier le nombre de paires et la
  difficulté du vocabulaire. Une « question » = une grille ; une série = 3 à 5 grilles.

#### EN-5 « Compte en anglais » (*Count with me*)
- « *How many apples?* » ; l'enfant touche le bon nombre parmi des cartes-quantités (points) ;
  le dino compte ensuite à voix haute en anglais. Niveaux : 1–3 puis jusqu'à 20.

### 8.2 Catégorie Français (langue de l'application)

#### FR-1 ⭐ « Le son du début » (*phonologie*)
- « Touche l'image qui commence par le son **[m]**… comme **m**aison ! » ; 4 images.
- Niveaux : voyelles longues (1–2), consonnes continues /m/ /s/ /f/ /l/ (3–4), occlusives /p/ /t/ /b/
  (5–6), sons proches /b/-/p/ /f/-/v/ (7–8), son de fin, puis attaques complexes /tr/ /bl/ (9–10).

#### FR-2 ⭐ « Ça rime ! »
- « Quel mot rime avec **chat** ? » — rat / lune / pomme / vélo.
- Niveaux : rimes très saillantes (1–4), puis rimes de 2 phonèmes, puis distracteurs partageant le
  début du mot (piège), puis rimes en fin de mots longs.

#### FR-3 « Tape les syllabes »
- Le dino dit un mot (« papillon ») ; l'enfant **tape sur le tambour** autant de fois qu'il y a de
  syllabes, puis touche le dino pour valider (ou choisit parmi 1 à 4 points). Niveaux : 1 à 4 syllabes,
  puis mots à syllabes complexes.

#### FR-4 « Les lettres » (5–7 ans, débloqué à partir du niveau 4 de difficulté)
- « Touche la lettre **A** » parmi 4 lettres (majuscules → minuscules → cursives) ; puis « Quelle
  lettre fait le son [o] ? ». Lien avec FR-1.

#### FR-5 « Les contraires »
- « Le contraire de **grand**, c'est… » ; images (petit / rouge / chaud / chat). Puis notions
  spatiales : dessus/dessous, devant/derrière, dedans/dehors.

#### FR-6 « Écoute l'histoire » (compréhension orale)
- Une phrase ou une mini-histoire de 2–3 phrases illustrée, puis une question : « Qui a mangé le
  gâteau ? » ; 4 images. Niveaux : de la phrase simple à l'inférence (« Pourquoi Léo prend-il son
  parapluie ? »).

### 8.3 Catégorie Logique

#### LO-1 ⭐ « La suite » (*patterns*)
- Une frise (🔴🔵🔴🔵❓) ; l'enfant choisit l'élément manquant parmi 3–4.
- Niveaux : AB (1–2), AAB / ABB (3–4), ABC (5), croissance de taille ou de quantité (6–7), double
  critère couleur + forme (8–9), rotation/orientation (10).

#### LO-2 ⭐ « L'intrus »
- 4 images, une n'appartient pas au groupe : « Lequel n'est pas comme les autres ? ».
- Niveaux : couleur évidente (1–2) → forme → catégorie (fruit parmi animaux) → sous-catégorie
  (animal marin parmi animaux de la ferme) → propriété abstraite (ce qui ne vole pas).

#### LO-3 ⭐ « Combien ? » (dénombrement)
- « Montre-moi **3** pommes » (choisir le panier qui en contient 3) ou « Combien de poissons ? »
  (cartes 1–4 en points).
- Niveaux : 1–3 (1–2), jusqu'à 5 (3–4), jusqu'à 10 (5–7), comparaison plus/moins (8), petites
  additions avec objets (9–10).

#### LO-4 « Les ombres »
- Associer un objet à sa silhouette parmi 4. Niveaux : silhouettes très différentes → très proches
  → silhouettes tournées.

#### LO-5 « Du plus petit au plus grand »
- Glisser 3 à 5 objets dans l'ordre (taille, quantité, puis étapes d'une histoire : graine → pousse →
  fleur). Glisser-déposer avec « aimantation » généreuse.

#### LO-6 « Le bon rangement » (tri)
- Glisser chaque objet dans la bonne boîte (couleur, forme, puis catégorie). Une question = un objet
  à ranger.

#### LO-7 « Labyrinthe de Dino » (Flame)
- Tracer avec le doigt le chemin de Dino vers sa nourriture. Niveaux : chemin unique → impasses →
  ramasser les objets dans l'ordre demandé.

### 8.4 Catégorie Monde

#### MO-1 ⭐ « Montre-moi » (*Show me*)
- « Montre-moi **le lama** ! » ; 4 images.
- Thèmes successifs : animaux de la ferme (1–2), fruits/légumes, véhicules, animaux sauvages (3–5),
  métiers, instruments de musique, objets du quotidien, animaux rares (6–8), phénomènes naturels,
  monuments, planètes (9–10). Aux hauts niveaux, distracteurs proches (lama / alpaga / chameau /
  mouton).

#### MO-2 ⭐ « Qui fait ce bruit ? »
- Un son est joué (vache, pluie, ambulance, violon…) ; l'enfant touche la source parmi 4 images.
- Niveaux : animaux familiers → véhicules → instruments → bruits de la nature → sons proches
  (chouette/coucou).

#### MO-3 « Où j'habite ? » (habitats)
- « Où vit le poisson ? » → mer / désert / forêt / banquise ; puis glisser l'animal dans son habitat.

#### MO-4 « Les bébés animaux »
- « Qui est le bébé de la vache ? » → veau / poussin / chaton / poulain ; puis le nom des petits.

#### MO-5 « Qui mange quoi ? »
- Associer animal ↔ nourriture (lapin → carotte). Aux niveaux élevés : herbivore / carnivore.

#### MO-6 « Les saisons et la météo »
- « Montre-moi l'hiver », « Que mets-tu quand il pleut ? », ordre des saisons.

#### MO-7 « Mon corps »
- « Montre-moi le genou » sur une illustration d'enfant (zones touchables), puis les 5 sens
  (« Avec quoi on entend ? »).

#### MO-8 « Les métiers »
- « Qui soigne les animaux ? » ; 4 images de métiers ; outils associés aux métiers.

### 8.4 bis Jeux à voix haute (VO-1 à VO-12)
L'enfant répond **en parlant** : il touche un gros bouton micro (le micro ne s'allume qu'à ce moment),
le dino écoute au plus 6 secondes, puis corrige.
- **Reconnaissance sur l'appareil** (Vosk en WebAssembly) : aucune voix enregistrée ni envoyée (§14).
  Elle choisit seulement entre la bonne réponse (avec ses variantes : féminin, synonymes), des mauvaises
  réponses plausibles et « [unk] » (bruit, mot inconnu). Les petits mots (« c'est un… ») sont ignorés.
- **Correction indulgente** : bonne réponse entendue (même entourée d'autres mots) → bravo ; autre réponse
  entendue avec confiance ≥ 0,6 → erreur (« J'ai entendu : chat ») ; sinon « pas entendu », qui ne compte
  pas. Après deux essais, ou si le modèle ne connaît pas le mot, la question se joue **au doigt** (cartes).
  Trois questions de suite sans rien entendre : la fin de la série se joue au doigt.
- **Aides** : après une erreur, le dino fait répéter (« Écoute bien : le chien. À toi ! » ; en anglais :
  « Répète après moi : dog ») ou donne un indice (famille, première lettre).
- **Packs** : un modèle par langue (≈ 40 Mo, français et anglais), facultatif, téléchargé une fois depuis
  l'espace parents et gardé par le navigateur ; les jeux à voix haute n'apparaissent qu'avec le micro
  autorisé et le pack de leur langue. Ils ne sont pas mélangés aux autres jeux.

| Jeu | Âge | Contenu |
|-----|-----|---------|
| VO-1 Comment ça s'appelle ? | 3+ | Nommer l'image (vocabulaire de « Montre-moi ») |
| VO-2 Say it in English! | 5+ | Dire le mot en anglais (pack anglais) |
| VO-3 Lis à voix haute | 5+ | Lire un mot (capitales, minuscules, attaché) |
| VO-4 à VO-12 | 5+ | Devinettes et questions par thème : animaux, métiers, sport, espace, saisons et météo, formes et couleurs, pays et peuples, mon pays, nature |

### 8.5 Moteur générique de mini-jeux
Pour limiter le code, les jeux reposent sur un petit nombre de **gabarits** :

| Gabarit | Jeux |
|---------|------|
| `audio_to_image` (consigne audio → 4 images) | EN-1, EN-3, FR-1, FR-2, FR-5, FR-6, MO-1…MO-8, LO-2, LO-4 |
| `enumerated_choice` (énumération audio + surlignage) | EN-2, FR-4 (variante) |
| `sequence_complete` | LO-1 |
| `count` | LO-3, EN-5 |
| `drag_order` / `drag_sort` | LO-5, LO-6, MO-3 |
| `memory_pairs` | EN-4 |
| `tap_rhythm` | FR-3 |
| `trace_path` (Flame) | LO-7 |
| `body_hotspot` | MO-7 |

Un nouveau mini-jeu = un **fichier de contenu** + éventuellement un nouveau gabarit.

---

## 9. Contenus : modèle de données, images, audio

### 9.1 Hébergement : pourquoi pas une API d'images publique en direct
Les API publiques (Unsplash, Pixabay, Wikimedia, Open Images…) **ne doivent pas être interrogées
directement par l'application** :
- risque d'images inadaptées à des enfants ou ambiguës (un « lama » qui serait un dessin abstrait) ;
- style visuel incohérent (photos + dessins mélangés : les enfants s'y perdent) ;
- licences et attributions, quotas, disponibilité, latence ;
- non-conformité aux règles « Familles » des stores (contenus et appels tiers non maîtrisés).

**Solution retenue** : images **sélectionnées / produites en amont** (illustrations dans un style
unique ; éventuellement sourcées sur Wikimedia/CC0 ou générées puis validées manuellement), publiées
sur **notre propre CDN**, **non embarquées** dans l'application mais :
- téléchargées **par paquets de niveau** (« packs ») à la demande ;
- **préchargées** en arrière-plan pour la série suivante dès le début d'une série ;
- conservées dans un **cache disque** (LRU, limite par défaut 150 Mo, réglable) ;
- le **pack niveau 1–2** de chaque jeu MVP et toutes les interfaces/dino sont embarqués pour que le
  premier lancement fonctionne même hors-ligne.

Formats : images **WebP** 512×512 (≈ 20–40 Ko), quelques **SVG** pour formes/lettres ; audio **Opus/OGG**
mono 48 kbit/s (AAC `.m4a` pour iOS si nécessaire), ≈ 5–10 Ko par mot.

### 9.2 Lexique de concepts (partagé entre jeux)

```jsonc
// concepts/animals.json (extrait)
{
  "id": "llama",
  "tags": ["animal", "mammal", "farm_exotic", "andes"],
  "image": "img/animals/llama.webp",
  "sound": "sfx/animals/llama.opus",          // optionnel (MO-2)
  "level": { "show_me": 4, "listen_tap": 6 },  // niveau par jeu si différent
  "similar": ["alpaca", "camel", "sheep"],     // distracteurs difficiles
  "i18n": {
    "fr": { "word": "lama", "article": "le", "audio": "voice/fr/word/llama.opus",
            "baby": "petit lama", "first_phoneme": "l", "syllables": 2 },
    "en": { "word": "llama", "audio": "voice/en/word/llama.opus" }
  }
}
```

### 9.3 Définition d'un mini-jeu

```jsonc
// games/world_show_me.json
{
  "id": "MO-1",
  "category": "world",
  "template": "audio_to_image",
  "icon": "ui/games/show_me.webp",
  "intro_line": "game.show_me.intro",       // clé de réplique du dino
  "prompt_line": "game.show_me.prompt",     // « Montre-moi {article} {word} ! »
  "generator": {
    "source": "concepts",
    "filter": { "tags_any": ["animal", "vehicle", "food", "job", "instrument"] },
    "choices_by_level": [2, 3, 3, 4, 4, 4, 4, 4, 4, 4],
    "distractors_by_level": ["other_category", "other_category", "other_category",
                             "same_category", "same_category", "same_category",
                             "similar", "similar", "similar", "similar"]
  },
  "questions": []                            // questions écrites additionnelles
}
```

### 9.4 Question écrite (exemple LO-1)

```jsonc
{
  "id": "LO-1:0042",
  "level": 4,
  "sequence": ["shape/circle_red", "shape/circle_red", "shape/square_blue",
               "shape/circle_red", "shape/circle_red", "?"],
  "answer": "shape/square_blue",
  "choices": ["shape/square_blue", "shape/circle_red", "shape/triangle_green"]
}
```

### 9.5 Manifeste et mises à jour
- `manifest.json` (CDN) : version du contenu, liste des packs, empreintes (hash) des fichiers, version
  minimale de l'app compatible.
- Au lancement (si en ligne) : comparaison des versions, téléchargement **différentiel** des fichiers
  modifiés. Une question dont l'`id` est conservé garde sa maîtrise ; un `id` supprimé est ignoré.
- Ajouter des questions/jeux = publier du contenu, **sans mise à jour de l'application** (tant que le
  gabarit existe).

### 9.6 Audio
- **Voix du dino** : une seule voix, chaleureuse et enjouée, par langue. Recommandé : enregistrement
  par un comédien pour les répliques récurrentes (≈ 400 répliques), TTS neuronal de haute qualité
  pour les mots du lexique (des milliers), avec relecture humaine.
- **Mots anglais** : voix native anglaise (accent britannique ou américain, au choix, mais constant).
- **Phrases à trous** : « Montre-moi » + « le lama » sont deux fichiers enchaînés sans blanc
  (`just_audio` ConcatenatingAudioSource, silences rognés au pipeline) ; préférer, pour les jeux
  principaux, des **phrases complètes pré-générées** (« Montre-moi le lama ! ») qui sonnent plus naturel.
- **Sons** : effets d'interface courts et doux ; musique d'ambiance par île, très discrète, coupée
  pendant que le dino parle (*ducking*).
- Volume normalisé (−16 LUFS), pas de son brusque ou fort.

---

## 10. Internationalisation

- Deux notions distinctes :
  - **Langue de l'application** (`appLocale`) : voix du dino, catégorie « langue maternelle ».
    V1 : `fr`.
  - **Langue étrangère** (`foreignLocale`) : catégorie « langue étrangère ». V1 : `en`.
- La catégorie « Français » s'appelle en interne `native_language` ; la catégorie « Anglais »,
  `foreign_language`. Avec `appLocale = en`, l'île « langue maternelle » devient English et l'île
  « langue étrangère » peut proposer français ou espagnol.
- Toutes les répliques : clés (`series.perfect.03`) → fichiers audio par langue.
- Les jeux phonologiques (FR-1, FR-2, FR-3) ont un contenu **propre à chaque langue** (rimes et
  phonèmes ne se traduisent pas) : un fichier de contenu par langue.
- Les jeux à concepts (MO, LO, EN) réutilisent le lexique ; seule la couche `i18n` est à compléter.
- Les rares textes visibles (espace parents) passent par les fichiers ARB de Flutter (`intl`).
- Mise en page compatible RTL (arabe, hébreu) dès la V1 (`Directionality`), même si non utilisée.
- Choix de la langue : dans l'espace parents uniquement, avec par défaut la langue du système si elle
  est supportée.

---

## 11. Espace parents

### 11.1 Verrou parental
- Accès par le cadenas : épreuve **réservée aux lecteurs adultes** : « Touchez les chiffres
  *sept*, *deux*, *neuf* » écrits en toutes lettres (aléatoire), conforme aux exigences Apple Kids /
  Google Families. Échec → retour à l'accueil sans message négatif.

### 11.2 Fonctions
- **Profils** : jusqu'à 4 enfants ; avatar (couleur de dino), prénom (facultatif, stocké localement),
  âge (3–7, sert au décalage de difficulté §7.2).
- **Suivi** : temps de jeu par jour, séries jouées, taux de réussite par catégorie et par jeu,
  niveau de difficulté actuel par jeu, mots maîtrisés (liste avec écoute), jeux terminés.
- **Réglages** :
  - durée maximale de jeu par jour (15 / 30 / 45 min / illimité) → à l'échéance le dino s'endort et
    l'app affiche l'écran de nuit (seul l'espace parents reste accessible) ;
  - longueur des séries (5 / 8 / 10) ;
  - plafond quotidien de nourriture (20 / 40 / 60 XP) ;
  - catégories et jeux activés ;
  - forçage du niveau de difficulté d'un jeu (ou « automatique ») ;
  - volume musique / effets / voix séparés ;
  - langue de l'app et langue étrangère ;
  - téléchargement anticipé de tous les contenus (pour un voyage) et taille du cache ;
  - réinitialiser un profil (avec double confirmation).
- **Conseils** : petits textes pédagogiques sur chaque jeu (objectif, comment prolonger hors écran).
- **Fiches à imprimer** (version web) : à la fin du temps de jeu du jour (ou au coucher), l'enfant
  choisit une enveloppe parmi trois (familles différentes : coloriage, réflexion, écriture, découpage,
  jeu). La fiche, générée en SVG A4 avec le dino de l'enfant et adaptée à son âge et à ses progrès,
  attend les parents dans l'onglet « À imprimer », avec ses conseils (ce qu'elle fait travailler,
  comment en parler, comment prolonger, matériel, solution). Un diplôme tous les 5 niveaux du dino.
  Détail : `web/README.md`, code : `web/src/print/`.

---

## 12. Architecture logicielle

### 12.1 Couches

```
┌───────────────────────────────────────────────────────────────┐
│ Présentation   Écrans Flutter, widgets, DinoWidget (Rive)     │
├───────────────────────────────────────────────────────────────┤
│ Application    Contrôleurs Riverpod : SessionController,      │
│                SeriesController, FeedingController, Guide     │
├───────────────────────────────────────────────────────────────┤
│ Domaine        DifficultyService, QuestionSelector,           │
│                RewardService, ProgressionService,             │
│                DistractorPicker, VoiceLinePicker (pur Dart,   │
│                100 % testé)                                   │
├───────────────────────────────────────────────────────────────┤
│ Données        ContentRepository (manifeste, packs, cache),   │
│                ProgressRepository (Drift), AudioService,      │
│                SettingsRepository                             │
└───────────────────────────────────────────────────────────────┘
```

### 12.2 Arborescence du projet

```
dinolearn/
├── app/                          # application Flutter
│   ├── lib/
│   │   ├── main.dart
│   │   ├── core/                 # thème, constantes, routes, i18n
│   │   ├── dino/                 # DinoWidget, DinoController (Rive), lip-sync
│   │   ├── audio/                # AudioService, file d'attente de répliques, ducking
│   │   ├── content/              # modèles, ContentRepository, cache, manifeste
│   │   ├── progress/             # base Drift, ProgressRepository
│   │   ├── domain/               # difficulté, sélection, récompenses, progression
│   │   ├── games/
│   │   │   ├── engine/           # SeriesController, gabarits communs
│   │   │   └── templates/        # audio_to_image, enumerated_choice, sequence…
│   │   └── screens/              # home, category, series_end, pantry, my_dino, parents
│   ├── assets/                   # dino.riv, UI, sons d'interface, pack de démarrage
│   └── test/
├── content/                      # sources de contenu (YAML/CSV) par jeu et par langue
├── tools/                        # pipeline : validation, TTS, optimisation, publication
└── docs/
```

### 12.3 Composants clés
- **DinoController** : API unique pour faire parler/réagir le dino depuis n'importe quel écran
  (`say(lineKey)`, `react(Reaction)`, `point(Offset)`), file d'attente des répliques, synchronisation
  bouche ↔ audio. Un seul dino « vivant » à la fois.
- **AudioService** : canaux voix / effets / musique, priorités (la voix interrompt la musique, une
  nouvelle consigne coupe la précédente), préchargement.
- **SeriesController** : machine à états `intro → question → feedback → … → bilan → récompenses`.
- **QuestionSelector**, **DifficultyService**, **RewardService**, **ProgressionService** : fonctions
  pures paramétrées par `balance.json`, couvertes par des tests unitaires.

---

## 13. Données locales et persistance

Tout est stocké **sur l'appareil** (pas de compte, pas de serveur de données personnelles en V1).

### 13.1 Schéma (Drift / SQLite)

```sql
profile(id, avatar, name NULL, age, app_locale, foreign_locale, created_at)

dino(id, profile_id, species, level, xp, stage, skin, hat, glasses, scarf, is_active, hatched_at)

answer(id, profile_id, game_id, category, question_id, level,
       first_try_success BOOL, attempts INT, response_ms INT, series_id, answered_at)
  -- index (profile_id, game_id, answered_at DESC) pour la fenêtre des 100 dernières réponses

question_state(profile_id, game_id, question_id,
               mastered BOOL, mastered_at NULL, last_failed_at NULL, times_seen INT)
  -- PRIMARY KEY (profile_id, game_id, question_id)

series(id, profile_id, game_id, mode, level, questions, first_try_successes, stars, started_at, ended_at)

game_level(profile_id, game_id, current_level, updated_at)   -- pour le lissage ±1

pantry(profile_id, food_type, quantity)

feeding_log(id, profile_id, dino_id, food_type, xp, fed_at)   -- pour le plafond quotidien

unlock(profile_id, item_id, unlocked_at)

voice_line_history(profile_id, line_group, variant, played_at) -- anti-répétition

settings(profile_id NULL, key, value)
```

- La table `answer` est purgée au-delà de 1 000 lignes par jeu et par profil (seules les 100
  dernières servent au calcul ; `question_state` conserve la maîtrise de façon permanente).
- **Sauvegarde** : export/import d'un fichier chiffré depuis l'espace parents ; sauvegarde
  automatique via les mécanismes du système (iCloud backup / Android Auto Backup), sans serveur tiers.

---

## 14. Confidentialité, sécurité et conformité stores

- **Aucune publicité**, aucun SDK publicitaire ni de suivi tiers.
- **Aucune donnée personnelle envoyée** : les seules requêtes réseau sont des téléchargements de
  fichiers statiques du CDN (sans identifiant).
- **Micro** : désactivé par défaut, autorisé par le parent ; allumé seulement pendant l'écoute d'une
  réponse ; le son est analysé sur l'appareil et jamais enregistré ni transmis.
- Analyse d'usage éventuelle : uniquement agrégée, anonyme, **opt-in parental**, et via un outil
  compatible « Kids » (ou aucune en V1).
- Conformité : **RGPD (art. 8, mineurs)**, **COPPA**, programme **Google Play « Conçu pour les
  familles »**, catégorie **Apple « Enfants »** (pas de liens sortants ni d'achats sans verrou
  parental).
- Pas d'achat intégré en V1. Si un modèle payant est introduit plus tard : achat unique ou
  abonnement **uniquement** depuis l'espace parents.
- Pas de notification push destinée à l'enfant.
- Contenus : relecture humaine de chaque image et audio avant publication (pipeline avec statut
  `validé`).

---

## 15. Exigences non fonctionnelles

| Domaine | Exigence |
|---------|----------|
| Plateformes | Android 7+ (API 24), iOS 14+ ; téléphones et tablettes |
| Taille | Application installée ≤ **40 Mo** (pack de démarrage inclus) |
| Performance | 60 fps sur appareil d'entrée de gamme (2 Go RAM) ; démarrage à froid ≤ 3 s |
| Latence | Retour visuel ≤ 100 ms après un toucher ; début de l'audio ≤ 200 ms (préchargé) |
| Hors-ligne | Toute série dont le pack est en cache est jouable sans réseau ; message visuel (dino à la longue-vue) sinon, avec proposition d'un jeu disponible |
| Robustesse | Une ressource manquante n'interrompt jamais une série (question remplacée) |
| Batterie | Pas d'animation lourde en arrière-plan ; Rive en pause hors écran |
| Accessibilité | Contrastes forts, cibles larges, pas d'information portée uniquement par la couleur (formes + couleurs), option « réduire les animations » |
| Ergonomie enfant | Tests utilisateurs avec des enfants de 3, 5 et 7 ans avant chaque jalon |
| Qualité | Tests unitaires du domaine ≥ 90 % ; tests widget des gabarits ; tests d'intégration du parcours série → nourrissage |

---

## 16. Feuille de route

### V0.1 — Prototype (≈ 4 semaines)
- Dino Rive (stade Bébé) qui parle avec lip-sync ; accueil ; gabarit `audio_to_image` ; jeu EN-1 sur
  2 niveaux ; série + bilan + étoiles. **Test avec des enfants.**

### V1.0 — MVP (≈ 3–4 mois)
- 4 îles, modes ciblé / catégorie aléatoire / Surprise.
- Jeux ⭐ : **EN-1, EN-2, FR-1, FR-2, LO-1, LO-2, LO-3, MO-1, MO-2** (9 jeux × 10 niveaux × ≥ 30
  questions).
- Récompenses, garde-manger, nourrissage, 20 niveaux, 6 stades, cosmétiques.
- Difficulté adaptative, maîtrise, révision.
- CDN + cache + pack de démarrage ; espace parents complet ; profils.
- Français (app) + anglais (langue étrangère).

### V1.x
- Jeux EN-3, EN-4, FR-3, FR-5, LO-4, LO-5, LO-6, MO-3, MO-4, MO-5.
- Nouvelles espèces après le niveau 20, parc de collection.

### V2
- Nouvelles langues d'app (anglais, espagnol…) et langues étrangères.
- FR-4, FR-6, LO-7 (Flame), MO-6, MO-7, MO-8.
- Synchronisation optionnelle entre appareils (compte parent).

---

## 17. Annexes

### 17.1 Paramètres d'équilibrage (`balance.json`, valeurs par défaut)

```json
{
  "series_length_by_age": { "3": 6, "4": 6, "5": 8, "6": 10, "7": 10 },
  "stars_thresholds": [0.4, 0.7, 0.9],
  "food_xp": { "leaf": 1, "apple": 2, "berries": 4, "watermelon": 6, "golden_fruit": 12 },
  "golden_fruit_chance": 0.3,
  "golden_fruit_min_level": 5,
  "daily_xp_cap": 40,
  "dino_max_level": 20,
  "xp_formula": { "a": 10, "b": 8, "exp": 1.3 },
  "age_level_offset": { "3": 0, "4": 0, "5": 1, "6": 2, "7": 3 },
  "success_window": 100,
  "success_window_min": 20,
  "success_adjust": [[0.9, 2], [0.75, 1], [0.5, 0], [0.35, -1], [0.0, -2]],
  "level_mix": { "same": 0.7, "below": 0.2, "above": 0.1 },
  "retry_share": 0.2,
  "max_level_step_per_series": 1,
  "hint_after_wrong_attempts": 2,
  "idle_reminder_s": 8,
  "idle_point_s": 15
}
```

### 17.2 Répliques du dino (extraits — ≥ 15 variantes par groupe)

| Groupe | Exemples |
|--------|----------|
| `welcome` | « Coucou ! Tu m'as manqué ! » · « Te revoilà ! On joue ? » · « Youpi, mon copain est là ! » |
| `home_choose` | « Choisis une île ! » · « Où est-ce qu'on va aujourd'hui ? » |
| `correct` | « Bravo ! » · « Exactement ! » · « Trop fort ! » · « Tu as l'œil ! » · « Super, c'est ça ! » |
| `wrong` | « Presque ! Essaie encore. » · « Hmm, regarde bien… » · « Pas celui-là, mais tu vas trouver ! » |
| `hint` | « Je t'aide : c'est celui qui brille ! » |
| `series_perfect` | « Waouh, tout juste ! Tu es un champion ! » · « Sans faute ! Je danse de joie ! » |
| `series_good` | « Très bien joué ! Tu progresses vite ! » · « Bravo, tu en as trouvé plein ! » |
| `series_ok` | « Bien joué ! On continue à s'entraîner ensemble ? » |
| `series_encourage` | « C'était difficile, hein ? Moi aussi j'apprends ! On réessaie ? » · « Chaque fois, ton cerveau devient plus fort ! » |
| `reward` | « Regarde tout ce que tu as gagné ! » · « Miam, ça a l'air bon ! » |
| `feed_ask` | « J'ai un petit creux… tu me donnes à manger ? » |
| `eating` | « Miam miam ! » · « Croc ! Délicieux ! » · « Encore une, s'il te plaît ! » |
| `full` | « J'ai le ventre tout plein ! On garde le reste pour demain ? » |
| `level_up` | « Oh ! Je grandis ! Merci de bien t'occuper de moi ! » |
| `continue_ask` | « On en refait une ? » (accompagné du gros bouton ▶) |
| `idle` | « Tu es toujours là ? » · « Je t'attends… je compte les nuages. » |
| `sleepy` | « Je suis tout fatigué… On rejoue demain ? Bonne nuit ! » |
| `review_mode` | « Tu connais déjà tout ici ! On révise tes champions ? » |
| `offline` | « Oh, je ne trouve pas ce jeu… Essayons celui-là ! » |
| `streak` | (3 bonnes réponses de suite) « Et de trois ! Tu es en feu ! » |
| `tickle` | (toucher le dino à l'accueil) « Hihi, ça chatouille ! » |

Règles : choix aléatoire pondéré, pas de répétition parmi les 5 dernières variantes d'un même
groupe ; après un `series_encourage`, la série suivante démarre automatiquement à un niveau ≤ au
précédent (lissage −1 possible grâce au taux de réussite).

### 17.3 Pseudo-code du calcul de difficulté

```dart
int computeLevel(Profile p, String gameId) {
  final base = clamp((p.experienceLevel / 2).ceil() + cfg.ageOffset[p.age]!, 1, 10);
  final window = answers.lastN(p.id, game: gameId, n: 100);
  final sample = window.length >= 20 ? window
      : answers.lastN(p.id, category: categoryOf(gameId), n: 100).orIfShorterThan(20,
          answers.lastN(p.id, n: 100));
  final adjust = sample.length < 20 ? 0 : cfg.adjustFor(sample.successRate);
  final target = clamp(base + adjust, 1, 10);
  final previous = gameLevels.get(p.id, gameId) ?? target;
  return clamp(target, previous - 1, previous + 1);
}
```

### 17.4 Pseudo-code de sélection

```dart
List<Question> pickSeries(Profile p, Game g, int level, int k) {
  final recent = seriesHistory.lastQuestionIds(p.id, g.id, series: 2);
  final candidates = g.questions
      .where((q) => !state.isMastered(p.id, g.id, q.id) && !recent.contains(q.id))
      .where(content.isAvailableOffline);

  final retry = candidates.where((q) => state.failedRecently(p.id, g.id, q.id, days: 14)
                                        && q.level <= level + 1);
  final picks = <Question>[...retry.shuffled().take((k * cfg.retryShare).round())];

  while (picks.length < k) {
    final l = weightedLevel(level);                 // 70 % N, 20 % N-1, 10 % N+1
    final q = nearestAvailable(candidates, l, exclude: picks);  // élargit N±1, N±2…
    if (q == null) break;
    picks.add(q);
  }
  if (picks.length < k) picks.addAll(reviewMastered(p, g, k - picks.length)); // mode révision
  return diversify(picks);                         // pas 2 concepts identiques à la suite
}
```

### 17.5 Critères d'acceptation du MVP (extraits)
- Un enfant de 3 ans, sans aide après la première démonstration, lance un jeu, termine une série et
  nourrit le dino (test observé, ≥ 4 enfants sur 5).
- Aucune question réussie du premier coup n'est reposée tant que le jeu possède des questions non
  maîtrisées (test automatisé sur 1 000 séries simulées).
- Le niveau de difficulté varie au plus de 1 entre deux séries d'un même jeu.
- Le dino ne peut pas absorber plus que le plafond quotidien d'XP ; les aliments excédentaires sont
  conservés.
- L'application installée pèse ≤ 40 Mo ; une série complète se joue hors-ligne si son pack est en
  cache.
- Aucun texte n'est nécessaire pour utiliser l'application hors de l'espace parents (revue écran par écran).
