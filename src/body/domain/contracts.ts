export type ISODate = string; // YYYY-MM-DD
export type ISOTimestamp = string; // ISO 8601

export type EventId = string;
export type ExpenseId = string;

export interface EventListItem {
  id: EventId;
  title: string;
  createdAt: ISOTimestamp;
}

export interface EventDetails {
  id: EventId;
  title: string;
  createdAt: ISOTimestamp;
  deleted: boolean;
}

export interface ExpenseItem {
  id: ExpenseId;
  eventId: EventId;
  date: ISODate;
  purpose: string;
  amountCents: number;
  name: string;
  nameNorm: string;
  createdAt: ISOTimestamp;
}

export interface OverviewTotals {
  totalCents: number;
  averageCents: number;
  participantCount: number;
}

export interface OverviewByNameRow {
  name: string;
  nameNorm: string;
  spentCents: number;
  diffToAverageCents: number;
}

export interface EventView {
  event: EventDetails;
  expenses: ExpenseItem[];
  overview: {
    totals: OverviewTotals;
    byName: OverviewByNameRow[];
  };
}

export interface CommandResult {
  ok: boolean;
  message: string;
}

export interface CreateEventResult extends CommandResult {
  eventId?: EventId;
}

export interface AddExpenseResult extends CommandResult {
  expenseId?: ExpenseId;
}
