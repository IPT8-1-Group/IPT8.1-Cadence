const express = require('express');
const authRoutes = require('./routes/authRoutes');
const modulverwaltungRoutes = require('./routes/modulverwaltungRoutes');
const kursRoutes = require('./routes/kursRoutes');
const grobplanungRoutes = require('./routes/grobplanungRoutes');
const feinplanungRoutes = require('./routes/feinplanungRoutes');

const app = express();

app.use(express.json());
app.use('/', authRoutes);
app.use('/api/modules', modulverwaltungRoutes);
app.use('/api/courses', kursRoutes);
app.use('/api/grobplanung', grobplanungRoutes);
app.use('/api/feinplanung', feinplanungRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
