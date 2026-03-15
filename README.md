# FairTeilen

Diese Anwendung läuft jetzt als Web-App mit `Deno.serve(...)` statt als lokales Desktop-Fenster.

## Lokal starten

Voraussetzung ist eine gesetzte `DATABASE_URL`, die auf den Postgres Event Store zeigt.

```bash
export DATABASE_URL="postgres://user:password@host:5432/database"
deno task dev
```

Danach ist die App unter dem von Deno ausgegebenen lokalen Port erreichbar.

## Deno Deploy

Für Deno Deploy braucht es im Wesentlichen nur:

1. Dieses Repo als Deno-Projekt deployen.
2. `DATABASE_URL` als Environment Variable setzen.
3. `main.ts` als Entry Point verwenden.

Beim Start initialisiert der verwendete `PostgresEventStore` die benötigte Datenbankstruktur selbst.
