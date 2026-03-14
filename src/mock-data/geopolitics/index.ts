import type { GeopoliticalEvent } from "@/types";

export const geopoliticalEvents: GeopoliticalEvent[] = [
  {
    id: "geo-1",
    title: "Red Sea shipping disruption watch",
    region: "Middle East",
    severity: "High",
    status: "Active",
    implication: "Keeps freight and energy risk premia elevated; favors resilient quality and shipping beneficiaries.",
  },
  {
    id: "geo-2",
    title: "US-China semiconductor restrictions",
    region: "Global",
    severity: "Moderate",
    status: "Escalation risk",
    implication: "Creates headline volatility across chips but supports local supply-chain diversification plays.",
  },
  {
    id: "geo-3",
    title: "OPEC+ compliance drift",
    region: "Energy",
    severity: "Moderate",
    status: "Monitoring",
    implication: "Affects oil beta and inflation expectations, which feed directly into regime balance.",
  },
];
