USE stundenplaner;

-- ---------------------------------------------------------------
-- User
-- Platzhalter-Hash: SHA2('Test1234!', 256) ergibt 64 Hex-Zeichen (passt in CHAR(64)).
-- Ersetzen durch Hashes der Backend-Hash-Funktion, sonst funktioniert der Login nicht.
-- Rollennamen (admin/teacher/student) sind Beispiele und müssen zum Backend passen.
-- ---------------------------------------------------------------
INSERT INTO `User` (id, email, password_hash, `role`, active) VALUES
    (1, 'tester@example.com',   SHA2('Test1234!', 256), 'admin',   TRUE),
    (2, 'teacher@example.com', SHA2('Test1234!', 256), 'teacher', TRUE),
    (3, 'student@example.com', SHA2('Test1234!', 256), 'student', TRUE),
    (4, 'inactive@example.com', SHA2('Test1234!', 256), 'student', FALSE);

-- ---------------------------------------------------------------
-- Token
-- Wird beim Login vom Backend erzeugt, daher keine Seed-Daten.
-- ---------------------------------------------------------------

-- ---------------------------------------------------------------
-- Module
-- ---------------------------------------------------------------
INSERT INTO Module (id, `desc`, title, code) VALUES
    (1, 'Datenbanken erstellen und Daten einfügen', 'Datenbanken',          'M164'),
    (2, 'Web-Applikationen realisieren',            'Web-Applikationen',    'M133'),
    (3, 'IT-Kleinprojekte abwickeln',               'Projektmanagement',    'M306');

-- ---------------------------------------------------------------
-- Course
-- ---------------------------------------------------------------
INSERT INTO Course (id, `desc`, title, fk_module_id) VALUES
    (1, 'Relationale Modellierung und SQL',  'Datenbanken Grundlagen', 1),
    (2, 'Vue-Frontend und Node.js-Backend',  'Web-Entwicklung',        2),
    (3, 'Planung und Durchführung',          'Kleinprojekt',           3);

-- ---------------------------------------------------------------
-- Course_day
-- Datum als 'YYYY-MM-DD' (setzt voraus, dass `date` ein DATE/DATETIME ist).
-- ---------------------------------------------------------------
INSERT INTO Course_day (id, date, start_time, end_time, fk_course_id) VALUES
    (1, '2026-11-02', '08:15:00', '11:45:00', 1),
    (2, '2026-11-09', '08:15:00', '11:45:00', 1),
    (3, '2026-11-02', '13:15:00', '16:45:00', 2),
    (4, '2026-11-09', '13:15:00', '16:45:00', 2),
    (5, '2026-11-16', '08:15:00', '11:45:00', 3);

-- ---------------------------------------------------------------
-- OutlinePlanning (Grobplanung)
-- ---------------------------------------------------------------
INSERT INTO OutlinePlanning (id, title, `desc`, fk_course) VALUES
    (1, 'Modellierung',        'ER-Modell und Normalisierung',  1),
    (2, 'SQL',                 'DDL, DML und Abfragen',         1),
    (3, 'Frontend',            'Komponenten und Navigation',    2),
    (4, 'Backend',             'API, Authentifizierung',        2),
    (5, 'Projektplanung',      'Ziele, Aufgaben, Zeitplan',     3);

-- ---------------------------------------------------------------
-- DetailedPlanning (Feinplanung)
-- Summe der Minuten pro Tag liegt unter der Kurstagsdauer (3.5 h = 210 min).
-- Eintrag 6 hat bewusst keine Grobplanung (fk_outline_planning = NULL).
-- ---------------------------------------------------------------
INSERT INTO DetailedPlanning (id, topic, `desc`, dur_min, fk_course_day, fk_outline_planning) VALUES
    (1, 'ER-Modell zeichnen',     'Entitäten und Beziehungen',       90, 1, 1),
    (2, 'Normalisierung',         '1NF bis 3NF mit Beispielen',      90, 1, 1),
    (3, 'CREATE TABLE',           'Datentypen und Constraints',      60, 2, 2),
    (4, 'SELECT und JOIN',        'Abfragen über mehrere Tabellen',  90, 2, 2),
    (5, 'Vue-Komponenten',        'Props, Events, Routing',          90, 3, 3),
    (6, 'Repetition',             'Offene Fragen der Klasse',        45, 4, NULL),
    (7, 'REST-API',               'Endpunkte und Fehlerbehandlung',  90, 4, 4),
    (8, 'Projektstart',           'Ziele und Aufgabenverteilung',    60, 5, 5);
