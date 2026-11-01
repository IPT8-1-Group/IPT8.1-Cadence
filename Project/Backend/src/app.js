const express = require("express");
const authRoutes = require("./routes/authRoutes");
const modulverwaltungRoutes = require("./routes/modulverwaltungRoutes");

const app = express();

app.use(express.json());
app.use("/", authRoutes);
app.use("/api/modules", modulverwaltungRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

module.exports = app;