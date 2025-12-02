import { beforeEach, describe, expect, test } from "@rstest/core";
import { createTestDB, store, type TestRecord } from "./setup.js";

describe("Type Safety", () => {
  let db: ReturnType<typeof createTestDB>;

  beforeEach(() => {
    db = createTestDB();
  });

  test("records maintain type information", async () => {
    // Trigger initialization
    await store.get(db.suspendBeforeInit);

    const record: TestRecord = {
      id: "user-1",
      type: "user",
      name: "Alice",
      createdAt: Date.now(),
    };

    await store.set(db.setter, { type: "put", value: record });
    const retrieved = store.get(db.item("user-1"));

    expect(retrieved?.type).toBe("user");
    expect(retrieved?.name).toBe("Alice");
  });
});
