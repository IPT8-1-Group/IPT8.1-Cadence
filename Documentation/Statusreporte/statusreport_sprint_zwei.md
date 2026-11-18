# Projekt-Statusbericht

## Projektinformationen

Projekt: Cadence
Projektleiter: Sanjivan
Sprint: 2
Berichtsdatum: 18.11.2026

---

## Management Summary

Wir haben etwa 2/3 des Frontends fertiggestellt. Die Fertigstellung von Modulen und Moduleinteilen ist fast abgeschlossen, und die Login- und Registrierung sind komplett. die Admin-Seite und die Startseite sind noch nicht vorhanden. Das Backend und die Datenbank sind fast komplett. Alle APIs sind vorhanden, aber es könnten noch mehr sein, und das Backend hat noch ein paar Fehler, die wir noch beheben werden.

**Gesamtstatus:** 🟢 Grün

---

## Projektfortschritt

### Erreichte Meilensteine

Legende: ✅ erreicht / ⚠️ noch offen / ❌ Termin verpasst

| Meilenstein | Geplant | Erreicht | Status |
|-------------|---------|----------|--------|
| Sprint 1 | 14.10.26 | erreicht | ✅ |
| Grundsystem, Login und Modulverwaltung | 21.10.2026 | erreicht | ✅ |
| Grobplanung, Feinplanung | 18.11.2026 | Termin verpasst | ❌ |
| Drag & Drop, Speicherung, Tests und Deployment | 13.01.2027 | noch offen | ⚠️ |
| Sprint 2 | 18.11.2026 | noch offen | ⚠️ |
 

### Aktuelle Arbeiten

- Die Grobplanung wird gerade ausgebaut. Kurse kann man schon verschieben mit dem Drag-and-Drop System, innerhalb eines Tages und zwischen verschiedenen Tagen.
- Die Modulverwaltung (ModuleView) wurde um das Erstellen und Bearbeiten von Modulen sowie um Rückmeldungen bei Änderungen erweitert mit Pop-up Notifications.
- In der Datenbank wurde eine neue Tabelle für die Lernziele der Module ergänzt und einige Bugs, die mit der DB zusammenhängen gelöst.

### Geplante Arbeiten bis zum nächsten Bericht

- Die Grobplanung mit der API verbinden, dass Kurse hinzugefügt und Änderungen an der Reihenfolge dauerhalt gespeichert werden können. 
- Die Feinplanung weiterentwickeln, damit Lektionen pro Tag erfasst, bearbeitet und nach der Zeit gewertet werden können.
- Die Änderungen aus Frontend, Backend und DB auf develop zusammenführen und das Laden und Speicehrn der Planung in Docker testen.
- Neueste Version des Projekts Uploaden und wichtige Features testen auf Plesk.
- Testing vom Frontend und Backend hinzufügen.

---

## Risiken

| Risiko | Auswirkung | Wahrscheinlichkeit | Massnahmen | Status |
|--------|------------|--------------------|------------|--------|
| Zeitverzug bei der Fein- und Grobplanung | Hoch | Mittel | Wir werden es frühzeitig anfangen, damit wir bei eintretenden Schwierigkeiten handeln können  | Offen |
| Probleme beim Hosten der Website und dass nicht alle mit Plesk kompatibel sind | Hoch | Mittel | Wir hosten den aktuellen Stand der Webseite und bei Fehlern passen wir unser System entsprechend an. | In Arbeit |


## Probleme und Eskalationen

| Thema | Beschreibung | Verantwortlich | Termin |
|-------|--------------|----------------|--------|
| Die Bearbeitung der Unterrichtssequenzen und die Anzeige der Gesamtdauer sind noch offen. | Das Hinzufügen, Bearbeiten und Löschen von Unterrichtssequenzen anbinden und die Gesamtdauer pro Tag anzeigen. | Sanjivan | 25.11.2026 |
| Die Tabelle zeigt ein festes Raster. Unterrichtssequenzen und die Gesamtdauer sind noch nicht vollständig angebunden. | noch nicht vollständig angebunden. Sequenzen für den gewählten Tag laden, bearbeiten und speichern. Die Gesamtdauer nach jeder Änderung neu berechnen. | Sanjivan | 25.11.2026 |

---

## Entscheidungen

| Datum | Entscheidung | Verantwortlich |
|--------|--------------|-----------------|
| 25.11.2026 | Farbschema anpassen  | Sanjivan, Zoé|
| 02.12.2026 | Testing Struktur auswählen und analysierung  | Sanjivan, Egor|


---
