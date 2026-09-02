# Pflichtenheft

## Dokumentinformationen

Projektname: Cadence \
Auftraggeber: Lager Stefan\
Datum: 26.08.2026

---

# 1. Einleitung

Beschreibt den Zweck des Projekts sowie die Ziele des zu entwickelnden Systems.

### Muss-Ziele

- Dynamische Tagesanzahl 
- Dynamische Zeilen in der Feinplanung
- Anzeigen des Datums in der Kurs Ansicht
- Möglichkeit, um Ferien und abwesende Klassen einzutragen und zu löschen.
- Unterrichtssequenzen müssen via Drag&Drop verschoben werden können. 
- Erfassung von Modulen, Unterricht und Inhalt
- Login für Lehrer

### Kann-Ziele

- Ferien und Feiertage werden automatisch anhand des Datums erkannt.
- Unterrichtssequenzen können farblich kategorisiert werden.
- Pausen werden automatisch in die Planung eingefügt.
- Bei Zeitüberschreitungen wird eine Warnung angezeigt.

---

# 2. Systemübersicht

## 2.1 Projektbeschreibung

Der Stundenplaner ist eine Website zur digitalen Erstellung und Verwaltung von Stundenplänen. Der Benutzer kann Klassen erstellen denen Stundenpläne hinzufügen und ausfüllen und diese danach bearbeiten falls notwenig. Bei Tagen, welche eine Klasse nicht zur verfügung stehen sollte, wird ein ausweichtermin gesucht und freie KLassen in die jetzt freie Stellen verschoben. Alle Pläne werden dauerhaft gespeichert.

## 2.2 Systemkontext

### Beteiligte Rollen

| Rolle | Beschreibung |
|-------|--------------|
| Benutzer | Kann Stundenpläne von Klassen sehen und diese bearbeiten. |

---

# 3. Funktionale Anforderungen

## 3.1 Übersicht

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| F001 | Benutzer-Authentifizierung (Lehrer Login) | Muss |
| F002 | Verwaltung von Modulen | Muss |
| F003 | Dynamische Planung und Tageskonfiguration | Muss |
| F004 | Kursansicht | Muss |
| F005 | Verwaltung von Ferien und Abwesenheit | Muss |
| F006 | Drag & Drop der Module | Muss |
| F007 | Automatische Erkennung von Ferien und Feiertagen | Kann |
| F008 | Kalender- & PDF-Export | Kann |
| F009 | Ereigniss Liste und Wochen Ansichten | Kann |
| F010 | Email-Benachrichtigung | Kann |
| F011 | Dark Mode | Extra |

---

### F001: Benutzer-Authentifizierung (Lehrer Login)

**Beschreibung**

> Sichere An- und Abmeldefunktion für Lehrpersonen zum Schutz und zur Personalisierung von Stundenplandaten.

**Akzeptanzkriterien**

- Lehrpersonen können sich mit ihren Zugangsdaten sicher einloggen und wieder abmelden.
- Ungültige Anmeldeversuche werden mit einer verständlichen Fehlermeldung abgelehnt.

---

### F002: Verwaltung von Modulen

**Beschreibung**

> Erfassung, Bearbeitung und Zuordnung von Unterrichtsmodulen inklusive Themen und Lerninhalten.

**Akzeptanzkriterien**

- Neue Module können mit Titel, Modulnummer und Beschreibung angelegt und editiert werden.
- Modulinhalte lassen sich bestehenden Unterrichtseinheiten flexibel zuweisen.

---

### F003: Dynamische Planung und Tageskonfiguration

**Beschreibung**

> Flexible Stundenplanstruktur mit anpassbarer Tagesanzahl und dynamisch steuerbaren Zeilen in der Feinplanung.

**Akzeptanzkriterien**

- Die Anzahl der angezeigten Tage pro Planungsperiode ist konfigurierbar.
- Zeilen in der Feinplanung können dynamisch hinzugefügt, verschoben oder entfernt werden.

---

### F004: Kursansicht

**Beschreibung**

> Zentrale Übersicht über geplante Kurse mit tagesaktueller Kalenderdatumsanzeige je Einheit.

