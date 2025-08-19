const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Shop = require("../models/Shop");

/** ---------------------------
 *  USER SIGNUP
 *  -------------------------- */
exports.userSignup = async (req, res) => {
  try {
    const { email, password, name, age, ageCategory, gender, skinTone, bodySize, shoeSize, location } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hash, name, age, ageCategory, gender, skinTone, bodySize, shoeSize, location });
    await user.save();

    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** ---------------------------
 *  USER LOGIN
 *  -------------------------- */
exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Incorrect password" });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** ---------------------------
 *  SHOP SIGNUP
 *  -------------------------- */
exports.shopSignup = async (req, res) => {
  try {
    const { ownerEmail, password, name, address, license, aadhaar, gst, location, upiVpa, upiName } = req.body;
    const existing = await Shop.findOne({ ownerEmail });
    if (existing) return res.status(400).json({ error: "Shop already exists" });

    const hash = await bcrypt.hash(password, 10);
    const shop = new Shop({ ownerEmail, password: hash, name, address, license, aadhaar, gst, location, upiVpa, upiName, approved: false });
    await shop.save();

    res.json({ success: true, message: "Shop registered - pending admin approval" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** ---------------------------
 *  SHOP LOGIN
 *  -------------------------- */
exports.shopLogin = async (req, res) => {
  try {
    const { ownerEmail, password } = req.body;
    const shop = await Shop.findOne({ ownerEmail });
    if (!shop) return res.status(400).json({ error: "Shop not found" });

    const valid = await bcrypt.compare(password, shop.password);
    if (!valid) return res.status(401).json({ error: "Incorrect password" });

    if (!shop.approved) return res.status(403).json({ error: "Shop is not approved yet" });

    const token = jwt.sign({ id: shop._id, ownerEmail: shop.ownerEmail }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** ---------------------------
 *  ADMIN LOGIN (Simple)
 *  -------------------------- */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Admin login attempt:", email);
    
    // Hardcoded admin credentials — change to DB-based if needed
    if (email === "admin@quickkart.com" && password === "admin123") {
      const token = jwt.sign({ 
        id: "admin", 
        email, 
        isAdmin: true 
      }, process.env.JWT_SECRET);
      
      console.log("✅ Admin login successful:", email);
      return res.json({ token });
    }
    
    console.log("❌ Admin login failed: Invalid credentials");
    res.status(401).json({ error: "Invalid admin credentials" });
  } catch (err) {
    console.error("❌ Admin login error:", err);
    res.status(500).json({ error: err.message });
  }
};
