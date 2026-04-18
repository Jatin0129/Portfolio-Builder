import { cycleOsProviders } from "@/providers";
import type { HoldingInput } from "@/types";

export async function createHolding(input: HoldingInput) {
  return cycleOsProviders.portfolio.createHolding(input);
}

export async function updateHolding(id: string, input: HoldingInput) {
  return cycleOsProviders.portfolio.updateHolding(id, input);
}

export async function deleteHolding(id: string) {
  return cycleOsProviders.portfolio.deleteHolding(id);
}
