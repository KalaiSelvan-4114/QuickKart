const express = require("express");
const { getRecommendations } = require("../controllers/aiStylistController");
const { authenticateUser } = require("../middlewares/auth");

const router = express.Router();

// AI stylist recommendation endpoint
router.post("/recommend", authenticateUser, getRecommendations);

module.exports = router;
