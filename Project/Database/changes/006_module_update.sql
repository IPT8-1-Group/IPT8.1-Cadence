alter table Module
    add column created_at datetime not null default current_timestamp,
    add column updated_at datetime not null default current_timestamp on update current_timestamp;
