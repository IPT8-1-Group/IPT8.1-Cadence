# Backend Strukturierung

In der Strukturierung wird festgelegt, welche Aufgaben die einzelnen Bereiche des Backends übernehmen und wie die Abläufe innerhalb der Anwendung funktionieren.

Das Backend wird mit Node.js umgesetzt. Für die API wird eine klare Trennung zwischen Routes, Middleware, Controllern, Services und Models verwendet.

Das Backend beinhaltet aktuell folgende Hauptbereiche:

* Login
* Mobul
* Feinplanung
* Grobplanung

---

# Grundstruktur

Die Ordnerstruktur des Backends ist folgendermassen aufgebaut:

```text
backend/
│
├── 0_routes/
│   ├── authRoutes.js
│   ├── mobulRoutes.js
│   ├── feinplanungRoutes.js
│   └── grobplanungRoutes.js
│
├── 1_middleware/
│   ├── authenticateToken.js
│   ├── errorHandler.js
│   └── notFoundHandler.js
│
├── 2_controllers/
│   ├── authController.js
│   ├── mobulController.js
│   ├── feinplanungController.js
│   └── grobplanungController.js
│
├── 3_services/
│   ├── authService.js
│   ├── mobulService.js
│   ├── feinplanungService.js
│   └── grobplanungService.js
│
├── 4_models/
│   ├── authModel.js
│   ├── mobulModel.js
│   ├── feinplanungModel.js
│   └── grobplanungModel.js
│
├── 5_utils/
│   ├── ApiError.js
│   ├── asyncHandler.js
│   └── validators.js
│
├── app.js
├── package.json
└── .env
```

Die genaue Anzahl der Dateien kann sich während der Entwicklung noch verändern.

---

# Backend Flow

Eine normale Anfrage durchläuft mehrere Bereiche des Backends.

```text
Client
  ↓
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Model
  ↓
Datenbank
  ↓
Response
  ↓
Client
```

Dadurch hat jeder Bereich eine klar definierte Aufgabe.

---

# Login Flow

Der Login besitzt einen etwas anderen Ablauf, da zuerst die Zugangsdaten überprüft werden.

```text
Client
  ↓
POST /api/auth/login
  ↓
authRoutes
  ↓
authController
  ↓
authService
  ↓
authModel
  ↓
Datenbank
  ↓
Passwort überprüfen
  ↓
Token erstellen
  ↓
Response
  ↓
Client
```

Nach einem erfolgreichen Login erhält der Benutzer beispielsweise einen Authentifizierungs-Token.

Geschützte API-Endpunkte können anschliessend überprüfen, ob dieser Token gültig ist.

---

# API Endpunkte

Das Backend stellt verschiedene API-Bereiche zur Verfügung.

## Authentifizierung

Der Bereich `/auth` ist für die Anmeldung des Benutzers zuständig.

| Methode | Endpunkt          | Beschreibung      |
| ------- | ----------------- | ----------------- |
| `POST`  | `/api/auth/login` | Benutzer anmelden |

### Login

```http
POST /api/auth/login
```

Beispiel Request:

```json
{
    "username": "max",
    "password": "passwort"
}
```

Beispiel Response:

```json
{
    "message": "Login erfolgreich",
    "token": "..."
}
```

Die tatsächlichen Felder können später an die Datenbank angepasst werden.

---

# Mobul

Der Bereich `/mobul` beinhaltet alle API-Endpunkte, die für Mobul benötigt werden.

Die genaue Datenstruktur wird während der Entwicklung festgelegt.

Grundsätzlich können die üblichen CRUD-Operationen verwendet werden.

CRUD steht für:

* Create
* Read
* Update
* Delete

## Endpunkte

| Methode  | Endpunkt         | Beschreibung                 |
| -------- | ---------------- | ---------------------------- |
| `GET`    | `/api/mobul`     | Alle Mobul-Daten abrufen     |
| `GET`    | `/api/mobul/:id` | Einzelne Mobul-Daten abrufen |
| `POST`   | `/api/mobul`     | Neue Mobul-Daten erstellen   |
| `PUT`    | `/api/mobul/:id` | Mobul-Daten bearbeiten       |
| `DELETE` | `/api/mobul/:id` | Mobul-Daten löschen          |

Beispiel:

```http
GET /api/mobul
```

Die Route ruft den entsprechenden Controller auf:

