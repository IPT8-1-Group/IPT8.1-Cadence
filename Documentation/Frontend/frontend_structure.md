# Cadence – Frontend-Entwicklungsstruktur

## 1. Überblick

Das Frontend von **Cadence** wird mit **Vue 3, TypeScript, Vite, Vue Router und Pinia** umgesetzt. Die Struktur ist so aufgebaut, dass jede Datei und jeder Bereich eine klar definierte Verantwortung besitzt.

Ziele der Struktur:

- **Trennung von Benutzeroberfläche, Anwendungslogik und API-Kommunikation**
- **Feature-basierter Aufbau** für Module, Kurse und Unterrichtsplanung
- **Wiederverwendbare Komponenten** für Formulare, Tabellen und Planung
- **Einheitliche Navigation und rollenbasierte Zugriffssteuerung**
- **Erweiterbarkeit** für Stundenplan, Abwesenheiten und zusätzliche Funktionen

## 2. Ordnerstruktur

```text
Frontend/
├── public/                              # Öffentliche Dateien, z. B. favicon
├── src/
│   ├── assets/                          # Bilder, Icons, Logo-Platzhalter
│   ├── styles/                          # Globale Styles und Designvariablen
│   │   ├── main.css
│   │   └── variables.css
│   │
│   ├── components/                      # Wiederverwendbare Vue-Komponenten
│   │   ├── ui/                          # BaseButton, BaseInput, Modal, Dialog
│   │   ├── layout/                      # AppNavbar, PageContainer
│   │   ├── modules/                     # ModuleCard, ModuleForm
│   │   ├── courses/                     # CourseCard, ClassSelector
│   │   ├── planning/                    # OutlineTable, DetailedPlanningTable
│   │
│   ├── pages/                           # Vollständige Seiten (Views)
│   │   ├── Landing/
│   │   │   └── LandingView.vue
│   │   ├── Auth/
│   │   │   ├── LoginView.vue
│   │   │   └── RegisterRequestView.vue
│   │   ├── Dashboard/
│   │   │   └── DashboardView.vue
│   │   ├── Modules/
│   │   │   ├── ModulesView.vue
│   │   │   └── ModuleDetailView.vue
│   │   ├── Courses/
│   │   │   ├── OutlinePlanningView.vue
│   │   │   └── DetailedPlanningView.vue
│   │   ├── Admin/
│   │   │   ├── RegistrationRequestsView.vue
│   │   │   └── UsersView.vue
│   │   └── NotFoundView.vue
│   │
│   ├── features/                        # Fachliche Logik pro Funktionsbereich
│   │   ├── auth/                        # Anmelden, Abmelden, Berechtigungen
│   │   ├── registration/                # Zugangsanfragen
│   │   ├── modules/                     # Modulverwaltung
│   │   ├── courses/                     # Kurs- und Klassenzuordnung
│   │   ├── outlinePlanning/             # Grobplanung, dynamische Tage
│   │   ├── detailedPlanning/            # Feinplanung, Zeilen und Dauer
│   │   └── admin/                       # Freigaben und Benutzerverwaltung
│   │
│   ├── services/                        # HTTP-Aufrufe zum Backend
│   │   ├── apiClient.ts
│   │   ├── authService.ts
│   │   ├── registrationService.ts
│   │   ├── moduleService.ts
│   │   ├── courseService.ts
│   │   ├── outlinePlanningService.ts
│   │   ├── detailedPlanningService.ts
│   │   └── adminService.ts
│   │
│   ├── stores/                          # Gemeinsamer Zustand mit Pinia
│   │   ├── authStore.ts
│   │   ├── moduleStore.ts
│   │   ├── courseStore.ts
│   │   └── planningStore.ts
│   │
│   ├── router/
│   │   └── index.ts                     # Routen und Navigation Guards
│   │
│   ├── types/                           # TypeScript-Typen / Interfaces
│   │   ├── user.ts
│   │   ├── module.ts
│   │   ├── course.ts
│   │   ├── courseDay.ts
│   │   ├── outlinePlanning.ts
│   │   ├── detailedPlanning.ts
│   │   ├── registrationRequest.ts
│   │   ├── class.ts
│   │
│   ├── utils/                           # Allgemeine Hilfsfunktionen
│   │   ├── date.ts                      # Datum und Wochentag formatieren
│   │   ├── duration.ts                  # Unterrichtsdauer berechnen
│   │   └── helpers.ts
│   │
│   ├── App.vue
│   └── main.ts
│
├── index.html
├── package.json
├── vite.config.ts
└── .env.example                       # Dokumentierte, nicht geheime Variablen
```

