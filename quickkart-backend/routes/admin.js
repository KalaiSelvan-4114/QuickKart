const express = require("express");
const {
  approveShop,
  listPendingShops,
  declineShop
} = require("../controllers/adminController");

const { authenticateAdmin } = require("../middlewares/auth");
const router = express.Router();

// Approve shop
router.put("/approve/:id", authenticateAdmin, approveShop);

// List all pending shops
router.get("/pending", authenticateAdmin, listPendingShops);

// Decline shop
router.delete("/decline/:id", authenticateAdmin, declineShop);

module.exports = router;
