import { atom } from 'jotai';
import { getAll } from '../db/queries.js';
import type { RecordType } from '../types/index.js';

/**
 * Creates a writable atom that reads all items as [id, value] pairs
 * The write function is used for invalidation only
 */
export function createEntriesAtom<T extends RecordType>(
  db: IDBDatabase,
  storeName: string,
) {
  return atom(
    async () => {
      const items = await getAll<T>(db, storeName);
      return items.map((item) => [item.id, item] as const);
    },
    async () => {
      // write function for invalidation - re-read from IDB
      const items = await getAll<T>(db, storeName);
      return items.map((item) => [item.id, item] as const);
    },
  );
}
