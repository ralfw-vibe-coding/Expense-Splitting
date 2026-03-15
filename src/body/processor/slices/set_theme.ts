import type { Theme } from "../../providers/settings_provider.ts";
import { loadSettings, saveSettings } from "../../providers/settings_provider.ts";

export async function setTheme(
  settingsFilename: string,
  theme: Theme,
): Promise<{ ok: boolean; message: string }> {
  if (theme !== "light" && theme !== "dark") return { ok: false, message: "Ungültiges Theme." };
  const current = loadSettings(settingsFilename);
  saveSettings(settingsFilename, { ...current, theme });
  return { ok: true, message: "Modus gespeichert." };
}
