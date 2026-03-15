import {
  createFilter,
  type Event,
  type MemoryEventStore,
} from "https://raw.githubusercontent.com/ralfw/ccceventstores/main/src/mod.ts";
import { EventTypes } from "../../domain/event_types.ts";
import type { CreateEventResult } from "../../domain/contracts.ts";
import { projectEvents } from "../../domain/projections.ts";
import { normalizeTitle } from "../../providers/name_normalizer.ts";

export async function createEvent(es: MemoryEventStore, title: string): Promise<CreateEventResult> {
  const { display, norm } = normalizeTitle(title);
  if (!display) return { ok: false, message: "Name fehlt." };

  const q = createFilter([
    EventTypes.eventCreated,
    EventTypes.eventRenamed,
    EventTypes.eventDeleted,
  ]);
  const ctx = await es.query(q);
  const eventsById = projectEvents(ctx.events);
  const existing = [...eventsById.values()].filter((e) => !e.deleted).some((e) =>
    e.title.toLocaleLowerCase() === norm
  );
  if (existing) return { ok: false, message: "Veranstaltung existiert bereits." };

  const eventId = crypto.randomUUID();
  const now = new Date().toISOString();
  const events: Event[] = [{
    eventType: EventTypes.eventCreated,
    payload: {
      title: display,
      titleNorm: norm,
      createdAt: now,
      eventCreatedID: eventId,
    },
  }];

  await es.append(events, q, ctx.maxSequenceNumber);
  return { ok: true, message: "Veranstaltung angelegt.", eventId };
}
