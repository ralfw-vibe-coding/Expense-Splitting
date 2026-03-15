const state = {
  events: [],
  selectedEventId: null,
  selectedView: null,
  toastTimer: null,
};

const el = (id) => document.getElementById(id);
const panels = () => {
  const list = document.querySelectorAll(".layout .panel");
  return {
    events: list[0],
    middle: list[1],
    right: list[2],
  };
};

const money = (cents) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(
    (cents ?? 0) / 100,
  );

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
};

function toast(msg) {
  const t = el("toast");
  t.textContent = msg ?? "";
  t.classList.remove("toast--error");
  t.classList.toggle("toast--show", !!msg);
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => {
    t.textContent = "";
    t.classList.remove("toast--show");
  }, 2500);
}

function toastError(msg) {
  const t = el("toast");
  t.textContent = msg ?? "";
  t.classList.add("toast--error");
  t.classList.toggle("toast--show", !!msg);
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => {
    t.textContent = "";
    t.classList.remove("toast--show", "toast--error");
  }, 3500);
}

function iconTrash() {
  return `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M9 3h6m-8 4h10m-9 0 1 16h6l1-16M10 11v8m4-8v8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

function setEnabled(enabled) {
  el("btnEventTitleAction").disabled = !enabled;
  el("expenseDate").disabled = !enabled;
  el("expensePurpose").disabled = !enabled;
  el("expenseAmount").disabled = !enabled;
  el("expenseName").disabled = !enabled;
  el("btnAddExpense").disabled = !enabled;
}

function isTitleEditing() {
  const container = el("eventTitleDisplay")?.closest(".titleedit");
  return container?.classList.contains("titleedit--editing") ?? false;
}

function setTitleEditing(editing) {
  const container = el("eventTitleDisplay")?.closest(".titleedit");
  container?.classList.toggle("titleedit--editing", !!editing);
  el("btnEventTitleAction").disabled = !state.selectedEventId;
  el("btnEventTitleAction").title = editing ? "Speichern" : "Umbenennen";
  el("eventTitleInput").disabled = !editing;
}

function setPanelsEnabled(enabled) {
  const p = panels();
  p.middle?.classList.toggle("panel--disabled", !enabled);
  p.right?.classList.toggle("panel--disabled", !enabled);
}

function renderEvents() {
  const list = el("eventsList");
  list.classList.toggle("empty", state.events.length === 0);
  list.innerHTML = "";

  if (state.events.length === 0) {
    list.textContent = "Noch keine Veranstaltungen.";
    return;
  }

  for (const ev of state.events) {
    const item = document.createElement("div");
    item.className = "item" + (ev.id === state.selectedEventId ? " item--selected" : "");
    item.tabIndex = 0;

    const main = document.createElement("div");
    main.className = "item__main";
    main.innerHTML = `
      <div class="item__title">${escapeHtml(ev.title)}</div>
      <div class="item__subtitle">Angelegt: ${escapeHtml(fmtDate(ev.createdAt))}</div>
    `;

    const meta = document.createElement("div");
    meta.className = "item__meta";

    const del = document.createElement("button");
    del.className = "iconbtn";
    del.title = "Löschen";
    del.innerHTML = iconTrash();
    del.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!confirm(`Veranstaltung "${ev.title}" löschen?`)) return;
      const res = await backend.deleteEvent(ev.id);
      (res.ok ? toast : toastError)(res.message);
      await loadEvents();
    });

    meta.appendChild(del);
    item.appendChild(main);
    item.appendChild(meta);

    item.addEventListener("click", async () => {
      await selectEvent(ev.id);
    });

    list.appendChild(item);
  }
}

function renderView() {
  const view = state.selectedView?.view;
  if (!view) {
    setPanelsEnabled(false);
    el("eventMeta").textContent = "Keine Veranstaltung ausgewählt.";
    el("eventTitleDisplay").textContent = "—";
    el("eventTitleInput").value = "";
    setTitleEditing(false);
    el("expensesList").textContent = "Keine Ausgaben.";
    el("expensesList").classList.add("empty");
    el("overviewList").textContent = "Keine Daten.";
    el("overviewList").classList.add("empty");
    el("kpiTotal").textContent = "—";
    el("kpiAverage").textContent = "—";
    setEnabled(false);
    return;
  }

  setPanelsEnabled(true);
  setEnabled(true);
  el("eventMeta").textContent = `ID: ${view.event.id}`;
  el("eventTitleDisplay").textContent = view.event.title;
  el("eventTitleInput").value = view.event.title;
  setTitleEditing(false);

  el("kpiTotal").textContent = money(view.overview.totals.totalCents);
  el("kpiAverage").textContent = money(view.overview.totals.averageCents);

  const expList = el("expensesList");
  expList.innerHTML = "";
  expList.classList.toggle("empty", view.expenses.length === 0);
  if (view.expenses.length === 0) {
    expList.textContent = "Keine Ausgaben.";
  } else {
    for (const ex of view.expenses) {
      const item = document.createElement("div");
      item.className = "item";

      const main = document.createElement("div");
      main.className = "item__main";
      main.innerHTML = `
        <div class="item__title">${escapeHtml(ex.purpose)}</div>
        <div class="item__subtitle">${escapeHtml(ex.date)} · ${escapeHtml(ex.name)}</div>
      `;

      const meta = document.createElement("div");
      meta.className = "item__meta";

      const amount = document.createElement("div");
      amount.className = "pill";
      amount.textContent = money(ex.amountCents);

      const del = document.createElement("button");
      del.className = "iconbtn";
      del.title = "Löschen";
      del.innerHTML = iconTrash();
      del.addEventListener("click", async () => {
        if (!confirm("Ausgabe löschen?")) return;
        const res = await backend.deleteExpense(view.event.id, ex.id);
        (res.ok ? toast : toastError)(res.message);
        await refreshView();
      });

      meta.appendChild(amount);
      meta.appendChild(del);

      item.appendChild(main);
      item.appendChild(meta);
      expList.appendChild(item);
    }
  }

  const ovList = el("overviewList");
  ovList.innerHTML = "";
  ovList.classList.toggle("empty", view.overview.byName.length === 0);
  if (view.overview.byName.length === 0) {
    ovList.textContent = "Keine Daten.";
  } else {
    for (const row of view.overview.byName) {
      const item = document.createElement("div");
      item.className = "item";

      const main = document.createElement("div");
      main.className = "item__main";
      main.innerHTML = `
        <div class="item__title">${escapeHtml(row.name)}</div>
        <div class="item__subtitle">Ausgaben: ${escapeHtml(money(row.spentCents))}</div>
      `;

      const meta = document.createElement("div");
      meta.className = "item__meta";

      const diff = row.diffToAverageCents;
      const pill = document.createElement("div");
      pill.className = "pill " + (diff >= 0 ? "pill--green" : "pill--red");
      pill.textContent = diff >= 0 ? `+${money(diff)}` : money(diff);

      meta.appendChild(pill);
      item.appendChild(main);
      item.appendChild(meta);
      ovList.appendChild(item);
    }
  }
}

async function loadEvents() {
  state.events = await backend.listEvents();
  if (state.events.length === 0) {
    state.selectedEventId = null;
    state.selectedView = null;
    renderEvents();
    renderView();
    return;
  }

  if (!state.selectedEventId || !state.events.some((e) => e.id === state.selectedEventId)) {
    state.selectedEventId = state.events[0].id;
  }

  renderEvents();
  await refreshView();
}

async function selectEvent(eventId) {
  state.selectedEventId = eventId;
  renderEvents();
  await refreshView();
}

async function refreshView() {
  if (!state.selectedEventId) {
    state.selectedView = null;
    renderView();
    return;
  }
  state.selectedView = await backend.getEventView(state.selectedEventId);
  if (!state.selectedView.ok) {
    toast(state.selectedView.message);
    state.selectedView = null;
  }
  renderView();
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function amountToCents(raw) {
  const value = Number(String(raw).replace(",", "."));
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100);
}

function wireActions() {
  el("btnToggleTheme").addEventListener("click", () => {
    const current = document.documentElement.dataset.theme || "dark";
    const theme = current === "light" ? "dark" : "light";
    applyTheme(theme);
    backend.setTheme(theme).catch((err) => {
      console.error(err);
      toastError("Konnte Modus nicht speichern.");
    });
  });

  el("btnCreateEvent").addEventListener("click", async () => {
    try {
      const title = el("newEventTitle").value.trim();
      if (!title) return;
      const res = await backend.createEvent(title);
      (res.ok ? toast : toastError)(res.message);
      el("newEventTitle").value = "";
      await loadEvents();
      if (res.ok && res.eventId) {
        await selectEvent(res.eventId);
      }
    } catch (err) {
      console.error(err);
      toast("Fehler beim Anlegen.");
    }
  });

  el("newEventTitle").addEventListener("keydown", (e) => {
    if (e.key === "Enter") el("btnCreateEvent").click();
  });

  async function saveEventTitle() {
    if (!state.selectedEventId) return;
    const newTitle = el("eventTitleInput").value.trim();
    if (!newTitle) {
      toastError("Name fehlt.");
      return;
    }
    const res = await backend.renameEvent(state.selectedEventId, newTitle);
    (res.ok ? toast : toastError)(res.message);
    if (res.ok) {
      await loadEvents();
      await refreshView();
    }
    setTitleEditing(false);
  }

  el("btnEventTitleAction").addEventListener("click", async () => {
    if (!state.selectedEventId) return;
    if (!isTitleEditing()) {
      setTitleEditing(true);
      const input = el("eventTitleInput");
      input.focus();
      input.select();
      return;
    }
    await saveEventTitle();
  });

  el("eventTitleInput").addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await saveEventTitle();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setTitleEditing(false);
      const view = state.selectedView?.view;
      if (view) el("eventTitleInput").value = view.event.title;
    }
  });

  el("btnAddExpense").addEventListener("click", async () => {
    const view = state.selectedView?.view;
    if (!view) return;

    const date = el("expenseDate").value || todayISO();
    const purpose = el("expensePurpose").value.trim();
    const cents = amountToCents(el("expenseAmount").value);
    const name = el("expenseName").value.trim();

    if (!purpose || cents === null || cents < 0 || !name) {
      toastError("Bitte alle Felder korrekt ausfüllen.");
      return;
    }

    const res = await backend.addExpense(view.event.id, date, purpose, cents, name);
    (res.ok ? toast : toastError)(res.message);
    if (res.ok) {
      el("expensePurpose").value = "";
      el("expenseAmount").value = "";
      el("expenseName").value = "";
      await refreshView();
    }
  });

  ["expensePurpose", "expenseAmount", "expenseName"].forEach((id) => {
    el(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") el("btnAddExpense").click();
    });
  });

  el("expenseDate").value = todayISO();
}

async function init() {
  window.addEventListener("unhandledrejection", (e) => {
    console.error(e.reason);
    toastError("Fehler (Promise).");
  });
  window.addEventListener("error", (e) => {
    console.error(e.error ?? e.message);
    toastError("Fehler (JS).");
  });

  wireActions();
  try {
    toast("Verbinde …");
    await backend.waitReady({ timeoutMs: 15000 });
  } catch (err) {
    console.error(err);
    toastError("Keine Verbindung zum Backend.");
    renderEvents();
    renderView();
    return;
  }
  await loadEvents();
}

init();
