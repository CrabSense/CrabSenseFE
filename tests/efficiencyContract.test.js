import test from "node:test";
import assert from "node:assert/strict";
import { verifyEfficiency, efficiencyRate } from "../src/services/efficiencyContract.js";

const empty = { cohortBasis: "stockedAt-current-status-v1", farmingAreaId: "a",
  totalCrabs: 0, aliveCrabs: 0, moltingCrabs: 0, moltedCrabs: 0,
  harvestedCrabs: 0, deadCrabs: 0, unclassifiedCrabs: 0,
  survivalRate: null, moltingRate: null, harvestRate: null, mortalityRate: null, aliveRate: null };
test("empty cohort is unknown and legacy or wrong scope is rejected", () => {
  assert.equal(verifyEfficiency({...empty, healthScore: 30}, "a").healthScore, null);
  assert.equal(verifyEfficiency(empty, "a").harvestRate, null);
  assert.throws(() => verifyEfficiency(empty, "b"));
  assert.throws(() => verifyEfficiency({...empty, cohortBasis: undefined}, "a"));
  assert.throws(() => verifyEfficiency({...empty, harvestRate: 0}, "a"));
});
test("known zero remains zero; invalid numeric coercions and counts rejected", () => {
  const known = {...empty, totalCrabs: 1, aliveCrabs: 1, survivalRate: 100,
    aliveRate: 100, harvestRate: 0, mortalityRate: 0, moltingRate: 0};
  assert.equal(verifyEfficiency(known, "a").harvestRate, 0);
  for (const bad of ["", "0", false, Infinity, -1, 101]) {
    assert.equal(efficiencyRate(bad), null);
    assert.throws(() => verifyEfficiency({...known, harvestRate: bad}, "a"));
  }
  assert.throws(() => verifyEfficiency({...known, totalCrabs: 2}, "a"));
});
