import { beforeEach, describe, expect, test } from "@rstest/core";
import { createTestDB, store, type TestRecord } from "./setup.js";

describe("Item Queries", () => {
  let db: ReturnType<typeof createTestDB>;

  beforeEach(async () => {
    db = createTestDB();
    // Trigger initialization
    await store.get(db.suspendBeforeInit);

    const records: TestRecord[] = [
      {
        id: "user-1",
        type: "user",
        name: "Alice",
        createdAt: 1000,
      },
      {
        id: "post-1",
        type: "post",
        name: "First Post",
        createdAt: 2000,
      },
    ];

    for (const record of records) {
      await store.set(db.setter, { type: "put", value: record });
    }
  });

  test("gets single item by id", () => {
    const item = store.get(db.item("user-1"));
    expect(item?.id).toBe("user-1");
    expect(item?.name).toBe("Alice");
  });

  test("returns correct keys", () => {
    const keys = store.get(db.keys);
    expect(keys.sort()).toEqual(["post-1", "user-1"]);
  });

  test("returns correct entries", () => {
    const entries = store.get(db.entries);
    expect(entries).toHaveLength(2);
    const entriesSorted = entries.sort((a, b) => a[0].localeCompare(b[0]));
    expect(entriesSorted[0]).toEqual([
      "post-1",
      expect.objectContaining({ id: "post-1" }),
    ]);
  });
});
