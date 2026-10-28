# Migration- & Rollback-Konzept

Dieses Dokument beschreibt, wie Änderungen am Datenbankschema von `stundenplaner` verwaltet werden. Wir verwenden **nummerierte SQL-Skripte ohne zusätzliches Migrationstool**. Sobald die Datenbank in mehreren Umgebungen mit echten Daten betrieben wird, kann ein Tool (z. B. Flyway oder Knex) nachgerüstet werden. Die Skripte und Regeln bleiben dabei weiterverwendbar.

## 1. Ziel

- Jede Schemaänderung ist ein Skript im Repository und damit in Git nachvollziehbar.
- Die Datenbank kann jederzeit auf dem aktuellen Stand neu aufgebaut werden.
- Bestehende Datenbanken (Test, Produktion) können mit den Änderungsskripten nachgezogen werden, ohne Daten zu verlieren.
- Der Stand jeder Datenbank ist bekannt.

## 2. Ordnerstruktur

```
Project/Database/
├── schema.sql                  Gesamtstand des Schemas (Neuaufbau)
├── changes/
│   ├── 001_<beschreibung>.sql
│   ├── 002_<beschreibung>.sql
│   └── ...
├── rollback/                   optionale Rückgängig-Skripte
│   └── 002_<beschreibung>_undo.sql
├── seeds/
│   └── seed_data.sql           Start- und Testdaten
└── MIGRATIONS.md
```

| Ordner / Datei | Zweck |
|---|---|
| `schema.sql` | Vollständiges, aktuelles Schema. Damit wird eine leere Datenbank aufgebaut (neue Teammitglieder, lokale Umgebung, CI). |
| `changes/` | Einzelne Änderungsskripte für **bestehende** Datenbanken. Jede Änderung ist eine Datei. |
| `rollback/` | Optionale Skripte, die eine Änderung rückgängig machen. |
| `seeds/` | Start- und Testdaten, getrennt vom Schema. |

## 3. Namenskonvention

- Format: `NNN_beschreibung_in_snake_case.sql` mit dreistelliger, fortlaufender Nummer (`001`, `002`, ...). Die führenden Nullen sind wichtig, damit die Reihenfolge stimmt.
- Eine Datei enthält **eine logische Änderung**.
- Der Name beschreibt die Änderung, z. B. `002_rename_fk_columns.sql`, `003_add_check_constraints.sql`.
- Rückgängig-Skripte heißen gleich mit Endung `_undo`, z. B. `002_rename_fk_columns_undo.sql`.

Beispiel einer Änderungsdatei:

```sql
-- 002_rename_fk_columns.sql
-- Vereinheitlicht FK-Namen (fk_<tabelle>_id)
ALTER TABLE OutlinePlanning
    RENAME COLUMN fk_course TO fk_course_id;
```

Zugehöriges Rückgängig-Skript:

```sql
-- 002_rename_fk_columns_undo.sql
ALTER TABLE OutlinePlanning
    RENAME COLUMN fk_course_id TO fk_course;
```

## 4. Ablauf bei einer Schemaänderung

1. Neue Datei `changes/NNN_<name>.sql` mit der nächsten freien Nummer anlegen.
2. Lokal auf einer Kopie bzw. frischen Datenbank ausführen und prüfen.
3. Bei umkehrbaren Änderungen ein Rückgängig-Skript in `rollback/` ablegen und testen.
4. **Im selben Commit** `schema.sql` und `ERModel.mmd` anpassen, damit sie dem Stand nach der Änderung entsprechen.
5. Pull Request erstellen und reviewen lassen.
6. Nach dem Merge das Skript in Test bzw. Produktion der Reihe nach ausführen

## 5. Rollback-Konzept

- **Rückgängig-Skript:** Für umkehrbare Änderungen (Spalte umbenennen, Index oder Spalte hinzufügen, Constraint hinzufügen) gibt es ein `_undo`-Skript in `rollback/`. Nach dem Ausführen wird der Eintrag in `schema_migrations` gelöscht.
- **Nicht umkehrbare Änderungen:** `DROP TABLE`, `DROP COLUMN` oder das Verkleinern von Datentypen führt zu Datenverlust. Solche Skripte werden im Pull Request ausdrücklich markiert und nur nach Backup ausgeführt.
- **Roll-forward:** Ist ein Rückgängig-Skript nicht möglich oder nicht sinnvoll, wird der Fehler mit einer **neuen** Änderungsdatei korrigiert. Alte Dateien werden nicht verändert.
- **Kein transaktionales DDL in MySQL:** `ALTER`/`CREATE`/`DROP` werden nicht automatisch zurückgerollt, wenn ein Skript mittendrin fehlschlägt. Deshalb pro Datei nur eine logische Änderung, damit der Zustand nach einem Fehler überschaubar bleibt.

## 6. Seeds

- Start- und Testdaten (Admin-User, Beispielmodule, Testkurse) stehen **nicht** in `changes/`, sondern in `seeds/`.
- Seeds werden nur in lokalen und Test-Umgebungen eingespielt.
- Passwörter werden nie im Klartext gespeichert. Seed-User erhalten ein mit der Backend-Hash-Funktion erzeugtes `password_hash`.
- Für Produktion enthalten Seeds keine Testdaten. Admin-Zugangsdaten kommen aus Umgebungsvariablen.

## 7. Regeln für das Team

1. **Bereits gemergte oder ausgeführte Skripte werden nie geändert.** Änderungen erfolgen immer in einer neuen Datei.
2. Eine Datei = eine logische Änderung, mit sprechendem Namen und fortlaufender Nummer.
3. Nummern werden nicht doppelt vergeben. Bei Konflikten zwischen Branches wird die Nummer vor dem Merge angepasst.
4. `schema.sql`, Änderungsskript und `ERModel.mmd` werden **im selben Commit** angepasst.
5. Änderungen werden auf dem Branch `database` entwickelt und über `develop` nach `main` integriert.
6. Vor `DROP` oder Änderungen mit Datenverlust gibt es ein Backup.
7. Keine Zugangsdaten im Repository.
