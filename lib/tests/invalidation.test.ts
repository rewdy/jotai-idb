import { beforeEach, describe, expect, test } from "@rstest/core";
import { createTestDB, store, type TestRecord } from "./setup.js";

describe("Cache Invalidation", () => {
  let db: ReturnType<typeof createTestDB>;

  beforeEach(() => {
    db = createTestDB();
  });

  test("items atom updates after put", async () => {
    let items = store.get(db.items);
    expect(items).toBeUndefined(); // Initially undefined before first init

    // Trigger initialization and wait
    await store.get(db.suspendBeforeInit);
    items = store.get(db.items);
    expect(Object.keys(items || {})).toHaveLength(0);

    const record: TestRecord = {
      id: "user-1",
      type: "user",
      name: "Alice",
      createdAt: Date.now(),
    };

    await store.set(db.setter, { type: "put", value: record });

    // Get fresh value from atom
    items = store.get(db.items);
    expect(Object.keys(items || {})).toHaveLength(1);
  });

  test("items atom updates after delete", async () => {
    // Trigger initialization
    await store.get(db.suspendBeforeInit);

    const record: TestRecord = {
      id: "user-1",
      type: "user",
      name: "Alice",
      createdAt: Date.now(),
    };

    await store.set(db.setter, { type: "put", value: record });
    let items = store.get(db.items);
    expect(Object.keys(items || {})).toHaveLength(1);

    await store.set(db.setter, { type: "delete", id: "user-1" });
    items = store.get(db.items);
    expect(Object.keys(items || {})).toHaveLength(0);
  });
});
