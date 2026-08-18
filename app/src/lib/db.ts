/**
 * A very small promise wrapper over IndexedDB.
 *
 * Written by hand rather than pulling in `idb`: the app only needs four object
 * stores and two access patterns, and keeping the dependency out means the
 * offline bundle stays small and the upgrade path stays explicit.
 */

export const DB_NAME = 'sparkboard';
export const DB_VERSION = 1;

export const STORES = {
  sessions: 'sessions',
  ideas: 'ideas',
  groups: 'groups',
  actions: 'actions',
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

let dbPromise: Promise<IDBDatabase> | null = null;

export class PersistenceError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'PersistenceError';
  }
}

export function isIndexedDbAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

export function openDb(): Promise<IDBDatabase> {
  if (!isIndexedDbAvailable()) {
    return Promise.reject(
      new PersistenceError(
        'IndexedDB is unavailable. Private-browsing modes sometimes block it; your work cannot be saved.',
      ),
    );
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.sessions)) {
        const sessions = db.createObjectStore(STORES.sessions, { keyPath: 'id' });
        sessions.createIndex('updatedAt', 'updatedAt');
      }
      for (const name of [STORES.ideas, STORES.groups, STORES.actions] as const) {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: 'id' });
          store.createIndex('sessionId', 'sessionId');
        }
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      // If another tab starts a version upgrade, let go of this handle cleanly.
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
    request.onerror = () =>
      reject(new PersistenceError('Could not open the local database.', { cause: request.error }));
    request.onblocked = () =>
      reject(
        new PersistenceError('The local database is blocked by another open tab of Sparkboard.'),
      );
  }).catch((error) => {
    dbPromise = null;
    throw error;
  });

  return dbPromise;
}

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new PersistenceError('A database request failed.', { cause: request.error }));
  });
}

export function runTransaction<T>(
  stores: StoreName[],
  mode: IDBTransactionMode,
  work: (tx: IDBTransaction) => Promise<T> | T,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(stores, mode);
        let result: T;
        let settled = false;

        tx.oncomplete = () => {
          if (!settled) {
            settled = true;
            resolve(result);
          }
        };
        tx.onerror = () => {
          if (!settled) {
            settled = true;
            reject(new PersistenceError('The database transaction failed.', { cause: tx.error }));
          }
        };
        tx.onabort = () => {
          if (!settled) {
            settled = true;
            reject(new PersistenceError('The database transaction was aborted.', { cause: tx.error }));
          }
        };

        Promise.resolve(work(tx))
          .then((value) => {
            result = value;
          })
          .catch((error) => {
            settled = true;
            try {
              tx.abort();
            } catch {
              /* already finished */
            }
            reject(error);
          });
      }),
  );
}

export const idb = {
  get: <T>(tx: IDBTransaction, store: StoreName, key: IDBValidKey) =>
    promisify<T | undefined>(tx.objectStore(store).get(key) as IDBRequest<T | undefined>),
  getAll: <T>(tx: IDBTransaction, store: StoreName) =>
    promisify<T[]>(tx.objectStore(store).getAll() as IDBRequest<T[]>),
  getAllByIndex: <T>(tx: IDBTransaction, store: StoreName, index: string, value: IDBValidKey) =>
    promisify<T[]>(tx.objectStore(store).index(index).getAll(value) as IDBRequest<T[]>),
  getAllKeysByIndex: (tx: IDBTransaction, store: StoreName, index: string, value: IDBValidKey) =>
    promisify<IDBValidKey[]>(tx.objectStore(store).index(index).getAllKeys(value)),
  put: (tx: IDBTransaction, store: StoreName, value: unknown) =>
    promisify(tx.objectStore(store).put(value)),
  delete: (tx: IDBTransaction, store: StoreName, key: IDBValidKey) =>
    promisify(tx.objectStore(store).delete(key)),
  clear: (tx: IDBTransaction, store: StoreName) => promisify(tx.objectStore(store).clear()),
};

/** Exposed for tests and for the "reset local data" affordance in settings. */
export function closeDb(): void {
  if (!dbPromise) return;
  void dbPromise.then((db) => db.close()).catch(() => undefined);
  dbPromise = null;
}
