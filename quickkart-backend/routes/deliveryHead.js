const express = require("express");
const router = express.Router();
const { authenticateDeliveryHead } = require("../middlewares/auth");
const {
  getProfile,
  addDeliveryBoy,
  getDeliveryBoys,
  updateDeliveryBoy,
  deleteDeliveryBoy,
  getUnassignedOrders,
  assignOrder,
  getDashboardStats
} = require("../controllers/deliveryHeadController");

// Protected routes (require authentication)
router.use(authenticateDeliveryHead);

// Profile
router.get('/profile', getProfile);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Delivery Boys management
router.post('/boys', addDeliveryBoy);
router.get('/boys', getDeliveryBoys);
router.put('/boys/:boyId', updateDeliveryBoy);
router.delete('/boys/:boyId', deleteDeliveryBoy);

// Order management
router.get('/orders/unassigned', getUnassignedOrders);
router.post('/orders/assign', assignOrder);

module.exports = router;
