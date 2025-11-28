import { beforeEach, describe, expect, test } from "@rstest/core";
import { createTestDB, store, type TestRecord } from "./setup.js";

describe("Cache Invalidation", () => {
  let db: Awaited<ReturnType<typeof createTestDB>>;

  beforeEach(async () => {
    db = await createTestDB();
  });

  test("items atom updates after put", async () => {
    let items = await store.get(db.items);
    expect(items).toHaveLength(0);

    const record: TestRecord = {
      id: "user-1",
      type: "user",
      name: "Alice",
      createdAt: Date.now(),
    };

    await store.set(db.setter, { type: "put", value: record });

    // Get fresh value from atom
    items = await store.get(db.items);
    expect(items).toHaveLength(1);
  });

  test("items atom updates after delete", async () => {
    const record: TestRecord = {
      id: "user-1",
      type: "user",
      name: "Alice",
      createdAt: Date.now(),
    };

    await store.set(db.setter, { type: "put", value: record });
    let items = await store.get(db.items);
    expect(items).toHaveLength(1);

    await store.set(db.setter, { type: "delete", id: "user-1" });
    items = await store.get(db.items);
    expect(items).toHaveLength(0);
  });
});
