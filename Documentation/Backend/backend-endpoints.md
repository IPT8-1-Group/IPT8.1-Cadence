# Cadence – Backend-Endpunkte

API-Vertrag für die Implementierung des Node.js-Backends. Alle Pfade beginnen mit `/api`.

## 1. Gemeinsame API-Regeln

### 1.1 Anmeldung und Berechtigungen

Geschützte Endpunkte erhalten den Sitzungstoken aus dem Login:

```http
Authorization: Bearer <token>
```

| Zugriff | Prüfung |
| --- | --- |
| Öffentlich | Keine Sitzung erforderlich. Ein ausdrücklich verlangter Einladungs- oder Reset-Token muss gültig sein. |
| Lehrperson | Aktives Konto mit Rolle `teacher` und Zugriff auf die betroffene Ressource. |
| Admin | Aktives Konto mit Rolle `admin`. |
| Lehrperson / Admin | Beide Rollen zugelassen; Änderungen sind auf das eigene Konto beschränkt. |

Planungen gehören einer Lehrperson. Alle referenzierten IDs werden auf Zugehörigkeit und Berechtigung geprüft. Adminrechte zur Benutzerverwaltung gewähren keine zusätzlichen Rechte auf fremde Planungen. Der Server setzt Eigentümer, IDs und Zeitstempel; diese Felder werden nicht aus dem Request übernommen.

Sitzungstokens sind widerrufbar und besitzen eine Ablaufzeit. Das Backend speichert nur ihren Hash. Abgelaufene oder widerrufene Sitzungen und inaktive Konten erhalten `401`.

### 1.2 Eingaben und Formate

- Pfadparameter wie `:courseId` sind positive ganzzahlige IDs.
- JSON-Felder verwenden `camelCase`. Unbekannte Felder werden mit `400 VALIDATION_ERROR` abgelehnt.
- Bei `PATCH` werden nur übergebene Felder geändert. Mindestens ein erlaubtes Feld ist erforderlich. `null` ist nur bei ausdrücklich nullable Feldern erlaubt.
- Zahlenfelder werden als JSON-Zahlen übergeben; Mengen, Positionen und Minuten sind Ganzzahlen.
- Kalenderdaten: `YYYY-MM-DD`. Uhrzeiten: `HH:mm`, Zeitzone `Europe/Zurich`.
- Technische Zeitstempel: ISO 8601 in UTC, beispielsweise `2026-10-27T20:00:00Z`.
- `from` und `to` begrenzen einen Datumsbereich einschliesslich beider Tage; `from <= to`.
- E-Mail-Adressen werden getrimmt und für Vergleiche vereinheitlicht. Passwörter werden unverändert geprüft und gehasht.
- Neue Passwörter: 12–128 Zeichen; gleicher Validator für Einrichtung, Änderung und Zurücksetzung. Passwort-Hashes werden niemals ausgegeben.
- `GET` und `DELETE` haben keinen Request-Body. Aktions-Endpunkte ohne beschriebene Eingaben ebenfalls nicht.

### 1.3 Antworten und Listen

Einzelne Ressourcen:

```json
{
  "data": {
    "id": 7,
    "title": "Python Grundlagen"
  }
}
```

Paginierte Listen:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 0
  }
}
```

Module, Klassen und Admin-Listen verwenden `page` (Standard `1`) und `pageSize` (Standard `20`, Maximum `100`). Andere Listen sind vollständig und liefern `{ "data": [] }`. Leere Listen sind erfolgreich. Reihenfolgen von Tagen, Lernzielen und Planungseinträgen bleiben in der Antwort erhalten.

| Status | Bedeutung |
| --- | --- |
| `200 OK` | Daten gelesen oder Änderung/Aktion abgeschlossen. |
| `201 Created` | Ressource erstellt; Antwort enthält ihre ID. |
| `202 Accepted` | Anfrage oder Mailauftrag angenommen. |
| `204 No Content` | Erfolgreich gelöscht oder abgemeldet; kein Response-Body. |
| `400 Bad Request` | Ungültige Eingaben oder Query-Parameter. |
| `401 Unauthorized` | Anmeldung fehlt oder ist ungültig; beim Login auch ungültige Zugangsdaten. |
| `403 Forbidden` | Erforderliche Rolle fehlt. |
| `404 Not Found` | Ressource fehlt oder ist für die Person nicht zugänglich. |
| `409 Conflict` | Fachlicher Konflikt, beispielsweise doppelte Modulnummer oder Terminüberschneidung. |
| `412 Precondition Failed` | Kursversion oder Terminvorschau veraltet. |
| `428 Precondition Required` | Erforderlicher `If-Match`-Header fehlt. |
| `429 Too Many Requests` | Anfragebegrenzung erreicht; `Retry-After` beachten. |
| `500 Internal Server Error` | Unerwarteter Fehler; keine internen Details ausgeben. |
| `503 Service Unavailable` | Dienst oder benötigte Abhängigkeit nicht verfügbar. |

Fehlerformat:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Die Eingaben sind ungültig.",
    "details": {
      "fields": {
        "title": "Darf nicht leer sein."
      }
    }
  }
}
```

`details` ist optional. Die allgemeinen Fehler gelten für alle passenden Endpunkte; bei den einzelnen Endpunkten stehen zusätzliche fachliche Fehler.

### 1.4 Kursversion und Transaktionen

Ein Kurs, seine Tage, Grob-/Feinplanung, Klassen-Zuordnungen und Klassentermine bilden einen gemeinsamen Versionsbereich. JSON-Leseantworten dieser Planungsbereiche für genau einen Kurs enthalten den aktuellen Versionsstand zusätzlich zu `data`:

```http
ETag: "course-7-v12"
```

```json
{
  "data": {},
  "courseVersion": 12
}
```

Alle unten mit `If-Match` gekennzeichneten Schreibzugriffe verlangen den zuletzt gelesenen `ETag`. Der gezeigte Wert ist ein Beispiel und wird durch den aktuellen Wert ersetzt. `428 VERSION_REQUIRED` bedeutet fehlender Header, `412 VERSION_CONFLICT` bedeutet veralteter Wert. Syntaxfehler erhalten `400`.

Versionsprüfung und Änderungen erfolgen atomar in einer Datenbanktransaktion. Erfolgreiche Änderungen erhöhen die Kursversion genau einmal und liefern den neuen `ETag`; bei JSON-Antworten zusätzlich `courseVersion`. Bei `204` entfällt der Body. Beim Löschen des ganzen Kurses entfällt auch der neue `ETag`.

Neu angelegte Kurse starten bei Version `1`. Terminvorschauen verändern keine Planungsdaten und erhöhen die Kursversion nicht. Automatische Speichervorgänge desselben Kurses werden im Frontend nacheinander gesendet. Bei getrennten Frontend-/Backend-Origins müssen CORS `Authorization` und `If-Match` erlauben sowie `ETag` und `Retry-After` für das Frontend freigeben.

### 1.5 Gemeinsame Antwortobjekte

Die folgenden Namen bezeichnen die JSON-Objekte in `data`. Einträge werden vollständig mit den genannten Feldern geliefert, sofern ein Endpunkt keine kompaktere Projektion nennt.

