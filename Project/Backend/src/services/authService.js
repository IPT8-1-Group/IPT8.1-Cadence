const crypto = require('crypto');
const authModel = require('../models/authModel');
const { verifyKeyPair } = require('../utils/crypto');

async function registerUser(email, password) {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  await authModel.createUser(email, hash);
}

async function loginUser(email, password) {
  const user = await authModel.findUserByEmail(email);
  const hash = crypto.createHash('sha256').update(password).digest('hex');

  if (!user || (user.password_hash !== hash && user.password_hash !== password)) {
    return null;
  }

  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await authModel.createToken(user.id, publicKey, expiresAt);

  return privateKey;
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

module.exports = {
  registerUser,
  loginUser,
  verifyToken,
  refreshToken,
  logoutUser,
};
