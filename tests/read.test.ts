import { beforeEach, describe, expect, test } from "@rstest/core";
import { createTestDB, store } from "./setup.js";

describe("Read Operations", () => {
  let db: Awaited<ReturnType<typeof createTestDB>>;

  beforeEach(async () => {
    db = await createTestDB();
  });

  test("returns empty items initially", async () => {
    const items = await store.get(db.items);
    expect(items).toEqual([]);
  });

  test("returns empty keys initially", async () => {
    const keys = await store.get(db.keys);
    expect(keys).toEqual([]);
  });

  test("returns empty entries initially", async () => {
    const entries = await store.get(db.entries);
    expect(entries).toEqual([]);
  });

  test("returns undefined for non-existent item", async () => {
    const item = await store.get(db.item("non-existent"));
    expect(item).toBeUndefined();
  });
});
