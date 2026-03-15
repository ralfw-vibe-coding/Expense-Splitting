import type { Theme } from "../../providers/settings_provider.ts";
import { loadSettings } from "../../providers/settings_provider.ts";

export async function getTheme(settingsFilename: string): Promise<Theme> {
  return loadSettings(settingsFilename).theme;
}
