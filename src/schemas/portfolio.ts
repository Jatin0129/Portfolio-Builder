import { z } from "zod";

export const holdingInputSchema = z.object({
  ticker: z.string().min(1),
  name: z.string().min(1),
  assetClass: z.string().min(1),
  sector: z.string().min(1),
  region: z.string().min(1),
  currency: z.string().min(1),
  themes: z.array(z.string().min(1)).default([]),
  allocationBucket: z.enum(["core", "tactical", "hedge"]),
  quantity: z.number().positive(),
  investedAmountAed: z.number().positive(),
  currentValueAed: z.number().positive(),
  beta: z.number().min(-5).max(5),
  correlationTag: z.string().min(1),
  stopDistancePct: z.number().positive(),
});

export type HoldingInputPayload = z.infer<typeof holdingInputSchema>;
