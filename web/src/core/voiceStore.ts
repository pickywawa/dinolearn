/**
 * Rangement des voix et des listes de mots sur l'appareil : Cache API, ou IndexedDB
 * quand elle manque (certaines vues d'appli iOS). Utilisable dans la page comme dans
 * un worker (le calcul de la voix tourne dans un worker).
 */
export const CACHE = 'dinolearn-voices-v1';

export interface BlobStore {
  get(url: string): Promise<Blob | undefined>;
  put(url: string, blob: Blob): Promise<void>;
  clear(): Promise<void>;
}

const cacheStore: BlobStore = {
  async get(url) {
    const res = await (await caches.open(CACHE)).match(url);
    return res ? res.blob() : undefined;
  },
  async put(url, blob) {
    await (await caches.open(CACHE)).put(url, new Response(blob, { headers: { 'content-type': blob.type } }));
  },
  async clear() { await caches.delete(CACHE); },
};

function idb<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(CACHE, 1);
    open.onupgradeneeded = () => open.result.createObjectStore('files');
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const req = run(db.transaction('files', mode).objectStore('files'));
      req.onsuccess = () => { db.close(); resolve(req.result); };
      req.onerror = () => { db.close(); reject(req.error); };
    };
  });
}

const idbStore: BlobStore = {
  get: (url) => idb<Blob | undefined>('readonly', (s) => s.get(url) as IDBRequest<Blob | undefined>),
  put: (url, blob) => idb('readwrite', (s) => s.put(blob, url)).then(() => undefined),
  clear: () => idb('readwrite', (s) => s.clear()).then(() => undefined),
};

/** Le Cache API manque dans certaines vues d'appli (iOS) : IndexedDB prend le relais. */
let storePromise: Promise<BlobStore> | undefined;
export function store(): Promise<BlobStore> {
  storePromise ??= (async () => {
    try {
      if (typeof caches !== 'undefined') {
        await caches.open(CACHE);
        return cacheStore;
      }
    } catch {
      // Cache API refusée : IndexedDB.
    }
    return idbStore;
  })();
  return storePromise;
}

