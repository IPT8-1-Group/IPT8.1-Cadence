use stundenplaner;

alter table `User`
    add column if not exists reset_token VARCHAR(64) NULL,
    add column if not exists reset_token_expires DATETIME NULL;
