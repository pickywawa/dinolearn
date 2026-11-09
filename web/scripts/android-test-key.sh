#!/usr/bin/env bash
# Crée la clé de signature des APK de test et la range dans les secrets du dépôt GitHub
# (jamais dans les fichiers : le dépôt est public). À lancer une seule fois, sur le Mac,
# avec le compte GitHub du dépôt connecté à `gh` (gh auth login).
set -euo pipefail
REPO="${1:-pickywawa/dinolearn}"
KEYTOOL="${JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}/bin/keytool"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
PW="$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-28)"
"$KEYTOOL" -genkeypair -keystore "$TMP/test.keystore" -alias dinolearn-test -keyalg RSA -keysize 2048 \
  -validity 10000 -storepass "$PW" -keypass "$PW" -dname "CN=DinoLearn Test, O=DinoLearn, C=FR" >/dev/null 2>&1
base64 -i "$TMP/test.keystore" | gh secret set ANDROID_TEST_KEYSTORE_BASE64 --repo "$REPO"
printf '%s' "$PW" | gh secret set ANDROID_TEST_KEYSTORE_PASSWORD --repo "$REPO"
echo "Clé de test créée et rangée dans les secrets de $REPO (copie locale effacée)."
