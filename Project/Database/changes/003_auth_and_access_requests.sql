USE stundenplaner;

ALTER TABLE `User`
    ADD COLUMN IF NOT EXISTS reset_token VARCHAR(64) NULL,
    ADD COLUMN IF NOT EXISTS reset_token_expires DATETIME NULL;

ALTER TABLE DetailedPlanning
    MODIFY COLUMN position INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS AccessRequest (
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
