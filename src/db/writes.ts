import type { RecordType } from '../types/index.js';

/**
 * Puts a record into the object store
 */
export function putRecord<T extends RecordType>(
  db: IDBDatabase,
  storeName: string,
  value: T,
): Promise<IDBValidKey> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(value);

    request.onerror = () => {
      reject(new Error(`Failed to put record: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

/**
 * Deletes a record from the object store
 */
export function deleteRecord(
  db: IDBDatabase,
  storeName: string,
  id: IDBValidKey,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onerror = () => {
      reject(new Error(`Failed to delete record: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

/**
 * Clears all records from the object store
 */
export function clearStore(db: IDBDatabase, storeName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onerror = () => {
      reject(new Error(`Failed to clear store: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}
