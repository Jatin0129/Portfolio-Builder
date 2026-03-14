import { assetUniverse, marketSummary } from "@/mock-data";
import { getGeopoliticalBoard, scoreAssetGeopoliticalFit } from "@/engines/geopolitics";
import { getMacroState, scoreAssetMacroFit } from "@/engines/macro";
import type { AssetSignalInput } from "@/types";

export function getMarketSummary() {
  // Future integration point: replace with broker or market data API adapters.
  return marketSummary;
}

export function getAssetUniverse(): AssetSignalInput[] {
  const state = getMacroState();
  const geopoliticalBoard = getGeopoliticalBoard();

  return assetUniverse.map((asset) => {
    const macroFit = scoreAssetMacroFit(asset, state);
    const geopoliticalFit = scoreAssetGeopoliticalFit(asset, geopoliticalBoard);

    return {
      ...asset,
      macroFit: macroFit.score,
      geopoliticalFit: geopoliticalFit.score,
      macroReasons: macroFit.reasons,
      geopoliticalReasons: geopoliticalFit.reasons,
    };
  });
}
