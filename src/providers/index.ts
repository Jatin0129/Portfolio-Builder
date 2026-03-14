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

const resilientSettingsProvider: SettingsProvider = {
  async getSettings() {
    try {
      return await prismaSettingsProvider.getSettings();
    } catch {
      return mockSettingsProvider.getSettings();
    }
  },
  async saveSettings(settings) {
    try {
      return await prismaSettingsProvider.saveSettings(settings);
    } catch {
      return mockSettingsProvider.saveSettings(settings);
    }
  },
};

const resilientJournalProvider: JournalProvider = {
  async getEntries() {
    try {
      return await prismaJournalProvider.getEntries();
    } catch {
      return mockJournalProvider.getEntries();
    }
  },
  async createEntry(entry) {
    try {
      return await prismaJournalProvider.createEntry(entry);
    } catch {
      return mockJournalProvider.createEntry(entry);
    }
  },
  async closeEntry(exit) {
    try {
      return await prismaJournalProvider.closeEntry(exit);
    } catch {
      return mockJournalProvider.closeEntry(exit);
    }
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
