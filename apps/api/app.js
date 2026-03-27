
const express = require("express");

const app = express();
app.use(express.json());
// Routes
// app.use("/api/v1/auth", authRouter);

module.exports = app;
