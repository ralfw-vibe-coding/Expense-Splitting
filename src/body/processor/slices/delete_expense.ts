import {
  createFilter,
  type Event,
  type EventStore,
} from "jsr:@ricofritzsche/eventstore";
import { EventTypes } from "../../domain/event_types.ts";
import type { EventId, ExpenseId } from "../../domain/contracts.ts";
import { projectExpenses } from "../../domain/projections.ts";

export async function deleteExpense(
  es: EventStore,
  eventId: EventId,
  expenseId: ExpenseId,
): Promise<{ ok: boolean; message: string }> {
  const q = createFilter([EventTypes.expenseAdded, EventTypes.expenseDeleted], [{ eventId }]);
  const ctx = await es.query(q);
  const expenses = projectExpenses(ctx.events, eventId);
  if (!expenses.some((e) => e.id === expenseId)) {
    return { ok: false, message: "Ausgabe nicht gefunden." };
  }

  const now = new Date().toISOString();
  const events: Event[] = [{
    eventType: EventTypes.expenseDeleted,
    payload: {
      eventId,
      expenseAddedID: expenseId,
      deletedAt: now,
      expenseDeletedID: crypto.randomUUID(),
    },
  }];

  await es.append(events, q, ctx.maxSequenceNumber);
  return { ok: true, message: "Ausgabe gelöscht." };
}
