const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || process.env.DB_PORT_HOST || 3307),
  user: process.env.DB_USER || 'cadence_user',
  password: process.env.DB_PASSWORD || 'cadence_secure_password',
  database: process.env.DB_NAME || 'stundenplaner',
});

module.exports = pool;
