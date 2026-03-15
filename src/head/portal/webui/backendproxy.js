class BackendProxy {
  constructor() {
    this._readyPromise = null;
    this._themeKey = "fairteilen-theme";
  }

  async waitReady(options = {}) {
    const timeoutMs = options.timeoutMs ?? 8000;
    const pollMs = options.pollMs ?? 80;

    if (this._readyPromise) return this._readyPromise;

    this._readyPromise = (async () => {
      const start = Date.now();
      while (true) {
        try {
          const response = await fetch("/api/ping");
          if (response.ok) return true;
        } catch {
          // not connected yet
        }
        if (Date.now() - start > timeoutMs) {
          throw new Error("Backend nicht verbunden (Timeout).");
        }
        await new Promise((r) => setTimeout(r, pollMs));
      }
    })();

    return this._readyPromise;
  }

  async _call(method, payload) {
    await this.waitReady();
    const response = await fetch(`/api/${method}`, {
      method: payload === undefined ? "GET" : "POST",
      headers: payload === undefined ? undefined : { "content-type": "application/json" },
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
    return await response.json();
  }

  async getTheme() {
    const theme = localStorage.getItem(this._themeKey);
    return { theme: theme === "light" ? "light" : "dark" };
  }

  async setTheme(theme) {
    if (theme !== "light" && theme !== "dark") {
      return { ok: false, message: "Ungueltiges Theme." };
    }
    localStorage.setItem(this._themeKey, theme);
    return { ok: true, message: "Modus gespeichert." };
  }

  async listEvents() {
    return await this._call("listEvents", {});
  }

  async createEvent(title) {
    return await this._call("createEvent", { title });
  }

  async renameEvent(eventId, newTitle) {
    return await this._call("renameEvent", { eventId, newTitle });
  }

  async deleteEvent(eventId) {
    return await this._call("deleteEvent", { eventId });
  }

  async getEventView(eventId) {
    return await this._call("getEventView", { eventId });
  }

  async addExpense(eventId, date, purpose, amountCents, name) {
    return await this._call("addExpense", { eventId, date, purpose, amountCents, name });
  }

  async deleteExpense(eventId, expenseId) {
    return await this._call("deleteExpense", { eventId, expenseId });
  }
}

window.backend = new BackendProxy();
