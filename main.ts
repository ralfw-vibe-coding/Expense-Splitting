import { createEventStore } from "./src/body/providers/event_store_provider.ts";
import { createProcessor } from "./src/body/processor/processor.ts";

const indexHtml = await Deno.readTextFile(
  new URL("./src/head/portal/webui/index.html", import.meta.url),
);
const appJs = await Deno.readTextFile(
  new URL("./src/head/portal/webui/app.js", import.meta.url),
);
const backendProxyJs = await Deno.readTextFile(
  new URL("./src/head/portal/webui/backendproxy.js", import.meta.url),
);
const stylesCss = await Deno.readTextFile(
  new URL("./src/head/portal/webui/styles.css", import.meta.url),
);

const eventStore = await createEventStore();
const processor = createProcessor(eventStore);

function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init?.headers,
    },
  });
}

async function handleApi(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/api/ping") {
    return json({ ok: true, message: "pong" });
  }

  if (request.method !== "POST") {
    return json({ ok: false, message: "Methode nicht erlaubt." }, { status: 405 });
  }

  const body = request.headers.get("content-type")?.includes("application/json")
    ? await request.json()
    : {};

  try {
    switch (url.pathname) {
      case "/api/listEvents":
        return json(await processor.listEvents());
      case "/api/createEvent":
        return json(await processor.createEvent(String(body.title ?? "")));
      case "/api/renameEvent":
        return json(
          await processor.renameEvent(String(body.eventId ?? ""), String(body.newTitle ?? "")),
        );
      case "/api/deleteEvent":
        return json(await processor.deleteEvent(String(body.eventId ?? "")));
      case "/api/getEventView": {
        const view = await processor.getEventView(String(body.eventId ?? ""));
        return json({ ok: true, view });
      }
      case "/api/addExpense":
        return json(
          await processor.addExpense({
            eventId: String(body.eventId ?? ""),
            date: String(body.date ?? ""),
            purpose: String(body.purpose ?? ""),
            amountCents: Number(body.amountCents ?? Number.NaN),
            name: String(body.name ?? ""),
          }),
        );
      case "/api/deleteExpense":
        return json(
          await processor.deleteExpense(String(body.eventId ?? ""), String(body.expenseId ?? "")),
        );
      default:
        return json({ ok: false, message: "Unbekannter API-Endpunkt." }, { status: 404 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Interner Fehler.";
    return json({ ok: false, message }, { status: 500 });
  }
}

function handleStatic(request: Request): Response {
  const { pathname } = new URL(request.url);

  switch (pathname) {
    case "/":
      return new Response(indexHtml, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    case "/app.js":
      return new Response(appJs, {
        headers: { "content-type": "application/javascript; charset=utf-8" },
      });
    case "/backendproxy.js":
      return new Response(backendProxyJs, {
        headers: { "content-type": "application/javascript; charset=utf-8" },
      });
    case "/styles.css":
      return new Response(stylesCss, {
        headers: { "content-type": "text/css; charset=utf-8" },
      });
    default:
      return new Response("Not found", { status: 404 });
  }
}

Deno.serve((request) => {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) {
    return handleApi(request);
  }
  return handleStatic(request);
});
