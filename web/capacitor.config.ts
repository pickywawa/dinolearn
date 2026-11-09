import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Appli Android / iOS : le jeu compilé (`dist/`) embarqué dans une vue web.
 * Tout fonctionne hors ligne ; seuls les packs de langue se téléchargent au
 * premier lancement (voix depuis HuggingFace, reconnaissance depuis le site).
 */
const config: CapacitorConfig = {
  appId: 'fr.dinolearn.app',
  appName: 'DinoLearn',
  webDir: 'dist',
  backgroundColor: '#16b6ed',
  android: {
    // Les sons et la voix démarrent sans attendre un geste supplémentaire.
    allowMixedContent: false,
  },
  plugins: {
    // Encoche et barres : gérées par MainActivity (décor dessous, marges passées au jeu).
    SystemBars: { insetsHandling: 'disable' },
  },
  ios: {
    contentInset: 'never',
    scrollEnabled: false,
  },
};

export default config;
