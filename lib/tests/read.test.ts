import { beforeEach, describe, expect, test } from "@rstest/core";
import { createTestDB, store } from "./setup.js";

describe("Read Operations", () => {
  let db: ReturnType<typeof createTestDB>;

  beforeEach(() => {
    db = createTestDB();
  });

  test("returns empty items initially", async () => {
    await store.get(db.suspendBeforeInit);
    const items = store.get(db.items);
    expect(items).toEqual({});
  });

  test("returns empty keys initially", async () => {
    await store.get(db.suspendBeforeInit);
    const keys = store.get(db.keys);
    expect(keys).toEqual([]);
  });

  test("returns empty entries initially", async () => {
    await store.get(db.suspendBeforeInit);
    const entries = store.get(db.entries);
    expect(entries).toEqual([]);
  });

  test("returns undefined for non-existent item", async () => {
    await store.get(db.suspendBeforeInit);
    const item = store.get(db.item("non-existent"));
    expect(item).toBeUndefined();
  });
});