| Objekt | Felder |
| --- | --- |
| `User` | `id`, `firstName`, `lastName`, `email`, `role` (`teacher` oder `admin`), `active`, `createdAt`, `updatedAt`. |
| `Module` | `id`, `code`, `title`, `description`, `externalUrl` (String oder `null`), `learningObjectives` (String-Liste), `createdAt`, `updatedAt`. |
| `Course` | `id`, `moduleId`, `title`, `description`, `lessonDurationMin`, `assessmentMethods` (String-Liste), `dayCount`, `createdAt`, `updatedAt`. |
| `CourseDay` | `id`, `courseId`, `title`, `position`, `lessonCount`, `learningObjectives` (String-Liste). `position` beginnt bei `1`. |
| `OutlineEntry` | `id`, `dayId`, `title`, `description`, `lessonCount`, `position`. |
| `DetailedEntry` | `id`, `dayId`, `outlineEntryId` (ID oder `null`), `title`, `description`, `durationMin`, `method`, `media` (String-Liste), `comment`, `position`. |
| `Class` | `id`, `name`. |
| `CourseClass` | `id`, `courseId`, `classId`, `className`, `startDate` (Datum oder `null`), `weekdays` (Zahlenliste), `lessonTimes` (Liste je Wochentag; Abschnitt 9). |
| `ClassDate` | `dayId`, `date` (Datum oder `null`), `lessonTimes` (Liste aus `startTime` und `endTime`). |
| `AccessRequest` | `id`, `firstName`, `lastName`, `email`, `institution`, `function`, `additionalInformation`, `status`, `reason` (String oder `null`), `userId` (ID oder `null`), `createdAt`, `decidedAt` (Zeitstempel oder `null`). |

IDs und Zählwerte sind Ganzzahlen. Bezeichnungen und Beschreibungen sind Strings. `dayCount` und andere Statistikfelder werden berechnet. Listen sind bei fehlenden Einträgen leer, nicht `null`.

Ein Kurs kann mehreren Klassen zugeordnet werden. Seine Planungstage sind relative Tage; ein konkretes Datum gehört zur Kombination `(courseClassId, dayId)`. Diese Kombination und `(courseId, classId)` sind jeweils eindeutig. Die Datenbank speichert kein gemeinsames Kalenderdatum auf dem relativen Planungstag.

## 2. Anmeldung und Zugang

Login, Zugangsanfrage und Passwortzurücksetzung werden begrenzt; bei Überschreitung gilt `429`. Einladungs- und Reset-Tokens sind zufällig, nur gehasht gespeichert, zeitlich begrenzt, zweckgebunden und einmal verwendbar. E-Mail-Aufträge werden nach erfolgreicher Datenbankänderung zuverlässig abgearbeitet.

### 2.1 Login

```http
POST /api/auth/login
Content-Type: application/json
```

**Zugriff:** Öffentlich.

**Request-Body**

```json
{
  "email": "lehrperson@schule.ch",
  "password": "<Passwort>"
}
```

**Regeln:** `email` und `password` sind Pflichtfelder. Nur aktive Konten mit eingerichtetem Passwort können sich anmelden. Eine Sitzung wird erstellt; ihre Ablaufzeit wird serverseitig geprüft.

**Antwort:** `200 OK` mit `data.token`, `data.expiresAt` und `data.user` (`User`).

**Fachliche Fehler:** `401 INVALID_CREDENTIALS` bei unbekannter E-Mail, falschem Passwort oder nicht nutzbarem Konto; gleiche allgemeine Meldung.

### 2.2 Logout

```http
POST /api/auth/logout
```

**Zugriff:** Lehrperson / Admin.

**Regeln:** Nur die durch den Bearer-Token identifizierte Sitzung wird widerrufen.

**Antwort:** `204 No Content`.

### 2.3 Aktuellen Benutzer laden

```http
GET /api/auth/me
```

**Zugriff:** Lehrperson / Admin.

**Antwort:** `200 OK` mit `data` als `User`.

### 2.4 Zugang anfragen (optional)

```http
POST /api/access-requests
Content-Type: application/json
```

**Zugriff:** Öffentlich.

**Request-Body**

```json
{
  "firstName": "Anna",
  "lastName": "Muster",
  "email": "anna.muster@schule.ch",
  "institution": "Berufsfachschule",
  "function": "Lehrperson",
  "additionalInformation": "Ich möchte meine Kurse mit Cadence planen."
}
```

**Regeln:** Alle Felder ausser `additionalInformation` sind erforderlich. Fehlende Zusatzinformationen werden als leerer String gespeichert. `function` ist die berufliche Funktion und vergibt keine Rolle. Die Anfrage erhält `pending`; es entsteht noch kein Konto. Doppelte offene Anfragen werden nicht nochmals angelegt. Bereits registrierte oder abgelehnte Adressen erhalten dieselbe neutrale Antwort.

**Antwort:** `202 Accepted` mit `data.message`: `Die Anfrage wurde entgegengenommen.`

### 2.5 Erstes Passwort festlegen (optional)

```http
POST /api/auth/set-password
Content-Type: application/json
```

**Zugriff:** Öffentlich mit Einladungstoken.

**Request-Body**

```json
{
  "token": "<Einladungstoken>",
  "newPassword": "<Neues Passwort>"
}
```

**Regeln:** Beide Felder sind erforderlich. Passwort setzen und Token verbrauchen erfolgen atomar. Das Konto muss weiterhin aktiv sein und darf noch kein Passwort besitzen. Keine automatische Sitzung; anschliessend Login verwenden.

**Antwort:** `200 OK` mit `data.message`: `Das Passwort wurde festgelegt.`

**Fachliche Fehler:** `400 INVALID_OR_EXPIRED_TOKEN`.

### 2.6 Passwortzurücksetzung anfordern (optional)

```http
POST /api/auth/forgot-password
Content-Type: application/json
```

**Zugriff:** Öffentlich.

**Request-Body**

```json
{
  "email": "lehrperson@schule.ch"
}
```

**Regeln:** `email` ist erforderlich. Für berechtigte aktive Konten wird ein Reset-Link versendet. Antwort und Status verraten nicht, ob das Konto existiert.

**Antwort:** `202 Accepted` mit `data.message`: `Falls ein passendes Konto existiert, erhältst du eine E-Mail.`

### 2.7 Passwort zurücksetzen (optional)

```http
POST /api/auth/reset-password
Content-Type: application/json
```

**Zugriff:** Öffentlich mit Reset-Token.

**Request-Body**

```json
{
  "token": "<Reset-Token>",
  "newPassword": "<Neues Passwort>"
}
```

**Regeln:** Beide Felder sind erforderlich. Passwort ändern, Token verbrauchen, weitere Reset-Tokens und bestehende Sitzungen widerrufen erfolgen atomar. Kein automatischer Login.

**Antwort:** `200 OK` mit `data.message`: `Das Passwort wurde zurückgesetzt.`

**Fachliche Fehler:** `400 INVALID_OR_EXPIRED_TOKEN`.

## 3. Dashboard

### 3.1 Dashboard laden

```http
GET /api/dashboard
```

**Zugriff:** Lehrperson.

**Query-Parameter**

| Parameter | Typ | Vorgabe / Bedeutung |
| --- | --- | --- |
| `from` | Datum | Optional; Standard heute in Europe/Zurich. |
| `to` | Datum | Optional; Standard `from + 6 Tage`. |

**Regeln:** Nur zugängliche Daten liefern. `upcomingDates` enthält datierte Termine im Bereich, aufsteigend nach Datum und erster Startzeit. Keine Paginierung.

**Antwort:** `200 OK` mit `data.modules` (`id`, `code`, `title`, `courseCount`), `data.courses` (`id`, `moduleId`, `title`, `dayCount`), `data.classes` (`Class`) und `data.upcomingDates` (`courseId`, `courseClassId`, `classId`, `className`, `dayId`, `dayTitle`, `date`, `lessonTimes`). Alle vier Felder sind Listen.

## 4. Module

### 4.1 Module auflisten

```http
GET /api/modules
```

**Zugriff:** Lehrperson.

**Query-Parameter**

