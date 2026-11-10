const pool = require('../confing/database');

async function getAllOutlines(courseId) {
  if (courseId) {
    const [rows] = await pool.query('SELECT id, title, `desc`, fk_course FROM OutlinePlanning WHERE fk_course = ?', [courseId]);
    return rows;
  }
  const [rows] = await pool.query('SELECT id, title, `desc`, fk_course FROM OutlinePlanning');
  return rows;
}

async function getOutlineById(id) {
  const [rows] = await pool.query('SELECT id, title, `desc`, fk_course FROM OutlinePlanning WHERE id = ?', [id]);
  return rows[0];
}

async function createOutline(title, desc, fk_course) {
  const [result] = await pool.query(
    'INSERT INTO OutlinePlanning (title, `desc`, fk_course) VALUES (?, ?, ?)',
    [title, desc, fk_course]
  );
  return result.insertId;
}

async function updateOutline(id, title, desc) {
  await pool.query('UPDATE OutlinePlanning SET title = ?, `desc` = ? WHERE id = ?', [title, desc, id]);
  return getOutlineById(id);
}

async function deleteOutline(id) {
  await pool.query('DELETE FROM OutlinePlanning WHERE id = ?', [id]);
}

async function moveOutline(id, targetCourseId) {
  await pool.query('UPDATE OutlinePlanning SET fk_course = ? WHERE id = ?', [targetCourseId, id]);
  return getOutlineById(id);
}

module.exports = {
  getAllOutlines,
  getOutlineById,
  createOutline,
  updateOutline,
  deleteOutline,
  moveOutline,
};
