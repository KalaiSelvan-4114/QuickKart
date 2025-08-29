const express = require("express");
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
const compression = require("compression");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const shopRoutes = require("./routes/shop");
const adminRoutes = require("./routes/admin");
const aiStylistRoutes = require("./routes/aiStylist");
const deliveryRoutes = require("./routes/delivery");
const deliveryHeadAuthRoutes = require("./routes/deliveryHeadAuth");
const deliveryHeadRoutes = require("./routes/deliveryHead");

// Safe defaults for dev env
if (!process.env.PORT) process.env.PORT = 3000;
if (!process.env.MONGO_URI) process.env.MONGO_URI = "mongodb://localhost:27017/quickkart";
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = "dev_jwt_secret_change_me";

const app = express();
app.use(cors());
app.use(express.json());
// Enable gzip compression to reduce payload size
app.use(compression());
// Trust proxy for proper caching/headers in some hosts
app.set("trust proxy", 1);

// Try to connect to MongoDB, but don't crash if it's not available
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.log("⚠️ MongoDB connection failed:", err.message);
    console.log("⚠️ App will continue running without database (some features may not work)");
  });

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/shop", shopRoutes);
app.use("/admin", adminRoutes);
app.use("/stylist", aiStylistRoutes);
app.use("/delivery", deliveryRoutes);
app.use("/delivery-head/auth", deliveryHeadAuthRoutes);
app.use("/delivery-head", deliveryHeadRoutes);

// Health check / root route for Render
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "quickkart-backend" });
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});

console.log("QuickKart backend starting...");
