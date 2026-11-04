const jwt = require('jsonwebtoken');
const pool = require('../confing/database');
const authService = require('../services/authService');

const JWT_SECRET = process.env.JWT_SECRET || 'cadence_secret_key_2026';

// Prueft ob der Benutzer angemeldet und sein Konto aktiv ist
async function requireAuth(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }

    // 1. Pruefung ueber Bearer JWT Token
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const [users] = await pool.query(
          'SELECT id, email, role, active, first_name AS firstName, last_name AS lastName, institution, `function`, created_at AS createdAt FROM `User` WHERE id = ?',
          [decoded.id]
        );
        const user = users[0];

        // Konto muss existieren und aktiv sein
        if (!user || !user.active) {
          return res.status(401).json({ error: 'Sitzung ungültig oder Konto deaktiviert' });
        }

        req.user = user;
        return next();
      } catch {
        // Falls JWT ungueltig oder abgelaufen ist
        return res.status(401).json({ error: 'Ungültiger oder abgelaufener Token' });
      }
    }

    // 2. Pruefung ueber Email und Private Key (Fallback fuer RSA-Auth)
    const email = req.headers['x-user-email'] || (req.body && req.body.email);
    const privateKey = req.headers['x-private-key'] || (req.body && req.body.private_key);

    if (email && privateKey) {
      const validToken = await authService.verifyToken(email, privateKey);
      if (validToken) {
        const [users] = await pool.query(
          'SELECT id, email, role, active, first_name AS firstName, last_name AS lastName, institution, `function`, created_at AS createdAt FROM `User` WHERE email = ?',
          [email]
        );
        const user = users[0];

        if (!user || !user.active) {
          return res.status(401).json({ error: 'Konto deaktiviert' });
        }

        req.user = user;
        return next();
      }
    }

    return res.status(401).json({ error: 'Anmeldung erforderlich' });
  } catch (err) {
    return res.status(500).json({ error: 'Authentifizierungsfehler' });
  }
}

// Prueft ob der angemeldete Benutzer Admin ist
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Zugriff verweigert: Nur Administratoren erlaubt' });
  }
  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  JWT_SECRET,
};

