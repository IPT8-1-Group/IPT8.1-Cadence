# Index-Konzept

Dieses Dokument legt fest, welche Indizes die Datenbank `stundenplaner` (MariaDB) hat und warum. Die zusätzlichen Indizes stehen in `changes/001_index.sql` (Rückgängig: `rollback/001_index_undo.sql`).

## 1. Ziel

Typische Abfragen des Stundenplaners sollen auch bei wachsender Datenmenge schnell bleiben, ohne unnötige Indizes anzulegen. Jeder Index beschleunigt Lesezugriffe, macht aber `INSERT`, `UPDATE` und `DELETE` etwas langsamer und braucht Speicher. Deshalb gibt es nur Indizes mit einem konkreten Zweck.

## 2. Bereits vorhandene Indizes (automatisch)

| Art | Spalten | Entsteht durch |
|---|---|---|
| Primärschlüssel | `id` in allen Tabellen | `PRIMARY KEY` |
| Unique | `User.email`, `Module.code` | `UNIQUE` |
| Fremdschlüssel | `Token.fk_user_id`, `Course.fk_module_id`, `Course_day.fk_course_id`, `OutlinePlanning.fk_course`, `DetailedPlanning.fk_course_day`, `DetailedPlanning.fk_outline_planning` | `FOREIGN KEY` |

Damit sind Zugriffe über Primärschlüssel, Login per E-Mail, Modulsuche per Code und alle Joins entlang der Fremdschlüssel bereits abgedeckt.

## 3. Zusätzliche Indizes

| Index | Tabelle und Spalten | Abfrage | Begründung |
|---|---|---|---|
| `idx_course_day_course_date` | `Course_day (fk_course_id, date)` | Stundenplan eines Kurses in einem Zeitraum: `WHERE fk_course_id = ? AND date BETWEEN ? AND ?` | Die wichtigste Abfrage des Stundenplaners. Der zusammengesetzte Index deckt Filter und Bereich ab. Über die linke Spalte werden auch Abfragen nur nach `fk_course_id` bedient. |
| `idx_course_day_date` | `Course_day (date)` | Tagesansicht über alle Kurse: `WHERE date = ?` | Ohne Kursfilter kann der obige Index nicht genutzt werden, weil `date` dort nicht an erster Stelle steht. |
| `idx_token_expires_at` | `Token (expires_at)` | Abgelaufene Tokens aufräumen: `WHERE expires_at < NOW()` | Regelmäßiger Cleanup-Job soll nicht die ganze Tabelle lesen. |
| `idx_token_user_expires` | `Token (fk_user_id, expires_at)` | Gültige Tokens eines Users prüfen: `WHERE fk_user_id = ? AND expires_at > NOW()` | Wird bei Authentifizierung und Token-Erneuerung abgefragt. |

> Die Abfragen sind Annahmen aus dem Datenmodell. Nutzt das Backend eine davon nicht, wird der zugehörige Index nicht angelegt bzw. wieder entfernt.

## 4. Bewusst kein Index

| Spalte | Grund |
|---|---|
| `User.active`, `User.role`, `Token.update` | Wenige verschiedene Werte, ein Index bringt kaum Selektivität. |
| `title`, `desc`, `topic` | Es gibt keine Suche nach Textinhalten. Bei Bedarf wäre ein `FULLTEXT`-Index die richtige Wahl, kein normaler Index. |
| `DetailedPlanning.dur_min` | Wird nur zusammen mit dem Kurstag gelesen, nie als Filter. |
| Einzelne FK-Spalten mit vorhandenem Index | Doppelte Indizes kosten Schreibleistung ohne Nutzen. |

Hinweis: `idx_course_day_course_date` macht den automatischen FK-Index auf `Course_day.fk_course_id` teilweise überflüssig, weil die Spalte dort links steht. Das ist unkritisch und wird nicht entfernt.

## 5. Datentyp von `Course_day.date`

Die Spalte ist aktuell ein `INT` (Unix-Timestamp). Die Indizes funktionieren damit wie bei einem `DATE`. Bereichsabfragen müssen dann mit Timestamps formuliert werden:

```sql
WHERE date BETWEEN UNIX_TIMESTAMP('2026-11-01') AND UNIX_TIMESTAMP('2026-11-30')
```

Wird die Spalte später auf `DATE` geändert, bleiben die Indizes bestehen und werden von MariaDB neu aufgebaut. Die bestehenden Werte müssen vorher in Datumswerte umgerechnet werden (z. B. mit `FROM_UNIXTIME`), sonst gehen sie beim Umwandeln verloren oder sind falsch.

## 6. Prüfen

Ob ein Index verwendet wird, zeigt `EXPLAIN`. In der Spalte `key` muss der Indexname stehen, nicht `NULL`:

```sql
EXPLAIN SELECT * FROM Course_day WHERE fk_course_id = 1;
EXPLAIN SELECT * FROM Course_day
WHERE fk_course_id = 1
  AND date BETWEEN UNIX_TIMESTAMP('2026-11-01') AND UNIX_TIMESTAMP('2026-11-30');
EXPLAIN SELECT * FROM Token WHERE expires_at < NOW();
```

Bei sehr kleinen Tabellen (z. B. nur die Seed-Daten) wählt die Datenbank manchmal trotzdem einen Table Scan, weil er dort schneller ist. Aussagekräftig wird der Test mit mehr Daten (einige tausend Zeilen).

Vorhandene Indizes einer Tabelle anzeigen:

```sql
SHOW INDEX FROM Course_day;
```

## 7. Regeln

1. Neue Indizes werden als nummeriertes Skript in `changes/` angelegt, mit passendem `_undo`-Skript in `rollback/` (siehe `MIGRATIONS.md`).
2. `schema.sql` wird im selben Commit angepasst, damit ein Neuaufbau dieselben Indizes enthält.
3. Jeder neue Index braucht einen Eintrag in Abschnitt 3 mit Abfrage und Begründung.
4. Vor dem Anlegen wird mit `EXPLAIN` geprüft, ob ein bestehender Index die Abfrage nicht schon abdeckt.
5. Namensschema: `idx_<tabelle>_<spalten>`.
6. Nicht mehr genutzte Indizes werden per Migration entfernt.
