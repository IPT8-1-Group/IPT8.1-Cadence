use stundenplaner;


create table AccessRequest(
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(50) NOT NULL,
    institution VARCHAR(150) NOT NULL,
    job_title VARCHAR(100) NOT NULL DEFAULT '',
    additional_info TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);