**Akzeptanzkriterien**

- Jeder Tag im Plan zeigt das korrekte, formatierte Datum sowie den Wochentag an.
- Beim Wechseln von Wochen oder Planungszeiträumen aktualisiert sich das Datum synchron.

---

### F005: Verwaltung von Ferien und Abwesenheit

**Beschreibung**

> Manuelle Erfassung, Bearbeitung und optische Kennzeichnung von Ferienzeiten sowie abwesenden Klassen.

**Akzeptanzkriterien**

- Ferien und Klassenabwesenheiten können mit Start- und Endzeitraum eingetragen und gelöscht werden.
- Abwesende Zeiten werden im Stundenplan eindeutig als unterrichtsfrei markiert.

---

### F006: Drag & Drop der Module

**Beschreibung**

> Intuitive Verschiebung und Neuanordnung von Unterrichtsmodulen per Drag & Drop im Stundenplanraster.

**Akzeptanzkriterien**

- Modulblöcke lassen sich mit der Maus greifen und in freie Zeitslots ablegen.
- Die neue Position wird beim Loslassen sofort persistent gespeichert.

---

### F007: Automatische Erkennung von Ferien und Feiertagen

**Beschreibung**

> Automatische Ermittlung gesetzlicher Feiertage und Schulferien anhand des Kalenderjahres.

**Akzeptanzkriterien**

- Feiertage werden datumsbasiert automatisch im Stundenplan als frei eingetragen.
- Automatisch generierte Ferientermine können bei Bedarf manuell übersteuert werden.

---

### F008: Kalender- & PDF-Export

**Beschreibung**

> Exportfunktion der Stundenpläne in Standardformate für den Ausdruck oder externe Kalenderanwendungen.

**Akzeptanzkriterien**

- Der Stundenplan kann als formatierte PDF-Datei heruntergeladen werden.
- Ein iCal-Feed (`.ics`) ermöglicht das Abonnieren in gängigen Kalender-Apps.

---

### F009: Ereignisliste und Wochenansichten

**Beschreibung**

> Alternative Darstellungsformen der Termine als kompakte Wochenübersicht sowie als chronologische Ereignisliste.

**Akzeptanzkriterien**

- Benutzer können nahtlos zwischen Raster-Wochenansicht und Listenansicht umschalten.
- Die Ereignisliste fasst anstehende Termine und Änderungen chronologisch zusammen.

---

### F010: E-Mail-Benachrichtigung

**Beschreibung**

> Automatische Benachrichtigung betroffener Personen bei kurzfristigen Stundenplanänderungen per E-Mail.

**Akzeptanzkriterien**

- Bei Verschiebungen oder Ausfällen erhalten betroffene Lehrpersonen eine Info-Mail.
- Benachrichtigungen lassen sich in den persönlichen Einstellungen konfigurieren.

---

### F011: Dark Mode

**Beschreibung**

> Umschaltbares dunkles Farbschema der Benutzeroberfläche für eine augenschonende Darstellung.

**Akzeptanzkriterien**

- Die Oberfläche kann über einen Schalter zwischen Light Mode und Dark Mode gewechselt werden.
- Die gewählte Designeinstellung bleibt für zukünftige Sitzungen gespeichert.

# 4. Nichtfunktionale Anforderungen

## 4.1 Übersicht

| ID    | Anforderung                               | Priorität |
|---    |---                                        |---        |
| NF001 | Reaktionszeit & Performance               | Muss      |
| NF002 | Datensicherheit & Passwort-Hashing        | Muss      |
| NF003 | Responsive Design & Usability             | Muss      |
| NF004 | Datenintegrität & Persistenz              | Muss      |
| NF005 | Browser-Kompatibilität                    | Muss      |
| NF006 | Barrierefreiheit (Kontraste & Lesbarkeit) | Kann      |

---

### NF001: Reaktionszeit & Performance

**Beschreibung**

> Die Webanwendung muss interaktive Aktionen schnell und verzögerungsfrei verarbeiten, um einen flüssigen Arbeitsablauf bei der Stundenplanung zu garantieren.

