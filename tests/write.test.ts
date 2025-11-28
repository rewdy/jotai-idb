import { beforeEach, describe, expect, test } from "@rstest/core";
import { createTestDB, store, type TestRecord } from "./setup.js";

describe("Write Operations", () => {
  let db: Awaited<ReturnType<typeof createTestDB>>;

  beforeEach(async () => {
    db = await createTestDB();
  });

  test("puts a single record", async () => {
    const record: TestRecord = {
      id: "user-1",
      type: "user",
      name: "Alice",
      createdAt: Date.now(),
    };

    await store.set(db.setter, { type: "put", value: record });

    const items = await store.get(db.items);
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual(record);
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

    const items = await store.get(db.items);
    expect(items).toHaveLength(2);
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

    const item = await store.get(db.item("user-1"));
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
    expect(await store.get(db.items)).toHaveLength(1);

    await store.set(db.setter, { type: "delete", id: "user-1" });
    expect(await store.get(db.items)).toHaveLength(0);
  });
});
