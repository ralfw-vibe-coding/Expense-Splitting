import { WebUI } from "jsr:@webui/deno-webui";
import { dirname, fromFileUrl, join } from "https://deno.land/std@0.97.0/path/mod.ts";
import { createWriteThruEventStore } from "./src/body/providers/event_store_provider.ts";
import { loadSettings } from "./src/body/providers/settings_provider.ts";
import { createProcessor } from "./src/body/processor/processor.ts";
import { bindWebUI } from "./src/head/application/webui_bindings.ts";

const rootDir = dirname(fromFileUrl(import.meta.url));
const portalDir = join(rootDir, "src", "head", "portal", "webui");

const eventStore = await createWriteThruEventStore(join(rootDir, "events.json"));
const settingsFilename = join(rootDir, "settings.json");
const processor = createProcessor(eventStore, settingsFilename);

Deno.chdir(portalDir);
const theme = loadSettings(settingsFilename).theme;
const html = (await Deno.readTextFile("index.html")).replace(
  /data-theme="(dark|light)"/,
  `data-theme="${theme}"`,
);

const win = new WebUI();
bindWebUI(win, processor);

await win.showBrowser(html, WebUI.Browser.AnyBrowser);
await WebUI.wait();
