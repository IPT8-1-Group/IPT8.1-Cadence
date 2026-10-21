const crypto = require('crypto');

function verifyKeyPair(publicKey, privateKey) {
  try {
    const data = Buffer.from('verify');
    const signature = crypto.sign('sha256', data, privateKey);
    return crypto.verify('sha256', data, publicKey, signature);
  } catch {
    return false;
  }
}

module.exports = { verifyKeyPair };
