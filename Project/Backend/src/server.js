const express = require('express');
const crypto = require('crypto');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

function verifyKeyPair(publicKey, privateKey) {
  try {
    const data = Buffer.from('verify');
    const signature = crypto.sign('sha256', data, privateKey);
    return crypto.verify('sha256', data, publicKey, signature);
  } catch {
    return false;
  }
}

async function getActiveTokens(email) {
  const [tokens] = await pool.query(
    'SELECT t.* FROM `User` u JOIN `Token` t ON u.id = t.fk_user_id WHERE u.email = ? AND t.expires_at > NOW()',
    [email]
  );
  return tokens;
}

// 0. Register
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  try {
    await pool.query('INSERT INTO `User` (email, password_hash, role) VALUES (?, ?, ?)', [email, hash, 'user']);
    res.json({ message: 'User registered' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'User already exists' });
    }
    res.status(400).json({ error: 'Registration failed' });
  }
});

// 1. Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [users] = await pool.query('SELECT * FROM `User` WHERE email = ?', [email]);
  const hash = crypto.createHash('sha256').update(password).digest('hex');

  if (!users[0] || (users[0].password_hash !== hash && users[0].password_hash !== password)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await pool.query('INSERT INTO `Token` (fk_user_id, public_key, expires_at) VALUES (?, ?, ?)', [users[0].id, publicKey, expiresAt]);

  res.json({ message: 'Login successful', private_key: privateKey });
});

// 2. Check Validity
app.post('/verify', async (req, res) => {
  const { email, private_key } = req.body;
  const tokens = await getActiveTokens(email);
  const token = tokens.find((t) => verifyKeyPair(t.public_key, private_key));
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  res.json({ message: 'Valid' });
});

// 3. Refresh Key
app.post('/refresh', async (req, res) => {
  const { email, private_key } = req.body;
  const tokens = await getActiveTokens(email);
  const token = tokens.find((t) => verifyKeyPair(t.public_key, private_key));
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await pool.query('UPDATE `Token` SET expires_at = ? WHERE id = ?', [expiresAt, token.id]);

  res.json({ message: 'Refreshed' });
});

// 4. Logout
app.post('/logout', async (req, res) => {
  const { email, private_key } = req.body;
  const tokens = await getActiveTokens(email);
  const token = tokens.find((t) => verifyKeyPair(t.public_key, private_key));
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  await pool.query('DELETE FROM `Token` WHERE id = ?', [token.id]);

  res.json({ message: 'Logged out' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
