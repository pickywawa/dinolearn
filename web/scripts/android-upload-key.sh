#!/usr/bin/env bash
# Crée la clé d'envoi Google Play (« upload key ») de DinoLearn. À lancer UNE SEULE FOIS, sur le Mac,
# avec le compte GitHub du dépôt connecté à `gh` (gh auth login).
# - la clé et son mot de passe sont gardés sur le Mac, hors du dépôt : ~/.config/dinolearn/
#   (à sauvegarder : sans elle, il faut demander à Google de la réinitialiser) ;
# - une copie va dans les secrets du dépôt GitHub (ANDROID_KEYSTORE_*), pour que la release
#   construise aussi le .aab. Le dépôt est public : jamais de clé dans les fichiers.
set -euo pipefail
REPO="${1:-pickywawa/dinolearn}"
DIR="$HOME/.config/dinolearn"
STORE="$DIR/upload.keystore"
KEYTOOL="${JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}/bin/keytool"
if [ -e "$STORE" ]; then
  echo "La clé d'envoi existe déjà : $STORE (rien n'est changé)."
  exit 1
fi
mkdir -p "$DIR"
chmod 700 "$DIR"
PW="$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-28)"
"$KEYTOOL" -genkeypair -keystore "$STORE" -alias dinolearn-upload -keyalg RSA -keysize 2048 \
  -validity 10000 -storepass "$PW" -keypass "$PW" -dname "CN=DinoLearn, O=DinoLearn, C=FR" >/dev/null 2>&1
printf 'ANDROID_KEYSTORE_FILE=%s\nANDROID_KEYSTORE_PASSWORD=%s\nANDROID_KEY_ALIAS=dinolearn-upload\nANDROID_KEY_PASSWORD=%s\n' \
  "$STORE" "$PW" "$PW" > "$DIR/upload.env"
chmod 600 "$STORE" "$DIR/upload.env"
base64 -i "$STORE" | gh secret set ANDROID_KEYSTORE_BASE64 --repo "$REPO"
printf '%s' "$PW" | gh secret set ANDROID_KEYSTORE_PASSWORD --repo "$REPO"
printf '%s' "$PW" | gh secret set ANDROID_KEY_PASSWORD --repo "$REPO"
printf 'dinolearn-upload' | gh secret set ANDROID_KEY_ALIAS --repo "$REPO"
echo "Clé d'envoi créée : $STORE (mot de passe dans $DIR/upload.env), copiée dans les secrets de $REPO."
echo "Pense à sauvegarder le dossier $DIR (gestionnaire de mots de passe, clé USB…)."
