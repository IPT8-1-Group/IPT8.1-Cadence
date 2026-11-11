const jwt = require('jsonwebtoken');
const pool = require('../confing/database');
const authService = require('../services/authService');

const JWT_SECRET = process.env.JWT_SECRET || 'cadence_secret_key_2026';

async function requireAuth(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const [users] = await pool.query(
          'SELECT id, email, role, active, first_name AS firstName, last_name AS lastName, institution, job_title AS jobTitle, created_at AS createdAt FROM `User` WHERE id = ?',
          [decoded.id]
        );
        const user = users[0];

        if (!user || !user.active) {
          return res.status(401).json({ error: 'Sitzung ungültig oder Konto deaktiviert' });
        }

        user.funktion = user.jobTitle;
        req.user = user;
        return next();
      } catch {
        return res.status(401).json({ error: 'Ungültiger oder abgelaufener Token' });
      }
    }

    const email = req.headers['x-user-email'] || (req.body && req.body.email);
    const privateKey = req.headers['x-private-key'] || (req.body && req.body.private_key);

    if (email && privateKey) {
      const validToken = await authService.verifyToken(email, privateKey);
      if (validToken) {
        const [users] = await pool.query(
          'SELECT id, email, role, active, first_name AS firstName, last_name AS lastName, institution, job_title AS jobTitle, created_at AS createdAt FROM `User` WHERE email = ?',
          [email]
        );
        const user = users[0];

        if (!user || !user.active) {
          return res.status(401).json({ error: 'Konto deaktiviert' });
        }

        user.funktion = user.jobTitle;
        req.user = user;
        return next();
      }
    }

    return res.status(401).json({ error: 'Anmeldung erforderlich' });
  } catch {
    return res.status(500).json({ error: 'Authentifizierungsfehler' });
  }
}

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
