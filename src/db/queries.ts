import type { RangeQuery, RecordType } from '../types/index.js';

/**
 * Retrieves all records from the object store
 */
export function getAll<T extends RecordType>(
  db: IDBDatabase,
  storeName: string,
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => {
      reject(new Error(`Failed to get all records: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      resolve(request.result as T[]);
    };
  });
}

/**
 * Retrieves a single record by ID
 */
export function getById<T extends RecordType>(
  db: IDBDatabase,
  storeName: string,
  id: IDBValidKey,
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onerror = () => {
      reject(new Error(`Failed to get record: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      resolve(request.result as T | undefined);
    };
  });
}

/**
 * Retrieves all keys from the object store
 */
export function getAllKeys(
  db: IDBDatabase,
  storeName: string,
): Promise<IDBValidKey[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAllKeys();

    request.onerror = () => {
      reject(new Error(`Failed to get all keys: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

/**
 * Retrieves records by range query on an index
 */
export function getAllByRange<T extends RecordType>(
  db: IDBDatabase,
  storeName: string,
  query: RangeQuery,
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(query.index);

    // Build the key range
    let range: IDBKeyRange | undefined;
    if (query.lower !== undefined || query.upper !== undefined) {
      if (query.lower !== undefined && query.upper !== undefined) {
        range = IDBKeyRange.bound(
          query.lower,
          query.upper,
          query.lowerOpen ?? false,
          query.upperOpen ?? false,
        );
      } else if (query.lower !== undefined) {
        range = IDBKeyRange.lowerBound(query.lower, query.lowerOpen ?? false);
      } else if (query.upper !== undefined) {
        range = IDBKeyRange.upperBound(query.upper, query.upperOpen ?? false);
      }
    }

    const request = range ? index.getAll(range) : index.getAll();

    request.onerror = () => {
      reject(
        new Error(`Failed to get records by range: ${request.error?.message}`),
      );
    };

    request.onsuccess = () => {
      let results = request.result as T[];
      if (query.reverse) {
        results = results.reverse();
      }
      resolve(results);
    };
  });
}
