export const EventTypes = {
  eventCreated: "eventCreated",
  eventRenamed: "eventRenamed",
  eventDeleted: "eventDeleted",

  expenseAdded: "expenseAdded",
  expenseDeleted: "expenseDeleted",
} as const;

export type EventType = (typeof EventTypes)[keyof typeof EventTypes];
