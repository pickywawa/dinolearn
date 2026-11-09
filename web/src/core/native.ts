import { Capacitor } from '@capacitor/core';

/**
 * Le jeu tourne dans l'appli Android / iOS (Capacitor), et non dans un navigateur.
 * L'appli embarque tout le jeu ; seuls les packs de langue se téléchargent.
 */
export const isNative = () => Capacitor.isNativePlatform();

/** Site du jeu : l'appli y télécharge les packs de reconnaissance vocale. */
export const SITE = 'https://pickywawa.github.io/dinolearn/';

/** Adresse d'un pack de reconnaissance vocale : à côté du jeu sur le site, depuis le site dans l'appli. */
export const voiceAsset = (path: string) => new URL(path, isNative() ? SITE : document.baseURI).href;
