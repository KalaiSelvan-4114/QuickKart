const express = require("express");
const {
  addStock,
  editStock,
  deleteStock,
  getStocks,
  confirmOrder,
  deliverOrder,
  getOrders,
  notifyDelivery
} = require("../controllers/shopController");

const { authenticateShop } = require("../middlewares/auth");
const Shop = require("../models/Shop");
const bcrypt = require("bcryptjs");
const router = express.Router();

// Test endpoint to create a test shop (remove in production)
router.post("/create-test-shop", async (req, res) => {
  try {
    const hash = await bcrypt.hash("test123", 10);
    const testShop = new Shop({
      name: "Test Shop",
      ownerEmail: "test@shop.com",
      password: hash,
      approved: true,
      address: "Test Address"
    });
    await testShop.save();
    res.json({ success: true, message: "Test shop created", shopId: testShop._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test endpoint to verify authentication
router.get("/test-auth", authenticateShop, (req, res) => {
  res.json({ 
    message: "Shop authentication working!", 
    shopId: req.shop.id,
    ownerEmail: req.shop.ownerEmail
  });
});

// Stock management
router.get("/stocks", authenticateShop, getStocks);
router.post("/stocks", authenticateShop, addStock);
router.put("/stocks/:id", authenticateShop, editStock);
router.delete("/stocks/:id", authenticateShop, deleteStock);

// Order management
router.get("/orders", authenticateShop, getOrders);
router.put("/orders/:id/confirm", authenticateShop, confirmOrder);
router.put("/orders/:id/deliver", authenticateShop, deliverOrder);
router.put("/orders/:id/notify-delivery", authenticateShop, notifyDelivery);

module.exports = router;
