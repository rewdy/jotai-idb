import type { WritableAtom } from "jotai";
import { atom } from "jotai";
import { deleteRecord, putRecord } from "../db/writes.js";
import type { RecordType } from "../types/index.js";

export type SetterAction<T extends RecordType> =
  | { type: "put"; value: T }
  | { type: "delete"; id: IDBValidKey };

/**
 * Creates a write-through atom that syncs writes to IndexedDB
 * and invalidates dependent atoms
 */
export function createSetterAtom<T extends RecordType>(
  db: IDBDatabase,
  storeName: string,
  itemsAtom: WritableAtom<Promise<T[]>, [], void>,
  itemAtomFamily: (
    id: string,
  ) => WritableAtom<Promise<T | undefined>, [], void>,
) {
  // Write-only atom that handles put/delete operations
  return atom(null, async (_get, set, action: SetterAction<T>) => {
    if (action.type === "put") {
      // Write to IDB
      await putRecord(db, storeName, action.value);

      // Invalidate items atom by resetting to undefined to trigger refetch
      // Using atom's write to trigger invalidation
      set(itemsAtom);

      // Invalidate the specific item atom
      set(itemAtomFamily(action.value.id));
    } else if (action.type === "delete") {
      // Delete from IDB
      await deleteRecord(db, storeName, action.id);

      // Invalidate items atom to refetch
      set(itemsAtom);

      // Invalidate the specific item atom
      set(itemAtomFamily(String(action.id)));
    }
  });
}
