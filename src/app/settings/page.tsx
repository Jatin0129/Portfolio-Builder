import { SettingsView } from "@/components/settings/settings-view";
import { getSettingsSnapshot } from "@/services/settings-service";

export default async function SettingsPage() {
  return <SettingsView snapshot={await getSettingsSnapshot()} />;
}