| Parameter | Typ | Vorgabe / Bedeutung |
| --- | --- | --- |
| `search` | String | Optional; Suche in Code und Titel. |
| `sortBy` | String | `code`, `title` oder `updatedAt`; Standard `updatedAt`. |
| `sortDirection` | String | `asc` oder `desc`; Standard `desc`. |
| `page / pageSize` | Ganzzahl | Paginierung gemäss Abschnitt 1.3. |

**Antwort:** `200 OK` mit paginierter Liste aus `id`, `code`, `title`, `description`, `courseCount`, `createdAt`, `updatedAt`.

### 4.2 Moduldetails laden

```http
GET /api/modules/:moduleId
```

**Zugriff:** Lehrperson.

**Antwort:** `200 OK` mit `data` als `Module`, ergänzt um `statistics: { courseCount, dayCount, detailedEntryCount }`. Statistik über die zugänglichen Kurse des Moduls berechnen.

### 4.3 Modul erstellen

```http
POST /api/modules
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "code": "M323",
  "title": "Funktional programmieren",
  "description": "Grundlagen der funktionalen Programmierung."
}
```

**Regeln:** `code`, `title` und `description` sind erforderlich; Code und Titel dürfen nicht leer sein. Code ist eindeutig. `externalUrl` startet mit `null`, `learningObjectives` mit `[]`.

**Antwort:** `201 Created` mit `data` als `Module`.

**Fachliche Fehler:** `409 MODULE_CODE_EXISTS`.

### 4.4 Modul bearbeiten

```http
PATCH /api/modules/:moduleId
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "title": "Funktional programmieren mit Python",
  "externalUrl": "https://example.org/module/m323"
}
```

**Regeln:** Erlaubte Felder: `code`, `title`, `description`, `externalUrl`. Code und Titel dürfen nicht leer sein. `externalUrl` ist eine absolute HTTP(S)-URL oder `null` zum Entfernen.

**Antwort:** `200 OK` mit aktualisiertem `Module`.

**Fachliche Fehler:** `409 MODULE_CODE_EXISTS`.

### 4.5 Modul löschen

```http
DELETE /api/modules/:moduleId
```

**Zugriff:** Lehrperson.

**Regeln:** Nur Module ohne Kurse löschen. Modul-Lernziele werden mitgelöscht.

**Antwort:** `204 No Content`.

**Fachliche Fehler:** `409 MODULE_NOT_EMPTY`.

### 4.6 Modul kopieren (optional)

```http
POST /api/modules/:moduleId/copy
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "code": "M323-KOPIE",
  "title": "Funktional programmieren – Kopie",
  "includeCourses": true
}
```

**Regeln:** `code` und `title` sind erforderlich; `includeCourses` ist optional und standardmässig `false`. Modulbeschreibung, Link und Lernziele werden kopiert. Bei `true` zusätzlich Kurse, Tage, Grob-/Feinplanung und Tageslernziele mit neuen IDs kopieren. Interne Verknüpfungen auf die neuen IDs umsetzen; neue Kurse starten bei Version 1. Klassen-Zuordnungen und konkrete Termine werden nicht übernommen. Die Kopie ist unabhängig. Alles in einer Transaktion speichern.

**Antwort:** `201 Created` mit `data` als neuem `Module`, ergänzt um `courseIds` als Liste der neuen Kurs-IDs.

**Fachliche Fehler:** `409 MODULE_CODE_EXISTS`.

### 4.7 Modul-Lernziele ersetzen

```http
PUT /api/modules/:moduleId/learning-objectives
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "learningObjectives": [
    "Die Teilnehmenden kennen reine Funktionen.",
    "Die Teilnehmenden können rekursive Funktionen entwickeln."
  ]
}
```

**Regeln:** `learningObjectives` ist erforderlich: eine vollständige geordnete Liste nicht leerer Strings. `[]` entfernt alle Lernziele.

**Antwort:** `200 OK` mit `data.moduleId` und `data.learningObjectives`.

## 5. Kurse

### 5.1 Kurse eines Moduls auflisten

```http
GET /api/modules/:moduleId/courses
```

**Zugriff:** Lehrperson.

**Antwort:** `200 OK` mit vollständiger Liste von `Course`-Objekten, jeweils ergänzt um `classes` (`CourseClass`-Liste) und `courseVersion` des jeweiligen Kurses. Sortierung nach Titel und ID.

### 5.2 Kurs erstellen

```http
POST /api/modules/:moduleId/courses
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "title": "Python Grundlagen",
  "description": "Einführung mit praktischen Übungen.",
  "lessonDurationMin": 45
}
```

**Regeln:** Alle drei Felder sind erforderlich. Titel darf nicht leer sein; `lessonDurationMin` ist eine positive Ganzzahl. Der Kurs startet ohne Tage und Klassen-Zuordnungen, mit `assessmentMethods: []`.

**Antwort:** `201 Created` mit `data` als `Course`, `courseVersion: 1` und neuem `ETag`.

### 5.3 Kursdetails laden

```http
GET /api/courses/:courseId
```

**Zugriff:** Lehrperson.

**Antwort:** `200 OK` mit `data` als `Course`, ergänzt um `module: { id, code, title, externalUrl }`, `classes` (`CourseClass`-Liste) und `planningStatus: { outlineEntryCount, detailedEntryCount, datedDayCount, undatedDayCount }`. Die beiden Tageszählwerte zählen Kombinationen aus Kurs-Klassen-Zuordnung und Planungstag. Zusätzlich Kursversion und `ETag`.

### 5.4 Kurs bearbeiten

```http
PATCH /api/courses/:courseId
If-Match: "course-7-v12"
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "title": "Python Grundlagen und Rekursion",
  "lessonDurationMin": 45,
  "assessmentMethods": [
    "Theoretische Prüfung",
    "Projektarbeit"
  ]
}
```

**Regeln:** Erlaubte Felder: `title`, `description`, `lessonDurationMin`, `assessmentMethods`. Titel nicht leer; Lektionsdauer positive Ganzzahl; Kurskontrollen String-Liste. Bei geänderter Lektionsdauer alle Tageszeiten neu berechnen. Bestehende Termin- und Wochentagszeiten müssen zur neuen Dauer passen. Falls nicht, zuerst betroffene Termine auf undatiert und Regeln auf leer setzen; nach der Daueränderung neue Regeln und Termine speichern.

**Antwort:** `200 OK` mit aktualisiertem `Course`.

**Fachliche Fehler:** `409 LESSON_TIMES_INCOMPATIBLE`.

### 5.5 Kurs löschen

```http
DELETE /api/courses/:courseId
If-Match: "course-7-v12"
```

**Zugriff:** Lehrperson.

**Regeln:** Kurs, Tage, Planungszeilen, Lernziele, Klassen-Zuordnungen, Klassentermine und Vorschauen gemeinsam löschen. Klasse und Modul bleiben bestehen.

**Antwort:** `204 No Content`.

## 6. Gemeinsame Planungstage

Die gespeicherte Position bestimmt die Reihenfolge und die sichtbare Tagesnummer. IDs bleiben beim Umordnen erhalten; Inhalte und Klassentermine bleiben über ihre IDs mit dem Tag verbunden.

### 6.1 Planungstage auflisten

```http
GET /api/courses/:courseId/days
```

**Zugriff:** Lehrperson.

**Antwort:** `200 OK` mit vollständiger `CourseDay`-Liste, nach `position` geordnet; zusätzlich Kursversion und `ETag`.

### 6.2 Planungstag erstellen

```http
POST /api/courses/:courseId/days
If-Match: "course-7-v12"
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "title": "Grundlagen",
  "lessonCount": 2,
  "beforeDayId": null
}
```

