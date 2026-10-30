## DinoLearn 0.4.0 — 5 jeux, jeu au hasard, panier de fruits

### Nouveautés
- **Accueil simplifié** : un **gros bouton vert** au centre lance un jeu au hasard (jamais deux fois
  le même d'affilée) ; un **petit bouton** (mosaïque) ouvre le choix des jeux. Le dino montre
  chaque bouton du bras.
- **3 nouveaux jeux** :
  - **Devinettes** (Monde) : des cris d'animaux (« Qui fait meuh ? ») jusqu'aux énigmes
    (« J'ai huit bras et je vis dans la mer ») ;
  - **L'intrus** (Logique) : trois images de la même famille et un intrus, de plus en plus proche ;
  - **Combien ?** (Logique) : compter de 1 à 10 fruits et toucher le bon nombre (chiffre + points),
    le dino compte ensuite à voix haute.
- **Montre-moi** beaucoup plus difficile : mots plus rares plus tôt, et leurres de la même
  sous-famille dès le niveau 2.
- **Anglais** plus facile : 2 images seulement, mot dit deux fois, lentement.
- **Toucher le dino** pendant un jeu lui fait répéter la question (le bouton oreille est supprimé).
- **Panier de fruits** : en fin de série, les fruits tombent dans un panier ; un seul toucher et le
  dino mange tout.
- **Niveau du dino** affiché sur l'accueil (étoile), réglable avec − et + pour tester.

### Installer / tester
- En ligne : https://pickywawa.github.io/dinolearn/
- Archive `dinolearn-web-v0.4.0.zip` : le jeu compilé, pour tout hébergement web statique.
- En local : `cd web && npm install && npm run dev`.

### Limites connues
- La voix dépend des voix installées sur l'appareil ; certaines vues web intégrées (dont l'aperçu
  dans l'appli Claude) n'ont pas de synthèse vocale.
- Pas encore d'espace parents.
