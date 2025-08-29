const Shop = require("../models/Shop");
const Product = require("../models/Product");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Shop registration
exports.register = async (req, res) => {
  try {
    const { name, ownerEmail, ownerPhone, password, address, city, state, pincode } = req.body;

    // Check if shop already exists
    const existingShop = await Shop.findOne({ ownerEmail });
    if (existingShop) {
      return res.status(400).json({ error: "Shop with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new shop
    const shop = new Shop({
      name,
      ownerEmail,
      ownerPhone,
      password: hashedPassword,
      address,
      city,
      state,
      pincode
    });

    await shop.save();

    res.status(201).json({ 
      success: true, 
      message: "Shop registered successfully. Please wait for admin approval." 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Shop login
exports.login = async (req, res) => {
  try {
    const { ownerEmail, password } = req.body;

    // Find shop by email
    const shop = await Shop.findOne({ ownerEmail });
    if (!shop) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check if approved
    if (!shop.approved) {
      return res.status(400).json({ error: "Shop not yet approved by admin" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, shop.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: shop._id, ownerEmail: shop.ownerEmail },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      shop: {
        id: shop._id,
        name: shop.name,
        ownerEmail: shop.ownerEmail
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get shop profile
exports.getProfile = async (req, res) => {
  try {
    const shop = await Shop.findById(req.shop.id).select('-password');
    res.json(shop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add product
exports.addProduct = async (req, res) => {
  try {
    const { title, description, price, category, sizes, colors, images } = req.body;

    const product = new Product({
      shop: req.shop.id,
      title,
      description,
      price,
      category,
      sizes,
      colors,
      images
    });

    await product.save();

    res.status(201).json({ 
      success: true, 
      message: "Product added successfully",
      product 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get shop products
exports.getShopProducts = async (req, res) => {
  try {
    const products = await Product.find({ shop: req.shop.id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: productId, shop: req.shop.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ 
      success: true, 
      message: "Product updated successfully",
      product 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOneAndDelete({ 
      _id: productId, 
      shop: req.shop.id 
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ 
      success: true, 
      message: "Product deleted successfully" 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get shop orders
exports.getShopOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = { shop: req.shop.id };
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

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get shop order statistics
exports.getShopOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({ shop: req.shop.id });
    const pendingOrders = await Order.countDocuments({ shop: req.shop.id, status: 'pending' });
    const confirmedOrders = await Order.countDocuments({ shop: req.shop.id, status: 'confirmed' });
    const processingOrders = await Order.countDocuments({ shop: req.shop.id, status: 'processing' });
    const shippedOrders = await Order.countDocuments({ shop: req.shop.id, status: 'shipped' });
    const outForDeliveryOrders = await Order.countDocuments({ shop: req.shop.id, status: 'out_for_delivery' });
    const deliveredOrders = await Order.countDocuments({ shop: req.shop.id, status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ shop: req.shop.id, status: 'cancelled' });

    // Calculate revenue
    const revenueStats = await Order.aggregate([
      { 
        $match: { 
          shop: req.shop.id,
          status: { $in: ['delivered', 'out_for_delivery'] } 
        } 
      },
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
          shop: req.shop.id,
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

    // Pending payouts
    const pendingPayouts = await Order.aggregate([
      { 
        $match: { 
          shop: req.shop.id,
          status: { $in: ['delivered', 'out_for_delivery'] },
          'settlement.paidToShop': false
        } 
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$total" },
          orderCount: { $sum: 1 }
        }
      }
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
      monthlyRevenue,
      pendingPayouts: {
        totalAmount: pendingPayouts[0]?.totalAmount || 0,
        orderCount: pendingPayouts[0]?.orderCount || 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, shop: req.shop.id },
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ 
      success: true, 
      message: "Order status updated successfully",
      order 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
