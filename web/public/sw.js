// Service worker minimal de DinoLearn : il ne garde rien en cache (le jeu se met à jour
// normalement). Il répond seulement aux ouvertures de page, ce que certains navigateurs
// demandent pour proposer « Installer l'appli ». Les autres fichiers (modèles, packs de
// voix…) passent directement par le réseau, sans lui.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') event.respondWith(fetch(event.request));
});
