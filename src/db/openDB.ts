import type { JotaiIDBConfig, StoreDefinition } from "../types/index.js";

/**
 * Opens or creates an IndexedDB database with the specified configuration.
 * Creates the object store and indexes if they don't exist.
 */
export function openDB(config: JotaiIDBConfig): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(config.dbName, config.version);

    request.onerror = () => {
      reject(new Error(`Failed to open database: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      createStoreAndIndexes(db, config.store);
    };
  });
}

/**
 * Creates the object store and indexes if they don't exist
 */
function createStoreAndIndexes(
  db: IDBDatabase,
  storeDefinition: StoreDefinition,
): void {
  const { name, keyPath, indexes = [] } = storeDefinition;

  // Create object store if it doesn't exist
  if (!db.objectStoreNames.contains(name)) {
    const store = db.createObjectStore(name, { keyPath });

    // Create indexes
    for (const index of indexes) {
      store.createIndex(index.name, index.keyPath, {
        unique: index.unique ?? false,
        multiEntry: index.multiEntry ?? false,
      });
    }
  }
}
