import { beforeEach, describe, expect, test } from "@rstest/core";
import { JotaiIDB } from "../src/index.js";
import { createTestDB, type TestRecord } from "./setup.js";

describe("Database Initialization", () => {
  let db: Awaited<ReturnType<typeof createTestDB>>;

  beforeEach(async () => {
    db = await createTestDB();
  });

  test("initializes database successfully", async () => {
    expect(db).toBeDefined();
  });

  test("atoms are created after init", () => {
    expect(db.items).toBeDefined();
    expect(db.keys).toBeDefined();
    expect(db.entries).toBeDefined();
    expect(db.setter).toBeDefined();
  });

  test("throws error when using atoms before init", () => {
    const uninitialized = new JotaiIDB<TestRecord>({
      dbName: "test-uninitialized",
      version: 1,
      store: {
        name: "main",
        keyPath: "id",
      },
    });

    expect(() => uninitialized.item("test-id")).toThrow();
  });
});
