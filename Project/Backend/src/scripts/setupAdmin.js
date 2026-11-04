const crypto = require('crypto');
const pool = require('../confing/database');

async function setupAdmin() {
  try {
    const [admins] = await pool.query('SELECT id, email FROM `User` WHERE role = ?', ['admin']);

    if (admins.length > 0) {
      console.log(`Administrator existiert bereits (${admins[0].email}). Kein neuer Admin angelegt.`);
      process.exit(0);
    }

    const email = process.env.ADMIN_EMAIL || 'admin@cadence.local';
    const password = process.env.ADMIN_PASSWORD || 'AdminPass123!';
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    await pool.query(
      'INSERT INTO `User` (email, password_hash, role, first_name, last_name, institution, `function`, active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [email, passwordHash, 'admin', 'System', 'Admin', 'Schule', 'Leitung']
    );

    console.log('Erster Administrator erfolgreich angelegt:');
    console.log(`  E-Mail: ${email}`);
    console.log(`  Passwort: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('Fehler beim Anlegen des Administrators:', err);
    process.exit(1);
  }
}

setupAdmin();
