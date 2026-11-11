# DinoLearn — appli Android et iOS

L'appli embarque le jeu compilé (`dist/`) avec [Capacitor](https://capacitorjs.com). Tout fonctionne hors ligne,
moteur de voix Piper compris (`public/piper/`, copié depuis les paquets npm par `npm run piper`). Seuls les packs de
langue se téléchargent au premier lancement, depuis HuggingFace : les voix (`rhasspy/piper-voices`) et la
reconnaissance vocale (dataset `pickywawa/dinolearn-voice-packs`, publié par le workflow « Publier les packs de
reconnaissance vocale »). Publication sur les stores : voir [STORES.md](STORES.md).

## Tester l'APK Android

Chaque release GitHub (onglet *Releases*) contient `dinolearn-vX.Y.Z.apk`. Sur la tablette : télécharger l'APK,
autoriser « Installer des applis inconnues » pour le navigateur, l'ouvrir. Les APK de test sont signés avec une clé
de test rangée **uniquement dans les secrets GitHub** (`ANDROID_TEST_KEYSTORE_BASE64`, `ANDROID_TEST_KEYSTORE_PASSWORD`) :
chaque nouvelle version s'installe par-dessus la précédente.

**Aucune clé ni mot de passe dans le dépôt (il est public).** Les clés vont dans *Settings → Secrets and variables →
Actions* du dépôt GitHub.

## Construire sur le Mac

```bash
npm run android   # compile le jeu et le copie dans android/
npm run ios       # idem pour ios/
npx cap open android   # Android Studio (JDK 21)
npx cap open ios       # Xcode
```

APK en ligne de commande : `cd android && ./gradlew assembleRelease` (JDK 21, par exemple celui d'Android Studio).

## Publier sur les stores (plus tard)

- **Google Play** : créer une clé de publication, puis ajouter au dépôt les secrets `ANDROID_KEYSTORE_BASE64`,
  `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` : la release signe alors avec cette clé.
  Pour la fiche Play : public « enfants », formulaire Familles, déclaration du micro (réponses à voix haute,
  traitées sur l'appareil), politique de confidentialité : `https://pickywawa.github.io/dinolearn/confidentialite.html`.
- **App Store** : compte développeur Apple, équipe de signature dans Xcode, catégorie Enfants, même politique de
  confidentialité ; la phrase d'explication du micro est dans `ios/App/App/Info.plist`.

## Réglages natifs

- Android : `android/app/src/main/AndroidManifest.xml` (paysage, micro, Documents), `MainActivity.java`
  (plein écran, encoche, son sans geste).
- iOS : `ios/App/App/Info.plist` (paysage, micro, barre d'état), `AppDelegate.swift` (son en mode silencieux).
- Identifiant de l'appli : `fr.dinolearn.app` (à ne plus changer une fois publiée).
