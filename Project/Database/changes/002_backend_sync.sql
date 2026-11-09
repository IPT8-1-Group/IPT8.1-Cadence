use stundenplaner;

alter table `User`
    add column first_name VARCHAR(100) NULL,
    add column last_name VARCHAR(100) NULL,
    add column institution VARCHAR(150) NULL,
    add column job_title VARCHAR(100) NULL;

alter table DetailedPlanning
    add column position INT NOT NULL;