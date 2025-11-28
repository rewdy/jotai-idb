import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import { getAllByRange } from "../db/queries.js";
import type { RangeQuery, RecordType } from "../types/index.js";

/**
 * Creates an atom family for range queries
 * Each atom in the family is writable for invalidation purposes
 */
export function createRangeAtom<T extends RecordType>(
  db: IDBDatabase,
  storeName: string,
) {
  return atomFamily((query: RangeQuery) => {
    return atom(
      async () => {
        return getAllByRange<T>(db, storeName, query);
      },
      async () => {
        // write function for invalidation - re-read from IDB
        return getAllByRange<T>(db, storeName, query);
      },
    );
  });
}
