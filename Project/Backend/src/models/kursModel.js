const pool = require('../confing/database');

async function getAllCourses() {
  const [rows] = await pool.query('SELECT id, title, `desc`, fk_module_id FROM Course');
  return rows;
}

async function getCourseById(id) {
  const [rows] = await pool.query('SELECT id, title, `desc`, fk_module_id FROM Course WHERE id = ?', [id]);
  if (!rows[0]) return null;
  const course = rows[0];
  course.days = await getDaysByCourseId(id);
  return course;
}

async function createCourse(title, desc, fk_module_id) {
  const [result] = await pool.query(
    'INSERT INTO Course (title, `desc`, fk_module_id) VALUES (?, ?, ?)',
    [title, desc, fk_module_id]
  );
  return result.insertId;
}

async function updateCourse(id, title, desc) {
  await pool.query('UPDATE Course SET title = ?, `desc` = ? WHERE id = ?', [title, desc, id]);
  return getCourseById(id);
}

async function deleteCourse(id) {
  await pool.query('DELETE FROM Course WHERE id = ?', [id]);
}

// Kurstage (Course_day)
async function getDaysByCourseId(courseId) {
  const [rows] = await pool.query(
    'SELECT id, date, start_time AS startTime, end_time AS endTime, fk_course_id AS courseId, TIMESTAMPDIFF(MINUTE, start_time, end_time) AS durationMin FROM Course_day WHERE fk_course_id = ? ORDER BY date ASC, start_time ASC',
    [courseId]
  );
  return rows;
}

async function getDayById(dayId) {
  const [rows] = await pool.query(
    'SELECT id, date, start_time AS startTime, end_time AS endTime, fk_course_id AS courseId, TIMESTAMPDIFF(MINUTE, start_time, end_time) AS durationMin FROM Course_day WHERE id = ?',
    [dayId]
  );
  return rows[0];
}

async function createDay(courseId, date, startTime = '08:15:00', endTime = '16:45:00') {
  let dateVal = date;
  if (typeof date === 'string' && date.includes('-')) {
    dateVal = Math.floor(new Date(date).getTime() / 1000);
  }
  const [result] = await pool.query(
    'INSERT INTO Course_day (date, start_time, end_time, fk_course_id) VALUES (?, ?, ?, ?)',
    [dateVal || Math.floor(Date.now() / 1000), startTime, endTime, courseId]
  );
  return getDayById(result.insertId);
}

async function updateDay(dayId, fields) {
  const current = await getDayById(dayId);
  if (!current) return null;

  let dateVal = fields.date !== undefined ? fields.date : current.date;
  if (typeof dateVal === 'string' && dateVal.includes('-')) {
    dateVal = Math.floor(new Date(dateVal).getTime() / 1000);
  }

  const startTime = fields.startTime || fields.start_time || current.startTime;
  const endTime = fields.endTime || fields.end_time || current.endTime;

  await pool.query(
    'UPDATE Course_day SET date = ?, start_time = ?, end_time = ? WHERE id = ?',
    [dateVal, startTime, endTime, dayId]
  );
  return getDayById(dayId);
}

async function deleteDay(dayId) {
  await pool.query('DELETE FROM Course_day WHERE id = ?', [dayId]);
}

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getDaysByCourseId,
  getDayById,
  createDay,
  updateDay,
  deleteDay,
};
