import { beforeEach, describe, expect, test } from "@rstest/core";
import { createTestDB, store, type TestRecord } from "./setup.js";

describe("Write Operations", () => {
  let db: ReturnType<typeof createTestDB>;

  beforeEach(async () => {
    db = createTestDB();
    // Trigger initialization
    await store.get(db.suspendBeforeInit);
  });

  test("puts a single record", async () => {
    const record: TestRecord = {
      id: "user-1",
      type: "user",
      name: "Alice",
      createdAt: Date.now(),
    };

    await store.set(db.setter, { type: "put", value: record });

    const items = store.get(db.items);
    expect(Object.keys(items || {})).toHaveLength(1);
    expect(items?.["user-1"]).toEqual(record);
  });

  test("puts multiple records", async () => {
    const records: TestRecord[] = [
      {
        id: "user-1",
        type: "user",
        name: "Alice",
        createdAt: Date.now(),
      },
      {
        id: "post-1",
        type: "post",
        name: "First Post",
        createdAt: Date.now(),
      },
    ];

    for (const record of records) {
      await store.set(db.setter, { type: "put", value: record });
    }

    const items = store.get(db.items);
    expect(Object.keys(items || {})).toHaveLength(2);
  });

  test("updates existing record", async () => {
    const original: TestRecord = {
      id: "user-1",
      type: "user",
      name: "Alice",
      createdAt: Date.now(),
    };

    await store.set(db.setter, { type: "put", value: original });

    const updated: TestRecord = {
      ...original,
      name: "Alice Updated",
    };

    await store.set(db.setter, { type: "put", value: updated });

    const item = store.get(db.item("user-1"));
    expect(item?.name).toBe("Alice Updated");
  });

  test("deletes a record", async () => {
    const record: TestRecord = {
      id: "user-1",
      type: "user",
      name: "Alice",
      createdAt: Date.now(),
    };

    await store.set(db.setter, { type: "put", value: record });
    expect(Object.keys(store.get(db.items) || {})).toHaveLength(1);

    await store.set(db.setter, { type: "delete", id: "user-1" });
    expect(Object.keys(store.get(db.items) || {})).toHaveLength(0);
  });
});
