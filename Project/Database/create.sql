CREATE DATABASE IF NOT EXISTS stundenplaner
    CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE stundenplaner;

CREATE TABLE `User`(
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(50) NOT NULL UNIQUE,
    password_hash CHAR(64) NOT NULL,
    `role` VARCHAR(20) NOT NULL,
    first_name VARCHAR(100) NOT NULL DEFAULT '',
    last_name VARCHAR(100) NOT NULL DEFAULT '',
    institution VARCHAR(150) NOT NULL DEFAULT '',
    job_title VARCHAR(100) NOT NULL DEFAULT '',
    reset_token VARCHAR(64) NULL,
    reset_token_expires DATETIME NULL,
    active BOOL NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE AccessRequest(
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    institution VARCHAR(100) NOT NULL,
    job_title VARCHAR(50) NOT NULL DEFAULT '',
    additional_info TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `Token`(
    id INT AUTO_INCREMENT PRIMARY KEY,
    public_key TEXT NOT NULL,
    `update` BOOL NOT NULL DEFAULT FALSE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fk_user_id INT NOT NULL,

    CONSTRAINT fk_token_user
        FOREIGN KEY (fk_user_id) REFERENCES `User`(id)
            ON DELETE CASCADE
);

CREATE TABLE Module
(
    id INT AUTO_INCREMENT PRIMARY KEY,
    `desc` VARCHAR(255),
    title VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE Course(
    id INT AUTO_INCREMENT PRIMARY KEY,
    `desc` VARCHAR(255),
    title VARCHAR(100) NOT NULL,
    fk_module_id INT NOT NULL,

    CONSTRAINT fk_course_module
        FOREIGN KEY(fk_module_id) REFERENCES Module(id)
            ON DELETE CASCADE
);

CREATE TABLE Course_day(
    id INT AUTO_INCREMENT PRIMARY KEY,
    date INT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    fk_course_id INT NOT NULL,

    CONSTRAINT fk_coursedate_course
        FOREIGN KEY(fk_course_id) REFERENCES Course(id)
            ON DELETE CASCADE
);

CREATE TABLE OutlinePlanning(
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    `desc` VARCHAR(255),
    fk_course INT NOT NULL,

    CONSTRAINT fk_outline_course
        FOREIGN KEY(fk_course) REFERENCES Course(id)
            ON DELETE CASCADE
);

CREATE TABLE DetailedPlanning(
    id INT AUTO_INCREMENT PRIMARY KEY,
    topic VARCHAR(100) NOT NULL,
    `desc` VARCHAR(255),
    dur_min INT NOT NULL DEFAULT 45,
    position INT NOT NULL DEFAULT 0,
    fk_course_day INT NOT NULL,
    fk_outline_planning INT,

    CONSTRAINT fk_detail_courseday
        FOREIGN KEY(fk_course_day) REFERENCES Course_day(id)
            ON DELETE CASCADE,
    CONSTRAINT fk_detail_outline
        FOREIGN KEY(fk_outline_planning) REFERENCES OutlinePlanning(id)
            ON DELETE SET NULL
);

-- Indizes (aus changes/001_index.sql)
CREATE INDEX idx_course_day_course_date
    ON Course_day (fk_course_id, `date`);

CREATE INDEX idx_course_day_date
    ON Course_day (`date`);

CREATE INDEX idx_token_expires_at
    ON Token (expires_at);

CREATE INDEX idx_token_user_expires
    ON Token (fk_user_id, expires_at);
