const jwt = require('jsonwebtoken');
const pool = require('../confing/database');
const authService = require('../services/authService');
const sendError = require('../utils/apiError');

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
          'SELECT id, email, role, active, first_name AS firstName, last_name AS lastName, institution, job_title AS jobTitle, created_at AS createdAt FROM `User` WHERE id = ?',
          [decoded.id]
        );
        const user = users[0];

        // Konto muss existieren und aktiv sein
        if (!user || !user.active) {
          return sendError(res, 401, 'ACCOUNT_INACTIVE', 'Das Benutzerkonto ist nicht vorhanden oder deaktiviert.');
        }

        user.funktion = user.jobTitle;
        req.user = user;
        return next();
      } catch (err) {
        if (err.name !== 'JsonWebTokenError' && err.name !== 'TokenExpiredError' && err.name !== 'NotBeforeError') {
          throw err;
        }
        return sendError(res, 401, 'TOKEN_INVALID', 'Die Sitzung ist ungültig oder abgelaufen. Bitte melden Sie sich erneut an.');
      }
    }

    // 2. Pruefung ueber Email und Private Key (Fallback fuer RSA-Auth)
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
          return sendError(res, 401, 'ACCOUNT_INACTIVE', 'Das Benutzerkonto ist nicht vorhanden oder deaktiviert.');
        }

        user.funktion = user.jobTitle;
        req.user = user;
        return next();
      }
    }

    return sendError(res, 401, 'AUTHENTICATION_REQUIRED', 'Bitte melden Sie sich an, um fortzufahren.');
  } catch (err) {
    return next(err);
  }
}

// Prueft ob der angemeldete Benutzer Admin ist
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(res, 403, 'ADMIN_REQUIRED', 'Für diese Aktion sind Administratorrechte erforderlich.');
  }
  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  JWT_SECRET,
};
