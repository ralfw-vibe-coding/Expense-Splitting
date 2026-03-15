import {
  createFilter,
  type Event,
  type EventStore,
} from "jsr:@ricofritzsche/eventstore";
import { EventTypes } from "../../domain/event_types.ts";
import type { EventId } from "../../domain/contracts.ts";
import { projectEvents } from "../../domain/projections.ts";

export async function deleteEvent(
  es: EventStore,
  eventId: EventId,
): Promise<{ ok: boolean; message: string }> {
  const q = createFilter([
    EventTypes.eventCreated,
    EventTypes.eventRenamed,
    EventTypes.eventDeleted,
  ]);
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
