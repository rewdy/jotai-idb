import { beforeEach, describe, expect, test } from "@rstest/core";
import { createTestDB, store, type TestRecord } from "./setup.js";

describe("Type Safety", () => {
  let db: Awaited<ReturnType<typeof createTestDB>>;

  beforeEach(async () => {
    db = await createTestDB();
  });

  test("records maintain type information", async () => {
    const record: TestRecord = {
      id: "user-1",
      type: "user",
      name: "Alice",
      createdAt: Date.now(),
    };

    await store.set(db.setter, { type: "put", value: record });
    const retrieved = await store.get(db.item("user-1"));

    expect(retrieved?.type).toBe("user");
    expect(retrieved?.name).toBe("Alice");
  });
});
