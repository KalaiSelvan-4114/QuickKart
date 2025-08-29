const express = require("express");
const router = express.Router();
const { authenticateAdmin } = require("../middlewares/auth");
const {
  login,
  getPendingShops,
  approveShop,
  rejectShop,
  getPendingDeliveryHeads,
  approveDeliveryHead,
  rejectDeliveryHead,
  getAllOrders,
  getOrderStats,
  settleOrderWithShop,
  getPayoutSummary
} = require("../controllers/adminController");

// Public routes
router.post('/login', login);

// Protected routes
router.use(authenticateAdmin);

// Shop management
router.get('/pending-shops', getPendingShops);
router.put('/shops/:shopId/approve', approveShop);
router.delete('/shops/:shopId/reject', rejectShop);

// Delivery Head management
router.get('/pending-delivery-heads', getPendingDeliveryHeads);
router.put('/delivery-heads/:deliveryHeadId/approve', approveDeliveryHead);
router.delete('/delivery-heads/:deliveryHeadId/reject', rejectDeliveryHead);

// Order management
router.get('/orders', getAllOrders);
router.get('/orders/stats', getOrderStats);
router.put('/orders/:orderId/settle-shop', settleOrderWithShop);

// Payouts
router.get('/payouts/summary', getPayoutSummary);

module.exports = router;
