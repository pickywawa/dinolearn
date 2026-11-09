import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/** Nom de fichier sans caractères gênants. */
const fileName = (title: string) => `${title.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '-')
  .replace(/^-|-$/g, '').slice(0, 60) || 'fiche'}.pdf`;

/**
 * Appli : Android range le PDF dans Documents/DinoLearn (les parents
 * l'impriment ensuite) ; iOS ouvre la feuille de partage (Imprimer,
 * Enregistrer dans Fichiers, AirDrop…). Renvoie le message à afficher.
 */
export async function savePdf(title: string, base64: string): Promise<string> {
  const name = fileName(title);
  if (Capacitor.getPlatform() === 'android') {
    try {
      await Filesystem.writeFile({ path: `DinoLearn/${name}`, data: base64, directory: Directory.Documents, recursive: true });
      return `Fiche enregistrée dans Documents/DinoLearn (${name}).`;
    } catch {
      // Dossier public refusé (ancien Android) : on passe par le partage.
    }
  }
  const { uri } = await Filesystem.writeFile({ path: name, data: base64, directory: Directory.Cache });
  await Share.share({ title, files: [uri], dialogTitle: 'Imprimer ou enregistrer la fiche' });
  return '';
}
