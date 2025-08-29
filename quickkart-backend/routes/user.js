const express = require("express");
const {
  getProfile,
  updateProfile,
  getNearbyStocks,
  getAllProducts,
  getProductById,
  getNearbyShops,
  getAllShops,
  getShop,
  getShopProducts,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getOrders,
  createOrder,
  getUserOrders,
  getOrderById,
  getShopUpi,
  cancelOrder
} = require("../controllers/userController");

const { authenticateUser } = require("../middlewares/auth");
const router = express.Router();

// Profile
router.get("/profile", authenticateUser, getProfile);
router.put("/profile", authenticateUser, updateProfile);

// Products (public access)
router.get("/products", getAllProducts);
router.get("/products/:productId", getProductById);
router.get("/stocks", authenticateUser, getNearbyStocks);

// Shops
router.get("/shops", authenticateUser, getAllShops);
router.get("/shops/nearby", authenticateUser, getNearbyShops);
router.get("/shops/:shopId", authenticateUser, getShop);
router.get("/shops/:shopId/products", authenticateUser, getShopProducts);
router.get("/shops/:shopId/upi", authenticateUser, getShopUpi);

// Debug endpoint (remove in production)
router.get("/debug/shops", authenticateUser, async (req, res) => {
  try {
    const Shop = require("../models/Shop");
    const allShops = await Shop.find({});
    res.json({
      total: allShops.length,
      shops: allShops.map(shop => ({
        id: shop._id,
        name: shop.name,
        approved: shop.approved,
        ownerEmail: shop.ownerEmail,
        address: shop.address
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test endpoint (remove in production)
router.get("/test/shops", async (req, res) => {
  try {
    const Shop = require("../models/Shop");
    const allShops = await Shop.find({});
    res.json({
      total: allShops.length,
      shops: allShops.map(shop => ({
        id: shop._id,
        name: shop.name,
        approved: shop.approved,
        ownerEmail: shop.ownerEmail,
        address: shop.address
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Addresses
router.get("/addresses", authenticateUser, getAddresses);
router.post("/addresses", authenticateUser, addAddress);
router.put("/addresses/:id", authenticateUser, updateAddress);
router.delete("/addresses/:id", authenticateUser, deleteAddress);
router.put("/addresses/:id/default", authenticateUser, setDefaultAddress);

// Cart
router.get("/cart", authenticateUser, getCart);
router.post("/cart", authenticateUser, addToCart);
router.put("/cart/:itemId", authenticateUser, updateCartItem);
router.delete("/cart/:id", authenticateUser, removeFromCart);

// Wishlist
router.get("/wishlist", authenticateUser, getWishlist);
router.post("/wishlist", authenticateUser, addToWishlist);
router.delete("/wishlist/:id", authenticateUser, removeFromWishlist);

// Orders
router.post("/orders", authenticateUser, createOrder);
router.get("/orders", authenticateUser, getUserOrders);
router.get("/orders/:orderId", authenticateUser, getOrderById);
router.post("/orders/:orderId/cancel", authenticateUser, cancelOrder);

module.exports = router;
