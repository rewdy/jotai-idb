import { beforeEach, describe, expect, test } from "@rstest/core";
import { createTestDB } from "./setup.js";

describe("Atom Caching with atomFamily", () => {
  let db: Awaited<ReturnType<typeof createTestDB>>;

  beforeEach(async () => {
    db = await createTestDB();
  });

  test("db.item(id) returns same atom instance for same id", () => {
    const atom1 = db.item("user-1");
    const atom2 = db.item("user-1");
    expect(atom1).toBe(atom2);
  });

  test("db.item(id) returns different atom instances for different ids", () => {
    const atom1 = db.item("user-1");
    const atom2 = db.item("user-2");
    expect(atom1).not.toBe(atom2);
  });

  test("db.range(query) returns same atom instance for same query", () => {
    const query = { index: "byType", lower: "user", upper: "user" };
    const atom1 = db.range(query);
    const atom2 = db.range(query);
    expect(atom1).toBe(atom2);
  });

  test("db.range(query) returns different atom instances for different queries", () => {
    const query1 = { index: "byType", lower: "user", upper: "user" };
    const query2 = { index: "byType", lower: "post", upper: "post" };
    const atom1 = db.range(query1);
    const atom2 = db.range(query2);
    expect(atom1).not.toBe(atom2);
  });
});
