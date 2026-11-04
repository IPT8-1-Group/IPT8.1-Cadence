const pool = require('../confing/database');

async function findUserByEmail(email) {
  const [users] = await pool.query('SELECT * FROM `User` WHERE email = ?', [email]);
  return users[0];
}

async function findUserById(id) {
  const [users] = await pool.query(
    'SELECT id, first_name AS firstName, last_name AS lastName, email, institution, `function`, role, active, created_at AS createdAt FROM `User` WHERE id = ?',
    [id]
  );
  return users[0];
}

async function createUser(email, passwordHash, role = 'user', firstName = '', lastName = '', institution = '', func = '') {
  const [result] = await pool.query(
    'INSERT INTO `User` (email, password_hash, role, first_name, last_name, institution, `function`, active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
    [email, passwordHash, role, firstName, lastName, institution, func]
  );
  return result.insertId;
}

async function getAllUsers() {
  const [rows] = await pool.query(
    'SELECT id, first_name AS firstName, last_name AS lastName, email, institution, `function`, role, active, created_at AS createdAt FROM `User` ORDER BY id ASC'
  );
  return rows;
}

async function updateUser(id, fields) {
  const updates = [];
  const params = [];

  if (fields.role !== undefined) {
    updates.push('role = ?');
    params.push(fields.role);
  }
  if (fields.active !== undefined) {
    updates.push('active = ?');
    params.push(fields.active ? 1 : 0);
  }
  if (fields.firstName !== undefined) {
    updates.push('first_name = ?');
    params.push(fields.firstName);
  }
  if (fields.lastName !== undefined) {
    updates.push('last_name = ?');
    params.push(fields.lastName);
  }
  if (fields.institution !== undefined) {
    updates.push('institution = ?');
    params.push(fields.institution);
  }
  if (fields.function !== undefined) {
    updates.push('`function` = ?');
    params.push(fields.function);
  }

  if (updates.length > 0) {
    params.push(id);
    await pool.query(`UPDATE \`User\` SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  return findUserById(id);
}

async function updateUserPassword(id, passwordHash) {
  await pool.query('UPDATE `User` SET password_hash = ? WHERE id = ?', [passwordHash, id]);
}

async function setResetToken(id, token, expiresAt) {
  await pool.query(
    'UPDATE `User` SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
    [token, expiresAt, id]
  );
}

async function findUserByResetToken(token) {
  const [users] = await pool.query(
    'SELECT * FROM `User` WHERE reset_token = ? AND reset_token_expires > NOW()',
    [token]
  );
  return users[0];
}

async function clearResetToken(id, newPasswordHash) {
  await pool.query(
    'UPDATE `User` SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
    [newPasswordHash, id]
  );
}

async function deleteTokensForUser(userId) {
  await pool.query('DELETE FROM `Token` WHERE fk_user_id = ?', [userId]);
}

async function getActiveTokens(email) {
  const [tokens] = await pool.query(
    'SELECT t.* FROM `User` u JOIN `Token` t ON u.id = t.fk_user_id WHERE u.email = ? AND t.expires_at > NOW()',
    [email]
  );
  return tokens;
}

async function createToken(userId, publicKey, expiresAt) {
  await pool.query('INSERT INTO `Token` (fk_user_id, public_key, expires_at) VALUES (?, ?, ?)', [userId, publicKey, expiresAt]);
}

async function updateTokenExpiry(tokenId, expiresAt) {
  await pool.query('UPDATE `Token` SET expires_at = ? WHERE id = ?', [expiresAt, tokenId]);
}

async function deleteToken(tokenId) {
  await pool.query('DELETE FROM `Token` WHERE id = ?', [tokenId]);
}

// Access Requests
async function createAccessRequest({ firstName, lastName, email, institution, func, additionalInfo }) {
  const [result] = await pool.query(
    'INSERT INTO AccessRequest (first_name, last_name, email, institution, `function`, additional_info, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [firstName, lastName, email, institution, func, additionalInfo || '', 'pending']
  );
  return result.insertId;
}

async function findPendingAccessRequestByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM AccessRequest WHERE email = ? AND status = "pending"',
    [email]
  );
  return rows[0];
}

async function getAllAccessRequests() {
  const [rows] = await pool.query(
    'SELECT id, first_name AS firstName, last_name AS lastName, email, institution, `function`, additional_info AS additionalInformation, status, created_at AS createdAt FROM AccessRequest ORDER BY created_at DESC'
  );
  return rows;
}

async function getAccessRequestById(id) {
  const [rows] = await pool.query('SELECT * FROM AccessRequest WHERE id = ?', [id]);
  return rows[0];
}

async function updateAccessRequestStatus(id, status) {
  await pool.query('UPDATE AccessRequest SET status = ? WHERE id = ?', [status, id]);
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  getAllUsers,
  updateUser,
  updateUserPassword,
  setResetToken,
  findUserByResetToken,
  clearResetToken,
  deleteTokensForUser,
  getActiveTokens,
  createToken,
  updateTokenExpiry,
  deleteToken,
  createAccessRequest,
  findPendingAccessRequestByEmail,
  getAllAccessRequests,
  getAccessRequestById,
  updateAccessRequestStatus,
};
