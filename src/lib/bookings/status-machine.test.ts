import { test } from "node:test";
import assert from "node:assert/strict";
import { canTransition } from "./status";

test("pending can move to review outcomes", () => {
  assert.ok(canTransition("PENDING", "CONFIRMED"));
  assert.ok(canTransition("PENDING", "REJECTED"));
  assert.ok(canTransition("PENDING", "CANCELLED"));
  assert.ok(canTransition("PENDING", "EXPIRED"));
});

test("confirmed can complete or cancel", () => {
  assert.ok(canTransition("CONFIRMED", "COMPLETED"));
  assert.ok(canTransition("CONFIRMED", "CANCELLED"));
});

test("terminal states allow nothing", () => {
  for (const from of ["REJECTED", "CANCELLED", "COMPLETED", "EXPIRED"] as const) {
    assert.ok(!canTransition(from, "PENDING"));
    assert.ok(!canTransition(from, "CONFIRMED"));
    assert.ok(!canTransition(from, "CANCELLED"));
  }
});

test("no skipping states", () => {
  assert.ok(!canTransition("PENDING", "COMPLETED"));
  assert.ok(!canTransition("CONFIRMED", "PENDING"));
  assert.ok(!canTransition("CONFIRMED", "REJECTED"));
});