**Regeln:** `title` und `lessonCount` sind erforderlich. Titel nicht leer, Lektionsanzahl positive Ganzzahl. `beforeDayId` ist optional: ID eines Tags desselben Kurses; `null` oder weggelassen fügt am Ende ein. Positionen lückenlos anpassen. Für bestehende Klassen-Zuordnungen bleibt der neue Tag vorerst undatiert.

**Antwort:** `201 Created` mit `data` als neuem `CourseDay`.

### 6.3 Planungstag bearbeiten

```http
PATCH /api/course-days/:dayId
If-Match: "course-7-v12"
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "title": "Rekursion",
  "lessonCount": 2
}
```

**Regeln:** Erlaubte Felder: `title`, `lessonCount`. Eine kleinere Kapazität darf die Summe der Grobplanungslektionen nicht unterschreiten. Bereits datierte Termine müssen weiterhin genau die neue Anzahl passender Lektionszeiten besitzen; sonst zuerst Termine zurücksetzen/anpassen. Feinplanungsüberlänge ist nur eine Warnung.

**Antwort:** `200 OK` mit aktualisiertem `CourseDay`.

**Fachliche Fehler:** `409 DAY_CAPACITY_EXCEEDED` oder `409 LESSON_TIMES_INCOMPATIBLE`.

### 6.4 Planungstag löschen

```http
DELETE /api/course-days/:dayId
If-Match: "course-7-v12"
```

**Zugriff:** Lehrperson.

**Regeln:** Tag nur löschen, wenn keine Grob-/Feinplanungszeilen und keine datierten Klassentermine bestehen. Undatierte Zuordnungen, Tageslernziele und der Tag werden entfernt; Positionen danach verdichten.

**Antwort:** `204 No Content`.

**Fachliche Fehler:** `409 DAY_NOT_EMPTY`.

### 6.5 Tagesreihenfolge ersetzen

```http
PUT /api/courses/:courseId/day-order
If-Match: "course-7-v12"
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "dayIds": [
    13,
    12
  ]
}
```

**Regeln:** `dayIds` enthält alle Tage des Kurses genau einmal. Keine fremden oder doppelten IDs. Nur Positionen ändern; Termine bleiben an ihren bisherigen `dayId`-Werten.

**Antwort:** `200 OK` mit vollständig neu geordneter `CourseDay`-Liste.

## 7. Grobplanung

### 7.1 Grobplanung laden

```http
GET /api/courses/:courseId/outline
```

**Zugriff:** Lehrperson.

**Query-Parameter**

| Parameter | Typ | Vorgabe / Bedeutung |
| --- | --- | --- |
| `includeSchedule` | Boolean | `true` oder `false`; Standard `false`. |
| `courseClassId` | ID | Optional; Termine einer bestimmten Zuordnung. |
| `from / to` | Datum | Optionaler Terminbereich; nur mit `includeSchedule=true`. |

**Regeln:** Alle relativen Tage und Themen bleiben enthalten. Datumsfilter begrenzen ausschliesslich `schedule`. `courseClassId` muss zum Kurs gehören und setzt `includeSchedule=true` voraus.

**Antwort:** `200 OK` mit `data.module` (`id`, `code`, `title`, `externalUrl`, `learningObjectives`), `data.course` (`Course`) und `data.days` (`CourseDay`-Liste, je ergänzt um `entries` als `OutlineEntry`-Liste). Mit `includeSchedule=true` zusätzlich `data.schedule` im Format aus Abschnitt 9.10. Kursversion und `ETag` werden mitgeliefert.

### 7.2 Themenblock erstellen

```http
POST /api/course-days/:dayId/outline-entries
If-Match: "course-7-v12"
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "title": "Reine Funktionen",
  "description": "Mutation und Seiteneffekte vermeiden.",
  "lessonCount": 1,
  "beforeEntryId": null
}
```

**Regeln:** `title`, `description` und `lessonCount` sind erforderlich. Titel nicht leer; Lektionsanzahl positive Ganzzahl. `beforeEntryId` ist optional und muss zum Tag gehören; `null` oder weggelassen bedeutet Ende. Die Summe der Themenlektionen darf die Tageskapazität nicht überschreiten.

**Antwort:** `201 Created` mit `data.entry` (`OutlineEntry`) und `data.day` (`CourseDay` mit `entries`).

**Fachliche Fehler:** `409 DAY_CAPACITY_EXCEEDED`.

### 7.3 Themenblock bearbeiten

```http
PATCH /api/outline-entries/:entryId
If-Match: "course-7-v12"
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "title": "Reine Funktionen und Seiteneffekte",
  "lessonCount": 2
}
```

**Regeln:** Erlaubte Felder: `title`, `description`, `lessonCount`. Tageskapazität prüfen; Tag und Position werden über diesen Endpunkt nicht geändert.

**Antwort:** `200 OK` mit `data.entry` und aktualisiertem `data.day` wie beim Erstellen.

**Fachliche Fehler:** `409 DAY_CAPACITY_EXCEEDED`.

### 7.4 Themenblock löschen

```http
DELETE /api/outline-entries/:entryId
If-Match: "course-7-v12"
```

**Zugriff:** Lehrperson.

**Regeln:** Verknüpfte Feinplanungszeilen verhindern das Löschen. Ohne Verknüpfungen löschen und verbleibende Positionen verdichten.

**Antwort:** `204 No Content`.

**Fachliche Fehler:** `409 OUTLINE_ENTRY_IN_USE`.

### 7.5 Themenblock verschieben

```http
POST /api/outline-entries/:entryId/move
If-Match: "course-7-v12"
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "targetDayId": 13,
  "beforeEntryId": 62
}
```

**Regeln:** `targetDayId` und `beforeEntryId` sind erforderlich; `beforeEntryId: null` fügt am Ende ein. Zieltag muss zum selben Kurs gehören. Zielreferenz muss zum Zieltag gehören und darf nicht der verschobene Eintrag sein. Tageskapazität prüfen. Verknüpfte Feinplanungszeilen behalten ihre IDs und Themenzuordnung; bei einem Tageswechsel werden sie in bisheriger relativer Reihenfolge am Ende des Zieltags angehängt. Positionen und Zeitberechnungen beider Tage atomar aktualisieren. Klassentermine bleiben an den Tagen.

**Antwort:** `200 OK` mit `data.days`: betroffene Tage, je als `CourseDay` mit `outlineEntries` (`OutlineEntry`-Liste) und `detailed` (Tagesdarstellung aus Abschnitt 8.1). Bei Verschiebung innerhalb eines Tags nur diesen Tag ausgeben.

**Fachliche Fehler:** `409 DAY_CAPACITY_EXCEEDED`.

### 7.6 Mehrere Themenblöcke gemeinsam bearbeiten

```http
PATCH /api/courses/:courseId/outline
If-Match: "course-7-v12"
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "entries": [
    {
      "id": 51,
      "title": "Reine Funktionen",
      "description": "Ohne Mutation und Seiteneffekte.",
      "lessonCount": 1
    },
    {
      "id": 62,
      "title": "Rekursion",
      "lessonCount": 1
    }
  ]
}
```

**Regeln:** `entries` ist eine nicht leere Liste. Pro Eintrag sind `id` und mindestens eines aus `title`, `description`, `lessonCount` erforderlich. Nur bestehende Einträge dieses Kurses, jede ID höchstens einmal. Endzustand aller Tageskapazitäten prüfen und alles gemeinsam speichern. Keine Erstellung, Löschung oder Reihenfolgeänderung.

**Antwort:** `200 OK` mit vollständiger Grobplanung ohne Termine wie bei `GET .../outline`.

