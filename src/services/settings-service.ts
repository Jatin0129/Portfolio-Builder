import { settingsProfileGuidance, settingsProfilePresets } from "@/config/settings";
import { cycleOsProviders } from "@/providers";
import type { SettingsSnapshot, UserSettings } from "@/types";

export { settingsProfilePresets as profilePresets };

export function applyProfilePreset(settings: UserSettings): UserSettings {
  const preset = settingsProfilePresets[settings.profile];

  return {
    ...settings,
    ...preset,
  };
}

export async function getUserSettings() {
  return cycleOsProviders.settings.getSettings();
}

export async function saveUserSettings(settings: UserSettings) {
  return cycleOsProviders.settings.saveSettings(settings);
}

export async function getSettingsSnapshot(): Promise<SettingsSnapshot> {
  const settings = await getUserSettings();

  return {
    settings,
    profileGuidance: settingsProfileGuidance,
  };
}
