import { getCatalysts, getMacroCalendarViewModel, getSectorHeatmap } from "@/engines";
import { cycleOsProviders } from "@/providers";
import { getCycleOsAppState } from "@/services/cycleos/app-state";
import type { IntelligenceSnapshot } from "@/types";

export async function getIntelligenceSnapshot(): Promise<IntelligenceSnapshot> {
  const state = await getCycleOsAppState();

  return {
    regime: state.regime,
    macroState: state.macroState,
    macroSummary: state.macroSummary,
    macroCalendar: getMacroCalendarViewModel(state.macroEvents, state.macroState),
    macroEvents: state.macroEvents,
    geopoliticalBoard: state.geopoliticalBoard,
    geopoliticalEvents: state.geopoliticalEvents,
    sectorHeatmap: getSectorHeatmap(cycleOsProviders.macroData.getSectorHeatmap()),
    catalysts: getCatalysts(cycleOsProviders.macroData.getCatalysts()),
    rankedAssets: state.tradeIdeas.ideas,
  };
}
