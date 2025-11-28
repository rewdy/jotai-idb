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
export interface JotaiIDBConfig {
  dbName: string;
  version: number;
  store: StoreDefinition;
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
