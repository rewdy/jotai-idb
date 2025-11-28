import { atom } from "jotai";
import { getAllKeys } from "../db/queries.js";

/**
 * Creates a writable atom that reads all keys from the store
 * The write function is used for invalidation only
 */
export function createKeysAtom(db: IDBDatabase, storeName: string) {
  return atom(
    async () => {
      return getAllKeys(db, storeName);
    },
    async () => {
      // write function for invalidation - re-read from IDB
      return getAllKeys(db, storeName);
    },
  );
}
