import moment from "https://deno.land/x/momentjs@2.29.1-deno/mod.ts";
import type { EventRecord } from "jsr:@ricofritzsche/eventstore";
import { EventTypes } from "./event_types.ts";
import type {
  EventDetails,
  EventId,
  EventListItem,
  EventView,
  ExpenseId,
  ExpenseItem,
  OverviewByNameRow,
} from "./contracts.ts";

type Payload = Record<string, unknown>;

function asString(payload: Payload, key: string): string {
  const v = payload[key];
  if (typeof v !== "string") throw new Error(`Invalid payload: ${key} must be string.`);
  return v;
}

function asNumber(payload: Payload, key: string): number {
  const v = payload[key];
  if (typeof v !== "number" || !Number.isFinite(v)) {
    throw new Error(`Invalid payload: ${key} must be number.`);
  }
  return v;
}

export function projectEvents(records: EventRecord[]): Map<EventId, EventDetails> {
  const byId = new Map<EventId, EventDetails>();

  for (const r of records) {
    const p = r.payload as Payload;
    switch (r.eventType) {
      case EventTypes.eventCreated: {
        const id = asString(p, "eventCreatedID");
        if (!byId.has(id)) {
          byId.set(id, {
            id,
            title: asString(p, "title"),
            createdAt: asString(p, "createdAt"),
            deleted: false,
          });
        }
        break;
      }
      case EventTypes.eventRenamed: {
        const id = asString(p, "eventId");
        const e = byId.get(id);
        if (e && !e.deleted) {
          e.title = asString(p, "newTitle");
        }
        break;
      }
      case EventTypes.eventDeleted: {
        const id = asString(p, "eventId");
        const e = byId.get(id);
        if (e) e.deleted = true;
        break;
      }
    }
  }

  return byId;
}

export function projectEventList(records: EventRecord[]): EventListItem[] {
  const byId = projectEvents(records);
  const list = [...byId.values()].filter((e) => !e.deleted);
  list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  return list.map(({ deleted: _d, ...rest }) => rest);
}

export function projectExpenses(records: EventRecord[], eventId: EventId): ExpenseItem[] {
  const byId = new Map<ExpenseId, ExpenseItem>();
  const deleted = new Set<ExpenseId>();

  for (const r of records) {
    const p = r.payload as Payload;
    switch (r.eventType) {
      case EventTypes.expenseAdded: {
        if (asString(p, "eventId") !== eventId) break;
        const id = asString(p, "expenseAddedID");
        if (!byId.has(id)) {
          byId.set(id, {
            id,
            eventId,
            date: asString(p, "date"),
            purpose: asString(p, "purpose"),
            amountCents: asNumber(p, "amountCents"),
            name: asString(p, "name"),
            nameNorm: asString(p, "nameNorm"),
            createdAt: asString(p, "createdAt"),
          });
        }
        break;
      }
      case EventTypes.expenseDeleted: {
        if (asString(p, "eventId") !== eventId) break;
        deleted.add(asString(p, "expenseAddedID"));
        break;
      }
    }
  }

  const list = [...byId.values()].filter((x) => !deleted.has(x.id));
  list.sort((a, b) => {
    const da = moment(a.date, "YYYY-MM-DD", true).valueOf();
    const db = moment(b.date, "YYYY-MM-DD", true).valueOf();
    if (da !== db) return db - da;
    return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0;
  });
  return list;
}

export function projectOverview(
  expenses: ExpenseItem[],
): { totals: EventView["overview"]["totals"]; byName: OverviewByNameRow[] } {
  const byName = new Map<string, { name: string; nameNorm: string; spentCents: number }>();
  let totalCents = 0;

  for (const e of expenses) {
    totalCents += e.amountCents;
    const key = e.nameNorm;
    const existing = byName.get(key);
    if (existing) {
      existing.spentCents += e.amountCents;
    } else {
      byName.set(key, { name: e.name, nameNorm: e.nameNorm, spentCents: e.amountCents });
    }
  }

  const participantCount = byName.size;
  const averageCents = participantCount === 0 ? 0 : Math.round(totalCents / participantCount);

  const rows: OverviewByNameRow[] = [...byName.values()].map((r) => ({
    ...r,
    diffToAverageCents: r.spentCents - averageCents,
  }));
  rows.sort((a, b) => a.nameNorm.localeCompare(b.nameNorm));

  return {
    totals: { totalCents, averageCents, participantCount },
    byName: rows,
  };
}

export function projectEventView(records: EventRecord[], eventId: EventId): EventView {
  const eventsById = projectEvents(records);
  const event = eventsById.get(eventId);
  if (!event) throw new Error("Event not found.");

  const expenses = projectExpenses(records, eventId);
  const overview = projectOverview(expenses);

  return {
    event,
    expenses,
    overview,
  };
}
