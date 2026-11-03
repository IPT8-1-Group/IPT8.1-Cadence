const pool = require('../confing/database');

async function getAllCourses() {
  const [rows] = await pool.query('SELECT id, title, `desc`, fk_module_id FROM Course');
  return rows;
}

async function getCourseById(id) {
  const [rows] = await pool.query('SELECT id, title, `desc`, fk_module_id FROM Course WHERE id = ?', [id]);
  return rows[0];
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

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
