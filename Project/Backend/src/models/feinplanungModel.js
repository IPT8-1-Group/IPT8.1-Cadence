const pool = require('../confing/database');

async function getAllFeinplanungen(dayId) {
  if (dayId) {
    const [rows] = await pool.query(
      'SELECT id, topic, `desc`, dur_min, fk_course_day, fk_outline_planning FROM DetailedPlanning WHERE fk_course_day = ?',
      [dayId]
    );
    return rows;
  }
  const [rows] = await pool.query(
    'SELECT id, topic, `desc`, dur_min, fk_course_day, fk_outline_planning FROM DetailedPlanning'
  );
  return rows;
}

async function getFeinplanungById(id) {
  const [rows] = await pool.query(
    'SELECT id, topic, `desc`, dur_min, fk_course_day, fk_outline_planning FROM DetailedPlanning WHERE id = ?',
    [id]
  );
  return rows[0];
}

async function createFeinplanung(topic, desc, dur_min, fk_course_day, fk_outline_planning) {
  const [result] = await pool.query(
    'INSERT INTO DetailedPlanning (topic, `desc`, dur_min, fk_course_day, fk_outline_planning) VALUES (?, ?, ?, ?, ?)',
    [topic, desc, dur_min || 45, fk_course_day, fk_outline_planning || null]
  );
  return result.insertId;
}

async function updateFeinplanung(id, topic, desc, dur_min, fk_course_day, fk_outline_planning) {
  await pool.query(
    'UPDATE DetailedPlanning SET topic = ?, `desc` = ?, dur_min = ?, fk_course_day = ?, fk_outline_planning = ? WHERE id = ?',
    [topic, desc, dur_min, fk_course_day, fk_outline_planning, id]
  );
  return getFeinplanungById(id);
}

async function deleteFeinplanung(id) {
  await pool.query('DELETE FROM DetailedPlanning WHERE id = ?', [id]);
}

async function moveFeinplanung(id, targetDayId, targetOutlineId) {
  if (targetOutlineId !== undefined) {
    await pool.query(
      'UPDATE DetailedPlanning SET fk_course_day = ?, fk_outline_planning = ? WHERE id = ?',
      [targetDayId, targetOutlineId, id]
    );
  } else {
    await pool.query(
      'UPDATE DetailedPlanning SET fk_course_day = ? WHERE id = ?',
      [targetDayId, id]
    );
  }
  return getFeinplanungById(id);
}

module.exports = {
  getAllFeinplanungen,
  getFeinplanungById,
  createFeinplanung,
  updateFeinplanung,
  deleteFeinplanung,
  moveFeinplanung,
};

