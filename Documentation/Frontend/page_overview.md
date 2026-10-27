# Cadence – Seitenübersicht

## 1. Öffentliche Seiten

Ohne Anmeldung zugänglich.

| Page | Route | Beschreibung |
|---|---|---|
| Landingpage | `/` | Vorstellung von Cadence mit Login-Möglichkeit |
| Login | `/login` | Anmeldung mit E-Mail und Passwort |
| Zugang anfragen | `/register` | Registrierungsanfrage an den Administrator senden |

## 2. Seiten für Lehrpersonen

Nur nach Login zugänglich.

| Page | Route | Beschreibung |
|---|---|---|
| Dashboard | `/dashboard` | Übersicht über Module, Kurse und Unterricht |
| Module | `/modules` | Module erstellen, anzeigen, bearbeiten und löschen |
| Modul-Detail | `/modules/:id` | Moduldetails anzeigen und bearbeiten |
| Grobplanung | `/courses/:id/outline` | Unterrichtstage und Themen planen |
| Feinplanung | `/courses/:id/detailed` | Unterrichtssequenzen pro Planungstag bearbeiten |

## 3. Seiten für Administratoren

Diese Seiten sind ausschliesslich für Benutzer mit Administratorrechten zugänglich.

| Page | Route | Beschreibung |
|---|---|---|
| Registrierungsanfragen | `/admin/requests` | Registrierungsanfragen prüfen, genehmigen oder ablehnen |
| Benutzerverwaltung | `/admin/users` | Benutzerkonten erstellen, bearbeiten und deaktivieren |

## 4. Optionale Seiten

| Page | Route | Beschreibung |
|---|---|---|
| Passwort vergessen | `/forgot-password` | Passwortzurücksetzung anfordern |
| Passwort festlegen | `/set-password` | Passwort nach Erstellung des Kontos festlegen |
| Einstellungen | `/settings` | Benutzerprofil und Einstellungen verwalten |
| Ferien & Abwesenheiten | `/absences` | Ferien und abwesende Klassen verwalten |
| 404-Seite | `/:pathMatch(.*)*` | Fehlerseite für ungültige URLs |

## 5. Navigation

### Hauptnavigation

Die Navigation soll folgende Tabs enthalten:

- **Dashboard** 
- **Module**

Die Kurse werden über die Module erreichbar gemacht. Grobplanung und Feinplanung befinden sich innerhalb der Kursansicht.