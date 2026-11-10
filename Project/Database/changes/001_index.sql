USE stundenplaner;

-- Timetable of a course within a date range:
--   WHERE fk_course_id = ? AND `date` BETWEEN ? AND ?
-- The leftmost column also serves queries filtering only by fk_course_id.
CREATE INDEX idx_course_day_course_date
    ON Course_day (fk_course_id, `date`);

-- Day view across all courses:
--   WHERE `date` = ?  or  WHERE `date` BETWEEN ? AND ?
CREATE INDEX idx_course_day_date
    ON Course_day (`date`);

-- Cleanup of expired tokens:
--   WHERE expires_at < NOW()
CREATE INDEX idx_token_expires_at
    ON Token (expires_at);

-- Check valid tokens of a user:
--   WHERE fk_user_id = ? AND expires_at > NOW()
CREATE INDEX idx_token_user_expires
    ON Token (fk_user_id, expires_at);
