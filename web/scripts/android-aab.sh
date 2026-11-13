#!/usr/bin/env bash
# Construit le .aab Google Play sur le Mac, signé avec la clé d'envoi (~/.config/dinolearn/upload.env,
# créée par scripts/android-upload-key.sh). Résultat : web/dinolearn-<version>.aab
set -euo pipefail
cd "$(dirname "$0")/.."
ENV="$HOME/.config/dinolearn/upload.env"
if [ ! -f "$ENV" ]; then
  echo "Clé d'envoi introuvable ($ENV) : lance d'abord scripts/android-upload-key.sh."
  exit 1
fi
set -a
# shellcheck disable=SC1090
. "$ENV"
set +a
# Java 21 d'Android Studio (le JAVA_HOME du Mac peut être un Java plus ancien).
export JAVA_HOME="${DINOLEARN_JAVA_HOME:-/Applications/Android Studio.app/Contents/jbr/Contents/Home}"
VERSION="$(node -p "require('./package.json').version")"
npm run build
node scripts/app-assets.mjs
npx cap sync android
(cd android && ./gradlew bundleRelease --no-daemon)
cp android/app/build/outputs/bundle/release/app-release.aab "dinolearn-v$VERSION.aab"
echo "Prêt : web/dinolearn-v$VERSION.aab"
