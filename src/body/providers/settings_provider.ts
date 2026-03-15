export type Theme = "light" | "dark";

export interface Settings {
  theme: Theme;
}

const DEFAULT_SETTINGS: Settings = { theme: "dark" };

export function loadSettings(filename: string): Settings {
  try {
    const raw = Deno.readTextFileSync(filename);
    const parsed = JSON.parse(raw) as Partial<Settings>;
    if (parsed?.theme === "light" || parsed?.theme === "dark") return { theme: parsed.theme };
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(filename: string, settings: Settings): void {
  Deno.writeTextFileSync(filename, JSON.stringify(settings, null, 2) + "\n");
}
