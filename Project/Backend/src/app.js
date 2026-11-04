const express = require('express');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const accessRequestRoutes = require('./routes/accessRequestRoutes');
const modulverwaltungRoutes = require('./routes/modulverwaltungRoutes');
const kursRoutes = require('./routes/kursRoutes');
const grobplanungRoutes = require('./routes/grobplanungRoutes');
const { requireAuth } = require('./middlewares/authMiddleware');
const errorHandler = require('./middlewares/errohandling.middeleware');

const app = express();

// CORS-Middleware fuer Frontend
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, x-user-email, x-private-key');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// Auth-Routen unter /api/auth und /api
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes);

// Oeffentliche Zugangsanfragen
app.use('/api/access-requests', accessRequestRoutes);

// Admin-Endpunkte (Benutzerverwaltung und Zugangsanfragen)
app.use('/api/admin', adminRoutes);

// Geschuetzte Fachbereiche (Erfordern Anmeldung)
app.use('/api/modules', requireAuth, modulverwaltungRoutes);
app.use('/api/courses', requireAuth, kursRoutes);
app.use('/api/grobplanung', requireAuth, grobplanungRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Zentrale Fehlerbehandlung
app.use(errorHandler);

module.exports = app;
