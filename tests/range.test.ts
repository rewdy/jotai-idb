import { beforeEach, describe, expect, test } from "@rstest/core";
import { createTestDB, store, type TestRecord } from "./setup.js";

describe("Range Queries", () => {
  let db: Awaited<ReturnType<typeof createTestDB>>;

  beforeEach(async () => {
    db = await createTestDB();

    const records: TestRecord[] = [
      {
        id: "user-1",
        type: "user",
        name: "Alice",
        createdAt: 1000,
      },
      {
        id: "user-2",
        type: "user",
        name: "Bob",
        createdAt: 2000,
      },
      {
        id: "post-1",
        type: "post",
        name: "First Post",
        createdAt: 3000,
      },
      {
        id: "post-2",
        type: "post",
        name: "Second Post",
        createdAt: 4000,
      },
    ];

    for (const record of records) {
      await store.set(db.setter, { type: "put", value: record });
    }
  });

  test("queries by exact index value", async () => {
    const results = await store.get(
      db.range({
        index: "byType",
        lower: "user",
        upper: "user",
      }),
    );
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.type === "user")).toBe(true);
  });

  test("queries by composite index range", async () => {
    const results = await store.get(
      db.range({
        index: "byTypeAndCreatedAt",
        lower: ["post", 3000],
        upper: ["post", 4000],
      }),
    );
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.type === "post")).toBe(true);
  });

  test("respects lowerOpen boundary", async () => {
    const results = await store.get(
      db.range({
        index: "byTypeAndCreatedAt",
        lower: ["post", 3000],
        upper: ["post", 4000],
        lowerOpen: true,
      }),
    );
    // Should exclude the record at exactly 3000
    expect(results.some((r) => r.createdAt === 3000)).toBe(false);
  });

  test("respects upperOpen boundary", async () => {
    const results = await store.get(
      db.range({
        index: "byTypeAndCreatedAt",
        lower: ["post", 3000],
        upper: ["post", 4000],
        upperOpen: true,
      }),
    );
    // Should exclude the record at exactly 4000
    expect(results.some((r) => r.createdAt === 4000)).toBe(false);
  });

  test("reverses results when reverse is true", async () => {
    const normal = await store.get(
      db.range({
        index: "byTypeAndCreatedAt",
        lower: ["user", 1000],
        upper: ["user", 2000],
      }),
    );

    const reversed = await store.get(
      db.range({
        index: "byTypeAndCreatedAt",
        lower: ["user", 1000],
        upper: ["user", 2000],
        reverse: true,
      }),
    );

    expect(reversed[0].createdAt).toBe(normal[normal.length - 1].createdAt);
    expect(reversed[reversed.length - 1].createdAt).toBe(normal[0].createdAt);
  });

  test("queries with only lower bound", async () => {
    const results = await store.get(
      db.range({
        index: "byType",
        lower: "post",
      }),
    );
    expect(results.every((r) => r.type >= "post")).toBe(true);
  });

  test("queries with only upper bound", async () => {
    const results = await store.get(
      db.range({
        index: "byType",
        upper: "user",
      }),
    );
    expect(results.every((r) => r.type <= "user")).toBe(true);
  });
});
