const express = require("express");
const router = express.Router();
const { authenticateShop } = require("../middlewares/auth");
const {
  register,
  login,
  getProfile,
  addProduct,
  getShopProducts,
  updateProduct,
  deleteProduct,
  getShopOrders,
  getShopOrderStats,
  updateOrderStatus
} = require("../controllers/shopController");

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(authenticateShop);

// Profile
router.get('/profile', getProfile);

// Product management
router.post('/products', addProduct);
router.get('/products', getShopProducts);
router.put('/products/:productId', updateProduct);
router.delete('/products/:productId', deleteProduct);

// Order management
router.get('/orders', getShopOrders);
router.get('/orders/stats', getShopOrderStats);
router.put('/orders/:orderId/status', updateOrderStatus);

module.exports = router;
