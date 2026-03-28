const express = require("express");
const cors = require("cors");

const userRouter = require("./routers/userRoutes");
const productRouter = require("./routers/productRoutes");

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
app.use("/api/v1/products", productRouter);

module.exports = app;
