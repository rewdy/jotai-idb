/**
 * A record must have a string ID field
 */
export interface RecordType {
  id: string;
  [key: string]: unknown;
}

/**
 * Defines a single index on the object store
 */
export interface IndexDefinition {
  name: string;
  keyPath: string | string[];
  unique?: boolean;
  multiEntry?: boolean;
}

/**
 * Defines the object store structure
 */
export interface StoreDefinition {
  name: string;
  keyPath: string;
  indexes?: IndexDefinition[];
}

/**
 * Configuration for JotaiIDB
 */
export interface JotaiIDBConfig<T extends RecordType = RecordType> {
  dbName: string;
  version: number;
  store: StoreDefinition;
  /**
   * Initial data to populate the store with on first creation.
   * This data is only added when the database is first created (during onupgradeneeded).
   * Keyed by record ID.
   */
  initialData?: Record<string, T>;
}

/**
 * Range query specification
 */
export interface RangeQuery {
  index: string;
  lower?: IDBValidKey;
  upper?: IDBValidKey;
  lowerOpen?: boolean;
  upperOpen?: boolean;
  reverse?: boolean;
}

/**
 * Result of a range query
 */
export type RangeQueryResult<T extends RecordType> = Array<[string, T]>;

/**
 * Action for the setter atom
 */
export type SetterAction<T extends RecordType> =
  | { type: "put"; value: T }
  | { type: "delete"; id: IDBValidKey };
