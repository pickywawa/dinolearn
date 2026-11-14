# Publier DinoLearn sur Google Play et l'App Store

Ce qu'il faut savoir et répondre pour publier DinoLearn. L'appli ne contient ni publicité, ni achat, ni compte, ni statistiques : **aucune donnée ne quitte l'appareil**.

## Comptes

| | Google Play | App Store |
|---|---|---|
| Compte | Personnel possible (25 $, une fois) | Individuel possible (99 €/an) |
| Monétiser plus tard | Possible en compte personnel : nom, adresse et téléphone deviennent publics (statut « commerçant », règlement européen DSA) | Possible en compte individuel : ton nom apparaît comme vendeur |
| Particularité | Compte personnel récent : **test fermé obligatoire, 12 testeurs pendant 14 jours**, avant la production | Aucune |
| Compte entreprise | Demande un numéro D-U-N-S (donc une société) | Idem |

## Ce qui est déjà prêt dans le projet

- Icônes Android (adaptatives) et iOS, écran de démarrage, cible Android API 36.
- Texte d'autorisation du micro sur iOS dans les 20 langues (`ios/App/App/<langue>.lproj/InfoPlist.strings`).
- Manifeste de confidentialité iOS (`ios/App/App/PrivacyInfo.xcprivacy`) : aucun suivi, aucune donnée collectée.
- Déclaration de chiffrement iOS (`ITSAppUsesNonExemptEncryption = NO`) : uniquement du HTTPS standard.
- Politique de confidentialité : `public/confidentialite.html`, en ligne sur https://pickywawa.github.io/dinolearn/confidentialite.html.
- Écran « Crédits et licences » dans l'espace parents (onglet Réglages).
- Espace parents (et ses liens) protégé par le code parent : c'est la « barrière parentale » qu'exige Apple.

## Google Play

**Public cible et contenu**
- Tranches d'âge : *5 ans et moins* et *6 à 8 ans*. L'appli entre donc dans le programme **Familles**.
- Publicités : **non**. Achats intégrés : **non**.
- Catégorie : *Éducation* (ou *Jeux > Éducatif*).
- Classification du contenu (questionnaire IARC) : pas de violence, pas de contenu sexuel, pas de jeux d'argent, pas d'échanges entre utilisateurs, pas d'achat.

**Sécurité des données**
- Données collectées : **aucune**. Données partagées : **aucune**.
- Le micro : l'audio est traité **sur l'appareil** et n'est ni stocké ni transmis, il ne compte donc pas comme « collecté ».
- Chiffrement en transit : oui (HTTPS) ; suppression des données : tout est local (« Tout recommencer » dans l'espace parents, ou désinstaller l'appli).

**Permissions à justifier**
- `RECORD_AUDIO` : jeux à voix haute, reconnaissance vocale sur l'appareil, uniquement quand l'enfant touche le bouton micro.
- `INTERNET` : téléchargement des voix et de la reconnaissance vocale au premier lancement.

**Fiches du store** (titre, descriptions, icône 512, image de présentation 1024×500)
- Textes des 20 langues : `fastlane/listings.py` → `fastlane/metadata/android/<langue>/`. Les fiches ne promettent que ce qui existe dans la langue (lecture et fiches à imprimer : français seulement ; jeux à voix haute : seulement avec une reconnaissance vocale).
- Envoi direct : `npm run play:listings` (vérifie), puis `node scripts/play-listings.mjs --commit` (enregistre). Il faut une clé de compte de service dans `~/.config/dinolearn/play-key.json` (jamais dans le dépôt), et un premier .aab envoyé à la main dans la Play Console.
- Captures d'écran : à placer dans `fastlane/metadata/android/en-US/images/phoneScreenshots/` (langue par défaut de la fiche : en-US) (et `tenInchScreenshots/` pour les tablettes).

## App Store

