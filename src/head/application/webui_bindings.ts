import type { WebUI } from "jsr:@webui/deno-webui";
import type { Processor } from "../../body/processor/processor.ts";

function parseJsonArg<T>(raw: string): T {
  return JSON.parse(raw) as T;
}

export function bindWebUI(win: WebUI, processor: Processor): void {
  win.bind("ping", async () => {
    return "pong";
  });

  win.bind("getTheme", async () => {
    return JSON.stringify({ theme: await processor.getTheme() });
  });

  win.bind("setTheme", async (e) => {
    const { theme } = parseJsonArg<{ theme: "light" | "dark" }>(e.arg.string(0));
    return JSON.stringify(await processor.setTheme(theme));
  });

  win.bind("listEvents", async () => {
    return JSON.stringify(await processor.listEvents());
  });

  win.bind("createEvent", async (e) => {
    const { title } = parseJsonArg<{ title: string }>(e.arg.string(0));
    return JSON.stringify(await processor.createEvent(title));
  });

  win.bind("renameEvent", async (e) => {
    const { eventId, newTitle } = parseJsonArg<{ eventId: string; newTitle: string }>(
      e.arg.string(0),
    );
    return JSON.stringify(await processor.renameEvent(eventId, newTitle));
  });

  win.bind("deleteEvent", async (e) => {
    const { eventId } = parseJsonArg<{ eventId: string }>(e.arg.string(0));
    return JSON.stringify(await processor.deleteEvent(eventId));
  });

  win.bind("getEventView", async (e) => {
    const { eventId } = parseJsonArg<{ eventId: string }>(e.arg.string(0));
    try {
      const view = await processor.getEventView(eventId);
      return JSON.stringify({ ok: true, view });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Fehler";
      return JSON.stringify({ ok: false, message });
    }
  });

  win.bind("addExpense", async (e) => {
    const params = parseJsonArg<{
      eventId: string;
      date: string;
      purpose: string;
      amountCents: number;
      name: string;
    }>(e.arg.string(0));
    return JSON.stringify(await processor.addExpense(params));
  });

  win.bind("deleteExpense", async (e) => {
    const { eventId, expenseId } = parseJsonArg<{ eventId: string; expenseId: string }>(
      e.arg.string(0),
    );
    return JSON.stringify(await processor.deleteExpense(eventId, expenseId));
  });
}
