import { mockAiAgentProvider } from "@/providers/mock/ai-agent-provider";
import { mockGeopoliticsProvider } from "@/providers/mock/geopolitics-provider";
import { mockJournalProvider } from "@/providers/mock/journal-provider";
import { mockMacroDataProvider } from "@/providers/mock/macro-data-provider";
import { mockMarketDataProvider } from "@/providers/mock/market-data-provider";
import { mockPortfolioProvider } from "@/providers/mock/portfolio-provider";
import { mockSettingsProvider } from "@/providers/mock/settings-provider";
import { prismaJournalProvider } from "@/providers/persistence/journal-provider";
import { prismaSettingsProvider } from "@/providers/persistence/settings-provider";
import type { CycleOsProviders, JournalProvider, SettingsProvider } from "@/providers/interfaces";

async function withFallback<T>(primary: () => Promise<T>, fallback: () => Promise<T> | T) {
  try {
    return await primary();
  } catch {
    return await fallback();
  }
}

const resilientSettingsProvider: SettingsProvider = {
  async getSettings() {
    return withFallback(
      () => prismaSettingsProvider.getSettings(),
      () => mockSettingsProvider.getSettings(),
    );
  },
  async saveSettings(settings) {
    return withFallback(
      () => prismaSettingsProvider.saveSettings(settings),
      () => mockSettingsProvider.saveSettings(settings),
    );
  },
};

const resilientJournalProvider: JournalProvider = {
  async getEntries() {
    return withFallback(
      () => prismaJournalProvider.getEntries(),
      () => mockJournalProvider.getEntries(),
    );
  },
  async createEntry(entry) {
    return withFallback(
      () => prismaJournalProvider.createEntry(entry),
      () => mockJournalProvider.createEntry(entry),
    );
  },
  async closeEntry(exit) {
    return withFallback(
      () => prismaJournalProvider.closeEntry(exit),
      () => mockJournalProvider.closeEntry(exit),
    );
  },
};

export const cycleOsProviders: CycleOsProviders = {
  marketData: mockMarketDataProvider,
  macroData: mockMacroDataProvider,
  geopolitics: mockGeopoliticsProvider,
  portfolio: mockPortfolioProvider,
  settings: resilientSettingsProvider,
  journal: resilientJournalProvider,
  aiAgents: mockAiAgentProvider,
};
