import {
  createFilter,
  type EventStore,
} from "jsr:@ricofritzsche/eventstore";
import type { EventListItem } from "../../domain/contracts.ts";
import { EventTypes } from "../../domain/event_types.ts";
import { projectEventList } from "../../domain/projections.ts";

export async function listEvents(es: EventStore): Promise<EventListItem[]> {
  const filter = createFilter([
    EventTypes.eventCreated,
    EventTypes.eventRenamed,
    EventTypes.eventDeleted,
  ]);
  const ctx = await es.query(filter);
  return projectEventList(ctx.events);
}
