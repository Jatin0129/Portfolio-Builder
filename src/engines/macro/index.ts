import { catalysts, macroEvents, sectorHeatmap } from "@/mock-data";

export function getMacroEvents() {
  // Future integration point: pull macro calendar and consensus estimates from an economic data provider.
  return macroEvents;
}

export function getCatalysts() {
  return catalysts;
}

export function getSectorHeatmap() {
  return sectorHeatmap;
}
