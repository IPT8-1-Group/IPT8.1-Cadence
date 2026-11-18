USE stundenplaner;

-- ---------------------------------------------------------------
-- User
-- Platzhalter-Hash: SHA2('Test1234!', 256) ergibt 64 Hex-Zeichen (passt in CHAR(64)).
-- Ersetzen durch Hashes der Backend-Hash-Funktion, sonst funktioniert der Login nicht.
-- Rollennamen (admin/teacher/student) sind Beispiele und müssen zum Backend passen.
-- Profilfelder (first_name, last_name, institution, job_title) sind Beispielwerte.
-- reset_token und reset_token_expires bleiben NULL (werden vom Backend gesetzt).
-- ---------------------------------------------------------------
INSERT INTO `User` (id, email, password_hash, `role`, first_name, last_name, institution, job_title, active) VALUES
    (1, 'tester@example.com',   SHA2('Test1234!', 256), 'admin',   'Alex', 'Admin',    'Beispiel Schule', 'Administrator', TRUE),
    (2, 'teacher@example.com',  SHA2('Test1234!', 256), 'teacher', 'Tina', 'Teacher',  'Beispiel Schule', 'Dozentin',      TRUE),
    (3, 'student@example.com',  SHA2('Test1234!', 256), 'student', 'Sam',  'Student',  'Beispiel Schule', 'Student',       TRUE),
    (4, 'inactive@example.com', SHA2('Test1234!', 256), 'student', 'Ina',  'Inactive', 'Beispiel Schule', 'Student',       FALSE);

-- ---------------------------------------------------------------
-- AccessRequest
-- Je eine Anfrage pro Status. Die Status-Werte (pending/approved/rejected)
-- müssen zum Backend passen.
-- ---------------------------------------------------------------
INSERT INTO AccessRequest (id, first_name, last_name, email, institution, job_title, additional_info, status) VALUES
    (1, 'Anna',  'Muster',   'anna.muster@example.com',   'Beispiel Schule', 'Lehrerin',  'Möchte Kurse für die Klasse 3a planen.', 'pending'),
    (2, 'Ben',   'Beispiel', 'ben.beispiel@example.com',  'Beispiel Firma',  'Ausbilder', 'Zugang für die Ausbildungsplanung.',     'approved'),
    (3, 'Carla', 'Test',     'carla.test@example.com',    'Andere Schule',   '',          NULL,                                     'rejected');

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
-- `date` ist im aktuellen Schema ein INT und wird hier als Unix-Timestamp
-- (Sekunden seit 1970, in der Zeitzone der DB-Session) gespeichert.
-- Zurückrechnen: SELECT FROM_UNIXTIME(`date`) FROM Course_day;
-- ---------------------------------------------------------------
INSERT INTO Course_day (id, date, start_time, end_time, fk_course_id) VALUES
    (1, UNIX_TIMESTAMP('2026-11-02'), '08:15:00', '11:45:00', 1),
    (2, UNIX_TIMESTAMP('2026-11-09'), '08:15:00', '11:45:00', 1),
    (3, UNIX_TIMESTAMP('2026-11-02'), '13:15:00', '16:45:00', 2),
    (4, UNIX_TIMESTAMP('2026-11-09'), '13:15:00', '16:45:00', 2),
    (5, UNIX_TIMESTAMP('2026-11-16'), '08:15:00', '11:45:00', 3);

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
-- position ist die Reihenfolge innerhalb eines Kurstags (1, 2, ...).
-- ---------------------------------------------------------------
INSERT INTO DetailedPlanning (id, topic, `desc`, dur_min, position, fk_course_day, fk_outline_planning) VALUES
    (1, 'ER-Modell zeichnen',     'Entitäten und Beziehungen',       90, 1, 1, 1),
    (2, 'Normalisierung',         '1NF bis 3NF mit Beispielen',      90, 2, 1, 1),
    (3, 'CREATE TABLE',           'Datentypen und Constraints',      60, 1, 2, 2),
    (4, 'SELECT und JOIN',        'Abfragen über mehrere Tabellen',  90, 2, 2, 2),
    (5, 'Vue-Komponenten',        'Props, Events, Routing',          90, 1, 3, 3),
    (6, 'Repetition',             'Offene Fragen der Klasse',        45, 1, 4, NULL),
    (7, 'REST-API',               'Endpunkte und Fehlerbehandlung',  90, 2, 4, 4),
    (8, 'Projektstart',           'Ziele und Aufgabenverteilung',    60, 1, 5, 5);