```text
mobulRoutes
    ↓
mobulController
    ↓
mobulService
    ↓
mobulModel
    ↓
Datenbank
```

---

# Feinplanung

Der Bereich `/feinplanung` beinhaltet die API-Endpunkte für die Feinplanung.

## Endpunkte

| Methode  | Endpunkt               | Beschreibung               |
| -------- | ---------------------- | -------------------------- |
| `GET`    | `/api/feinplanung`     | Alle Feinplanungen abrufen |
| `GET`    | `/api/feinplanung/:id` | Eine Feinplanung abrufen   |
| `POST`   | `/api/feinplanung`     | Neue Feinplanung erstellen |
| `PUT`    | `/api/feinplanung/:id` | Feinplanung bearbeiten     |
| `DELETE` | `/api/feinplanung/:id` | Feinplanung löschen        |

Beispiel:

```http
POST /api/feinplanung
```

Die Anfrage wird folgendermassen verarbeitet:

```text
feinplanungRoutes
        ↓
feinplanungController
        ↓
feinplanungService
        ↓
feinplanungModel
        ↓
Datenbank
```

Die Feinplanung kann dabei beispielsweise auf Daten aus der Grobplanung aufbauen.

---

# Grobplanung

Der Bereich `/grobplanung` beinhaltet die API-Endpunkte für die Grobplanung.

## Endpunkte

| Methode  | Endpunkt               | Beschreibung               |
| -------- | ---------------------- | -------------------------- |
| `GET`    | `/api/grobplanung`     | Alle Grobplanungen abrufen |
| `GET`    | `/api/grobplanung/:id` | Eine Grobplanung abrufen   |
| `POST`   | `/api/grobplanung`     | Neue Grobplanung erstellen |
| `PUT`    | `/api/grobplanung/:id` | Grobplanung bearbeiten     |
| `DELETE` | `/api/grobplanung/:id` | Grobplanung löschen        |

Beispiel:

```http
GET /api/grobplanung/:id
```

Die Verarbeitung erfolgt über:

```text
grobplanungRoutes
        ↓
grobplanungController
        ↓
grobplanungService
        ↓
grobplanungModel
        ↓
Datenbank
```

---

# Controller

Controller sind für die Verarbeitung von HTTP-Anfragen zuständig.

## Aufgaben

* Requests empfangen
* Daten aus `req.body`, `req.params` und `req.query` auslesen
* Services aufrufen
* HTTP-Statuscodes setzen
* Responses zurückgeben

## Beispiel

```js
async function getMobul(req, res) {
    const result = await mobulService.getAll();

    res.status(200).json(result);
}
```

Controller sollen möglichst keine komplexe Geschäftslogik enthalten.

Die eigentliche Logik wird in den Services umgesetzt.

---

# Services

Services enthalten die Geschäftslogik der Anwendung.

## Aufgaben

* Daten verarbeiten
* Geschäftslogik umsetzen
* Daten validieren
* Models aufrufen
* Datenbankergebnisse verarbeiten

## Beispiel

```js
async function getAll() {
    return await mobulModel.findAll();
}
```

Der Service ist unabhängig von HTTP.

Dadurch kann dieselbe Geschäftslogik beispielsweise von mehreren Controllern verwendet und einfacher getestet werden.

---

# Routes

Routes definieren die API-Endpunkte.

## Aufgaben

* URLs definieren
* HTTP-Methoden festlegen
* Controller zuordnen
* Middleware einbinden

## Beispiel

```js
router.get("/", mobulController.getAll);
router.get("/:id", mobulController.getById);
router.post("/", mobulController.create);
router.put("/:id", mobulController.update);
router.delete("/:id", mobulController.delete);
```

Die Route selbst soll möglichst wenig Logik enthalten.

Sie verbindet hauptsächlich den HTTP-Endpunkt mit Middleware und Controller.

---

# Models

Models bilden die Datenstruktur der Anwendung ab.

Die Models stellen die Verbindung zwischen der Anwendung und der Datenbanklogik her.

## Aufgaben

* Datenstruktur definieren
* Felder definieren
* Datentypen festlegen
* Datenbankabfragen durchführen
* Beziehungen zwischen Daten abbilden

Geplant sind zunächst folgende Models:

```text
authModel
mobulModel
feinplanungModel
grobplanungModel
```

Die genaue Struktur der Models wird festgelegt, sobald die benötigten Daten und Beziehungen bekannt sind.

