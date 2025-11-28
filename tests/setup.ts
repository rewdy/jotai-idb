import "fake-indexeddb/auto";
import { getDefaultStore } from "jotai";
import { JotaiIDB } from "../src/index.js";
import type { RecordType } from "../src/types/index.js";

// Test record types
export type TestRecord = RecordType & {
  id: string;
  type: "user" | "post";
  name: string;
  createdAt: number;
};

// Test setup utilities
export const store = getDefaultStore();

export async function createTestDB() {
  return new JotaiIDB<TestRecord>({
    dbName: `test-db-${Date.now()}-${Math.random()}`,
    version: 1,
    store: {
      name: "main",
      keyPath: "id",
      indexes: [
        { name: "byType", keyPath: "type" },
        { name: "byTypeAndCreatedAt", keyPath: ["type", "createdAt"] },
      ],
    },
  }).init();
}
