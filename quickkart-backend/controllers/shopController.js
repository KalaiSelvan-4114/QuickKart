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

// Update shop profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      ownerEmail,
      ownerPhone,
      address,
      city,
      state,
      pincode,
      gst,
      upiVpa,
      upiName,
      shopImage,
      description
    } = req.body;

    const shop = await Shop.findByIdAndUpdate(
      req.shop.id,
      {
        name,
        ownerEmail,
        ownerPhone,
        address,
        city,
        state,
        pincode,
        gst,
        upiVpa,
        upiName,
        shopImage,
        description
      },
      { new: true, runValidators: true }
    );

    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      shop
    });
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
    const shopId = req.shop.id;
    const { page = 1, limit = 10, status } = req.query;

    console.log("🔍 Shop Orders Debug:");
    console.log("Shop ID:", shopId);
    console.log("Query params:", { page, limit, status });

    // First, get all products from this shop
    const shopProducts = await Product.find({ shop: shopId }).select('_id');
    const shopProductIds = shopProducts.map(p => p._id);
    
    console.log("Shop product IDs:", shopProductIds);

    // Build query to find orders that contain products from this shop
    const query = {
      "items.product": { $in: shopProductIds }
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    console.log("Query:", JSON.stringify(query, null, 2));

    const skip = (page - 1) * limit;
    
    // First, let's check if there are any orders at all
    const totalOrdersInDB = await Order.countDocuments({});
    console.log("Total orders in DB:", totalOrdersInDB);

    // Check if there are any orders with products from this shop
    const ordersWithShopProducts = await Order.countDocuments(query);
    console.log("Orders with shop products:", ordersWithShopProducts);

    // Let's also check a few sample orders to see their structure
    const sampleOrders = await Order.find({}).limit(3).populate('items.product');
    console.log("Sample orders structure:", JSON.stringify(sampleOrders.map(o => ({
      id: o._id,
      items: o.items.map(item => ({
        productId: item.product?._id,
        productShop: item.product?.shop
      }))
    })), null, 2));
    
    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate({
        path: 'items.product',
        select: 'title image price shop',
        populate: {
          path: 'shop',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log("Found orders:", orders.length);

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
    console.error("Error in getShopOrders:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get shop order stats
exports.getShopOrderStats = async (req, res) => {
  try {
    const shopId = req.shop.id;
    
    // First, get all products from this shop
    const shopProducts = await Product.find({ shop: shopId }).select('_id');
    const shopProductIds = shopProducts.map(p => p._id);
    
    // Get order counts by status
    const orderCounts = await Order.aggregate([
      { $match: { "items.product": { $in: shopProductIds } } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Get total revenue
    const revenueStats = await Order.aggregate([
      { $match: { "items.product": { $in: shopProductIds } } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" }, totalOrders: { $sum: 1 } } }
    ]);

    // Get recent orders
    const recentOrders = await Order.find({ "items.product": { $in: shopProductIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: 'items.product',
        select: 'title image price shop',
        populate: {
          path: 'shop',
          select: 'name'
        }
      })
      .populate('user', 'firstName lastName email phone');

    const stats = {
      orderCounts: {
        total: revenueStats[0]?.totalOrders || 0,
        pending: orderCounts.find(c => c._id === 'pending')?.count || 0,
        confirmed: orderCounts.find(c => c._id === 'confirmed')?.count || 0,
        notify_delivery: orderCounts.find(c => c._id === 'notify_delivery')?.count || 0,
        out_for_delivery: orderCounts.find(c => c._id === 'out_for_delivery')?.count || 0,
        delivered: orderCounts.find(c => c._id === 'delivered')?.count || 0,
        cancelled: orderCounts.find(c => c._id === 'cancelled')?.count || 0
      },
      revenue: {
        total: revenueStats[0]?.totalRevenue || 0,
        average: revenueStats[0]?.totalOrders > 0 ? revenueStats[0].totalRevenue / revenueStats[0].totalOrders : 0
      },
      recentOrders
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const shopId = req.shop.id;

    // First, get all products from this shop
    const shopProducts = await Product.find({ shop: shopId }).select('_id');
    const shopProductIds = shopProducts.map(p => p._id);

    // Find order that contains products from this shop
    const order = await Order.findOne({
      _id: orderId,
      "items.product": { $in: shopProductIds }
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update the order status
    order.status = status;
    await order.save();

    res.json({ 
      success: true, 
      message: "Order status updated successfully",
      order 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
