// Accès à l'API Google Play (compte de service) pour les scripts play-listings et play-release.
// La clé (JSON) n'est JAMAIS dans le dépôt : chemin dans PLAY_KEY, sinon ~/.config/dinolearn/play-key.json.
// Derrière un proxy d'entreprise, lancer node avec NODE_USE_ENV_PROXY=1 (les commandes npm le font).
import { createSign } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const PACKAGE = 'fr.dinolearn.app';
export const API = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE}`;
export const UPLOAD = `https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications/${PACKAGE}`;

const keyPath = process.env.PLAY_KEY ?? join(homedir(), '.config/dinolearn/play-key.json');
if (!existsSync(keyPath)) {
  console.error(`Clé du compte de service introuvable : ${keyPath}\n(variable PLAY_KEY, ou ~/.config/dinolearn/play-key.json)`);
  process.exit(1);
}
const key = JSON.parse(readFileSync(keyPath, 'utf8'));

/** Jeton d'accès OAuth du compte de service (JWT signé RS256). */
async function token() {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const body = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: key.client_email, scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
  })}`;
  const signature = createSign('RSA-SHA256').update(body).sign(key.private_key, 'base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${body}.${signature}` }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Connexion refusée : ${JSON.stringify(json)}`);
  return json.access_token;
}

const auth = { Authorization: `Bearer ${await token()}` };

/** Appel de l'API ; lève une erreur lisible si Google refuse. */
export async function call(method, url, body, headers = { 'Content-Type': 'application/json' }) {
  const res = await fetch(url, { method, headers: { ...auth, ...headers }, body });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${url.replace(API, '').replace(UPLOAD, '')} → ${res.status}\n${text}`);
  return text ? JSON.parse(text) : {};
}