**Fachliche Fehler:** `409 DAY_CAPACITY_EXCEEDED`.

## 8. Feinplanung

### 8.1 Tagesdarstellung laden

```http
GET /api/course-days/:dayId/detailed
```

**Zugriff:** Lehrperson.

**Query-Parameter**

| Parameter | Typ | Vorgabe / Bedeutung |
| --- | --- | --- |
| `courseClassId` | ID | Optional; konkrete Daten und Uhrzeiten dieser Kurs-Klassen-Zuordnung ergänzen. |

**Regeln:** Die Zuordnung muss zum Kurs des Tags gehören. Ohne Klassenkontext oder ohne datierten Klassentermin ist `classDate: null`. Zeilen nach Position sortieren.

**Antwort:** `200 OK` mit `data` als Tagesdarstellung im folgenden Format; zusätzlich Kursversion und `ETag`.

```json
{
  "data": {
    "courseId": 7,
    "day": {
      "id": 12,
      "courseId": 7,
      "title": "Grundlagen",
      "position": 1,
      "lessonCount": 2,
      "learningObjectives": ["Reine Funktionen verstehen."]
    },
    "lessonDurationMin": 45,
    "lessons": [
      {"lessonNumber": 1, "startMinute": 0, "endMinute": 45},
      {"lessonNumber": 2, "startMinute": 45, "endMinute": 90}
    ],
    "entries": [
      {
        "id": 81,
        "dayId": 12,
        "outlineEntryId": 51,
        "title": "Reine Funktionen",
        "description": "Einführung und Übungen.",
        "durationMin": 50,
        "method": "Plenum",
        "media": ["Beamer"],
        "comment": "",
        "position": 1,
        "startMinute": 0,
        "endMinute": 50,
        "lessonSegments": [
          {"lessonNumber": 1, "startMinute": 0, "endMinute": 45},
          {"lessonNumber": 2, "startMinute": 0, "endMinute": 5}
        ],
        "overflowMin": 0
      }
    ],
    "summary": {
      "totalDurationMin": 50,
      "availableDurationMin": 90,
      "remainingMin": 40,
      "overflowMin": 0
    },
    "warnings": [],
    "classDate": {
      "courseClassId": 21,
      "classId": 3,
      "className": "IMS24a",
      "date": "2026-09-07",
      "lessonTimes": [
        {"startTime": "08:15", "endTime": "09:00"},
        {"startTime": "09:05", "endTime": "09:50"}
      ]
    }
  },
  "courseVersion": 12
}
```

`startMinute` und `endMinute` einer Zeile beziehen sich auf die aufsummierte Unterrichtszeit des Tages ohne Pausen. In `lessonSegments` beziehen sie sich auf den Beginn der jeweiligen Lektion. Segmentgrenzen werden an Lektionen aufgeteilt. Konkrete Uhrzeiten ergeben sich aus den Segmenten und `classDate.lessonTimes`; Pausen werden dabei übersprungen.

`availableDurationMin = lessonCount × lessonDurationMin`; `remainingMin = availableDurationMin − totalDurationMin`. Bei Überschreitung bleibt `remainingMin` negativ, `overflowMin` wird positiv und `warnings` enthält `{ "code": "TIME_EXCEEDED", "overflowMin": 10 }` mit dem tatsächlichen Wert. Segmente werden nur für verfügbare Lektionen ausgegeben; überzählige Minuten stehen im `overflowMin` der Zeile. Diese Werte werden berechnet und sind nicht editierbar.

Schreibantworten auf Feinplanungszeilen enthalten diese Tagesdarstellung ohne Klassenkontext. Das Frontend kann für konkrete Uhrzeiten anschliessend mit `courseClassId` nachladen.

### 8.2 Unterrichtssequenz erstellen

```http
POST /api/course-days/:dayId/detailed-entries
If-Match: "course-7-v12"
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "outlineEntryId": 51,
  "title": "Begrüssung und Überblick",
  "description": "Vorstellung der Lernziele und des Tagesablaufs.",
  "durationMin": 10,
  "method": "Plenum",
  "media": [
    "Beamer"
  ],
  "comment": "",
  "beforeEntryId": null
}
```

**Regeln:** `title` und `durationMin` sind erforderlich; Titel nicht leer, Dauer positive Ganzzahl. Optional: `outlineEntryId` (Standard `null`), `description`, `method`, `comment` (Standard leerer String), `media` (Standard `[]`), `beforeEntryId` (Standard `null`). Themenblock und Zielreferenz müssen zum selben Tag gehören. `null` bei `beforeEntryId` fügt am Ende ein. Zeitüberschreitungen erzeugen eine Warnung und verhindern das Speichern nicht.

**Antwort:** `201 Created` mit `data.entry` als neuem `DetailedEntry` und `data.day` als neu berechneter Tagesdarstellung aus Abschnitt 8.1.

### 8.3 Unterrichtssequenz bearbeiten

```http
PATCH /api/detailed-entries/:entryId
If-Match: "course-7-v12"
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "durationMin": 20,
  "method": "Einzelarbeit",
  "media": [
    "Laptop"
  ],
  "comment": "Zusatzaufgabe bei Bedarf."
}
```

**Regeln:** Erlaubte Felder: `outlineEntryId`, `title`, `description`, `durationMin`, `method`, `media`, `comment`. `outlineEntryId: null` entfernt die Themenzuordnung. Eine gesetzte Themen-ID muss zum Tag gehören. Keine direkte Änderung von Position oder `dayId`; Zeiten anschliessend neu berechnen.

**Antwort:** `200 OK` mit `data.entry` (`DetailedEntry`) und `data.day` als neu berechneter Tagesdarstellung.

### 8.4 Unterrichtssequenz löschen

```http
DELETE /api/detailed-entries/:entryId
If-Match: "course-7-v12"
```

**Zugriff:** Lehrperson.

**Regeln:** Zeile löschen, Positionen verdichten und Tageszeiten neu berechnen. Zugehöriger Themenblock bleibt bestehen.

**Antwort:** `204 No Content`. Tagesdarstellung danach über `GET .../detailed` nachladen.

### 8.5 Zeilenreihenfolge ersetzen

```http
PUT /api/course-days/:dayId/detailed-entry-order
If-Match: "course-7-v12"
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "entryIds": [
    82,
    81,
    83
  ]
}
```

**Regeln:** `entryIds` enthält jede Feinplanungszeile des Tags genau einmal. Keine fremden oder doppelten IDs. Themenzuordnungen bleiben erhalten; Tageszeiten neu berechnen.

**Antwort:** `200 OK` mit `data` als neu berechneter Tagesdarstellung.

### 8.6 Unterrichtssequenz auf anderen Tag verschieben

```http
POST /api/detailed-entries/:entryId/move
If-Match: "course-7-v12"
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "targetDayId": 13,
  "beforeEntryId": null,
  "outlineEntryId": 62
}
```

**Regeln:** Alle drei Felder sind erforderlich. Zieltag muss ein anderer Tag desselben Kurses sein. `beforeEntryId` bezeichnet eine Zeile am Zieltag oder ist `null` für das Ende. `outlineEntryId` ist ein Themenblock des Zieltags oder ausdrücklich `null`. ID der verschobenen Zeile behalten; Positionen und Zeiten beider Tage atomar neu berechnen.

**Antwort:** `200 OK` mit `data.entry` als verschobenem `DetailedEntry` und `data.days` als Liste der beiden neu berechneten Tagesdarstellungen.

### 8.7 Tageslernziele ersetzen

