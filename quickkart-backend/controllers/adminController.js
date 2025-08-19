const Shop = require("../models/Shop");

/** Approve shop */
exports.approveShop = async (req, res) => {
  try {
    console.log("✅ Admin approving shop:", req.params.id);
    const shop = await Shop.findByIdAndUpdate(req.params.id, { approved: true });
    
    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }
    
    console.log("✅ Shop approved successfully:", shop.name);
    res.json({ success: true, message: "Shop approved" });
  } catch (err) {
    console.error("❌ Error approving shop:", err);
    res.status(500).json({ error: err.message });
  }
};

/** List all unapproved shops */
exports.listPendingShops = async (req, res) => {
  try {
    console.log("📋 Admin listing pending shops");
    const shops = await Shop.find({ approved: false });
    console.log(`✅ Found ${shops.length} pending shops`);
    res.json(shops);
  } catch (err) {
    console.error("❌ Error listing pending shops:", err);
    res.status(500).json({ error: err.message });
  }
};

/** Decline shop (remove from pending) */
exports.declineShop = async (req, res) => {
  try {
    console.log("🛑 Admin declining shop:", req.params.id);
    const shop = await Shop.findByIdAndDelete(req.params.id);

    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }

    console.log("🗑️ Shop declined and removed:", shop.name);
    res.json({ success: true, message: "Shop declined and removed" });
  } catch (err) {
    console.error("❌ Error declining shop:", err);
    res.status(500).json({ error: err.message });
  }
};