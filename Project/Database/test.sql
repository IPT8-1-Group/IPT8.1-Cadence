USE stundenplaner;

DROP TEMPORARY TABLE IF EXISTS test_results;
-- ENGINE=MEMORY, damit das ROLLBACK weiter unten die Ergebnisse nicht löscht.
CREATE TEMPORARY TABLE test_results (
    id     INT AUTO_INCREMENT PRIMARY KEY,
    name   VARCHAR(150) NOT NULL,
    result VARCHAR(10)  NOT NULL,
    detail VARCHAR(100) NULL
) ENGINE = MEMORY;

-- ===============================================================
-- A. Struktur
-- ===============================================================

INSERT INTO test_results (name, result)
SELECT 'Struktur: alle 7 Tabellen vorhanden',
       IF(COUNT(*) = 7, 'PASS', 'FAIL')
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'stundenplaner'
  AND TABLE_NAME IN ('User', 'Token', 'Module', 'Course', 'Course_day',
                     'OutlinePlanning', 'DetailedPlanning');

INSERT INTO test_results (name, result)
SELECT 'Struktur: Course_day.date ist vom Typ INT (Unix-Timestamp)',
       IF(COUNT(*) = 1, 'PASS', 'FAIL')
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'stundenplaner'
  AND TABLE_NAME = 'Course_day'
  AND COLUMN_NAME = 'date'
  AND DATA_TYPE = 'int';

INSERT INTO test_results (name, result)
SELECT 'Struktur: 5 Fremdschlüssel mit ON DELETE CASCADE',
       IF(COUNT(*) = 5, 'PASS', 'FAIL')
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'stundenplaner'
  AND CONSTRAINT_NAME IN ('fk_token_user', 'fk_course_module', 'fk_coursedate_course',
                          'fk_outline_course', 'fk_detail_courseday')
  AND DELETE_RULE = 'CASCADE';

INSERT INTO test_results (name, result)
SELECT 'Struktur: fk_detail_outline hat ON DELETE SET NULL',
       IF(COUNT(*) = 1, 'PASS', 'FAIL')
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'stundenplaner'
  AND CONSTRAINT_NAME = 'fk_detail_outline'
  AND DELETE_RULE = 'SET NULL';

-- ===============================================================
-- B. Daten (Seeds geladen, keine ungültigen Zustände)
-- ===============================================================

INSERT INTO test_results (name, result)
SELECT 'Daten: Seed-Daten sind geladen (Module vorhanden)',
       IF(COUNT(*) >= 1, 'PASS', 'FAIL')
FROM Module;

INSERT INTO test_results (name, result)
SELECT 'Daten: keine Kurse ohne Modul',
       IF(COUNT(*) = 0, 'PASS', 'FAIL')
FROM Course c
LEFT JOIN Module m ON m.id = c.fk_module_id
WHERE m.id IS NULL;

INSERT INTO test_results (name, result)
SELECT 'Daten: keine Kurstage ohne Kurs',
       IF(COUNT(*) = 0, 'PASS', 'FAIL')
FROM Course_day cd
LEFT JOIN Course c ON c.id = cd.fk_course_id
WHERE c.id IS NULL;

INSERT INTO test_results (name, result)
SELECT 'Daten: keine Feinplanung ohne Kurstag',
       IF(COUNT(*) = 0, 'PASS', 'FAIL')
FROM DetailedPlanning dp
LEFT JOIN Course_day cd ON cd.id = dp.fk_course_day
WHERE cd.id IS NULL;

INSERT INTO test_results (name, result)
SELECT 'Daten: Kurstage enden nach ihrem Beginn',
       IF(COUNT(*) = 0, 'PASS', 'FAIL')
FROM Course_day
WHERE end_time <= start_time;

INSERT INTO test_results (name, result)
SELECT 'Daten: Dauer der Feinplanung ist größer als 0',
       IF(COUNT(*) = 0, 'PASS', 'FAIL')
FROM DetailedPlanning
WHERE dur_min <= 0;

INSERT INTO test_results (name, result)
SELECT 'Daten: Feinplanung pro Tag nicht länger als der Kurstag',
       IF(COUNT(*) = 0, 'PASS', 'FAIL')
