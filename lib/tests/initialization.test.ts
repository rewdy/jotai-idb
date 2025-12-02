import { beforeEach, describe, expect, test } from "@rstest/core";
import { JotaiIDB } from "../src/index.js";
import { createTestDB, store, type TestRecord } from "./setup.js";

describe("Database Initialization", () => {
  let db: ReturnType<typeof createTestDB>;

  beforeEach(() => {
    db = createTestDB();
  });

  test("creates database instance synchronously", () => {
    expect(db).toBeDefined();
  });

  test("atoms are created on construction", () => {
    expect(db.items).toBeDefined();
    expect(db.keys).toBeDefined();
    expect(db.entries).toBeDefined();
    expect(db.setter).toBeDefined();
  });

  test("isInitialized is false before first read", () => {
    const isInit = store.get(db.isInitialized);
    expect(isInit).toBe(false);
  });

  test("isInitialized becomes true after suspendBeforeInit", async () => {
    await store.get(db.suspendBeforeInit);
    const isInit = store.get(db.isInitialized);
    expect(isInit).toBe(true);
  });

  test("item atomFamily is accessible immediately", () => {
    const itemAtom = db.item("test-id");
    expect(itemAtom).toBeDefined();
  });

  test("range atomFamily is accessible immediately", () => {
    const rangeAtom = db.range({
      index: "byType",
      lower: "user",
      upper: "user",
    });
    expect(rangeAtom).toBeDefined();
  });
});

describe("Initial Data", () => {
  test("initialData is available after initialization", async () => {
    const initialData: Record<string, TestRecord> = {
      "user-1": {
        id: "user-1",
        type: "user",
        name: "Alice",
        createdAt: 1000,
      },
      "post-1": {
        id: "post-1",
        type: "post",
        name: "First Post",
        createdAt: 2000,
      },
    };

    const dbWithData = new JotaiIDB<TestRecord>({
      dbName: `test-initial-data-${Date.now()}-${Math.random()}`,
      version: 1,
      store: {
        name: "main",
        keyPath: "id",
        indexes: [{ name: "byType", keyPath: "type" }],
      },
      initialData,
    });

    await store.get(dbWithData.suspendBeforeInit);

    const items = store.get(dbWithData.items);
    expect(Object.keys(items || {})).toHaveLength(2);
    expect(items?.["user-1"]?.name).toBe("Alice");
    expect(items?.["post-1"]?.name).toBe("First Post");
  });

  test("initialData is persisted to IndexedDB", async () => {
    const dbName = `test-initial-persist-${Date.now()}-${Math.random()}`;
    const initialData: Record<string, TestRecord> = {
      "user-1": {
        id: "user-1",
        type: "user",
        name: "Bob",
        createdAt: 1000,
      },
    };

    // Create first instance with initial data
    const db1 = new JotaiIDB<TestRecord>({
      dbName,
      version: 1,
      store: { name: "main", keyPath: "id" },
      initialData,
    });
    await store.get(db1.suspendBeforeInit);

    // Create second instance without initial data - should still have the data
    const db2 = new JotaiIDB<TestRecord>({
      dbName,
      version: 1,
      store: { name: "main", keyPath: "id" },
    });
    await store.get(db2.suspendBeforeInit);

    const items = store.get(db2.items);
    expect(items?.["user-1"]?.name).toBe("Bob");
  });

  test("initialData does not overwrite user modifications", async () => {
    const dbName = `test-initial-no-overwrite-${Date.now()}-${Math.random()}`;
    const initialData: Record<string, TestRecord> = {
      "user-1": {
        id: "user-1",
        type: "user",
        name: "Original Name",
        createdAt: 1000,
      },
    };

    // Create first instance and modify the data
    const db1 = new JotaiIDB<TestRecord>({
      dbName,
      version: 1,
      store: { name: "main", keyPath: "id" },
      initialData,
    });
    await store.get(db1.suspendBeforeInit);

    // Modify the record
    await store.set(db1.setter, {
      type: "put",
      value: {
        id: "user-1",
        type: "user",
        name: "Modified Name",
        createdAt: 1000,
      },
    });

    // Create second instance WITH the same initial data
    // The modified name should be preserved, not overwritten
    const db2 = new JotaiIDB<TestRecord>({
      dbName,
      version: 1,
      store: { name: "main", keyPath: "id" },
      initialData, // Same initial data with "Original Name"
    });
    await store.get(db2.suspendBeforeInit);

    const items = store.get(db2.items);
    expect(items?.["user-1"]?.name).toBe("Modified Name");
  });
});
