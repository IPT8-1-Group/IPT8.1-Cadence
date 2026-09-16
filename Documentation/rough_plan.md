# Grobplanung

## Sprints

| Datum | Sprint    | Meilenstein   |
| ------- | --------- | ------------- |
| 02.09.26 - 14.10.26 | Sprint 1          | Anforderungen und Mockup, Grundsystem, Login, Modulverwaltung  |
| 21.10.26 - 18.11.26 | Sprint 2         | Grobplaung, Feinplanung, Datumsanzeige und Abwesenheiten funktionieren  |
| 25.11.26 - 13.01.27 | Sprint 3          | Drag-and-Drop, Speicherung, Fehleranalyse, Tests, Deployment sind abgeschlossen  |

## Meilensteine

**Meilenstein: Anforderungen und Mockup**

* Sämliche Funktionen der Website sollen festgehalten werden als Markdown 
* Die Pages und Subpages der Website sollen erfasst und beschrieben werden (Markdown)
* Das Datenmodel der Datenbank soll erst als Markdown festgehalten werden, dann in draw.io ein ER Diagram erstellt werden.
* Die Mockups von essentiellen Pages erstellen

Datenbank: Datenmodel der Datenbank

Backend: -

Frontend: Mockups

Tests: -

---

**Meilenstein: Projektgrundlage**

* GitHub-Repositories erstellen.
* Grundstruktur für Vue.js, Node.js und MariaDB einrichten.
* Frontend, Backend und Datenbank miteinander verbinden.
* Login und Logout für den User umsetzen.
* Automatisiertes Deployment vorbereiten.

Datenbank: Benutzertabelle erstellen und Verbindung zu MariaDB einrichten.

Backend: Node.js-API, Datenbankverbindung und Authentifizierung einrichten.

Frontend: Vue.js-Projekt, Navigation und Loginseite erstellen.

Tests: Anmeldung mit gültigen und ungültigen Zugangsdaten sowie Verbindung zwischen allen Komponenten testen.

---

**Meilenstein: Grobplanung**

* Module mit Modulnummer, Titel und Beschreibung erfassen.
* Planungstage dynamisch hinzufügen und entfernen.
* Lektionen und Inhalte einem Planungstag zuweisen.
* Einträge erstellen, anzeigen, bearbeiten und löschen.
* Grobplanung übersichtlich darstellen.

Datenbank: Tabellen für Module, Planungstage, Lektionen und Inhalte erstellen.

Backend: CRUD-Endpunkte für Module, Tage, Lektionen und Inhalte umsetzen.

Frontend: Benutzeroberfläche für die Modulverwaltung und Grobplanung erstellen.

Tests: CRUD-Operationen und die dynamische Tagesanzahl testen.

---

**Meilenstein: Feinplanung**

* Für jeden Planungstag eine Feinplanung bereitstellen.
* Zeilen dynamisch hinzufügen, bearbeiten und löschen.
* Dauer, Inhalt, Methode, Mittel und Kommentar erfassen.
* Gesamtdauer der geplanten Unterrichtssequenzen berechnen.
* Reihenfolge der Feinplanungseinträge speichern.

Datenbank: Tabelle für Feinplanungseinträge erstellen und mit den Planungstagen verknüpfen.

Backend: CRUD-Endpunkte für Feinplanungseinträge und Zeitberechnungen umsetzen.

Frontend: Dynamische Tabelle für die Feinplanung erstellen.

Tests: Hinzufügen, Bearbeiten, Löschen und Berechnen der Einträge testen.

---

**Meilenstein: Datums- und Abwesenheitsverwaltung**

* Jedem Planungstag ein Datum und einen Wochentag zuweisen.
* Daten von Klassen ändern.
* Ferien und Abwesenheiten im Stundenplan kennzeichnen.
* Beim Wechsel der Unterrichtszeit die Daten aktualisieren.

Datenbank: -

Backend: -

Frontend: Bei Abwesenheiten kann der User die Daten anpassen

Tests: Datumsberechnung, Zeiträume und Darstellung von Abwesenheiten testen.

---

**Meilenstein: Drag-and-drop**

* Unterrichtssequenzen mit der Maus verschieben.
* Unterrichtssequenzen innerhalb eines Tages neu sortieren.
* Unterrichtssequenzen auf andere Tage verschieben.
* Ungültige Verschiebungen verhindern.
* Die neue Position nach dem Verschieben dauerhaft speichern.

Datenbank: Position und Zuordnung der Unterrichtssequenzen speichern.

Backend: Endpunkt zum Aktualisieren von Position, Tag und Reihenfolge erstellen.

Frontend: Drag-and-drop im Stundenplan und in der Feinplanung umsetzen.

Tests: Verschieben, Sortieren und Speicherung nach dem Neuladen testen.

---

**Meilenstein: Speicherung und Fehlerbehandlung**

* Sicherstellen, dass alle Änderungen dauerhaft gespeichert werden.
* Eingaben vor der Verarbeitung überprüfen.
* Verständliche Fehlermeldungen anzeigen.
* Fehler und wichtige Aktionen protokollieren.
* Datenbankfehler und Verbindungsprobleme abfangen.

Datenbank: Fremdschlüssel, Pflichtfelder und weitere Einschränkungen festlegen.

Backend: Zentrale Validierung, Fehlerbehandlung und Logging implementieren.

Frontend: Fehlermeldungen und Erfolgsmeldungen benutzerfreundlich darstellen.

Tests: Fehlerhafte Eingaben, fehlende Daten und Verbindungsfehler testen.

---

**Meilenstein: Tests und Abschluss**

* Alle Muss-Ziele aus dem Pflichtenheft überprüfen.
* Unit-, Integrations- und End-to-End-Tests durchführen.
* Responsive Darstellung auf Desktop und Tablet testen.
* Sicherheit, Performance und Browserkompatibilität prüfen.
* Fehler beheben und Benutzeroberfläche fertigstellen.
* Projektdokumentation und Präsentation erstellen.
* Anwendung auf Plesk bereitstellen.
* Kann-Ziele umsetzen, falls noch genügend Zeit vorhanden ist.

Datenbank: Datenmodell kontrollieren, Testdaten erstellen und finale Migrationen durchführen.

Backend: API dokumentieren, Sicherheit prüfen und Produktionskonfiguration fertigstellen.

Frontend: Design, Bedienbarkeit und responsive Darstellung abschliessen.

Tests: Sämtliche Muss-Ziele, CRUD-Operationen, Login, Drag-and-drop und Deployment abschliessend testen.
