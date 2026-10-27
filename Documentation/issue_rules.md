# Cadence - GitHub-Regeln

## 1. Ziel

Die Regeln werden festgelegt das Aufgaben (Issues) richtig und einheitlich beendet werden.

## 2. GitHub Project Board

| Status | Bedeutung | Regel |
|---|---|---|
| **Backlog** | Aufgabe ist erfasst, aber noch nicht eingeplant. | Noch nicht bearbeiten. |
| **Ready** | Aufgabe ist vorbereitet und kann begonnen werden. | Verantwortliche Person und Anforderungen festlegen. |
| **In progress** | Aufgabe wird aktiv bearbeitet. | Beim Arbeitsbeginn manuell hierhin verschieben. |
| **In review** | Umsetzung ist fertig und wird kontrolliert. | Pull Request oder Ergebnis zur Prüfung bereitstellen. |
| **Done** | Aufgabe ist abgeschlossen. | Erst nach erfolgreicher Prüfung bzw. Abnahme. |

## 3. Issues referenzieren und schliessen

| Schreibweise | Wirkung |
|---|---|
| `refs #33` | Verlinkt Issue #33, schliesst es **nicht**. `refs` ist nur unsere Konvention. GitHub erkennt die Referenz `#33`. |
| `fixes #33` | Schliesst Issue #33, wenn der entsprechende Commit im Default-Branch landet. |

**Teamregel:** Während der Bearbeitung `refs #33` verwenden. `Fixes #33` erst einsetzen, wenn die gesamte Aufgabe abgeschlossen ist und die Änderung in den Default-Branch übernommen werden soll.

GitHub schliesst das Issue beim Merge in den Default-Branch. Ein Pull Request mit Ziel `develop` löst über die PR-Beschreibung keine automatische Issue-Schliessung aus.

## 5. Ablauf einer Aufgabe

1. **Backlog -> Ready:** Aufgabe definieren, Anforderungen klären.
2. **Ready -> In progress:** Vor dem Arbeitsbeginn den Status manuell ändern.
3. **Während der Entwicklung:** Commits mit `refs #Nummer` erstellen und regelmässig pushen.
4. **In progress -> In review:** Pull Request erstellen, Tests ausführen und Review anfordern.
5. **In review -> Done:** Nach Freigabe in den Default-Branch mergen und Issue schliessen. Prüfen, ob der Project-Workflow den Status auf `Done` gesetzt hat.

**WICHTIG**: Ein Issue darf erst abgeschlossen werden, wenn die Akzeptanzkriterien erfüllt sind und die Änderungen getestet wurden. Ist eine Aufgabe noch nicht vollständig fertig, bleibt das Issue offen.