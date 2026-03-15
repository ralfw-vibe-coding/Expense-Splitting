import {
  createFilter,
  createQuery,
  type Event,
  type MemoryEventStore,
} from "https://raw.githubusercontent.com/ralfw/ccceventstores/main/src/mod.ts";
import { EventTypes } from "../../domain/event_types.ts";
import type { EventId } from "../../domain/contracts.ts";
import { projectEvents } from "../../domain/projections.ts";
import { normalizeTitle } from "../../providers/name_normalizer.ts";

export async function renameEvent(
  es: MemoryEventStore,
  eventId: EventId,
  newTitle: string,
): Promise<{ ok: boolean; message: string }> {
  const { display, norm } = normalizeTitle(newTitle);
  if (!display) return { ok: false, message: "Name fehlt." };

  const q = createQuery(
    createFilter([EventTypes.eventCreated, EventTypes.eventRenamed, EventTypes.eventDeleted]),
  );
  const ctx = await es.query(q);
  const eventsById = projectEvents(ctx.events);
  const existing = eventsById.get(eventId);
  if (!existing || existing.deleted) return { ok: false, message: "Veranstaltung nicht gefunden." };

  const titleTaken = [...eventsById.values()].filter((e) => !e.deleted && e.id !== eventId).some((
    e,
  ) => e.title.toLocaleLowerCase() === norm);
  if (titleTaken) return { ok: false, message: "Name ist bereits vergeben." };

  const now = new Date().toISOString();
  const events: Event[] = [{
    eventType: EventTypes.eventRenamed,
    payload: {
      eventId,
      newTitle: display,
      newTitleNorm: norm,
      renamedAt: now,
      eventRenamedID: crypto.randomUUID(),
    },
  }];

  await es.append(events, q, ctx.maxSequenceNumber);
  return { ok: true, message: "Veranstaltung umbenannt." };
}
