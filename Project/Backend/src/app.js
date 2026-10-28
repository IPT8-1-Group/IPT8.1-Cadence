const express = require("express");
const authRoutes = require("./routes/authRoutes");
const modulverwaltungRoutes = require("./routes/modulverwaltungRoutes");
const errorHandler = require("./middleware/errorHandler.middeleware.js");

const app = express();


app.use(express.json());
app.use("/", authRoutes);
app.use("/api/modules", modulverwaltungRoutes);


module.exports = app;

app.use((req, res, next) => {
  const err = new Error("Route not found");
  err.statusCode = 404;
  next(err);
});


app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server läuft auf Port 3000");
});