const pool = require('../confing/database');

const columns = 'id, topic, `desc`, method, medium, `comment`, dur_min, position, fk_course_day, fk_outline_planning';

async function transaction(work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getDayInfo(dayId, db = pool) {
  const [rows] = await db.query(
    'SELECT id, date, start_time, end_time, fk_course_id, TIMESTAMPDIFF(MINUTE, start_time, end_time) AS availableDurationMin FROM Course_day WHERE id = ?',
    [dayId]
  );
  return rows[0];
}

async function getAllFeinplanungen(dayId, db = pool) {
  if (dayId) {
    const day = await getDayInfo(dayId, db);
    if (!day) return null;

    const [rows] = await db.query(
      `SELECT ${columns} FROM DetailedPlanning WHERE fk_course_day = ? ORDER BY position ASC, id ASC`,
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

  const [rows] = await db.query(
    `SELECT ${columns} FROM DetailedPlanning ORDER BY fk_course_day ASC, position ASC, id ASC`
  );
  return rows;
}

async function getFeinplanungById(id, db = pool) {
  const [rows] = await db.query(
    `SELECT ${columns} FROM DetailedPlanning WHERE id = ?`,
    [id]
  );
  return rows[0];
}

// Lock parent days before changing their ordering. A stable lock order also
// allows concurrent moves in opposite directions.
async function lockDays(db, ids) {
  const [days] = await db.query(
    'SELECT id FROM Course_day WHERE id IN (?) ORDER BY id FOR UPDATE', [ids]
  );
  return days.length === new Set(ids.map(Number)).size;
}

async function appendPosition(db, dayId) {
  const [rows] = await db.query(
    'SELECT position FROM DetailedPlanning WHERE fk_course_day = ? ORDER BY position DESC, id DESC LIMIT 1 FOR UPDATE',
    [dayId]
  );
  return (rows[0]?.position ?? 0) + 1;
}

async function createFeinplanung(fields) {
  return transaction(async db => {
    if (!await lockDays(db, [fields.fk_course_day])) return { error: 'DAY_NOT_FOUND' };
    fields.position = await appendPosition(db, fields.fk_course_day);
    const [result] = await db.query('INSERT INTO DetailedPlanning SET ?', [fields]);
    return getFeinplanungById(result.insertId, db);
  });
}

async function updateFeinplanung(id, fields) {
  return transaction(async db => {
    if (fields.fk_course_day !== undefined) {
      const current = await getFeinplanungById(id, db);
      if (!current) return null;
      const target = Number(fields.fk_course_day);
      if (!await lockDays(db, [current.fk_course_day, target])) return { error: 'DAY_NOT_FOUND' };
      const [rows] = await db.query('SELECT fk_course_day FROM DetailedPlanning WHERE id = ? FOR UPDATE', [id]);
      if (!rows.length) return null;
      if (rows[0].fk_course_day !== current.fk_course_day) return { error: 'PLAN_CHANGED' };
      if (current.fk_course_day !== target) fields.position = await appendPosition(db, target);
    }
    if (Object.keys(fields).length) {
      await db.query('UPDATE DetailedPlanning SET ? WHERE id = ?', [fields, id]);
    }
    return getFeinplanungById(id, db);
  });
}

function deleteFeinplanung(id) {
  return pool.query('DELETE FROM DetailedPlanning WHERE id = ?', [id]);
}

function moveFeinplanung(id, targetDayId, targetOutlineId) {
  const fields = { fk_course_day: targetDayId };
  if (targetOutlineId !== undefined) fields.fk_outline_planning = targetOutlineId;
  return updateFeinplanung(id, fields);
}

async function reorderFeinplanung(dayId, orderedIds) {
  return transaction(async db => {
    if (!await lockDays(db, [dayId])) return { error: 'DAY_NOT_FOUND' };
    const [rows] = await db.query(
      'SELECT id FROM DetailedPlanning WHERE fk_course_day = ? FOR UPDATE', [dayId]
    );
    const expected = new Set(rows.map(row => row.id));
    if (rows.length !== orderedIds.length || !orderedIds.every(id => expected.delete(id))) {
      return { error: 'PLAN_CHANGED' };
    }
    for (const [index, id] of orderedIds.entries()) {
      await db.query('UPDATE DetailedPlanning SET position = ? WHERE id = ?', [index + 1, id]);
    }
    return getAllFeinplanungen(dayId, db);
  });
}

module.exports = {
  getDayInfo, getAllFeinplanungen, getFeinplanungById, createFeinplanung,
  updateFeinplanung, deleteFeinplanung, moveFeinplanung, reorderFeinplanung,
};
