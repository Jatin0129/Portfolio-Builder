import { z } from "zod";

export const journalEntryInputSchema = z.object({
  ticker: z.string().min(1),
  assetName: z.string().min(1),
  assetCategory: z.enum(["Equity", "Bonds", "Real Estate", "Others"]),
  account: z.string().min(1).optional(),
  quantity: z.number().positive().optional(),
  investedAmountAed: z.number().positive().optional(),
  currentValueAed: z.number().positive().optional(),
  incomeAed: z.number().min(0).optional(),
  manager: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  setupName: z.string().min(1),
  setupTags: z.array(z.string().min(1)).min(1),
  direction: z.enum(["LONG", "SHORT"]),
  openedAt: z.string().datetime(),
  entryPrice: z.number().positive(),
  thesis: z.string().min(1),
  entryReasons: z.array(z.string().min(1)).min(1),
  rulesFollowed: z.boolean(),
  plannedRiskPct: z.number().positive(),
  plannedRiskAed: z.number().positive(),
  disciplineScore: z.number().int().min(1).max(10),
  holdingHorizon: z.enum(["intraday", "swing", "position"]),
  reviewNotes: z.string().min(1),
});

export const journalExitInputSchema = z.object({
  id: z.string().min(1),
  closedAt: z.string().datetime(),
  exitPrice: z.number().positive(),
  exitReasons: z.array(z.string().min(1)).min(1),
  rulesFollowed: z.boolean(),
  reviewNotes: z.string().min(1),
});
