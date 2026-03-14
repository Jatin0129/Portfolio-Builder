import { catalysts, macroEvents, macroState, sectorHeatmap } from "@/mock-data/macro";
import type { MacroDataProvider } from "@/providers/interfaces";

export const mockMacroDataProvider: MacroDataProvider = {
  getMacroState() {
    // TODO: replace with live calendar and macro research feeds.
    return macroState;
  },
  getMacroEvents() {
    return macroEvents;
  },
  getCatalysts() {
    return catalysts;
  },
  getSectorHeatmap() {
    return sectorHeatmap;
  },
};
