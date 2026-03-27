const express = require("express");
const cors = require("cors");

const userRouter = require("./Routes/userRoutes");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:4200"],
    credentials: true,
  })
);

app.options("*", cors());


// Routes
app.use("/api/v1/users", userRouter);

module.exports = app;
