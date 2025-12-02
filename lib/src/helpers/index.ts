/**
 * The maximum Unicode character. Can be used for range queries
 * in IndexedDB.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#range_queries
 * @example
 * ```ts
 * import { UNICODE_MAX } from "jotai-idb";
 *
 * const users = useAtomValue(
 *   db.range({
 *     index: "byPrefix",
 *     lower: "user#",
 *     upper: `user#${UNICODE_MAX}` // Unicode max character
 *   })
 * );
 * ```
 */
export const UNICODE_MAX = "\uffff";
