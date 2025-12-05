import deepEqual from "fast-deep-equal/es6";
import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import { openDB } from "../db/openDB.js";
import { getAll, getAllByRange } from "../db/queries.js";
import { deleteRecord, putRecord } from "../db/writes.js";
import type {
  JotaiIDBConfig,
  RangeQuery,
  RecordType,
  SetterAction,
} from "../types/index.js";

type Cache<T> = Record<string, T>;

/**
 * Creates a thenable object with resolve/reject functions that can be
 * accessed externally. This is created once and reused.
 */
function createThenable<K = void>() {
  let resolve!: (data: K) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<K>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/**
 * Main JotaiIDB class for managing IndexedDB state with Jotai atoms.
 * No async initialization required - uses lazy initialization via atoms.
 *
 * @example
 * const db = new JotaiIDB<MyRecord>({
 *   dbName: "my-app",
 *   version: 1,
 *   store: { name: "main", keyPath: "id" },
 *   initialData: {
 *     "item-1": { id: "item-1", name: "First Item" },
 *   },
 * });
 *
 * // In React components:
 * const items = useAtomValue(db.items); // Suspends until ready
 * const dispatch = useSetAtom(db.setter);
 */
export class JotaiIDB<T extends RecordType> {
  private storeName: string;
  private initialData: Record<string, T>;

  // Database promise - created synchronously, resolved when DB opens
  private dbPromise: Promise<IDBDatabase>;

  // Cache stored as an atom - the single source of truth
  private cache = atom<Cache<T> | undefined>(undefined);

  // Initialization tracking
  private initStarted = atom(false);
  // Thenable for initialization - stored directly, not as an atom
  private initThenable = createThenable();

  /**
   * Atom that suspends until initialization is complete.
   * Use this in components that need to wait for the database.
   */
  suspendBeforeInit = atom(async (get) => {
    get(this.items);
    await this.initThenable.promise;
  });

  /**
   * Atom indicating whether initialization is complete.
   */
  isInitialized = atom((get) => get(this.cache) !== undefined);

  /**
   * Atom for all records in the store.
   * Triggers lazy initialization on first read.
   */
  items = atom(
    (get, { setSelf }) => {
      if (!get(this.initStarted)) {
        // Schedule initialization
        Promise.resolve().then(() => setSelf());
      }
      return get(this.cache);
    },
    async (get, set) => {
      if (!get(this.initStarted)) {
        set(this.initStarted, true);
        this.preloadData().then((data) => {
          set(this.cache, data);
          this.initThenable.resolve();
        });
      }
    },
  );

  /**
   * Atom for all keys in the store.
   */
  keys = atom((get) => Object.keys(get(this.items) || {}));

  /**
   * Atom for all [id, value] entries in the store.
   */
  entries = atom(
    (get) => Object.entries(get(this.items) || {}) as Array<[string, T]>,
  );

  /**
   * Atom family for accessing individual items by ID.
   */
  item = atomFamily((id: string) =>
    atom(
      (get) => get(this.items)?.[id],
      async (_get, set, update: T) => {
        await set(this.set, id, update);
      },
    ),
  );

  /**
   * Atom family for range queries.
   */
  range = atomFamily(
    (query: RangeQuery) =>
      atom(async (get) => {
        // Trigger initialization by reading items first
        // This ensures the cache is populated before we query
        const cache = get(this.items);
        if (cache === undefined) {
          // Cache not ready yet - wait for initialization
          await this.initThenable.promise;
        }
        const db = await this.dbPromise;
        const result = await getAllByRange<T>(db, this.storeName, query);
        return result;
      }),
    // Deep equal is required here because the query prop is an object
    // and js object comparisons use reference equality. Deep equal will properly
    // do the compare for us.
    deepEqual,
  );

  /**
   * Write atom for setting a single record.
   */
  set = atom(null, async (get, set, id: string, value: T) => {
    if (!get(this.cache)) {
      await get(this.suspendBeforeInit);
    }
    const cache = get(this.cache);
    if (!cache) {
      throw new Error("Cache was not initialized");
    }

    // Update cache optimistically
    set(this.cache, (data) => ({ ...data, [id]: value }));

    // Persist to IndexedDB
    const db = await this.dbPromise;
    await putRecord(db, this.storeName, value);
  });

  /**
   * Write atom for deleting a record.
   */
  delete = atom(null, async (get, set, id: string) => {
    if (!get(this.cache)) {
      await get(this.suspendBeforeInit);
    }
    set(this.cache, (data) => {
      const copy = { ...data };
      delete copy[id];
      return copy;
    });

    const db = await this.dbPromise;
    await deleteRecord(db, this.storeName, id);
  });

  /**
   * Convenience setter atom supporting put/delete actions. Functions
   * like a dispatch function for record modifications.
   */
  setter = atom(null, async (_get, set, action: SetterAction<T>) => {
    if (action.type === "put") {
      await set(this.set, action.value.id, action.value);
    } else if (action.type === "delete") {
      await set(this.delete, String(action.id));
    }
  });

  /**
   * Atom for clearing all records from the store.
   */
  clear = atom(null, async (get, set) => {
    if (!get(this.cache)) {
      await get(this.suspendBeforeInit);
    }
    set(this.cache, {});

    const db = await this.dbPromise;
    const transaction = db.transaction([this.storeName], "readwrite");
    const store = transaction.objectStore(this.storeName);
    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });

  constructor(config: JotaiIDBConfig<T>) {
    this.storeName = config.store.name;
    this.initialData = config.initialData ?? {};

    // Start opening the database immediately (non-blocking)
    this.dbPromise = openDB(config);
  }

  /**
   * Preload all data from IndexedDB into the cache.
   * Called during lazy initialization.
   * Merges with initialData (DB data takes precedence).
   */
  private async preloadData(): Promise<Cache<T>> {
    const db = await this.dbPromise;
    const items = await getAll<T>(db, this.storeName);
    const fromDb = Object.fromEntries(
      items.map((item) => [item.id, item]),
    ) as Cache<T>;

    // Merge initialData with DB data (DB takes precedence)
    return { ...this.initialData, ...fromDb };
  }
}
