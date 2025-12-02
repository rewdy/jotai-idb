import type {
  JotaiIDBConfig,
  RecordType,
  StoreDefinition,
} from "../types/index.js";

/**
 * Opens or creates an IndexedDB database with the specified configuration.
 * Creates the object store and indexes if they don't exist.
 * Seeds initial data if provided (only adds records that don't already exist).
 */
export function openDB<T extends RecordType>(
  config: JotaiIDBConfig<T>,
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(config.dbName, config.version);

    request.onerror = () => {
      reject(new Error(`Failed to open database: ${request.error?.message}`));
    };

    request.onsuccess = async () => {
      const db = request.result;

      // Seed initial data if provided (only adds records that don't exist)
      if (config.initialData && Object.keys(config.initialData).length > 0) {
        try {
          await seedInitialData(db, config.store.name, config.initialData);
        } catch (error) {
          // Log but don't fail - DB is still usable
          console.warn("[jotai-idb] Failed to seed initial data:", error);
        }
      }

      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      createStoreAndIndexes(db, config.store);
    };
  });
}

/**
 * Seeds initial data into the store.
 * Uses `add()` which only succeeds if the key doesn't already exist,
 * preserving any user modifications to the data.
 */
async function seedInitialData<T extends RecordType>(
  db: IDBDatabase,
  storeName: string,
  initialData: Record<string, T>,
): Promise<void> {
  const transaction = db.transaction([storeName], "readwrite");
  const store = transaction.objectStore(storeName);

  const promises: Promise<void>[] = [];

  for (const value of Object.values(initialData)) {
    // Use add() - it fails silently if the key already exists
    // This ensures we never overwrite user-modified data
    promises.push(
      new Promise<void>((resolve) => {
        const request = store.add(value);
        // Resolve on success (record added)
        request.onsuccess = () => resolve();
        // Also resolve on error (record already exists) - this is expected
        request.onerror = (e) => {
          // Prevent the error from bubbling up and aborting the transaction If the row already
          // exists, that just means the initial data has already been written. Since this
          // isn't an error, but rather expected behavior, do not bubble up an error. Just carry on.
          e.preventDefault();
          resolve();
        };
      }),
    );
  }

  await Promise.all(promises);

  // Wait for the transaction to complete
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
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
