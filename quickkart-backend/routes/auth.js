const express = require("express");
const {
  userSignup,
  userLogin,
  shopSignup,
  shopLogin,
  adminLogin,
  deliverySignup,
  deliveryLogin
} = require("../controllers/authController");

const router = express.Router();

// User Auth
router.post("/user/signup", userSignup);
router.post("/user/login", userLogin);

// Shop Auth
router.post("/shop/signup", shopSignup);
router.post("/shop/login", shopLogin);

// Admin Auth
router.post("/admin/login", adminLogin);

// Delivery Agent Auth
router.post("/delivery/signup", deliverySignup);
router.post("/delivery/login", deliveryLogin);

module.exports = router;
