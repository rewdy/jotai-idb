import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import { getById } from "../db/queries.js";
import type { RecordType } from "../types/index.js";

/**
 * Creates an atom family for reading a single item by ID
 * Each atom in the family is writable for invalidation purposes
 */
export function createItemAtom<T extends RecordType>(
  db: IDBDatabase,
  storeName: string,
) {
  return atomFamily((id: string) => {
    return atom(
      async () => {
        return getById<T>(db, storeName, id);
      },
      async () => {
        // write function for invalidation - re-read from IDB
        return getById<T>(db, storeName, id);
      },
    );
  });
}
