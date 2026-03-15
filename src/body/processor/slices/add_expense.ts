import moment from "https://deno.land/x/momentjs@2.29.1-deno/mod.ts";
import {
  createFilter,
  type Event,
  type EventStore,
} from "jsr:@ricofritzsche/eventstore";
import { EventTypes } from "../../domain/event_types.ts";
import type { AddExpenseResult, EventId } from "../../domain/contracts.ts";
import { projectEvents, projectExpenses } from "../../domain/projections.ts";
import { normalizeName } from "../../providers/name_normalizer.ts";

export async function addExpense(
  es: EventStore,
  params: { eventId: EventId; date: string; purpose: string; amountCents: number; name: string },
): Promise<AddExpenseResult> {
  const { eventId, date, purpose, amountCents, name } = params;
  const { display: nameDisplay, norm: nameNorm } = normalizeName(name);

  if (!nameDisplay) return { ok: false, message: "Name fehlt." };
  if (!purpose.trim()) return { ok: false, message: "Zweck fehlt." };
  if (!Number.isInteger(amountCents) || amountCents < 0) {
    return { ok: false, message: "Betrag ungültig." };
  }
  if (!moment(date, "YYYY-MM-DD", true).isValid()) return { ok: false, message: "Datum ungültig." };

  const q = createFilter([
    EventTypes.eventCreated,
    EventTypes.eventRenamed,
    EventTypes.eventDeleted,
    EventTypes.expenseAdded,
    EventTypes.expenseDeleted,
  ]);
  const ctx = await es.query(q);

  const event = projectEvents(ctx.events).get(eventId);
  if (!event || event.deleted) return { ok: false, message: "Veranstaltung nicht gefunden." };

  const existingExpenses = projectExpenses(ctx.events, eventId);
  const expenseId = crypto.randomUUID();
  if (existingExpenses.some((x) => x.id === expenseId)) {
    return { ok: false, message: "Bitte erneut versuchen." };
  }

  const now = new Date().toISOString();
  const events: Event[] = [{
    eventType: EventTypes.expenseAdded,
    payload: {
      eventId,
      date,
      purpose: purpose.trim(),
      amountCents,
      name: nameDisplay,
      nameNorm,
      createdAt: now,
      expenseAddedID: expenseId,
    },
  }];

  await es.append(events, q, ctx.maxSequenceNumber);
  return { ok: true, message: "Ausgabe hinzugefügt.", expenseId };
}
