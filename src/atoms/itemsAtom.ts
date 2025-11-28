import { atom } from 'jotai';
import { getAll } from '../db/queries.js';
import type { RecordType } from '../types/index.js';

/**
 * Creates a writable atom that reads all items from the store
 * The write function is used for invalidation only
 */
export function createItemsAtom<T extends RecordType>(
  db: IDBDatabase,
  storeName: string,
) {
  return atom(
    async () => {
      return getAll<T>(db, storeName);
    },
    async () => {
      // write function for invalidation - re-read from IDB
      return getAll<T>(db, storeName);
    },
  );
}
