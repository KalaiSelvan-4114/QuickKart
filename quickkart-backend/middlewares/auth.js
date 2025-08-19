const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Shop = require("../models/Shop");

/**
 * Middleware to authenticate a normal User
 */
exports.authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Token required" });

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    if (!token) return res.status(401).json({ error: "Token required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = { id: user._id, email: user.email };
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Middleware to authenticate a Shop Owner
 */
exports.authenticateShop = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Token required" });

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    if (!token) return res.status(401).json({ error: "Token required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const shop = await Shop.findById(decoded.id);

    if (!shop) return res.status(401).json({ error: "Shop not found" });
    if (!shop.approved) return res.status(403).json({ error: "Shop not approved by admin" });

    req.shop = { id: shop._id, ownerEmail: shop.ownerEmail };
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Middleware to authenticate an Admin
 * For simplicity admin check is done via JWT claim `isAdmin`
 */
exports.authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Token required" });

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    if (!token) return res.status(401).json({ error: "Token required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Simple admin check from token payload
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: "You are not authorized as Admin" });
    }

    req.admin = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
