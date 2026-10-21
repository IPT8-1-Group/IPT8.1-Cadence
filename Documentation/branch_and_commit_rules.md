# Branch-Regeln und Commit-Konventionen

**Projekt:** Cadence / IPT8.1  
**Stand:** 14.10.2026

## 1. Branch-Regeln

### Branch-Struktur

| Branch | Zweck | Zusammenführen in |
| --- | --- | --- |
| `main` | Stabile, getestete Version für Deployment und Abgabe | – |
| `develop` | Gemeinsamer Entwicklungsstand und Integration von Frontend, Backend und DB | `main` |
| `frontend` | Vue, Komponenten, Navigation und Darstellung | `develop` |
| `backend` | Node.js-API, Authentifizierung, Validierung und Geschäftslogik | `develop` |
| `database` | Datenbankschema, Migrationen und Testdatenskripte | `develop` |

`develop` wird aus `main` erstellt. `frontend`, `backend` und `database` werden aus `develop` erstellt. Alle fünf Branches bleiben während des Projekts bestehen.

Jeder Branch enthält das gesamte Repository. Die Namen legen den Arbeitsschwerpunkt fest; sie beschränken nicht die enthaltenen Ordner.

### Allgemeine Regeln

- Änderungen an `main` und `develop` erfolgen ausschliesslich über Pull Requests.
- Auf `frontend`, `backend` und `database` darf direkt gearbeitet und gepusht werden.
- Änderungen an API-Endpunkten oder Datenbankschema mit den betroffenen Teammitgliedern besprechen.

### Pull Requests und Integration

1. Eine überschaubare, zusammengehörige Aufgabe im zuständigen Arbeitsbranch umsetzen.
2. Relevante Prüfungen durchführen, beispielsweise Build, API-Test oder Migration auf einer Testdatenbank.
3. Einen Pull Request vom Arbeitsbranch nach `develop` erstellen.
4. Änderungen, Testresultate und Abhängigkeiten im Pull Request beschreiben. Mindestens ein anderes Teammitglied muss zustimmen.
5. Konflikte lösen und betroffene Prüfungen erneut ausführen. Danach mit **Create a merge commit** zusammenführen.
6. Nach erfolgreicher Integration `develop` wieder in die Arbeitsbranches übernehmen.
7. Einen getesteten Gesamtstand über einen Pull Request von `develop` nach `main` übernehmen.

Für die dauerhaften Branches verwenden wir Merge-Commits, damit die gemeinsame Historie erhalten bleibt. Die Branches werden nach dem Merge nicht gelöscht.

## 2. Commit-Konventionen

### Format

```text
typ(bereich): kurze Beschreibung
```

Der Bereich wird bei uns angegeben, zum Beispiel `frontend`, `backend`, `database`, `docker` oder `docs`. Typ und Bereich werden englisch und kleingeschrieben; die Beschreibung wird deutsch formuliert.

### Commit-Typen

| Typ | Verwendung | Beispiel |
| --- | --- | --- |
| `feat` | Neue Funktion | `feat(frontend): Loginformular hinzufügen` |
| `fix` | Fehler beheben | `fix(backend): Ungültige Zugangsdaten abfangen` |
| `refactor` | Code verbessern, ohne Verhalten zu ändern | `refactor(backend): Validierung auslagern` |
| `docs` | Dokumentation ändern | `docs(docs): Branch-Regeln dokumentieren` |
| `style` | Codeformatierung ohne Verhaltensänderung | `style(frontend): Einrückungen vereinheitlichen` |
| `test` | Tests hinzufügen oder anpassen | `test(backend): Modulvalidierung prüfen` |
| `build` | Build, Abhängigkeiten oder Docker ändern | `build(docker): Backend-Container konfigurieren` |
| `ci` | Automatisierte Prüfungen oder Deployment ändern | `ci(deploy): Deployment-Workflow ergänzen` |
| `chore` | Sonstige Wartungsarbeiten | `chore(repo): Gitignore ergänzen` |

`style` bezeichnet Codeformatierung. Eine sichtbare Änderung an der Oberfläche wird je nach Zweck als `feat` oder `fix` erfasst.

### Regeln für Commits

- Ein Commit enthält eine logisch zusammengehörige Änderung.
- Die erste Zeile umfasst höchstens 72 Zeichen und endet ohne Punkt.
- Die Beschreibung nennt konkret die Änderung, zum Beispiel „Modultabelle hinzufügen“. Nachrichten wie „Update“ oder „Fix“ reichen nicht aus.
- Zugangsdaten, echte `.env`-Dateien, Datenbankdaten mit persönlichen Daten und generierte Build-Dateien nicht committen.