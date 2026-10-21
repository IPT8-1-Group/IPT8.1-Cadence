const pool = require('../confing/database');

async function findUserByEmail(email) {
  const [users] = await pool.query('SELECT * FROM `User` WHERE email = ?', [email]);
  return users[0];
}

async function createUser(email, passwordHash) {
  await pool.query('INSERT INTO `User` (email, password_hash, role) VALUES (?, ?, ?)', [email, passwordHash, 'user']);
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

module.exports = {
  findUserByEmail,
  createUser,
  getActiveTokens,
  createToken,
  updateTokenExpiry,
  deleteToken,
};
