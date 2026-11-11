const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const authModel = require('../models/authModel');
const { verifyKeyPair } = require('../utils/crypto');
const { JWT_SECRET } = require('../middlewares/authMiddleware');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function registerUser({ email, password, role = 'user', firstName = '', lastName = '', institution = '', jobTitle = '', func = '' }) {
  const hash = hashPassword(password);
  const title = jobTitle || func;
  return authModel.createUser(email, hash, role, firstName, lastName, institution, title);
}

async function loginUser(email, password) {
  // 1 Sekunde Verzoegerung gegen Brute-Force
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const user = await authModel.findUserByEmail(email);
  if (!user || !user.active) {
    return null;
  }

  const hash = hashPassword(password);
  if (user.password_hash !== hash && user.password_hash !== password) {
    return null;
  }

  // RSA-Schluesselpaar fuer bestehende Auth-Funktionalitaet
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await authModel.createToken(user.id, publicKey, expiresAt);

  // JWT Token fuer Standard-Auth
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return {
    token,
    privateKey,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      institution: user.institution,
      jobTitle: user.job_title,
      funktion: user.job_title,
      active: !!user.active,
    },
  };
}

async function verifyToken(email, privateKey) {
  const tokens = await authModel.getActiveTokens(email);
  return tokens.find((t) => verifyKeyPair(t.public_key, privateKey));
}

async function refreshToken(email, privateKey) {
  const tokens = await authModel.getActiveTokens(email);
  const token = tokens.find((t) => verifyKeyPair(t.public_key, privateKey));
  if (!token) return false;

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await authModel.updateTokenExpiry(token.id, expiresAt);
  return true;
}

async function logoutUser(email, privateKey) {
  const tokens = await authModel.getActiveTokens(email);
  const token = tokens.find((t) => verifyKeyPair(t.public_key, privateKey));
  if (!token) return false;

  await authModel.deleteToken(token.id);
  return true;
}

async function createPasswordResetToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Stunden gueltig
  await authModel.setResetToken(userId, token, expiresAt);
  return token;
}

async function setPasswordWithToken(token, newPassword) {
  const user = await authModel.findUserByResetToken(token);
  if (!user) return false;

  const hash = hashPassword(newPassword);
  await authModel.clearResetToken(user.id, hash);
  return true;
}

async function changePassword(userId, oldPassword, newPassword) {
  const user = await authModel.findUserById(userId);
  if (!user) return { success: false, error: 'Benutzer nicht gefunden' };

  // Password-Hash ermitteln
  const [rows] = await require('../confing/database').query('SELECT password_hash FROM `User` WHERE id = ?', [userId]);
  if (!rows.length) return { success: false, error: 'Benutzer nicht gefunden' };

  const currentHash = rows[0].password_hash;
  const oldHash = hashPassword(oldPassword);

  if (currentHash !== oldHash && currentHash !== oldPassword) {
    return { success: false, error: 'Altes Passwort stimmt nicht' };
  }

  const newHash = hashPassword(newPassword);
  await authModel.updateUserPassword(userId, newHash);
  return { success: true };
}

module.exports = {
  hashPassword,
  registerUser,
  loginUser,
  verifyToken,
  refreshToken,
  logoutUser,
  createPasswordResetToken,
  setPasswordWithToken,
  changePassword,
};
