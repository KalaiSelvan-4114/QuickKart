const express = require("express");
const router = express.Router();
const { authenticateShop } = require("../middlewares/auth");
const {
  register,
  login,
  getProfile,
  updateProfile,
  addProduct,
  getShopProducts,
  updateProduct,
  deleteProduct,
  getShopOrders,
  getShopOrderStats,
  updateOrderStatus
} = require("../controllers/shopController");

// Public routes - these are now handled in /auth routes
// router.post('/register', register);
// router.post('/login', login);

// Debug endpoint to check authentication
router.get('/debug', authenticateShop, (req, res) => {
  res.json({
    message: "Shop authentication working",
    shopId: req.shop.id,
    shopEmail: req.shop.email
  });
});

// Protected routes
router.use(authenticateShop);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Product management
router.post('/products', addProduct);
router.get('/products', getShopProducts);
router.get('/stocks', getShopProducts); // Alias for stocks
router.put('/products/:productId', updateProduct);
router.delete('/products/:productId', deleteProduct);

// Order management
router.get('/orders', getShopOrders);
router.get('/orders/stats', getShopOrderStats);
router.put('/orders/:orderId/status', updateOrderStatus);

module.exports = router;
