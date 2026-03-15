class BackendProxy {
  constructor() {
    this._readyPromise = null;
  }

  async waitReady(options = {}) {
    const timeoutMs = options.timeoutMs ?? 8000;
    const pollMs = options.pollMs ?? 80;

    if (this._readyPromise) return this._readyPromise;

    this._readyPromise = (async () => {
      const start = Date.now();
      while (true) {
        if (window.webui && typeof window.webui.call === "function") {
          try {
            await window.webui.call("ping");
            return true;
          } catch {
            // not connected yet
          }
        }
        if (Date.now() - start > timeoutMs) {
          throw new Error("WebUI nicht verbunden (Timeout).");
        }
        await new Promise((r) => setTimeout(r, pollMs));
      }
    })();

    return this._readyPromise;
  }

  async _call(method, payload) {
    await this.waitReady();
    if (payload === undefined) return await webui.call(method);
    return await webui.call(method, payload);
  }

  async _callJson(method, obj) {
    const raw = await this._call(method, obj === undefined ? undefined : JSON.stringify(obj));
    return JSON.parse(raw);
  }

  async getTheme() {
    return await this._callJson("getTheme");
  }

  async setTheme(theme) {
    return await this._callJson("setTheme", { theme });
  }

  async listEvents() {
    return await this._callJson("listEvents");
  }

  async createEvent(title) {
    return await this._callJson("createEvent", { title });
  }

  async renameEvent(eventId, newTitle) {
    return await this._callJson("renameEvent", { eventId, newTitle });
  }

  async deleteEvent(eventId) {
    return await this._callJson("deleteEvent", { eventId });
  }

  async getEventView(eventId) {
    return await this._callJson("getEventView", { eventId });
  }

  async addExpense(eventId, date, purpose, amountCents, name) {
    return await this._callJson("addExpense", { eventId, date, purpose, amountCents, name });
  }

  async deleteExpense(eventId, expenseId) {
    return await this._callJson("deleteExpense", { eventId, expenseId });
  }
}

window.backend = new BackendProxy();
