const pool = require("../confing/database");

async function listModules({
  search,
  sortBy,
  sortDirection,
  pageSize,
  offset,
}) {
  const where = search ? "WHERE m.code LIKE ? OR m.title LIKE ?" : "";
  const searchParams = search ? [`%${search}%`, `%${search}%`] : [];
  const orderColumns = {
    code: "m.code",
    title: "m.title",
    updatedAt: "m.id",
  };
  const [rows] = await pool.query(
    `SELECT m.id, m.code, m.title, m.\`desc\` AS description, NULL AS createdAt, NULL AS updatedAt, COUNT(c.id) AS courseCount  FROM Module LEFT JOIN Course c ON c.fk_module_id = m.id  ${where}  GROUP BY m.id
         ORDER BY ${orderColumns[sortBy]} ${sortDirection}, m.id ${sortDirection}
         LIMIT ? OFFSET ?`,
    [...searchParams, pageSize, offset],
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM Module m ${where}`,
    searchParams,
  );
  return { rows, total };
}

async function getModuleById(id, connection = pool) {
  const [modules] = await connection.query(
    "SELECT id, code, title, `desc` AS description FROM Module WHERE id = ?",
    [id],
  );
  if (!modules[0]) return undefined;
  return {
    ...modules[0],
    externalUrl: null,
    learningObjectives: [],
    createdAt: null,
    updatedAt: null,
  };
}

async function getModuleStatistics(id) {
  const [[statistics]] = await pool.query(
    `SELECT COUNT(DISTINCT c.id) AS courseCount, COUNT(DISTINCT d.id) AS dayCount, COUNT(DISTINCT detail.id) AS detailedEntryCount FROM Course c
          LEFT JOIN Course_day d ON d.fk_course_id = c.id
         LEFT JOIN DetailedPlanning detail ON detail.fk_course_day = d.id
         WHERE c.fk_module_id = ?`,
    [id],
  );
  return statistics;
}

async function createModule({ title, code, description }) {
  const [result] = await pool.query(
    "INSERT INTO Module (title, code, `desc`) VALUES (?, ?, ?)",
    [title, code, description],
  );
  return result.insertId;
}

async function patchModule(id, fields) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const module = await getModuleById(id, connection);
    if (!module) {
      await connection.rollback();
      return undefined;
    }

    const columns = {
      code: "code",
      title: "title",
      description: "`desc`",
    };
    const updates = Object.keys(fields);
    await connection.query(
      `UPDATE Module SET ${updates.map((field) => `${columns[field]} = ?`).join(", ")}
             WHERE id = ?`,
      [...updates.map((field) => fields[field]), id],
    );
    await connection.commit();
    return getModuleById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteModule(id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [modules] = await connection.query(
      "SELECT id FROM Module WHERE id = ? FOR UPDATE",
      [id],
    );
    if (!modules.length) {
      await connection.rollback();
      return "not_found";
    }
    const [courses] = await connection.query(
      "SELECT id FROM Course WHERE fk_module_id = ? LIMIT 1",
      [id],
    );
    if (courses.length) {
      await connection.rollback();
      return "not_empty";
    }
    await connection.query("DELETE FROM Module WHERE id = ?", [id]);
    await connection.commit();
    return "deleted";
  } catch (error) {
    await connection.rollback();
    if (error.code === "ER_ROW_IS_REFERENCED_2") return "not_empty";
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  listModules,
  getModuleById,
  getModuleStatistics,
  createModule,
  patchModule,
  deleteModule,
};
