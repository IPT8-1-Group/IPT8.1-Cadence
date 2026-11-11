# Backend Strukturierung & API-Übersicht

Das Backend ist mit **Node.js und Express** umgesetzt und verbindet sich über einen MariaDB Connection-Pool mit der Datenbank.

Die Architektur trennt klar nach Aufgabenbereichen:
* **`routes/`**: Definiert die URL-Pfade und verknüpft sie mit den Controllern und Auth-Middlewares.
* **`controllers/`**: Nimmt HTTP-Requests entgegen, validiert Parameter und sendet die JSON-Response.
* **`services/`**: Enthält Auth- und Business-Logik (z. B. Hashing, Token-Erstellung).
* **`models/`**: Führt die eigentlichen SQL-Queries über den MariaDB-Pool aus.
* **`middlewares/`**: Authentifizierung (`requireAuth`, `requireAdmin`), CORS und zentrale Fehlerbehandlung.

---

## CORS & Kommunikation mit dem Frontend

Für die Anbindung des Vue-Frontends (Vite unter `http://localhost:5173`) ist in `app.js` eine CORS-Middleware aktiv:
- Erlaubt Requests von der Frontend-Origin mit Credentials.
- Unterstützt Methoden: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.
- Akzeptiert Authentifizierungs-Header: `Authorization: Bearer <token>`, `x-auth-token`, etc.

---

## API Endpunkte Übersicht

Alle API-Routen beginnen mit `/api`. Geschützte Routen verlangen einen gültigen Header:
```http
Authorization: Bearer <token>
```

### 1. Authentifizierung & Profil (`/api/auth`)

| Methode | Endpunkt | Schutz | Beschreibung |
|---|---|---|---|
| `POST` | `/api/auth/login` | Öffentlich | Anmelden mit `email` und `password`. Gibt JWT-Token und Benutzerprofil zurück. |
| `GET` | `/api/auth/me` | Angemeldet | Gibt das Profil des aktuell angemeldeten Benutzers zurück. |
| `POST` | `/api/auth/set-password` | Öffentlich | Setzt das Passwort über einen Einladungs- oder Reset-Token (`token`, `password`). |
| `POST` | `/api/auth/change-password` | Angemeldet | Ändert das Passwort (`oldPassword`, `newPassword`). |
| `POST` | `/api/auth/logout` | Öffentlich | Meldet den Benutzer ab. |

---

### 2. Modulverwaltung (`/api/modules`)

| Methode | Endpunkt | Schutz | Beschreibung |
|---|---|---|---|
| `GET` | `/api/modules` | Angemeldet | Paginierte Liste aller Module (inkl. `search`, `sortBy`, `page`, `pageSize`). |
| `GET` | `/api/modules/:moduleId` | Angemeldet | Details eines Moduls inklusive Statistiken (Kurs-, Tage- und Feinplanungsanzahl). |
| `POST` | `/api/modules` | Angemeldet | Neues Modul anlegen (`code`, `title`, `description`). |
| `PATCH`| `/api/modules/:moduleId` | Angemeldet | Modulfelder aktualisieren. |
| `DELETE`| `/api/modules/:moduleId`| Angemeldet | Modul löschen (nur wenn keine Kurse zugeordnet sind). |

---

### 3. Kursverwaltung & Dynamische Kurstage (`/api/courses`)

Kurse verwalten und die Unterrichtstage dynamisch konfigurieren (Muss-Ziel: Dynamische Tagesanzahl & Datum).