## 3. Erklärung der Hauptbereiche

### `public/`

Dateien, die Vite unverändert über die Website bereitstellt, beispielsweise das Favicon. Die Datei `index.html` liegt dagegen im **Projektstamm**, nicht in `public/`.

### `assets/` und `styles/`

- `assets/`: Bilder, Icons und die spätere Logo-Datei
- `styles/`: CSS, Schriftarten, globale Abstände und Farbvariablen

**Cadence-Farbpalette:**

| Verwendung | Farbe |
|---|---|
| Hintergrund | `#F6F3EC` |
| Primärfarbe (Navy) | `#1B2A4A` |
| Akzentfarbe (Senfgold) | `#E0A526` |
| Sekundärfarbe | `#4A5C82` |
| Dezenter Text | `#6B6F7D` |

Als Schrift ist **Inter** vorgesehen. Falls Tailwind CSS verwendet wird, können die Designwerte in dessen Theme-Konfiguration gepflegt werden.

### `components/`

Enthält wiederverwendbare **Darstellungselemente**, die von mehreren Seiten eingesetzt werden.

Beispiele:

- `AppNavbar.vue`: Navigation mit den Haupttabs **Dashboard** und **Module**
- `ModuleForm.vue`: Formular zum Erstellen und Bearbeiten von Modulen
- `OutlineTable.vue`: Zeilen und Unterrichtstage der Grobplanung
- `DetailedPlanningTable.vue`: Unterrichtssequenzen pro Tag
- `TimetableGrid.vue`: Darstellung von Unterrichtsterminen

Komponenten erhalten Daten nach Möglichkeit über **Props** und melden Aktionen über **Emits**. HTTP-Anfragen gehören nicht in allgemeine UI-Komponenten.

### `pages/`

Stellt vollständige Seiten dar. Eine View kombiniert Komponenten, lädt die benötigten Daten und reagiert auf Benutzereingaben.

Die Seiten folgen der **Cadence-Seitenübersicht**. Die Hauptnavigation bleibt auf **Dashboard** und **Module** reduziert: Ein Kurs wird über ein Modul geöffnet, die Grob- und Feinplanung über den betreffenden Kurs.

### `features/`

Hier befindet sich die **fachliche Frontend-Logik**, beispielsweise:

- Hinzufügen und Entfernen von Planungstagen
- Sortierung von Feinplanungseinträgen und Berechnung der Gesamtdauer
- Verschieben von Unterrichtseinträgen per Drag-and-Drop
- Formularvalidierung und Verarbeitung von Registrierungsanfragen

Feature-Logik kann beispielsweise über Composables (`useOutlinePlanning.ts`) umgesetzt werden. API-Aufrufe erfolgen über `services/`.

### `services/`

Kapselt die Kommunikation mit dem **Node.js-Backend**. Beispielsweise liefert `moduleService.ts` Funktionen zum Laden, Erstellen, Ändern und Löschen von Modulen.

Der gemeinsame `apiClient.ts` übernimmt Basis-URL, Request-Konfiguration und einheitliche Fehlerverarbeitung. Die Services enthalten **keine Vue-Darstellung**.

### `stores/`

Verwaltet den **gemeinsam benötigten Zustand** mit Pinia:

- `authStore.ts`: angemeldeter Benutzer, Rolle und Authentifizierungsstatus
- `moduleStore.ts`: aktuelle Modulliste und ausgewähltes Modul
- `courseStore.ts`: geladene Kurse und Kursauswahl
- `planningStore.ts`: im Projekt gemeinsam benötigte Planungsdaten

Nicht jeder Eingabewert benötigt einen Store. Lokale Formularzustände bleiben nach Möglichkeit direkt in der zuständigen View oder Komponente.

### `router/`

Definiert die Verbindung zwischen **URL und View** sowie die Zugriffskontrolle:

- Öffentliche Seiten ohne Login
- Geschützte Seiten für angemeldete Lehrpersonen
- Administrationsseiten ausschliesslich für Administratoren
- Weiterleitung bei fehlender Anmeldung oder fehlender Berechtigung

**Wichtig:** Frontend-Guards ersetzen keine Berechtigungsprüfung im Backend.

### `types/`

Definiert TypeScript-Interfaces und -Typen für die Daten, die das Frontend verwendet: `User`, `Module`, `Course`, `CourseDay`, `OutlinePlanning` und `DetailedPlanning` sowie Registrierungsanfragen und Stundenplan-Einträge.

Die tatsächlichen Attribute müssen mit den finalen **API-Verträgen und dem Datenbankmodell** abgestimmt werden. Insbesondere die Trennung von Planungstagen und konkreten Terminen je Klasse ist noch endgültig festzulegen.

