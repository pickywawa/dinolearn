// Texte d'une release GitHub : les fichiers à télécharger d'abord, puis un lien vers le journal des
// versions (CHANGELOG.md) — et non tout l'historique.
//   node scripts/release-body.mjs <tag> <propriétaire/dépôt> <fichier,fichier…>   → texte sur la sortie
const [tag, repo, files = ''] = process.argv.slice(2);
if (!tag || !repo) {
  console.error('Usage : node scripts/release-body.mjs <tag> <propriétaire/dépôt> <fichier,fichier…>');
  process.exit(1);
}
const version = tag.replace(/^v/, '');
const names = files.split(',').filter(Boolean);
const url = (name) => `https://github.com/${repo}/releases/download/${tag}/${name}`;
const describe = (name) => {
  if (name.endsWith('.apk')) return ['📱 **Android** : appli à installer (APK) · *install the app (APK)*', name];
  if (name.endsWith('.zip')) return ['🌐 **Jeu web** compilé, à héberger soi-même · *built web game, to self-host*', name];
  return [name, name];
};
const rows = names.map((n) => {
  const [what, file] = describe(n);
  return `| ${what} | [${file}](${url(n)}) |`;
});
const site = 'https://pickywawa.github.io/dinolearn/';
console.log(`## DinoLearn ${version}

### Télécharger · Download

| | Fichier · File |
|---|---|
| 🍎 **iPhone / iPad** : App Store | [Ouvrir · Open](https://apps.apple.com/app/id6834579327) |
| ▶️ **Jouer dans le navigateur** · *Play in the browser* | [${site.replace('https://', '')}](${site}) |
${rows.join('\n')}

### Nouveautés · What's new

Le détail de cette version et des précédentes est dans le [journal des versions](https://github.com/${repo}/blob/main/CHANGELOG.md).
*The details of this and earlier versions are in the [changelog](https://github.com/${repo}/blob/main/CHANGELOG.md) (French).*`);
