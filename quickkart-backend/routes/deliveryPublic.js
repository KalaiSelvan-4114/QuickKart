const express = require("express");
const router = express.Router();
const { confirmDeliveryByQr } = require("../controllers/deliveryHeadController");

// Public endpoint for delivery agents to confirm delivery using boyId + orderId + qrToken
router.post('/confirm', confirmDeliveryByQr);

module.exports = router;


