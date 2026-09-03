import { test } from "node:test";
import assert from "node:assert/strict";
import { computeAddonLine, computeTotal } from "./pricing";

test("total = package price + sum of addon price × quantity", () => {
  assert.equal(computeTotal(80000, []), 80000);
  assert.equal(computeTotal(80000, [{ price: 5000, quantity: 2 }, { price: 15000, quantity: 1 }]), 105000);
});

test("addon line total", () => {
  assert.equal(computeAddonLine({ price: 2000, quantity: 10 }), 20000);
  assert.equal(computeAddonLine({ price: 2000, quantity: 0 }), 0);
});

test("integer money stays exact", () => {
  const total = computeTotal(30000, [{ price: 5000, quantity: 3 }, { price: 12000, quantity: 1 }]);
  assert.equal(total, 57000);
  assert.ok(Number.isInteger(total));
});