| Methode | Endpunkt | Schutz | Beschreibung |
|---|---|---|---|
| `GET` | `/api/courses` | Angemeldet | Alle Kurse abrufen. |
| `GET` | `/api/courses/:id` | Angemeldet | Kursdetails abrufen (enthält direkt die zugeordneten `days`). |
| `POST` | `/api/courses` | Angemeldet | Kurs erstellen (`title`, `desc`, `fk_module_id`). |
| `PUT` | `/api/courses/:id` | Angemeldet | Kursdaten bearbeiten. |
| `DELETE`| `/api/courses/:id` | Angemeldet | Kurs und alle zugehörigen Tage löschen. |
| `GET` | `/api/courses/:courseId/days` | Angemeldet | Alle Planungstage eines Kurses chronologisch abrufen. |
| `POST` | `/api/courses/:courseId/days` | Angemeldet | Neuen Kurstag hinzufügen (`date`, `startTime`, `endTime`). |
| `GET` | `/api/courses/days/:dayId` | Angemeldet | Einzelnen Kurstag mit Dauer abrufen. |
| `PUT` | `/api/courses/days/:dayId` | Angemeldet | Datum oder Zeiten eines Kurstages ändern. |
| `DELETE`| `/api/courses/days/:dayId` | Angemeldet | Kurstag und dessen Feinplanung löschen. |

---

### 4. Grobplanung (`/api/grobplanung`)

Thematische Einheiten für Kurse verwalten.

| Methode | Endpunkt | Schutz | Beschreibung |
|---|---|---|---|
| `GET` | `/api/grobplanung` | Angemeldet | Grobplanungseinträge abrufen (optional `?courseId=...`). |
| `GET` | `/api/grobplanung/:id` | Angemeldet | Einzelnen Eintrag abrufen. |
| `POST` | `/api/grobplanung` | Angemeldet | Eintrag erstellen (`title`, `desc`, `fk_course`). |
| `PUT` | `/api/grobplanung/:id` | Angemeldet | Titel oder Beschreibung ändern. |
| `DELETE`| `/api/grobplanung/:id`| Angemeldet | Eintrag löschen. |
| `POST` | `/api/grobplanung/:id/move` | Angemeldet | Eintrag in einen anderen Kurs verschieben (`targetCourseId`). |

---

### 5. Feinplanung & Drag & Drop (`/api/feinplanung`)

Detaillierte Unterrichtssequenzen planen, Zeitbudgets prüfen und Sequenzen verschieben.

| Methode | Endpunkt | Schutz | Beschreibung |
|---|---|---|---|
| `GET` | `/api/feinplanung?dayId=...` | Angemeldet | Gibt alle Sequenzen des Kurstages zurück inkl. Zeitberechnung (`availableDurationMin`, `totalDurationMin`, `remainingMin`, `isOverCapacity`). |
| `POST` | `/api/feinplanung` | Angemeldet | Neue Sequenz anlegen (`topic`, `dur_min`, `fk_course_day`, optional `fk_outline_planning`). Position wird automatisch berechnet. |
| `PUT` | `/api/feinplanung/:id` | Angemeldet | Sequenz bearbeiten. |
| `DELETE`| `/api/feinplanung/:id` | Angemeldet | Sequenz löschen. |
| `POST` | `/api/feinplanung/:id/move` | Angemeldet | Sequenz auf einen anderen Kurstag verschieben (`targetDayId`). |
| `POST`/`PUT` | `/api/feinplanung/reorder` | Angemeldet | Drag & Drop: Reihenfolge innerhalb eines Tages neu speichern (`dayId`, `orderedIds: [3, 1, 2]`). |

---

### 6. Zugangsanfragen & Admin (`/api/access-requests` & `/api/admin`)

| Methode | Endpunkt | Schutz | Beschreibung |
|---|---|---|---|
| `POST` | `/api/access-requests` | Öffentlich | Zugangsanfrage einreichen (`firstName`, `lastName`, `email`, `institution`, `jobTitle`). |
| `GET` | `/api/admin/access-requests` | Admin | Offene Anfragen im Dashboard auflisten. |
| `POST` | `/api/admin/access-requests/:id/approve` | Admin | Anfrage genehmigen, Benutzer anlegen und Passwort-Setzen-Link generieren. |
| `POST` | `/api/admin/access-requests/:id/reject` | Admin | Anfrage ablehnen. |
| `GET` | `/api/admin/users` | Admin | Alle Benutzerkonten auflisten. |
| `PUT` | `/api/admin/users/:id` | Admin | Rolle (`admin`/`teacher`), Profil oder Aktivstatus (`active`) ändern. |
