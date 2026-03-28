const path = require("path");
const express = require("express");
const cors = require("cors");

const userRouter = require("./routers/userRoutes");
const productRouter = require("./routers/productRoutes");

const app = express();
app.use(express.json());

// Serve uploaded images as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