**Akzeptanzkriterien**

- Seitenwechsel und das Nachladen von Kursansichten erfolgen innerhalb von maximal 1 Sekunde.
- Drag & Drop Aktionen von Unterrichtsmodulen reagieren ohne spürbare Latenz (< 100 ms).

---

### NF002: Datensicherheit & Passwort-Hashing

**Beschreibung**

> Benutzerdaten und Authentifizierungsinformationen müssen nach aktuellen Sicherheitsstandards geschützt und übertragen werden.

**Akzeptanzkriterien**

- Passwörter werden vor dem Speichern in der Datenbank mit einem sicheren Algorithmus (z. B. bcrypt oder Argon2) gehasht.
- Die gesamte Kommunikation zwischen Client und Server erfolgt verschlüsselt über HTTPS.

---

### NF003: Responsive Design & Usability

**Beschreibung**

> Die Benutzeroberfläche muss sich flexibel an gängige Bildschirmauflösungen anpassen und intuitiv bedienbar sein.

**Akzeptanzkriterien**

- Die Anwendung lässt sich sowohl auf Desktop-Monitoren als auch auf Tablets (ab 10 Zoll) fehlerfrei und ohne horizontales Scrollen bedienen.
- Bedienungselemente (Buttons, Drag-Elemente) sind ausreichend gross und klar beschriftet.

---

### NF004: Datenintegrität & Persistenz

**Beschreibung**

> Das System stellt sicher, dass keine Stundenplandaten bei gleichzeitigen Bearbeitungen oder Verbindungsabbrüchen verloren gehen.

**Akzeptanzkriterien**

- Änderungen an Plänen werden sofort transaktionssicher in der Datenbank gespeichert.
- Bei Verbindungsfehlern erhält der Benutzer eine Rückmeldung, ohne dass bereits getätigte Eingaben gelöscht werden.

---

### NF005: Browser-Kompatibilität

**Beschreibung**

> Die Anwendung muss in den gängigen modernen Webbrowsern ohne Funktionseinschränkungen lauffähig sein.

**Akzeptanzkriterien**

- Vollständige Funktionalität und konsistente Darstellung in den aktuellen Versionen von Google Chrome, Mozilla Firefox, Microsoft Edge und Safari.
- Keine Abhängigkeit von veralteten Browser-Plugins.

---

### NF006: Barrierefreiheit (Kontraste & Lesbarkeit)

**Beschreibung**

> Die Oberfläche soll gute Kontrastwerte und eine klare Typografie aufweisen, um ermüdungsfreies Arbeiten zu ermöglichen.

**Akzeptanzkriterien**

- Text- und Farbelemente erfüllen die Mindestanforderungen an Kontrastverhältnisse gemäss WCAG 2.1 AA.
- Schriftgrössen sind auch bei längeren Modulbezeichnungen im Raster gut lesbar.


---

# 5. Benutzeroberfläche

## 5.1 Wireframes / Mockups

Hier Screenshots, Skizzen oder Verweise auf Mockups einfügen.

### Startseite



### Dashboard
![Mockup Dashboard](Mockup_Dashboard.html.png)

### Grobplanung 
![Mockup grobplanung](Mockup_Grobplanung.png)

### Feinplanung 
 
### Ferien und Absenzen
![Mockup absezen](absenzen.html.png)

---

