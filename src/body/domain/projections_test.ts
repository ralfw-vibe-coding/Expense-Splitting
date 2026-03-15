import { assertEquals } from "https://deno.land/std@0.97.0/testing/asserts.ts";
import { EventTypes } from "./event_types.ts";
import { projectEventList, projectEventView, projectOverview } from "./projections.ts";

function rec(eventType: string, payload: Record<string, unknown>) {
  return {
    eventType,
    payload,
    sequenceNumber: 1,
    timestamp: new Date(),
  };
}

Deno.test("projectEventList ignores deleted events", () => {
  const records = [
    rec(EventTypes.eventCreated, {
      title: "A",
      createdAt: "2026-02-17T10:00:00.000Z",
      eventCreatedID: "e1",
    }),
    rec(EventTypes.eventCreated, {
      title: "B",
      createdAt: "2026-02-17T11:00:00.000Z",
      eventCreatedID: "e2",
    }),
    rec(EventTypes.eventDeleted, {
      eventId: "e2",
      deletedAt: "2026-02-17T12:00:00.000Z",
      eventDeletedID: "d1",
    }),
  ];
  assertEquals(projectEventList(records as any).map((x) => x.id), ["e1"]);
});

Deno.test("projectEventView applies expenseDeleted", () => {
  const records = [
    rec(EventTypes.eventCreated, {
      title: "A",
      createdAt: "2026-02-17T10:00:00.000Z",
      eventCreatedID: "e1",
    }),
    rec(EventTypes.expenseAdded, {
      eventId: "e1",
      date: "2026-02-17",
      purpose: "Getränke",
      amountCents: 1000,
      name: "Peter",
      nameNorm: "peter",
      createdAt: "2026-02-17T10:10:00.000Z",
      expenseAddedID: "x1",
    }),
    rec(EventTypes.expenseDeleted, {
      eventId: "e1",
      expenseAddedID: "x1",
      deletedAt: "2026-02-17T10:20:00.000Z",
      expenseDeletedID: "dx1",
    }),
  ];
  const view = projectEventView(records as any, "e1");
  assertEquals(view.expenses.length, 0);
  assertEquals(view.overview.totals.totalCents, 0);
});

Deno.test("projectOverview calculates average and diffs", () => {
  const overview = projectOverview([
    {
      id: "x1",
      eventId: "e1",
      date: "2026-02-17",
      purpose: "A",
      amountCents: 3000,
      name: "Peter",
      nameNorm: "peter",
      createdAt: "2026-02-17T10:00:00.000Z",
    },
    {
      id: "x2",
      eventId: "e1",
      date: "2026-02-17",
      purpose: "B",
      amountCents: 1500,
      name: "Maria",
      nameNorm: "maria",
      createdAt: "2026-02-17T10:00:00.000Z",
    },
  ]);
  assertEquals(overview.totals.totalCents, 4500);
  assertEquals(overview.totals.averageCents, 2250);
  const peter = overview.byName.find((x) => x.nameNorm === "peter");
  const maria = overview.byName.find((x) => x.nameNorm === "maria");
  assertEquals(peter?.diffToAverageCents, 750);
  assertEquals(maria?.diffToAverageCents, -750);
});
