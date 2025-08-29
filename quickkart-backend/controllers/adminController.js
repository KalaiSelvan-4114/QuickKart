const Shop = require("../models/Shop");
const DeliveryHead = require("../models/DeliveryHead");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Admin login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hardcoded admin credentials for demo
    const adminEmail = "admin@quickkart.com";
    const adminPassword = "admin123";

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: "admin", email: adminEmail, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      admin: { email: adminEmail }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get pending shops
exports.getPendingShops = async (req, res) => {
  try {
    const shops = await Shop.find({ approved: false }).sort({ createdAt: -1 });
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve shop
exports.approveShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const shop = await Shop.findByIdAndUpdate(
      shopId,
      { approved: true },
      { new: true }
    );

    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }

    res.json({ 
      success: true, 
      message: "Shop approved successfully",
      shop 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reject shop
exports.rejectShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const shop = await Shop.findByIdAndDelete(shopId);

    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }

    res.json({ 
      success: true, 
      message: "Shop rejected and removed" 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get pending delivery heads
exports.getPendingDeliveryHeads = async (req, res) => {
  try {
    const deliveryHeads = await DeliveryHead.find({ isApproved: false }).sort({ createdAt: -1 });
    res.json(deliveryHeads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Approve delivery head
exports.approveDeliveryHead = async (req, res) => {
  try {
    const { deliveryHeadId } = req.params;
    const deliveryHead = await DeliveryHead.findByIdAndUpdate(
      deliveryHeadId,
      { isApproved: true },
      { new: true }
    );

    if (!deliveryHead) {
      return res.status(404).json({ error: "Delivery Head not found" });
    }

    res.json({ 
      success: true, 
      message: "Delivery Head approved successfully",
      deliveryHead 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reject delivery head
exports.rejectDeliveryHead = async (req, res) => {
  try {
    const { deliveryHeadId } = req.params;
    const deliveryHead = await DeliveryHead.findByIdAndDelete(deliveryHeadId);

    if (!deliveryHead) {
      return res.status(404).json({ error: "Delivery Head not found" });
    }

    res.json({ 
      success: true, 
      message: "Delivery Head rejected and removed" 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all orders for admin dashboard
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'title image price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    // Calculate total sales
    const totalSales = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'out_for_delivery'] } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      totalSales: totalSales[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    console.log("🔍 Admin getOrderStats called");
    
    // Get order counts by status
    const orderCounts = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Get total revenue
    const revenueStats = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$total" }, totalOrders: { $sum: 1 } } }
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "firstName lastName email")
      .populate("items.product", "title image price category");

    console.log("✅ Admin getOrderStats - Orders found:", recentOrders.length);

    const stats = {
      orderCounts: {
        total: revenueStats[0]?.totalOrders || 0,
        pending: orderCounts.find(c => c._id === 'pending')?.count || 0,
        confirmed: orderCounts.find(c => c._id === 'confirmed')?.count || 0,
        delivered: orderCounts.find(c => c._id === 'delivered')?.count || 0,
        cancelled: orderCounts.find(c => c._id === 'cancelled')?.count || 0
      },
      revenue: {
        total: revenueStats[0]?.totalRevenue || 0,
        average: revenueStats[0]?.totalOrders > 0 ? revenueStats[0].totalRevenue / revenueStats[0].totalOrders : 0
      },
      recentOrders
    };

    console.log("✅ Admin getOrderStats - Stats:", stats);
    res.json(stats);
  } catch (err) {
    console.error("❌ Admin getOrderStats error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Mark order as paid to shop (admin settles with shop)
exports.settleOrderWithShop = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.settlement.paidToShop) {
      return res.status(400).json({ error: "Order already settled with shop" });
    }

    order.settlement.paidToShop = true;
    order.settlement.settledAt = new Date();
    await order.save();

    res.json({ 
      success: true, 
      message: "Order settled with shop successfully",
      order 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get payout summary
exports.getPayoutSummary = async (req, res) => {
  try {
    // Get pending payouts to shops
    const pendingPayouts = await Order.aggregate([
      { 
        $match: { 
          status: { $in: ['delivered'] },
          'settlement.paidToShop': { $ne: true }
        } 
      },
      {
        $group: {
          _id: "$items.product.shop",
          totalAmount: { $sum: "$total" },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    // Get total pending amount
    const totalPending = pendingPayouts.reduce((sum, payout) => sum + payout.totalAmount, 0);

    res.json({
      pendingPayouts,
      totalPending,
      totalShops: pendingPayouts.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};