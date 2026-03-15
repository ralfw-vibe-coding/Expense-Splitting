import {
  createFilter,
  type MemoryEventStore,
} from "https://raw.githubusercontent.com/ralfw/ccceventstores/main/src/mod.ts";
import type { EventListItem } from "../../domain/contracts.ts";
import { EventTypes } from "../../domain/event_types.ts";
import { projectEventList } from "../../domain/projections.ts";

export async function listEvents(es: MemoryEventStore): Promise<EventListItem[]> {
  const filter = createFilter([
    EventTypes.eventCreated,
    EventTypes.eventRenamed,
    EventTypes.eventDeleted,
  ]);
  const ctx = await es.query(filter);
  return projectEventList(ctx.events);
}
