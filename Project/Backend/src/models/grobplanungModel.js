const pool = require('../confing/database');

async function transaction(run) {
  const db = await pool.getConnection();
  try {
    await db.beginTransaction();
    const result = await run(db);
    await db.commit();
    return result;
  } catch (error) {
    await db.rollback();
    throw error;
  } finally {
    db.release();
  }
}

async function getAllOutlines(courseId) {
  if (courseId) {
    const [rows] = await pool.query('SELECT id, title, `desc`, fk_course FROM OutlinePlanning WHERE fk_course = ? ORDER BY id', [courseId]);
    return rows;
  }
  const [rows] = await pool.query('SELECT id, title, `desc`, fk_course FROM OutlinePlanning ORDER BY id');
  return rows;
}

async function getOutlineById(id) {
  const [rows] = await pool.query('SELECT id, title, `desc`, fk_course FROM OutlinePlanning WHERE id = ?', [id]);
  return rows[0];
}

async function createOutline(title, desc, courseId, dayId) {
  return transaction(async db => {
    if (!await lockCourse(db, courseId)) return null;
    if (dayId != null && !await lockDays(db, courseId, [dayId])) return null;

    const [result] = await db.query(
      'INSERT INTO OutlinePlanning (title, `desc`, fk_course) VALUES (?, ?, ?)',
      [title, desc, courseId]
    );
    if (dayId != null) {
      const placements = await getPlacements(courseId, db);
      const existing = placements.filter(item => item.dayId === dayId).map(item => item.outlineId);
      for (const [index, id] of [...existing, result.insertId].entries()) {
        await writePosition(db, id, dayId, index + 1);
      }
    }
    return result.insertId;
  });
}

async function lockCourse(db, courseId) {
  const [rows] = await db.query('SELECT id FROM Course WHERE id = ? FOR UPDATE', [courseId]);
  return rows.length > 0;
}

async function lockDays(db, courseId, ids) {
  if (!ids.length) return true;
  const [rows] = await db.query(
    'SELECT id FROM Course_day WHERE fk_course_id = ? AND id IN (?) ORDER BY id FOR UPDATE',
    [courseId, ids]
  );
  return rows.length === new Set(ids).size;
}

async function getPlacements(courseId, db = pool) {
  // Existing lessons keep appearing in the overview even if the topic was
  // attached in the detailed plan, where an explicit placement is optional.
  const [items] = await db.query(
    `SELECT topic.id AS outlineId, day.id AS dayId, p.position, COUNT(d.id) AS linkedCount
     FROM OutlinePlanning topic
     INNER JOIN Course_day day ON day.fk_course_id = topic.fk_course
     LEFT JOIN OutlinePlanningDay p ON p.fk_day = day.id AND p.fk_outline = topic.id
     LEFT JOIN DetailedPlanning d ON d.fk_course_day = day.id AND d.fk_outline_planning = topic.id
     WHERE topic.fk_course = ? AND (p.fk_outline IS NOT NULL OR d.id IS NOT NULL)
     GROUP BY topic.id, day.id, p.position
     ORDER BY day.id, p.position IS NULL, p.position, MIN(d.position), topic.id`,
    [courseId]
  );
  return items;
}

async function writePosition(db, outlineId, dayId, position) {
  await db.query(
    `INSERT INTO OutlinePlanningDay (fk_outline, fk_day, position) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE position = VALUES(position)`,
    [outlineId, dayId, position]
  );
}

async function placeOutline(courseId, { outlineId, fromDayId, targetDayId, orderedIds }) {
  return transaction(async db => {
    if (!await lockCourse(db, courseId)) return 'not_found';
    const ids = [fromDayId, targetDayId].filter(id => id !== null);
    if (!await lockDays(db, courseId, ids)) return 'not_found';

    const [topics] = await db.query(
      'SELECT id FROM OutlinePlanning WHERE id = ? AND fk_course = ? FOR UPDATE',
      [outlineId, courseId]
    );
    if (!topics.length) return 'not_found';

    const placements = await getPlacements(courseId, db);
    const existing = placements.filter(item => item.outlineId === outlineId);
    const source = existing.find(item => item.dayId === fromDayId);
    if (fromDayId === null ? existing.length > 0 : !source) return 'changed';
    if (source?.linkedCount && targetDayId === null) return 'linked';

    if (targetDayId !== null) {
      const expected = new Set(placements.filter(item => item.dayId === targetDayId).map(item => item.outlineId));
      if (targetDayId !== fromDayId && expected.has(outlineId)) return 'changed';
      expected.add(outlineId);
      if (expected.size !== orderedIds.length || !orderedIds.every(id => expected.delete(id))) return 'changed';
    }

    if (fromDayId !== null && targetDayId !== fromDayId) {
      await db.query(
        'DELETE FROM OutlinePlanningDay WHERE fk_outline = ? AND fk_day = ?',
        [outlineId, fromDayId]
      );
      if (source.linkedCount) {
        const [last] = await db.query(
          'SELECT position FROM DetailedPlanning WHERE fk_course_day = ? ORDER BY position DESC LIMIT 1 FOR UPDATE',
          [targetDayId]
        );
        const [details] = await db.query(
          'SELECT id FROM DetailedPlanning WHERE fk_course_day = ? AND fk_outline_planning = ? ORDER BY position, id FOR UPDATE',
          [fromDayId, outlineId]
        );
        let position = last[0]?.position ?? 0;
        for (const detail of details) {
          position += 1;
          await db.query('UPDATE DetailedPlanning SET fk_course_day = ?, position = ? WHERE id = ?', [
            targetDayId, position, detail.id
          ]);
        }
      }
    }

    if (targetDayId !== null) {
      for (const [index, id] of orderedIds.entries()) {
        await writePosition(db, id, targetDayId, index + 1);
      }
    }
    return 'saved';
  });
}

async function updateOutline(id, title, desc) {
  await pool.query('UPDATE OutlinePlanning SET title = ?, `desc` = ? WHERE id = ?', [title, desc, id]);
  return getOutlineById(id);
}

async function deleteOutline(id) {
  await pool.query('DELETE FROM OutlinePlanning WHERE id = ?', [id]);
}

async function moveOutline(id, targetCourseId) {
  return transaction(async db => {
    const [topics] = await db.query('SELECT fk_course FROM OutlinePlanning WHERE id = ? FOR UPDATE', [id]);
    if (!topics.length) return null;
    if (topics[0].fk_course !== Number(targetCourseId)) {
      await db.query('UPDATE OutlinePlanning SET fk_course = ? WHERE id = ?', [targetCourseId, id]);
      await db.query('DELETE FROM OutlinePlanningDay WHERE fk_outline = ?', [id]);
    }
    const [rows] = await db.query('SELECT id, title, `desc`, fk_course FROM OutlinePlanning WHERE id = ?', [id]);
    return rows[0];
  });
}

module.exports = {
  getAllOutlines,
  getPlacements,
  placeOutline,
  getOutlineById,
  createOutline,
  updateOutline,
  deleteOutline,
  moveOutline,
};