```http
PUT /api/course-days/:dayId/learning-objectives
If-Match: "course-7-v12"
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "learningObjectives": [
    "Reine Funktionen erklären.",
    "Eine Funktion ohne Seiteneffekte implementieren."
  ]
}
```

**Regeln:** Vollständige geordnete Liste nicht leerer Strings. `[]` entfernt alle Tageslernziele. Modul-Lernziele bleiben unverändert.

**Antwort:** `200 OK` mit `data` als aktualisiertem `CourseDay`.

## 9. Klassen und konkrete Termine

`weekdays` verwendet ISO-Wochentage: `1` = Montag bis `7` = Sonntag. `lessonTimes` einer Kurs-Klassen-Zuordnung ist eine Liste aus `{ weekday, times }`; `times` enthält `{ startTime, endTime }`. Pro gewähltem Wochentag muss genau ein Eintrag bestehen, ohne doppelte Wochentage. Leere Regeln sind als `startDate: null`, `weekdays: []`, `lessonTimes: []` zulässig; für eine automatische Vorschau sind vollständige Regeln erforderlich.

Lektionszeiten sind aufsteigend, innerhalb eines Kalendertags und überschneiden sich nicht. Jede Lektion dauert genau `lessonDurationMin`; Pausen zwischen Lektionen sind erlaubt. Bei einem konkreten Klassentermin muss die Anzahl Zeiten der `lessonCount` des Tags entsprechen.

Zeitintervalle werden als `[Start, Ende)` geprüft: Direkt aufeinanderfolgende Lektionen kollidieren nicht. Parallele Termine derselben Klasse oder Lehrperson sind unzulässig. Kollisionsprüfung und Speichern werden gegen konkurrierende Terminänderungen geschützt, beispielsweise durch Sperren für die betroffene Lehrperson/Klasse in der Transaktion.

### 9.1 Klassen auflisten

```http
GET /api/classes
```

**Zugriff:** Lehrperson.

**Query-Parameter**

| Parameter | Typ | Vorgabe / Bedeutung |
| --- | --- | --- |
| `search` | String | Optional; Suche im Klassennamen. |
| `page / pageSize` | Ganzzahl | Paginierung gemäss Abschnitt 1.3. |

**Antwort:** `200 OK` mit paginierter `Class`-Liste, nach Name und ID sortiert.

### 9.2 Klassendetails laden

```http
GET /api/classes/:classId
```

**Zugriff:** Lehrperson.

**Antwort:** `200 OK` mit `data` als `Class`, ergänzt um `courses`: Liste aus `courseClassId`, `courseId`, `moduleId`, `title`, `startDate`.

### 9.3 Klasse erstellen

```http
POST /api/classes
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "name": "IMS24a"
}
```

**Regeln:** `name` ist erforderlich, nicht leer und höchstens 50 Zeichen lang. Klassenname ist eindeutig.

**Antwort:** `201 Created` mit `data` als `Class`.

**Fachliche Fehler:** `409 CLASS_NAME_EXISTS`.

### 9.4 Klasse bearbeiten

```http
PATCH /api/classes/:classId
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "name": "IMS24b"
}
```

**Regeln:** Nur `name` ist editierbar; gleiche Validierung wie beim Erstellen. Die Umbenennung verändert keine Verknüpfungen.

**Antwort:** `200 OK` mit aktualisiertem `Class`.

**Fachliche Fehler:** `409 CLASS_NAME_EXISTS`.

### 9.5 Klasse löschen

```http
DELETE /api/classes/:classId
```

**Zugriff:** Lehrperson.

**Regeln:** Nur Klassen ohne Kurs-Zuordnungen löschen.

**Antwort:** `204 No Content`.

**Fachliche Fehler:** `409 CLASS_IN_USE`.

### 9.6 Klassen-Zuordnungen eines Kurses laden

```http
GET /api/courses/:courseId/classes
```

**Zugriff:** Lehrperson.

**Antwort:** `200 OK` mit vollständiger `CourseClass`-Liste; zusätzlich Kursversion und `ETag`. Sortierung nach Klassenname und ID.

### 9.7 Klasse mit Kurs verbinden

```http
POST /api/courses/:courseId/classes
If-Match: "course-7-v12"
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "classId": 3,
  "startDate": "2026-09-07",
  "weekdays": [
    1,
    2
  ],
  "lessonTimes": [
    {
      "weekday": 1,
      "times": [
        {
          "startTime": "08:15",
          "endTime": "09:00"
        },
        {
          "startTime": "09:05",
          "endTime": "09:50"
        }
      ]
    },
    {
      "weekday": 2,
      "times": [
        {
          "startTime": "08:15",
          "endTime": "09:00"
        },
        {
          "startTime": "09:05",
          "endTime": "09:50"
        }
      ]
    }
  ]
}
```

**Regeln:** `classId` ist erforderlich. Terminregeln sind optional und starten ohne Angaben leer. Bei nicht leeren Regeln alle drei Felder gemeinsam übergeben und gemäss Abschnittseinleitung prüfen. Die Klasse muss zugänglich sein und darf dem Kurs noch nicht zugeordnet sein. Es werden keine Termine automatisch gespeichert.

**Antwort:** `201 Created` mit `data` als `CourseClass`.

**Fachliche Fehler:** `409 COURSE_CLASS_EXISTS`.

### 9.8 Terminregeln einer Zuordnung bearbeiten

```http
PATCH /api/course-classes/:courseClassId
If-Match: "course-7-v12"
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "startDate": "2026-09-08",
  "weekdays": [
    2
  ],
  "lessonTimes": [
    {
      "weekday": 2,
      "times": [
        {
          "startTime": "08:15",
          "endTime": "09:00"
        },
        {
          "startTime": "09:05",
          "endTime": "09:50"
        }
      ]
    }
  ]
}
```

**Regeln:** Erlaubte Felder: `startDate`, `weekdays`, `lessonTimes`; resultierenden vollständigen Regelsatz prüfen. Die referenzierte Klasse und der Kurs sind nicht editierbar. Bestehende konkrete Termine bleiben erhalten. Zum Neuverteilen Vorschau und Übernahme verwenden.

**Antwort:** `200 OK` mit aktualisiertem `CourseClass`.

### 9.9 Klasse vom Kurs entfernen

```http
DELETE /api/course-classes/:courseClassId
If-Match: "course-7-v12"
```

**Zugriff:** Lehrperson.

**Regeln:** Zuordnung, deren Klassentermine und Vorschauen löschen. Kurs, Klasse und relative Planung bleiben bestehen.

**Antwort:** `204 No Content`.

### 9.10 Kursansicht und Termine laden

```http
GET /api/courses/:courseId/schedule
```

**Zugriff:** Lehrperson.

**Query-Parameter**

| Parameter | Typ | Vorgabe / Bedeutung |
| --- | --- | --- |
| `courseClassId` | ID | Optional; auf eine Zuordnung dieses Kurses einschränken. |
| `from / to` | Datum | Optional; konkrete Termine im Bereich filtern. |

**Regeln:** Datierte Termine nach Datum und erster Startzeit sortieren. Ohne Datumsfilter auch undatierte Tage mit `date: null`, `lessonTimes: []` liefern; mit Datumsfilter diese ausschliessen. `conflicts` enthält berechnete Einträge `{ code, resourceId }`, mit den Codes `CLASS_TIME_CONFLICT` oder `TEACHER_TIME_CONFLICT`. `resourceId` bezeichnet den anderen Kurs; nur zugängliche IDs ausgeben. Wochen- und Ereignisansicht verwenden dieselben Daten.

