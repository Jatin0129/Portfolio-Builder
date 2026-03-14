import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { SettingsProvider } from "@/providers/interfaces";
import type { AlertThresholds, UserSettings } from "@/types";

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function toUserSettings(record: {
  id: string;
  totalCapital: number;
  reportingCurrency: string;
  cashAed: number;
  maxRiskPerTradePct: number;
  maxPortfolioOpenRiskPct: number;
  maxDrawdownThresholdPct: number;
  maxSinglePositionPct: number;
  maxSectorExposurePct: number;
  maxCorrelationClusterPct: number;
  preferredHoldingHorizon: string;
  preferredAssetUniverse: unknown;
  alertThresholds: unknown;
  profile: "CONSERVATIVE" | "BALANCED" | "AGGRESSIVE";
}): UserSettings {
  return {
    id: record.id,
    totalCapital: record.totalCapital,
    reportingCurrency: record.reportingCurrency,
    cashAed: record.cashAed,
    maxRiskPerTradePct: record.maxRiskPerTradePct,
    maxPortfolioOpenRiskPct: record.maxPortfolioOpenRiskPct,
    maxDrawdownThresholdPct: record.maxDrawdownThresholdPct,
    maxSinglePositionPct: record.maxSinglePositionPct,
    maxSectorExposurePct: record.maxSectorExposurePct,
    maxCorrelationClusterPct: record.maxCorrelationClusterPct,
    preferredHoldingHorizon: record.preferredHoldingHorizon as UserSettings["preferredHoldingHorizon"],
    preferredAssetUniverse: record.preferredAssetUniverse as UserSettings["preferredAssetUniverse"],
    alertThresholds: record.alertThresholds as AlertThresholds,
    profile: record.profile.toLowerCase() as UserSettings["profile"],
  };
}

export const prismaSettingsProvider: SettingsProvider = {
  async getSettings() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const record = await prisma.userSettings.findUnique({
      where: { id: "default" },
    });

    if (!record) {
      throw new Error("Settings record not found");
    }

    return toUserSettings(record);
  },
  async saveSettings(settings) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const saved = await prisma.userSettings.upsert({
      where: { id: "default" },
      update: {
        totalCapital: settings.totalCapital,
        reportingCurrency: settings.reportingCurrency,
        cashAed: settings.cashAed,
        maxRiskPerTradePct: settings.maxRiskPerTradePct,
        maxPortfolioOpenRiskPct: settings.maxPortfolioOpenRiskPct,
        maxDrawdownThresholdPct: settings.maxDrawdownThresholdPct,
        maxSinglePositionPct: settings.maxSinglePositionPct,
        maxSectorExposurePct: settings.maxSectorExposurePct,
        maxCorrelationClusterPct: settings.maxCorrelationClusterPct,
        preferredHoldingHorizon: settings.preferredHoldingHorizon,
        preferredAssetUniverse: toJson(settings.preferredAssetUniverse),
        alertThresholds: toJson(settings.alertThresholds),
        profile: settings.profile.toUpperCase() as "CONSERVATIVE" | "BALANCED" | "AGGRESSIVE",
      },
      create: {
        id: "default",
        totalCapital: settings.totalCapital,
        reportingCurrency: settings.reportingCurrency,
        cashAed: settings.cashAed,
        maxRiskPerTradePct: settings.maxRiskPerTradePct,
        maxPortfolioOpenRiskPct: settings.maxPortfolioOpenRiskPct,
        maxDrawdownThresholdPct: settings.maxDrawdownThresholdPct,
        maxSinglePositionPct: settings.maxSinglePositionPct,
        maxSectorExposurePct: settings.maxSectorExposurePct,
        maxCorrelationClusterPct: settings.maxCorrelationClusterPct,
        preferredHoldingHorizon: settings.preferredHoldingHorizon,
        preferredAssetUniverse: toJson(settings.preferredAssetUniverse),
        alertThresholds: toJson(settings.alertThresholds),
        profile: settings.profile.toUpperCase() as "CONSERVATIVE" | "BALANCED" | "AGGRESSIVE",
      },
    });

    return toUserSettings(saved);
  },
};
