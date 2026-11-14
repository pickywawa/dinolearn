// Accès à l'API App Store Connect (clé d'API de l'équipe) pour les scripts asc-*.
// La clé (.p8) n'est JAMAIS dans le dépôt : ~/.config/dinolearn/AuthKey_<KEY_ID>.p8.
// Identifiants dans ASC_KEY_ID / ASC_ISSUER_ID, sinon ~/.config/dinolearn/asc.env (lignes KEY=valeur).
// Derrière un proxy d'entreprise, lancer node avec NODE_USE_ENV_PROXY=1.
import { createPrivateKey, sign } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const BUNDLE_ID = 'fr.dinolearn.app';
const dir = join(homedir(), '.config/dinolearn');
const env = { ...process.env };
const envFile = join(dir, 'asc.env');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(\S+)/);
    if (m && !(m[1] in env)) env[m[1]] = m[2];
  }
}
const keyId = env.ASC_KEY_ID, issuer = env.ASC_ISSUER_ID;
if (!keyId || !issuer) { console.error('ASC_KEY_ID et ASC_ISSUER_ID manquent (variables ou ~/.config/dinolearn/asc.env)'); process.exit(1); }
const keyPath = join(dir, `AuthKey_${keyId}.p8`);
if (!existsSync(keyPath)) { console.error(`Clé introuvable : ${keyPath}`); process.exit(1); }
const privateKey = createPrivateKey(readFileSync(keyPath));

function jwt() {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const body = `${b64({ alg: 'ES256', kid: keyId, typ: 'JWT' })}.${b64({ iss: issuer, iat: now, exp: now + 1000, aud: 'appstoreconnect-v1' })}`;
  return `${body}.${sign('sha256', Buffer.from(body), { key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;
}

/** Appel JSON de l'API ; `path` commence par /v1/… (ou une URL complète). */
export async function api(method, path, body) {
  const res = await fetch(path.startsWith('http') ? path : `https://api.appstoreconnect.apple.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${jwt()}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${JSON.stringify(json.errors ?? json)}`);
  return json;
}