FROM (
    SELECT cd.id
    FROM Course_day cd
    JOIN DetailedPlanning dp ON dp.fk_course_day = cd.id
    GROUP BY cd.id, cd.start_time, cd.end_time
    HAVING SUM(dp.dur_min) > TIMESTAMPDIFF(MINUTE, cd.start_time, cd.end_time)
) AS zu_lang;

-- ===============================================================
-- C. Verhalten (Constraints und ON DELETE-Regeln)
-- Läuft in einer Transaktion, am Ende ROLLBACK.
-- ===============================================================

DROP PROCEDURE IF EXISTS run_schema_tests;

DELIMITER //

CREATE PROCEDURE run_schema_tests()
BEGIN
    DECLARE v INT DEFAULT 0;

    START TRANSACTION;

    -- C1. Ungültige Eingaben müssen mit dem richtigen Fehler abgelehnt werden
    -- Pro Test: `expected` = erwarteter Fehler, `other` = irgendein anderer Fehler.

    BEGIN
        DECLARE expected BOOL DEFAULT FALSE;
        DECLARE other BOOL DEFAULT FALSE;
        DECLARE CONTINUE HANDLER FOR 1062 SET expected = TRUE;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET other = TRUE;
        INSERT INTO `User` (email, password_hash, `role`)
        VALUES ('admin@example.com', 'x', 'admin');
        INSERT INTO test_results (name, result, detail)
        VALUES ('UNIQUE: doppelte E-Mail wird abgelehnt (1062)',
                IF(expected, 'PASS', 'FAIL'),
                IF(other, 'anderer Fehler als erwartet', NULL));
    END;

    BEGIN
        DECLARE expected BOOL DEFAULT FALSE;
        DECLARE other BOOL DEFAULT FALSE;
        DECLARE CONTINUE HANDLER FOR 1062 SET expected = TRUE;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET other = TRUE;
        INSERT INTO Module (title, code) VALUES ('Doppelt', 'M164');
        INSERT INTO test_results (name, result, detail)
        VALUES ('UNIQUE: doppelter Modulcode wird abgelehnt (1062)',
                IF(expected, 'PASS', 'FAIL'),
                IF(other, 'anderer Fehler als erwartet', NULL));
    END;

    BEGIN
        DECLARE expected BOOL DEFAULT FALSE;
        DECLARE other BOOL DEFAULT FALSE;
        DECLARE CONTINUE HANDLER FOR 1048 SET expected = TRUE;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET other = TRUE;
        INSERT INTO Module (title, code) VALUES (NULL, 'X001');
        INSERT INTO test_results (name, result, detail)
        VALUES ('NOT NULL: Modul ohne Titel wird abgelehnt (1048)',
                IF(expected, 'PASS', 'FAIL'),
                IF(other, 'anderer Fehler als erwartet', NULL));
    END;

    BEGIN
        DECLARE expected BOOL DEFAULT FALSE;
        DECLARE other BOOL DEFAULT FALSE;
        DECLARE CONTINUE HANDLER FOR 1452 SET expected = TRUE;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET other = TRUE;
        INSERT INTO Course (title, fk_module_id) VALUES ('Ohne Modul', 999999);
        INSERT INTO test_results (name, result, detail)
        VALUES ('FK: Kurs mit unbekanntem Modul wird abgelehnt (1452)',
                IF(expected, 'PASS', 'FAIL'),
                IF(other, 'anderer Fehler als erwartet', NULL));
    END;

    BEGIN
        DECLARE expected BOOL DEFAULT FALSE;
        DECLARE other BOOL DEFAULT FALSE;
        DECLARE CONTINUE HANDLER FOR 1452 SET expected = TRUE;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET other = TRUE;
        INSERT INTO Token (public_key, expires_at, fk_user_id)
        VALUES ('test', NOW() + INTERVAL 1 DAY, 999999);
        INSERT INTO test_results (name, result, detail)
        VALUES ('FK: Token mit unbekanntem User wird abgelehnt (1452)',
                IF(expected, 'PASS', 'FAIL'),
                IF(other, 'anderer Fehler als erwartet', NULL));
    END;

    BEGIN
        DECLARE expected BOOL DEFAULT FALSE;
        DECLARE other BOOL DEFAULT FALSE;
        DECLARE CONTINUE HANDLER FOR 1452 SET expected = TRUE;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET other = TRUE;
        -- UNIX_TIMESTAMP statt Text-Literal: `date` ist ein INT
        INSERT INTO Course_day (`date`, start_time, end_time, fk_course_id)
        VALUES (UNIX_TIMESTAMP(CURDATE()), '08:00:00', '09:00:00', 999999);
        INSERT INTO test_results (name, result, detail)
        VALUES ('FK: Kurstag mit unbekanntem Kurs wird abgelehnt (1452)',
                IF(expected, 'PASS', 'FAIL'),
                IF(other, 'anderer Fehler als erwartet', NULL));
    END;

    BEGIN
        DECLARE expected BOOL DEFAULT FALSE;
        DECLARE other BOOL DEFAULT FALSE;
        DECLARE CONTINUE HANDLER FOR 1452 SET expected = TRUE;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET other = TRUE;
        INSERT INTO DetailedPlanning (topic, fk_course_day) VALUES ('Ohne Kurstag', 999999);
        INSERT INTO test_results (name, result, detail)
        VALUES ('FK: Feinplanung mit unbekanntem Kurstag wird abgelehnt (1452)',
                IF(expected, 'PASS', 'FAIL'),
                IF(other, 'anderer Fehler als erwartet', NULL));
    END;

    -- C2. ON DELETE-Regeln ----------------------------------------------

    -- User löschen entfernt seine Tokens (CASCADE)
    INSERT INTO Token (public_key, expires_at, fk_user_id)
    VALUES ('test', NOW() + INTERVAL 1 DAY, 3);
    DELETE FROM `User` WHERE id = 3;
    SELECT COUNT(*) INTO v FROM Token WHERE fk_user_id = 3;
    INSERT INTO test_results (name, result)
    VALUES ('CASCADE: User löschen entfernt seine Tokens', IF(v = 0, 'PASS', 'FAIL'));

    -- OutlinePlanning löschen setzt die Verknüpfung auf NULL (SET NULL),
    -- die Feinplanung selbst bleibt bestehen
    DELETE FROM OutlinePlanning WHERE id = 3;
    SELECT COUNT(*) INTO v
    FROM DetailedPlanning
    WHERE id = 5 AND fk_outline_planning IS NULL;
    INSERT INTO test_results (name, result)
    VALUES ('SET NULL: Grobplanung löschen behält Feinplanung, Verknüpfung wird NULL',
            IF(v = 1, 'PASS', 'FAIL'));

    -- Modul löschen entfernt Kurse, Kurstage, Grob- und Feinplanung (CASCADE)
    DELETE FROM Module WHERE id = 1;
    SELECT (SELECT COUNT(*) FROM Course          WHERE fk_module_id = 1)
         + (SELECT COUNT(*) FROM Course_day      WHERE fk_course_id = 1)
         + (SELECT COUNT(*) FROM OutlinePlanning WHERE fk_course    = 1)
         + (SELECT COUNT(*) FROM DetailedPlanning WHERE fk_course_day IN (1, 2))
    INTO v;
    INSERT INTO test_results (name, result)
    VALUES ('CASCADE: Modul löschen entfernt Kurse, Kurstage und Planungen',
            IF(v = 0, 'PASS', 'FAIL'));

    -- Alle Änderungen dieser Tests zurücknehmen
    ROLLBACK;
END //

DELIMITER ;

CALL run_schema_tests();
DROP PROCEDURE run_schema_tests;

-- ===============================================================
-- D. Ergebnis
-- ===============================================================

-- Zusammenfassung (FAIL darf nicht vorkommen)
SELECT result, COUNT(*) AS anzahl
FROM test_results
GROUP BY result;

-- Alle Tests im Detail
SELECT id, name, result, detail
FROM test_results
ORDER BY id;

-- ===============================================================
-- E. Performance (manuell prüfen, kein PASS/FAIL)
-- In der Spalte "key" soll ein Index stehen, nicht NULL.
-- Bei sehr kleinen Tabellen wählt die Datenbank manchmal trotzdem einen Table Scan.
-- ===============================================================

EXPLAIN SELECT * FROM Course_day WHERE fk_course_id = 1;
EXPLAIN SELECT * FROM DetailedPlanning WHERE fk_course_day = 1;
EXPLAIN SELECT * FROM Course_day
WHERE `date` BETWEEN UNIX_TIMESTAMP(CURDATE())
                  AND UNIX_TIMESTAMP(CURDATE() + INTERVAL 30 DAY);
