import type { EventStore } from "jsr:@ricofritzsche/eventstore";
import type {
  AddExpenseResult,
  CreateEventResult,
  EventId,
  EventListItem,
  EventView,
  ExpenseId,
} from "../domain/contracts.ts";
import { addExpense } from "./slices/add_expense.ts";
import { createEvent } from "./slices/create_event.ts";
import { deleteEvent } from "./slices/delete_event.ts";
import { deleteExpense } from "./slices/delete_expense.ts";
import { getEventView } from "./slices/get_event_view.ts";
import { listEvents } from "./slices/list_events.ts";
import { renameEvent } from "./slices/rename_event.ts";

export interface Processor {
  listEvents(): Promise<EventListItem[]>;
  createEvent(title: string): Promise<CreateEventResult>;
  renameEvent(eventId: EventId, newTitle: string): Promise<{ ok: boolean; message: string }>;
  deleteEvent(eventId: EventId): Promise<{ ok: boolean; message: string }>;

  getEventView(eventId: EventId): Promise<EventView>;
  addExpense(params: {
    eventId: EventId;
    date: string;
    purpose: string;
    amountCents: number;
    name: string;
  }): Promise<AddExpenseResult>;
  deleteExpense(eventId: EventId, expenseId: ExpenseId): Promise<{ ok: boolean; message: string }>;
}

export function createProcessor(eventStore: EventStore): Processor {
  return {
    listEvents: () => listEvents(eventStore),
    createEvent: (title) => createEvent(eventStore, title),
    renameEvent: (eventId, newTitle) => renameEvent(eventStore, eventId, newTitle),
    deleteEvent: (eventId) => deleteEvent(eventStore, eventId),

    getEventView: (eventId) => getEventView(eventStore, eventId),
    addExpense: (params) => addExpense(eventStore, params),
    deleteExpense: (eventId, expenseId) => deleteExpense(eventStore, eventId, expenseId),
  };
}
