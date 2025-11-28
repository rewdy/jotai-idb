import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import type { SetterAction } from '../atoms/setterAtom.js';
import { openDB } from '../db/openDB.js';
import { getAll, getAllByRange, getAllKeys, getById } from '../db/queries.js';
import { deleteRecord, putRecord } from '../db/writes.js';
import type { JotaiIDBConfig, RangeQuery, RecordType } from '../types/index.js';

/**
 * Main JotaiIDB class for managing IndexedDB state with Jotai atoms
 * Initialize with await: const db = await new JotaiIDB(config).init()
 */
export class JotaiIDB<T extends RecordType> {
  private db: IDBDatabase | null = null;
  private storeName: string;
  private config: JotaiIDBConfig;

  // Public atoms
  items = atom(async () => {
    if (!this.db) throw new Error('JotaiIDB not initialized');
    return getAll<T>(this.db, this.storeName);
  });

  keys = atom(async () => {
    if (!this.db) throw new Error('JotaiIDB not initialized');
    return getAllKeys(this.db, this.storeName);
  });

  entries = atom(async () => {
    if (!this.db) throw new Error('JotaiIDB not initialized');
    const items = await getAll<T>(this.db, this.storeName);
    return items.map((item) => [item.id, item] as const);
  });

  // Atom families
  private itemAtomFamilyFn = atomFamily((id: string) =>
    atom(async () => {
      if (!this.db) throw new Error('JotaiIDB not initialized');
      return getById<T>(this.db, this.storeName, id);
    }),
  );

  private rangeAtomFamilyFn = atomFamily((query: RangeQuery) =>
    atom(async () => {
      if (!this.db) throw new Error('JotaiIDB not initialized');
      return getAllByRange<T>(this.db, this.storeName, query);
    }),
  );

  // Setter atom for write operations
  setter = atom(null, async (_get, _set, action: SetterAction<T>) => {
    if (!this.db) throw new Error('JotaiIDB not initialized');

    if (action.type === 'put') {
      await putRecord(this.db, this.storeName, action.value);
      // Note: Atoms will be re-evaluated on next read due to Jotai's default behavior
    } else if (action.type === 'delete') {
      await deleteRecord(this.db, this.storeName, action.id);
      // Note: Atoms will be re-evaluated on next read due to Jotai's default behavior
    }
  });

  constructor(config: JotaiIDBConfig) {
    this.config = config;
    this.storeName = config.store.name;
  }

  /**
   * Initialize the database
   * Must be called before using the instance
   */
  async init(): Promise<this> {
    this.db = await openDB(this.config);
    return this;
  }

  /**
   * Get an atom for a single item by ID
   */
  item(id: string) {
    if (!this.db) {
      throw new Error('JotaiIDB not initialized. Call await init() first.');
    }
    return this.itemAtomFamilyFn(id);
  }

  /**
   * Get an atom for a range query
   */
  range(query: RangeQuery) {
    if (!this.db) {
      throw new Error('JotaiIDB not initialized. Call await init() first.');
    }
    return this.rangeAtomFamilyFn(query);
  }
}
