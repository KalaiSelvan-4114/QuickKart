const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/deliveryHeadController");

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);

module.exports = router;