**Antwort:** `200 OK` mit `data.courseId`, `data.courseClasses` (`CourseClass`-Liste), `data.dates`; zusätzlich Kursversion und `ETag`. `dates` ist eine Liste aus `courseClassId`, `classId`, `className`, `dayId`, `dayTitle`, `date`, `lessonTimes`, `topics` (`OutlineEntry`-Liste) und `conflicts`.

### 9.11 Alle Datumszuordnungen einer Klasse ersetzen

```http
PUT /api/course-classes/:courseClassId/dates
If-Match: "course-7-v12"
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "dates": [
    {
      "dayId": 12,
      "date": "2026-09-07",
      "lessonTimes": [
        {
          "startTime": "08:15",
          "endTime": "09:00"
        },
        {
          "startTime": "09:05",
          "endTime": "09:50"
        }
      ]
    },
    {
      "dayId": 13,
      "date": null,
      "lessonTimes": []
    }
  ]
}
```

**Regeln:** `dates` enthält alle Planungstage des Kurses genau einmal. Für ungeplante Tage ausdrücklich `date: null` mit `lessonTimes: []` übergeben; damit wird ein bestehender Termin entfernt. Für datierte Tage Anzahl, Dauer, Reihenfolge und Kollisionen der Zeiten prüfen. Manuelle Termine müssen nicht den regulären Wochentagen entsprechen. Die gesamte Liste wird atomar ersetzt.

**Antwort:** `200 OK` mit `data.courseClassId` und `data.dates` als vollständiger `ClassDate`-Liste in Tagesreihenfolge.

**Fachliche Fehler:** `409 CLASS_TIME_CONFLICT` oder `409 TEACHER_TIME_CONFLICT`.

### 9.12 Automatische Terminverteilung berechnen

```http
POST /api/course-classes/:courseClassId/schedule-preview
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "maxDate": "2027-07-31"
}
```

**Regeln:** `maxDate` ist optional; Standard ist `startDate + 365 Tage`. `startDate` und vollständige Terminregeln müssen gespeichert sein. Alle Planungstage in ihrer aktuellen Reihenfolge verteilen. Pro Tag den nächsten freien regelkonformen Termin verwenden, dessen Lektionsanzahl passt. Belegte Termine überspringen; bisherige Termine derselben Zuordnung beim Ersetzen nicht als Fremdkollision zählen. Ergebnisse anderer Zuordnungen bleiben unverändert. Die Vorschau läuft nach 10 Minuten ab und ist an Benutzer, Zuordnung und Kursversion gebunden. Nur den Vorschau-Datensatz speichern, keine Termine verändern.

**Antwort:** `200 OK` mit `data.previewId` (String), `data.expiresAt`, `data.dates` (`ClassDate`-Liste) und `data.skippedDates` (Liste aus `date` und `reason`); zusätzlich Kursversion und `ETag` des berechneten Stands.

**Fachliche Fehler:** `400 SCHEDULE_RULES_INCOMPLETE` oder `409 NO_AVAILABLE_DATE`, wenn nicht alle Tage bis `maxDate` platziert werden können.

### 9.13 Terminvorschau übernehmen

```http
POST /api/course-classes/:courseClassId/schedule-apply
If-Match: "course-7-v12"
Content-Type: application/json
```

**Zugriff:** Lehrperson.

**Request-Body**

```json
{
  "previewId": "<Vorschau-ID>"
}
```

**Regeln:** `previewId` ist erforderlich. Vorschau muss zur Person und Zuordnung gehören, unverbraucht und nicht abgelaufen sein. Kursversion prüfen und alle Terminkollisionen beim Speichern nochmals prüfen. Bei Änderungen Vorschau neu berechnen. Termine vollständig ersetzen und Vorschau in derselben Transaktion verbrauchen.

**Antwort:** `200 OK` mit `data.courseClassId` und `data.dates` als gespeicherter `ClassDate`-Liste.

**Fachliche Fehler:** `412 PREVIEW_STALE`, `409 PREVIEW_EXPIRED`, `409 PREVIEW_ALREADY_USED` oder Termin-Konfliktcodes aus Abschnitt 9.11.

## 10. Administration – Zugangsanfragen

Statuswerte: `pending`, `approved`, `rejected`. Eine Entscheidung protokolliert Administrator und Entscheidungszeit intern. Benutzerkonto und Anfragestatus werden gemeinsam gespeichert. Einladungs-E-Mails werden über einen nachholbaren Auftrag versendet.

### 10.1 Zugangsanfragen auflisten

```http
GET /api/admin/access-requests
```

**Zugriff:** Admin.

**Query-Parameter**

| Parameter | Typ | Vorgabe / Bedeutung |
| --- | --- | --- |
| `status` | String | Optional: `pending`, `approved` oder `rejected`. |
| `search` | String | Optional; Suche in Name, E-Mail und Institution. |
| `page / pageSize` | Ganzzahl | Paginierung gemäss Abschnitt 1.3. |

**Antwort:** `200 OK` mit paginierter `AccessRequest`-Liste, neueste zuerst.

### 10.2 Zugangsanfrage laden

```http
GET /api/admin/access-requests/:requestId
```

**Zugriff:** Admin.

**Antwort:** `200 OK` mit `data` als `AccessRequest`.

### 10.3 Zugangsanfrage genehmigen

```http
POST /api/admin/access-requests/:requestId/approve
```

**Zugriff:** Admin.

**Regeln:** Nur offene Anfrage genehmigen. Aktives Konto mit Rolle `teacher` und noch nicht eingerichtetem Passwort erstellen sowie Einladung erzeugen. Wiederholte Genehmigung einer bereits genehmigten Anfrage liefert dasselbe Konto und erzeugt keine weitere Einladung. Andere abgeschlossene Anfragen nicht umwandeln.

**Antwort:** `200 OK` mit `data.request` (`AccessRequest`) und `data.user` (`User`).

**Fachliche Fehler:** `409 REQUEST_ALREADY_DECIDED` bei abgelehnter Anfrage; `409 EMAIL_IN_USE` bei bereits unabhängig bestehendem Konto.

### 10.4 Zugangsanfrage ablehnen

```http
POST /api/admin/access-requests/:requestId/reject
Content-Type: application/json
```

**Zugriff:** Admin.

**Request-Body**

```json
{
  "reason": "Der Zugang ist nur für interne Lehrpersonen vorgesehen."
}
```

**Regeln:** `reason` ist optional; ohne Angabe `null` speichern. Offene Anfrage auf `rejected` setzen. Erneutes Ablehnen liefert die gespeicherte Entscheidung; keine zweite Aktion. Bereits genehmigte Anfrage nicht ablehnen.

**Antwort:** `200 OK` mit `data` als `AccessRequest`.

**Fachliche Fehler:** `409 REQUEST_ALREADY_DECIDED` bei genehmigter Anfrage.

## 11. Administration – Benutzerverwaltung

Benutzer werden deaktiviert statt gelöscht. Das letzte aktive Administratorkonto darf weder deaktiviert noch seiner Rolle entzogen werden; diese Prüfung muss auch bei konkurrierenden Adminänderungen greifen. `passwordSet` in den folgenden Antworten ist ein berechneter Boolean.

### 11.1 Benutzer auflisten

```http
GET /api/admin/users
```

**Zugriff:** Admin.

**Query-Parameter**

| Parameter | Typ | Vorgabe / Bedeutung |
| --- | --- | --- |
| `search` | String | Optional; Suche in Name und E-Mail. |
| `role` | String | Optional: `teacher` oder `admin`. |
| `active` | Boolean | Optional: `true` oder `false`. |
| `page / pageSize` | Ganzzahl | Paginierung gemäss Abschnitt 1.3. |

**Antwort:** `200 OK` mit paginierter `User`-Liste, jeweils ergänzt um `passwordSet`; Sortierung nach Nachname, Vorname und ID.

