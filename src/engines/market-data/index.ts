import { scoreAssetGeopoliticalFit } from "@/engines/geopolitics";
import { scoreAssetMacroFit } from "@/engines/macro";
import type { AssetSignalInput, AssetSignalSeed, GeopoliticalBoard, MacroState, MarketSummary } from "@/types";

export function getMarketSummary(summary: MarketSummary) {
  return summary;
}

export function getAssetUniverse(
  assets: AssetSignalSeed[],
  state: MacroState,
  geopoliticalBoard: GeopoliticalBoard,
): AssetSignalInput[] {
  return assets.map((asset) => {
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
