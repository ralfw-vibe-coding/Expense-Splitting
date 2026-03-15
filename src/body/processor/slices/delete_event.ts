import {
  createFilter,
  createQuery,
  type Event,
  type MemoryEventStore,
} from "https://raw.githubusercontent.com/ralfw/ccceventstores/main/src/mod.ts";
import { EventTypes } from "../../domain/event_types.ts";
import type { EventId } from "../../domain/contracts.ts";
import { projectEvents } from "../../domain/projections.ts";

export async function deleteEvent(
  es: MemoryEventStore,
  eventId: EventId,
): Promise<{ ok: boolean; message: string }> {
  const q = createQuery(
    createFilter([EventTypes.eventCreated], [{ eventCreatedID: eventId }]),
    createFilter([EventTypes.eventRenamed, EventTypes.eventDeleted], [{ eventId }]),
  );
  const ctx = await es.query(q);
  const event = projectEvents(ctx.events).get(eventId);
  if (!event || event.deleted) return { ok: false, message: "Veranstaltung nicht gefunden." };

  const now = new Date().toISOString();
  const events: Event[] = [{
    eventType: EventTypes.eventDeleted,
    payload: {
      eventId,
      deletedAt: now,
      eventDeletedID: crypto.randomUUID(),
    },
  }];

  await es.append(events, q, ctx.maxSequenceNumber);
  return { ok: true, message: "Veranstaltung gelöscht." };
}
