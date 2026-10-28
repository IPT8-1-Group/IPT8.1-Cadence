const pool = require('../confing/database');

async function getModuleByTitle(title) {
    const [modules] = await pool.query('SELECT * FROM Module WHERE title = ?', [title]);
    return modules[0];
}

async function getAllModules() {
    const [modules] = await pool.query('SELECT * FROM Module');
    return modules;
}

async function updateModuleTitle(id, newTitle) {
    const [result] = await pool.query(
        'UPDATE Module SET title = ? WHERE id = ?',
        [newTitle, id]
    );
    return result;
}

module.exports = {
    getModuleByTitle,
    getAllModules,
    updateModuleTitle,
};