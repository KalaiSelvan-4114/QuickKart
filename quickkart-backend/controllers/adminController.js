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
      .populate('shop', 'name ownerEmail')
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

// Get order statistics for admin
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const outForDeliveryOrders = await Order.countDocuments({ status: 'out_for_delivery' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Calculate revenue
    const revenueStats = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'out_for_delivery'] } } },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: "$total" },
          avgOrderValue: { $avg: "$total" }
        } 
      }
    ]);

    // Monthly revenue for current year
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await Order.aggregate([
      { 
        $match: { 
          status: { $in: ['delivered', 'out_for_delivery'] },
          createdAt: { $gte: new Date(currentYear, 0, 1) }
        } 
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$total" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      orderCounts: {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        outForDelivery: outForDeliveryOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders
      },
      revenue: {
        total: revenueStats[0]?.totalRevenue || 0,
        average: revenueStats[0]?.avgOrderValue || 0
      },
      monthlyRevenue
    });
  } catch (err) {
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

// Get payout summary for admin
exports.getPayoutSummary = async (req, res) => {
  try {
    const pendingPayouts = await Order.aggregate([
      { 
        $match: { 
          status: { $in: ['delivered', 'out_for_delivery'] },
          'settlement.paidToShop': false
        } 
      },
      {
        $group: {
          _id: "$shop",
          totalAmount: { $sum: "$total" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "shops",
          localField: "_id",
          foreignField: "_id",
          as: "shopDetails"
        }
      },
      { $unwind: "$shopDetails" }
    ]);

    const totalPendingAmount = pendingPayouts.reduce((sum, item) => sum + item.totalAmount, 0);

    res.json({
      pendingPayouts,
      totalPendingAmount,
      totalPendingOrders: pendingPayouts.reduce((sum, item) => sum + item.orderCount, 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};