# 6. Projektplanung
| Datum          | Phase            | Geplante Arbeiten                                                                 |
| -------------- | ---------------- | --------------------------------------------------------------------------------- |
| **26.08.2026** | Analyse          | Anforderungen prüfen, Muss- und Kann-Ziele festlegen, Projektstruktur definieren  |
| **02.09.2026** | Analyse / Design | Datenmodell planen, Benutzeroberfläche und Navigation planen                      |
| **09.09.2026** | Grundsystem      | Projekt aufsetzen, Datenbank erstellen, Grundstruktur der Website entwickeln      |
| **16.09.2026** | Entwicklung      | F001 Login und Benutzerverwaltung umsetzen                                        |
| **23.09.2026** | Herbstferien     | Keine reguläre Projektarbeit                                                      |
| **30.09.2026** | Herbstferien     | Keine Projektarbeit                                                               |
| **07.10.2026** | Herbstferien     | Keine Projektarbeit                                                               |
| **14.10.2026** | Entwicklung      | F002 Modulverwaltung, Module erstellen, bearbeiten und speichern                  |
| **21.10.2026** | Entwicklung      | F003 Dynamische Planung, Tagesanzahl und dynamische Zeilen                        |
| **28.10.2026** | Entwicklung      | F004 Kursansicht, Datum und Wochentag anzeigen                                    |
| **04.11.2026** | Entwicklung      | F005 Ferien und Abwesenheiten, Eintragen und Löschen                              |
| **11.11.2026** | Entwicklung      | F006 Drag & Drop, Unterrichtssequenzen verschieben                                |
| **18.11.2026** | Integration      | Drag & Drop persistent speichern, Module, Kurse und Planung miteinander verbinden |
| **25.11.2026** | Qualität         | Responsive Design, Datenintegrität, Fehlermeldungen und Performance               |
| **02.12.2026** | Kann-Ziele       | F007 automatische Ferien/Feiertage, falls genügend Zeit vorhanden                 |
| **09.12.2026** | Kann-Ziele       | F008 PDF/Kalender-Export oder F009 Wochen-/Ereignisansicht                        |
| **16.12.2026** | Test             | Gesamtsystem testen, Fehler beheben, Muss-Ziele kontrollieren                     |
| **23.12.2026** | Weihnachtsferien | Keine Projektarbeit                                                               |
| **30.12.2026** | Weihnachtsferien | Keine Projektarbeit                                                               |
| **06.01.2027** | Abschluss        | Endkontrolle, Dokumentation, Präsentation und Abnahme                             |


## Meilensteine

| Meilenstein                            | Termin     |
| ---------------------------------------| ---------- |
| Analyse abgeschlossen und Pflichtenheft mit Mockups | 02.09.2026 |
| Grundsystem und Login abgeschlossen    | 16.09.2026 |
| Kernfunktionen umgesetzt               | 18.11.2026 |
| Umsetzung der Muss-Ziele abgeschlossen | 25.11.2026 |
| Optionale Funktionen abgeschlossen     | 09.12.2026 |
| Test abgeschlossen                     | 16.12.2026 |
| Abnahme / Projektabschluss             | 06.01.2027 |

## Termine
|                        |                      Termin | Geplantes Ergebnis                                                                        |
| --------------------------------- | --------------------------: | ----------------------------------------------------------------------------------------- |
| Projektorganisation abgeschlossen |                  25.08.2026 | Projektteam-Page, GitHub-Zugriffe, Teams-Ordner und Projektteam-Excel vorbereitet         |
| Pflichtenheft eingereicht         |              02.09.2026 | Projektbeschreibung, Anforderungen und Mockups sind vollständig dokumentiert              |
| Sprint 1                     |     02.09. – 14.10.2026 | Grundstruktur, Datenbank, Login und grundlegende Modulverwaltung                          |
| Projektstatusbericht Sprint 1     |              14.10.2026 | Aktueller Entwicklungsstand ist dokumentiert und auf Teams abgelegt                       |
| Sprint 2                      |     21.10. – 18.11.2026 | Kernfunktionen der Stundenplanung, Kursansicht, Abwesenheiten und Drag & Drop             |
| Projektstatusbericht Sprint 2     |              18.11.2026 | Entwicklungsstand und Ergebnisse aus Sprint 2 sind dokumentiert                           |
| Zwischenpräsentation              |              24.11.2026 | Aktueller Stand des Stundenplaners wird als Video präsentiert und auf Teams abgelegt      |
| Sprint 3                      | 25.11.2026 – 13.01.2027 | Muss-Ziele fertigstellen, testen, Fehler beheben und nach Möglichkeit Kann-Ziele umsetzen |
| Projektabschluss                  |              13.01.2027 | Anwendung ist fertiggestellt, getestet und für die Präsentation vorbereitet               |
| Produktpräsentation           |              20.01.2027 | Fertiges Produkt wird präsentiert                                                         |


