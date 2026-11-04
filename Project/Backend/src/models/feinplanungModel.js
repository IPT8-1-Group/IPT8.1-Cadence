const pool = require('../confing/database');

async function getDayInfo(dayId) {
  const [rows] = await pool.query(
    'SELECT id, date, start_time, end_time, fk_course_id, TIMESTAMPDIFF(MINUTE, start_time, end_time) AS availableDurationMin FROM Course_day WHERE id = ?',
    [dayId]
  );
  return rows[0];
}

async function getAllFeinplanungen(dayId) {
  if (dayId) {
    const day = await getDayInfo(dayId);
    if (!day) return null;

    const [rows] = await pool.query(
      'SELECT id, topic, `desc`, dur_min, position, fk_course_day, fk_outline_planning FROM DetailedPlanning WHERE fk_course_day = ? ORDER BY position ASC, id ASC',
      [dayId]
    );

    let currentMinute = 0;
    const entries = rows.map((entry) => {
      const startMinute = currentMinute;
      const endMinute = currentMinute + entry.dur_min;
      currentMinute = endMinute;
      return {
        ...entry,
        startMinute,
        endMinute,
        timeRange: `${startMinute}-${endMinute}'`,
      };
    });

    const totalDurationMin = currentMinute;
    const availableDurationMin = day.availableDurationMin || 0;

    return {
      day: {
        id: day.id,
        date: day.date,
        startTime: day.start_time,
        endTime: day.end_time,
        availableDurationMin,
      },
      summary: {
        totalDurationMin,
        availableDurationMin,
        remainingMin: availableDurationMin - totalDurationMin,
        isOverCapacity: totalDurationMin > availableDurationMin,
      },
      entries,
    };
  }

  const [rows] = await pool.query(
    'SELECT id, topic, `desc`, dur_min, position, fk_course_day, fk_outline_planning FROM DetailedPlanning ORDER BY fk_course_day ASC, position ASC, id ASC'
  );
  return rows;
}

async function getFeinplanungById(id) {
  const [rows] = await pool.query(
    'SELECT id, topic, `desc`, dur_min, position, fk_course_day, fk_outline_planning FROM DetailedPlanning WHERE id = ?',
    [id]
  );
  return rows[0];
}

async function createFeinplanung(topic, desc, dur_min, fk_course_day, fk_outline_planning) {
  const day = await getDayInfo(fk_course_day);
  if (!day) return { error: 'DAY_NOT_FOUND' };

  const [countRows] = await pool.query(
    'SELECT COUNT(*) AS total FROM DetailedPlanning WHERE fk_course_day = ?',
    [fk_course_day]
  );
  const nextPos = countRows[0].total + 1;

  const [result] = await pool.query(
    'INSERT INTO DetailedPlanning (topic, `desc`, dur_min, position, fk_course_day, fk_outline_planning) VALUES (?, ?, ?, ?, ?, ?)',
    [topic, desc, dur_min || 45, nextPos, fk_course_day, fk_outline_planning || null]
  );
  return { id: result.insertId };
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
  const day = await getDayInfo(targetDayId);
  if (!day) return { error: 'DAY_NOT_FOUND' };

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

async function reorderFeinplanung(dayId, orderedIds) {
  const day = await getDayInfo(dayId);
  if (!day) return { error: 'DAY_NOT_FOUND' };

  for (let i = 0; i < orderedIds.length; i++) {
    await pool.query(
      'UPDATE DetailedPlanning SET position = ? WHERE id = ? AND fk_course_day = ?',
      [i + 1, orderedIds[i], dayId]
    );
  }
  return getAllFeinplanungen(dayId);
}

module.exports = {
  getDayInfo,
  getAllFeinplanungen,
  getFeinplanungById,
  createFeinplanung,
  updateFeinplanung,
  deleteFeinplanung,
  moveFeinplanung,
  reorderFeinplanung,
};