- Catégorie : **Enfants**, tranches *5 ans et moins* et *6 à 8 ans* (ou *Éducation*, sans la catégorie Enfants).
- Confidentialité de l'appli (« étiquette nutritionnelle ») : **Aucune donnée collectée**.
- Achats intégrés : aucun. Connexion : aucune.
- Fiches (nom, sous-titre, description, mots-clés) : `python3 fastlane/appstore.py` → `fastlane/metadata/ios/<langue>/`. Apple n'a pas de fiche pour l'ourdou, le persan ni le népalais (anglais par défaut).
- Captures : `fastlane/metadata/ios/<langue>/screenshots/{iphone,ipad}/` (iPhone 16 Pro Max 2868×1320, iPad Pro 13" 2752×2064, prises sur simulateur).
- Envoi : `NODE_USE_ENV_PROXY=1 node scripts/asc-listings.mjs` (vérifie), puis `--commit` (enregistre, ne soumet pas). Clé d'API App Store Connect : `~/.config/dinolearn/AuthKey_<ID>.p8` + `asc.env` (ASC_KEY_ID, ASC_ISSUER_ID), jamais dans le dépôt. Équipe : `DEVELOPMENT_TEAM` dans le projet Xcode.
- Version : renseigner `MARKETING_VERSION` (= version du jeu, ex. 0.23.0) et augmenter `CURRENT_PROJECT_VERSION` à chaque envoi, dans Xcode.

## Notes pour l'examinateur (à copier)

> **Français**
> DinoLearn est un jeu éducatif pour les 3-7 ans, sans publicité, sans achat ni compte : tout reste sur l'appareil.
> Au premier lancement, l'appli télécharge la voix du dino et la reconnaissance vocale de la langue de l'appareil (environ 100 à 150 Mo) : une connexion Wi-Fi est conseillée, la progression s'affiche en bas de l'écran.
> Ensuite : toucher l'œuf 4 fois pour le faire éclore, écouter le dino (bouton « Passer » en bas à droite), puis un parent remplit la fiche de l'enfant et choisit un code à 4 chiffres. Ce code ouvre l'espace parents (bouton « Paramètres » de l'accueil).
> Le micro sert uniquement aux jeux à voix haute : la reconnaissance se fait sur l'appareil, rien n'est enregistré ni envoyé.

> **English**
> DinoLearn is an educational game for children aged 3 to 7, with no ads, no purchases and no account: everything stays on the device.
> On first launch, the app downloads the dino's voice and the speech recognition for the device language (about 100–150 MB). Wi-Fi is recommended; progress is shown at the bottom of the screen.
> Then: tap the egg 4 times to hatch it, listen to the dino (a "Skip" button is at the bottom right), then a parent fills in the child's details and chooses a 4-digit code. This code opens the parents' area ("Settings" button on the home screen).
> The microphone is only used for the speaking games: recognition runs on the device, nothing is recorded or sent.

## Points à garder en tête

**Licences des voix** : tout est cité dans l'écran « Crédits et licences ». Trois voix interdisent l'usage commercial (CC BY-NC-SA 4.0) et n'ont pas d'équivalent libre compatible avec le moteur :

| Langue | Voix | Licence |
|---|---|---|
| Hindi | hi_IN-priyamvada-medium | CC BY-NC-SA 4.0 |
| Turc | tr_TR-dfki-medium | CC BY-NC-SA 4.0 |
| Coréen | ko_KR-kss-medium | CC BY-NC-SA 4.0 |
| Chinois | zh_CN-huayan-medium | non précisée (la voix libre « chaowen » utilise une prononciation que le moteur ne gère pas) |
| Arabe | ar_JO-kareem-medium | non précisée (seule voix arabe) |
| Indonésien | id_ID-news_tts-medium | « voir la source » (seule voix indonésienne) |

Pour une appli gratuite sans publicité, c'est en principe toléré ; **avant de monétiser**, il faudra remplacer ces voix (ou désactiver ces langues).

**eSpeak NG (GPL-3.0)** : la prononciation des voix utilise eSpeak NG, sous licence GPL. Le code du jeu est public sur GitHub, ce qui répond à l'obligation de fournir les sources. Apple et la GPL font historiquement mauvais ménage, mais seul un auteur d'eSpeak NG pourrait s'en plaindre (cela n'arrive pratiquement jamais).

**Premier lancement** : sans connexion, le jeu ne démarre pas (la voix et la reconnaissance sont indispensables). Un message s'affiche, et un toucher relance le téléchargement.
