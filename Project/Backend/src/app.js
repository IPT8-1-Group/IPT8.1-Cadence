const express = require('express');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const accessRequestRoutes = require('./routes/accessRequestRoutes');
const modulverwaltungRoutes = require('./routes/modulverwaltungRoutes');
const kursRoutes = require('./routes/kursRoutes');
const grobplanungRoutes = require('./routes/grobplanungRoutes');
const feinplanungRoutes = require('./routes/feinplanungRoutes');
const { requireAuth } = require('./middlewares/authMiddleware');
const errorHandler = require('./middlewares/errohandling.middeleware');
const sendError = require('./utils/apiError');

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
app.use('/api/feinplanung', requireAuth, feinplanungRoutes);

// Serve built frontend (only if it exists, so Docker/dev still works)
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(path.join(publicDir, 'index.html'))) {
  app.use(express.static(publicDir));

  // SPA fallback: any GET that isn't an API call returns index.html
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

app.use((req, res) => {
  sendError(res, 404, 'ROUTE_NOT_FOUND', 'Der angeforderte Endpunkt wurde nicht gefunden.');
});

// Zentrale Fehlerbehandlung
app.use(errorHandler);

module.exports = app;
