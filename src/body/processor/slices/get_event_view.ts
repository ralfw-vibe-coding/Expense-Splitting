import {
  createFilter,
  createQuery,
  type MemoryEventStore,
} from "https://raw.githubusercontent.com/ralfw/ccceventstores/main/src/mod.ts";
import type { EventId, EventView } from "../../domain/contracts.ts";
import { EventTypes } from "../../domain/event_types.ts";
import { projectEventView } from "../../domain/projections.ts";

export async function getEventView(es: MemoryEventStore, eventId: EventId): Promise<EventView> {
  const q = createQuery(
    createFilter([EventTypes.eventCreated], [{ eventCreatedID: eventId }]),
    createFilter([EventTypes.eventRenamed, EventTypes.eventDeleted], [{ eventId }]),
    createFilter([EventTypes.expenseAdded, EventTypes.expenseDeleted], [{ eventId }]),
  );
  const ctx = await es.query(q);
  return projectEventView(ctx.events, eventId);
}
