import assert from "node:assert/strict";
import test from "node:test";

import { applyProfilePreset, profilePresets } from "@/services/settings-service";
import { defaultUserSettings } from "@/mock-data/risk";

test("applyProfilePreset maps balanced settings to the balanced risk envelope", () => {
  const result = applyProfilePreset({
    ...defaultUserSettings,
    profile: "balanced",
  });

  assert.equal(result.maxRiskPerTradePct, profilePresets.balanced.maxRiskPerTradePct);
  assert.equal(result.maxPortfolioOpenRiskPct, profilePresets.balanced.maxPortfolioOpenRiskPct);
});

test("applyProfilePreset maps aggressive settings to the aggressive risk envelope", () => {
  const result = applyProfilePreset({
    ...defaultUserSettings,
    profile: "aggressive",
  });

  assert.equal(result.maxSinglePositionPct, profilePresets.aggressive.maxSinglePositionPct);
  assert.equal(result.maxCorrelationClusterPct, profilePresets.aggressive.maxCorrelationClusterPct);
});
