# Projekt-Statusbericht

## Projektinformationen

Projekt: Cadence
Projektleiter: Sanjivan
Sprint: 1
Berichtsdatum: 14.10.2026

---

## Management Summary

Kurze Zusammenfassung des aktuellen Projektstatus (max. 5 bis 10 Sätze).

**Gesamtstatus:** 🟢 Grün

Wir sind gerade im Aufbau der technischen Grundlagen. Wir haben die letzten Male die Aufgaben bestimmt und eine Projektplanung dazu erstellt. Diese haben wir dann weiter ausgearbeitet mit Zuständigkeiten und Daten wann diese zu erledigen sind. Dann haben wir die Aufgaben im Backlog eingetragen auf Github. Gerade sind wir am Aufbau vom der Projektstruktur mit Frontend, Backend und DB. Dazu arbeiten wir am Docker Container, da wir das Projekt Containisieren wollen, weshalb wir am compose.yml und an den Dockerfiles dran sind. An der Datenbank sind wir an dem Create Datei dran und der Verbindung mit dem Backend.

---

## Projektfortschritt

### Erreichte Meilensteine

Legende: ✅ erreicht / ⚠️ noch offen / ❌ Termin verpasst

| Meilenstein | Geplant | Erreicht | Status |
|-------------|---------|----------|--------|
| Planung und Projektorganisation  | 16.09.2026 | 16.09.2026 | ✅  |
| Grundsystem, Login und Modulverwaltung | 21.10.2026 | noch offen | ⚠️ |
| Grobplanung, Feinplanung | 18.11.2026 | noch offen | ⚠️ |
| Drag & Drop, Speicherung, Tests und Deployment | 13.01.2027 | noch offen | ⚠️ |

### Aktuelle Arbeiten

- Datenbankstruktur erstellen und die DB mit dem Backend verbinden
- Docker-Container aufbauen
- Backend-Struktur aufbauen und erste API-Endpunkte implementieren

### Geplante Arbeiten bis zum nächsten Bericht
##### 1. Backend
- Migrationen

//Versionierte Skripte für Datenbankänderungen (Basis-Migration aus dem aktuellen Schema, Seed-Daten getrennt), damit die DB auf jedem System      reproduzierbar aufgebaut und später ohne Datenverlust geändert werden kann
- Authentifizierung & Passwort-Sicherheit
- Modulverwaltung API
- Klassen- & Kurs-Management API
- Stundenplan-Logik & Dynamische Perioden
- Kursansicht & Datums-Logik API
- Tests & Fehlerbehandlung 
- Globales Error-handling & Logging

##### 2. Frontend 
- Frontend-Grundstruktur (Vue.js-Projekt erstellen,
Ordnerstruktur einrichten, Vue Router und State Management konfigurieren)
- Layout und Navigation
- Startseite
- Login und Logout
- API-Anbindung
- Dashboard
- Modulverwaltung
- Grobplanung
- Feinplanung
- Frontend-Tests

---

## Risiken

| Risiko | Auswirkung | Wahrscheinlichkeit | Massnahmen | Status |
|--------|------------|--------------------|------------|--------|
| Zeitverzug bei Grundsystem, Login und Modulverwaltung | Hoch | Hoch | Kernfunktionen priorisieren, Aufgaben klar verteilen und Termine anhand des Fortschritts anpassen. | Offen |
| Probleme beim Zusammenspiel von Frontend, Backend und Datenbank | Hoch | Mittel | Docker-Umgebung starten, Verbindungen testen und Konfigurationsfehler früh beheben. | In Arbeit |

---

## Probleme und Eskalationen

| Thema | Beschreibung | Umsetzung | Verantwortlich | Termin |
|-------|--------------|----------------|--------|--------|
| Unklarer Umsetzungsstand | Grundsystem, Login und Modulverwaltung sind noch als offen geführt. Tatsächlichen Fortschritt klären und Projektplanung aktualisieren. | Der tatsächliche Stand wird gemeinsam im Team-Meeting besprochen. Danach wird die Projektplanung entsprechend aktualisiert. | Sanjivan, Gian, Zoe | 21.10.2026 |
| Datenbank verbindungsprobleme| Die Verbindung von Datenbank aufs Backend funktioniert nicht oder unzuverlässig | Die Datenbank wird neu in Docker aufgesetzt und das Vorgehen mit den Verantwortlichen besprochen. Anschliessend werden die Container neu gestartet und die Verbindung erneut getestet. | Gian, Egor | 21.10.2026 |

---

## Entscheidungen

| Datum | Entscheidung | Beschreibung | Verantwortlich |
|--------|--------------|-----------------|------------|
| 14.10.2026 | Branching vom Projekt | Die Branches `frontend`, `backend` und `database` werden in `develop` integriert. Nach erfolgreichem Test wird `develop` in `main` (stabile Version für Deployment und Abgabe) gemergt. | Sanjivan, Egor |
| 21.10.2026 | Anmeldung über JWT oder serverseitige Sessions | - | Gian |
| 11.11.2026 | Festlegen, wie Frontend, Backend und Datenbank auf Plesk betrieben, über HTTPS erreichbar gemacht und gesichert werden. | - | Egor |

---
