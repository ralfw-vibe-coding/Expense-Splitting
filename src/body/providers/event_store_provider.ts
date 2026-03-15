import { PostgresEventStore } from "jsr:@ricofritzsche/eventstore";
import type { EventStore } from "jsr:@ricofritzsche/eventstore";

export async function createEventStore(): Promise<EventStore> {
  const eventStore = new PostgresEventStore({
    connectionString: Deno.env.get("DATABASE_URL"),
  });
  await eventStore.initializeDatabase();
  return eventStore;
}
