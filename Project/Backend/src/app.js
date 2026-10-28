const express = require("express");
const authRoutes = require("./routes/authRoutes");
const modulverwaltungRoutes = require("./routes/modulverwaltungRoutes");

const app = express();

app.use(express.json());
app.use("/", authRoutes);
app.use("/api/modules", modulverwaltungRoutes);

module.exports = app;
