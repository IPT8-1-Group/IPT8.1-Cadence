ALTER TABLE Course ADD COLUMN IF NOT EXISTS assessment VARCHAR(100) NULL;

CREATE TABLE IF NOT EXISTS OutlinePlanningDay (
    fk_outline INT NOT NULL,
    fk_day INT NOT NULL,
    position INT UNSIGNED NOT NULL,
    PRIMARY KEY (fk_outline, fk_day),
    INDEX idx_outline_day_position (fk_day, position),
    CONSTRAINT fk_outline_day_outline FOREIGN KEY (fk_outline)
        REFERENCES OutlinePlanning(id) ON DELETE CASCADE,
    CONSTRAINT fk_outline_day_day FOREIGN KEY (fk_day)
        REFERENCES Course_day(id) ON DELETE CASCADE
);
