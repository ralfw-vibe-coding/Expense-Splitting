# FairTeilen

FairTeilen ist eine kleine Web-Anwendung, mit der gemeinsame Ausgaben in einer Gruppe einfach verteilt und übersichtlich dargestellt werden können.

Man kann Veranstaltungen wie eine Reise, ein Abendessen oder ein gemeinsames Wochenende anlegen, Ausgaben erfassen und sofort sehen, wer wie viel bezahlt hat und wie stark das vom Durchschnitt pro Person abweicht.

Die Anwendung ist mit Deno gebaut und verwendet ein Event-Sourcing-Backend mit PostgreSQL als Event Store. Lokal läuft sie mit `Deno.serve(...)` und sie lässt sich direkt auf Deno Deploy hosten.

## Funktionsumfang

- Veranstaltungen anlegen und umbenennen
- Ausgaben hinzufügen und löschen
- Alle Ausgaben einer Veranstaltung anzeigen
- Summen und Abweichungen pro Person zum Durchschnitt anzeigen
- Alle Daten dauerhaft in einem PostgreSQL-basierten Event Store speichern

## Verwendete Technik

- Deno
- HTML, CSS und JavaScript ohne Framework
- `Deno.serve(...)` als Webserver
- PostgreSQL Event Store über `jsr:@ricofritzsche/eventstore`
- Deno Deploy fürs Hosting

## Lokal starten

### Voraussetzungen

- [Deno](https://deno.com/)
- Eine erreichbare PostgreSQL-Datenbank

### Umgebung

Lege im Projektverzeichnis eine `.env`-Datei an:

```env
DATABASE_URL=postgres://user:password@host:5432/database
```

Der lokale Dev-Task lädt die `.env` automatisch.

### Starten

```bash
deno task dev
```

Danach die von Deno ausgegebene lokale URL im Browser öffnen.

### Testen

Nach dem Start kann der Server zum Beispiel so geprüft werden:

```bash
curl http://localhost:8000/api/ping
```

Die Antwort sollte ein JSON zurückgeben, das bestätigt, dass das Backend erreichbar ist.

Zusätzlich lässt sich die Anwendung direkt im Browser testen:

1. Eine Veranstaltung anlegen
2. Eine oder mehrere Ausgaben hinzufügen
3. Die Seite neu laden
4. Prüfen, ob die Daten weiterhin vorhanden sind

## Deployment auf Deno Deploy

Die Anwendung kann direkt als dynamische Deno-Deploy-App veröffentlicht werden.

### Konfiguration in Deno Deploy

Verwende dafür diese Einstellungen:

- Runtime-Typ: `Dynamic App`
- Entrypoint: `main.ts`
- Install command: leer lassen
- Build command: leer lassen
- Pre-deploy command: leer lassen
- Runtime working directory: leer lassen

### Environment Variables

In Deno Deploy muss mindestens diese Environment Variable gesetzt werden:

```env
DATABASE_URL=postgres://user:password@host:5432/database
```

Falls dein PostgreSQL-Anbieter TLS bzw. SSL verlangt, kann die URL zum Beispiel so aussehen:

```env
DATABASE_URL=postgres://user:password@host:5432/database?sslmode=require
```

### Hinweise

- Die Anwendung braucht keinen separaten Build-Schritt.
- Der Server startet direkt aus `main.ts`.
- Der PostgreSQL Event Store legt die benötigte Datenbankstruktur beim Start selbst an.
- Das Theme wird im Browser lokal gespeichert und nicht in der Datenbank.

## Entwicklungsbefehle

```bash
deno task dev
deno task check
deno task test
deno task fmt
```

## Idee hinter dem Projekt

FairTeilen ist bewusst klein und fokussiert gehalten. Ziel ist eine einfache und schnelle Oberfläche für gemeinsame Ausgaben, kombiniert mit einem event-sourced Backend, das sich leicht verstehen und unkompliziert betreiben lässt.
