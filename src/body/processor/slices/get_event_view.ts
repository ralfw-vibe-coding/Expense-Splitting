import {
  createFilter,
  type EventStore,
} from "jsr:@ricofritzsche/eventstore";
import type { EventId, EventView } from "../../domain/contracts.ts";
import { EventTypes } from "../../domain/event_types.ts";
import { projectEventView } from "../../domain/projections.ts";

export async function getEventView(es: EventStore, eventId: EventId): Promise<EventView> {
  const q = createFilter([
    EventTypes.eventCreated,
    EventTypes.eventRenamed,
    EventTypes.eventDeleted,
    EventTypes.expenseAdded,
    EventTypes.expenseDeleted,
  ]);
  const ctx = await es.query(q);
  return projectEventView(ctx.events, eventId);
}
