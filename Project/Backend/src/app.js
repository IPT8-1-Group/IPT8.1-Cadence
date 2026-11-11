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

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, x-user-email, x-private-key');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes);
app.use('/api/access-requests', accessRequestRoutes);
app.use('/api/admin', adminRoutes);

// Protected routes
app.use('/api/modules', requireAuth, modulverwaltungRoutes);
app.use('/api/courses', requireAuth, kursRoutes);
app.use('/api/grobplanung', requireAuth, grobplanungRoutes);
app.use('/api/feinplanung', requireAuth, feinplanungRoutes);

// Static frontend build (falls vorhanden)
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(path.join(publicDir, 'index.html'))) {
  app.use(express.static(publicDir));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
