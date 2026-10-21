// Re-export / run server.js
module.exports = require('./server.js');


const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use('/', authRoutes);

module.exports = app;