### 11.2 Benutzer laden

```http
GET /api/admin/users/:userId
```

**Zugriff:** Admin.

**Antwort:** `200 OK` mit `data` als `User`, ergänzt um `passwordSet`.

### 11.3 Benutzer erstellen und einladen

```http
POST /api/admin/users
Content-Type: application/json
```

**Zugriff:** Admin.

**Request-Body**

```json
{
  "firstName": "Anna",
  "lastName": "Muster",
  "email": "anna.muster@schule.ch",
  "role": "teacher"
}
```

**Regeln:** Alle Felder sind erforderlich. Namen nicht leer; E-Mail eindeutig; Rolle `teacher` oder `admin`. Konto startet aktiv und ohne eingerichtetes Passwort. Einladung erzeugen und Versand beauftragen; kein Klartextpasswort setzen oder zurückgeben.

**Antwort:** `201 Created` mit `data` als `User`, ergänzt um `passwordSet: false`.

**Fachliche Fehler:** `409 EMAIL_IN_USE`.

### 11.4 Benutzer bearbeiten oder deaktivieren

```http
PATCH /api/admin/users/:userId
Content-Type: application/json
```

**Zugriff:** Admin.

**Request-Body**

```json
{
  "role": "teacher",
  "active": false
}
```

**Regeln:** Erlaubte Felder: `firstName`, `lastName`, `email`, `role`, `active`. Gleiche Validierung wie beim Erstellen. Bei Deaktivierung alle Sitzungen, Einladungs- und Reset-Tokens widerrufen. Bei Rollen- oder E-Mail-Änderung bestehende Sitzungen widerrufen. Reaktivierung erzeugt keine neue Sitzung. Letzten aktiven Admin schützen.

**Antwort:** `200 OK` mit aktualisiertem `User`, ergänzt um `passwordSet`.

**Fachliche Fehler:** `409 EMAIL_IN_USE` oder `409 LAST_ACTIVE_ADMIN`.

### 11.5 Einladung erneut senden

```http
POST /api/admin/users/:userId/invitation
```

**Zugriff:** Admin.

**Regeln:** Nur für aktive Konten ohne eingerichtetes Passwort. Frühere Einladungstokens widerrufen, neuen Token erzeugen und Versand beauftragen. Aufträge pro Zielkonto begrenzen.

**Antwort:** `202 Accepted` mit `data.message`: `Die Einladung wurde zum Versand vorgemerkt.`

**Fachliche Fehler:** `409 PASSWORD_ALREADY_SET` oder `409 USER_INACTIVE`.

## 12. Eigenes Profil und Einstellungen

Diese Endpunkte sind optional. Das eigene Profil wird über `GET /api/auth/me` geladen.

### 12.1 Eigenes Profil bearbeiten

```http
PATCH /api/users/me
Content-Type: application/json
```

**Zugriff:** Lehrperson / Admin.

**Request-Body**

```json
{
  "firstName": "Anna",
  "lastName": "Muster"
}
```

**Regeln:** Erlaubte Felder: `firstName`, `lastName`; beide dürfen nicht leer sein. Rolle, E-Mail und Aktivstatus können hier nicht verändert werden.

**Antwort:** `200 OK` mit `data` als aktualisiertem `User`.

### 12.2 Eigenes Passwort ändern

```http
PATCH /api/users/me/password
Content-Type: application/json
```

**Zugriff:** Lehrperson / Admin.

**Request-Body**

```json
{
  "currentPassword": "<Aktuelles Passwort>",
  "newPassword": "<Neues Passwort>"
}
```

**Regeln:** Beide Felder sind erforderlich. Aktuelles Passwort prüfen; neues Passwort validieren und hashen. Alle Sitzungen sowie offenen Reset-Tokens widerrufen, einschliesslich der aktuellen Sitzung. Danach erneut anmelden.

**Antwort:** `200 OK` mit `data.message`: `Das Passwort wurde geändert. Bitte melde dich erneut an.`

**Fachliche Fehler:** `400 CURRENT_PASSWORD_INVALID`.

### 12.3 Einstellungen laden

```http
GET /api/users/me/settings
```

**Zugriff:** Lehrperson / Admin.

**Antwort:** `200 OK` mit `data.theme` (`light`, `dark` oder `system`; Standard `system`) und `data.emailNotifications` (Boolean; Standard `false`).

### 12.4 Einstellungen bearbeiten

```http
PATCH /api/users/me/settings
Content-Type: application/json
```

**Zugriff:** Lehrperson / Admin.

**Request-Body**

```json
{
  "theme": "dark",
  "emailNotifications": true
}
```

**Regeln:** Erlaubte Felder: `theme`, `emailNotifications`. Werte wie beim Lesen validieren. Änderungen persistent pro Benutzer speichern. Bei aktivierten Benachrichtigungen nach erfolgreich gespeicherten Terminänderungen einen internen Mailauftrag erzeugen.

**Antwort:** `200 OK` mit den vollständigen aktualisierten Einstellungen.

## 13. PDF- und Kalenderexport (optional)

### 13.1 Kursplanung als PDF herunterladen

```http
GET /api/courses/:courseId/export/pdf
```

**Zugriff:** Lehrperson.

**Query-Parameter**

| Parameter | Typ | Vorgabe / Bedeutung |
| --- | --- | --- |
| `view` | String | `outline` oder `detailed`; Standard `outline`. |
| `dayId` | ID | Optional; nur mit `view=detailed`, sonst alle Tage. |
| `courseClassId` | ID | Optional; konkrete Klassentermine statt nur relativer Tage ergänzen. |

**Regeln:** Tag und Zuordnung müssen zum Kurs gehören. Datei aus einem konsistent gelesenen Planungsstand erstellen.

**Antwort:** `200 OK` mit PDF-Bytes, `Content-Type: application/pdf` und `Content-Disposition: attachment; filename="kurs-7.pdf"`. Kein JSON-Body.

### 13.2 Klassentermine als ICS herunterladen

```http
GET /api/course-classes/:courseClassId/export/ics
```

**Zugriff:** Lehrperson.

**Regeln:** Nur datierte Termine exportieren. Stabile Kalender-UID je `(courseClassId, dayId, lessonIndex)` verwenden; Änderungen aktualisieren denselben Kalendereintrag. Für jede Lektion einen Termin erzeugen, damit Unterrichtspausen keine falsche Belegung erzeugen. Zeiten mit korrektem Bezug zu Europe/Zurich ausgeben. Ein leerer Plan ergibt einen gültigen leeren Kalender.

**Antwort:** `200 OK` mit ICS-Text, `Content-Type: text/calendar; charset=utf-8` und `Content-Disposition: attachment; filename="kurs-klasse-21.ics"`. Kein JSON-Body.

## 14. Betrieb

### 14.1 Prozessstatus prüfen

```http
GET /api/health/live
```

**Zugriff:** Öffentlich.

**Regeln:** Nur prüfen, ob der Backend-Prozess Anfragen beantwortet. Keine Datenbankabfrage und keine internen Konfigurationswerte ausgeben.

**Antwort:** `200 OK` mit `data.status: "ok"`.

### 14.2 Betriebsbereitschaft prüfen

```http
GET /api/health/ready
```

**Zugriff:** Öffentlich.

**Regeln:** Datenbankverbindung mit kurzer Zeitbegrenzung prüfen. Keine Verbindungszeichenfolge oder interne Fehlermeldung ausgeben.

**Antwort:** `200 OK` mit `data.status: "ready"`; bei fehlender Bereitschaft `503 Service Unavailable` mit `error.code: "NOT_READY"` und allgemeiner Fehlermeldung.