### `utils/`

Enthält allgemeine, wiederverwendbare Hilfsfunktionen, beispielsweise zur Datumsformatierung oder Minutenberechnung. Spezifische Geschäftslogik bleibt in `features/`.

## 4. Seiten und Routen

### Öffentliche Seiten

| Seite | Route | View |
|---|---|---|
| Landingpage | `/` | `LandingView.vue` |
| Login | `/login` | `LoginView.vue` |
| Zugang anfragen | `/register` | `RegisterRequestView.vue` |

Die Registrierungsseite erstellt **kein Benutzerkonto direkt**: Sie sendet eine Anfrage, die später von einem Administrator geprüft wird.

### Seiten für Lehrpersonen

| Seite | Route | View |
|---|---|---|
| Dashboard | `/dashboard` | `DashboardView.vue` |
| Module | `/modules` | `ModulesView.vue` |
| Modul-Detail | `/modules/:id` | `ModuleDetailView.vue` |
| Kursansicht *(empfohlene Ergänzung)* | `/courses/:id` | `CourseDetailView.vue` |
| Grobplanung | `/courses/:id/outline` | `OutlinePlanningView.vue` |
| Feinplanung | `/courses/:id/detailed` | `DetailedPlanningView.vue` |

Die **Kursansicht** ist als Ergänzung zur bestehenden Seitenliste vorgesehen, um Kursinformationen, zugeordnete Klassen und den Einstieg in die Planungen an einem Ort zu bündeln. Sie ist **kein eigener Hauptnavigationstab**.

### Administrationsseiten

| Seite | Route | View |
|---|---|---|
| Registrierungsanfragen | `/admin/requests` | `RegistrationRequestsView.vue` |
| Benutzerverwaltung | `/admin/users` | `UsersView.vue` |

### Erweiterungen nach Bedarf

| Seite | Mögliche Route | Zweck |
|---|---|---|
| Passwort vergessen | `/forgot-password` | Passwortzurücksetzung anfordern |
| Passwort festlegen | `/set-password` | Passwort nach Kontoerstellung vergeben |
| Einstellungen | `/settings` | Benutzerprofil und Einstellungen |
| Fehlerseite | `/:pathMatch(.*)*` | Nicht gefundene Routen |

Diese optionalen Seiten werden erst mit der entsprechenden Umsetzung in `pages/` aufgenommen.

## 5. Datenfluss und Verantwortlichkeiten

Ein typischer Ablauf beim Laden eines Moduls:

```text
ModuleDetailView.vue
        ↓
Feature-Logik / Pinia-Store (bei gemeinsamem State)
        ↓
moduleService.ts
        ↓
apiClient.ts
        ↓
Node.js-Backend (API)
        ↓
Datenbank
        ↓
Antwort → Store / View → UI-Komponenten
```

| Bereich | Verantwortung |
|---|---|
| `pages/` | Seitenaufbau und Benutzerinteraktion |
| `components/` | Wiederverwendbare Darstellung |
| `features/` | Fachliche Frontend-Logik |
| `services/` | Backend-Kommunikation |
| `stores/` | Gemeinsamer Anwendungszustand |
| `router/` | Routen und Frontend-Zugriffskontrolle |
| `types/` | Typisierung der Daten |
| `utils/` | Allgemeine Hilfsfunktionen |

## 6. Entwicklungsregeln

1. **Benennung:** Vue-Komponenten und Views in `PascalCase` (`ModuleDetailView.vue`); TypeScript-Dateien wie Services und Stores in `camelCase` (`moduleService.ts`).
2. **Klare Zuständigkeit:** Komponenten stellen dar; Features verarbeiten fachliche Abläufe; Services kommunizieren mit der API.
3. **Keine doppelten API-Aufrufe:** Wiederverwendbare HTTP-Funktionen zentral unter `services/` definieren.
4. **Typisierung:** Für API-Daten und Component-Props TypeScript-Typen verwenden; `any` möglichst vermeiden.
5. **Zugriff:** Geschützte Routen prüfen den Login, Administrationsrouten zusätzlich die Rolle. Das Backend muss dieselben Rechte durchsetzen.
6. **Fehlerbehandlung:** Ladezustände, Validierungsfehler und API-Fehler in den Views verständlich anzeigen.
7. **Tests:** Kritische Abläufe wie Login, Modul-CRUD, dynamische Planung und Drag-and-Drop mit Vitest beziehungsweise Playwright testen, sofern die Testwerkzeuge installiert sind.
