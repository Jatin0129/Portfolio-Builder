import { defaultUserSettings } from "@/mock-data/risk";
import type { SettingsProvider } from "@/providers/interfaces";

export const mockSettingsProvider: SettingsProvider = {
  async getSettings() {
    // TODO: replace with authenticated user settings store when auth is added.
    return defaultUserSettings;
  },
  async saveSettings(settings) {
    return settings;
  },
};
