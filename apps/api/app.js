const path = require("path");
const express = require("express");
const cors = require("cors");

const userRouter = require("./routers/userRoutes");
const productRouter = require("./routers/productRoutes");
const cartRouter = require('./routers/cartRoutes');
const categoryRouter = require("./routers/categoryRoutes");
const adminRouter = require("./routers/adminRoutes");
const sellerRouter = require('./routers/sellerRoutes');
const siteContentController = require("./controllers/siteContentController");
const adminController = require("./controllers/adminController");
const protect = require("./middlewares/protect");
const restrictTo = require("./middlewares/restrictTo");

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
app.use('/api/v1/cart', cartRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/admin", adminRouter);
app.use('/api/v1/sellers', sellerRouter);

app.get("/api/v1/site-content", siteContentController.getPublicSiteContent);
app.post(
  "/api/v1/promos/validate",
  protect,
  restrictTo("customer", "seller", "admin"),
  adminController.validatePromo
);

module.exports = app;