---

# Middleware

Middleware wird während der Verarbeitung einer Anfrage ausgeführt.

## Aufgaben

* Authentifizierung
* Autorisierung
* Validierung
* Fehlerbehandlung
* Überprüfung von Requests

## Authentifizierung

Geschützte Endpunkte können über eine Authentifizierungs-Middleware abgesichert werden.

Beispiel:

```text
Request
  ↓
authenticateToken
  ↓
Controller
```

Die Middleware überprüft dabei beispielsweise den übergebenen Token.

Ist der Token gültig, wird die Anfrage mit `next()` weitergeleitet.

```js
function authenticateToken(req, res, next) {
    // Token überprüfen

    next();
}
```

---

# Utils

Der Bereich `utils/` enthält allgemeine Hilfsfunktionen.

## Aufgaben

* Wiederverwendbare Funktionen
* Fehlerklassen
* Validierung
* Allgemeine Hilfsfunktionen

Beispiele:

```text
ApiError
asyncHandler
validators
```

Utils sollen möglichst unabhängig von der konkreten Geschäftslogik funktionieren.

---

# Fehlerbehandlung

Fehler sollen zentral verarbeitet werden.

Dafür wird eine Error-Middleware verwendet.

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Fehler
  ↓
errorHandler
  ↓
Response
```

Beispiel:

```js
function errorHandler(err, req, res, next) {
    res.status(err.statusCode || 500).json({
        message: err.message || "Interner Serverfehler"
    });
}
```

Dadurch müssen Fehler nicht in jedem Controller individuell behandelt werden.

---

# app.js

`app.js` ist der zentrale Einstiegspunkt des Backends.

## Aufgaben

* Express initialisieren
* Globale Middleware registrieren
* Routes registrieren
* Fehlerbehandlung registrieren
* Server starten
* Datenbankverbindung initialisieren

Beispiel:

```js
const express = require("express");

const authRoutes = require("./0_routes/authRoutes");
const mobulRoutes = require("./0_routes/mobulRoutes");
const feinplanungRoutes = require("./0_routes/feinplanungRoutes");
const grobplanungRoutes = require("./0_routes/grobplanungRoutes");

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/mobul", mobulRoutes);
app.use("/api/feinplanung", feinplanungRoutes);
app.use("/api/grobplanung", grobplanungRoutes);

app.listen(3000, () => {
    console.log("Server läuft auf Port 3000");
});
```

---

# Gesamtübersicht

Die komplette Struktur des Backends sieht damit folgendermassen aus:

```text
                         CLIENT
                           │
                           ▼
                         ROUTES
                           │
                           ▼
                       MIDDLEWARE
                           │
                           ▼
                       CONTROLLER
                           │
                           ▼
                         SERVICE
                           │
                           ▼
                          MODEL
                           │
                           ▼
                       DATENBANK
                           │
                           ▼
                        RESPONSE
                           │
                           ▼
                         CLIENT
```

Die API ist in vier Hauptbereiche aufgeteilt:

```text
/api
│
├── /auth
│   └── POST /login
│
├── /mobul
│   ├── GET
│   ├── GET /:id
│   ├── POST
│   ├── PUT /:id
│   └── DELETE /:id
│
├── /feinplanung
│   ├── GET
│   ├── GET /:id
│   ├── POST
│   ├── PUT /:id
│   └── DELETE /:id
│
└── /grobplanung
    ├── GET
    ├── GET /:id
    ├── POST
    ├── PUT /:id
    └── DELETE /:id
```

## Ziel der Struktur

Die Trennung der einzelnen Bereiche sorgt dafür, dass das Backend übersichtlich und wartbar bleibt.

Jeder Bereich hat eine eigene Aufgabe:

| Bereich       | Aufgabe                                |
| ------------- | -------------------------------------- |
| `routes`      | API-Endpunkte definieren               |
| `middleware`  | Anfragen prüfen und absichern          |
| `controllers` | HTTP-Anfragen und Responses bearbeiten |
| `services`    | Geschäftslogik umsetzen                |
| `models`      | Datenbankzugriff und Datenstruktur     |
| `utils`       | Allgemeine Hilfsfunktionen             |
| `app.js`      | Backend zusammenführen und starten     |

Die Struktur kann während der Entwicklung erweitert werden, ohne dass die bestehenden Bereiche stark verändert werden müssen.
