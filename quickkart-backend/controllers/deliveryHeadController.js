const DeliveryHead = require("../models/DeliveryHead");
const DeliveryBoy = require("../models/DeliveryBoy");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register new delivery head
exports.register = async (req, res) => {
  try {
    const { username, password, name, email, phone } = req.body;

    // Check if user already exists
    const existingUser = await DeliveryHead.findOne({ 
      $or: [{ username }, { email }] 
    });
    if (existingUser) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new delivery head
    const deliveryHead = new DeliveryHead({
      username,
      password: hashedPassword,
      name,
      email,
      phone
    });

    await deliveryHead.save();

    res.status(201).json({ 
      success: true, 
      message: "Delivery Head registered successfully. Please wait for admin approval." 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login delivery head
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const deliveryHead = await DeliveryHead.findOne({ username });
    if (!deliveryHead) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check if approved
    if (!deliveryHead.isApproved) {
      return res.status(400).json({ error: "Account not yet approved by admin" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, deliveryHead.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: deliveryHead._id, type: "delivery-head" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      deliveryHead: {
        id: deliveryHead._id,
        username: deliveryHead.username,
        name: deliveryHead.name,
        email: deliveryHead.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get delivery head profile
exports.getProfile = async (req, res) => {
  try {
    const deliveryHead = await DeliveryHead.findById(req.deliveryHead.id).select('-password');
    res.json(deliveryHead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add new delivery boy
exports.addDeliveryBoy = async (req, res) => {
  try {
    const { boyId, name, phone, email, aadhar, location } = req.body;

    // Check if delivery boy already exists
    const existingBoy = await DeliveryBoy.findOne({ 
      $or: [{ boyId }, { email }, { aadhar }] 
    });
    if (existingBoy) {
      return res.status(400).json({ error: "Boy ID, email, or Aadhar already exists" });
    }

    // Create new delivery boy
    const deliveryBoy = new DeliveryBoy({
      boyId,
      name,
      phone,
      email,
      aadhar,
      location
    });

    await deliveryBoy.save();

    res.status(201).json({ 
      success: true, 
      message: "Delivery boy added successfully",
      deliveryBoy 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all delivery boys
exports.getDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await DeliveryBoy.find({ isActive: true })
      .select('-aadhar')
      .sort({ createdAt: -1 });
    res.json(deliveryBoys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update delivery boy
exports.updateDeliveryBoy = async (req, res) => {
  try {
    const { boyId } = req.params;
    const updateData = req.body;

    const deliveryBoy = await DeliveryBoy.findOneAndUpdate(
      { boyId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!deliveryBoy) {
      return res.status(404).json({ error: "Delivery boy not found" });
    }

    res.json({ 
      success: true, 
      message: "Delivery boy updated successfully",
      deliveryBoy 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete delivery boy (soft delete)
exports.deleteDeliveryBoy = async (req, res) => {
  try {
    const { boyId } = req.params;

    const deliveryBoy = await DeliveryBoy.findOneAndUpdate(
      { boyId },
      { isActive: false },
      { new: true }
    );

    if (!deliveryBoy) {
      return res.status(404).json({ error: "Delivery boy not found" });
    }

    res.json({ 
      success: true, 
      message: "Delivery boy removed successfully" 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get unassigned orders
exports.getUnassignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
      assignedTo: { $exists: false }, 
      status: { $in: ['pending', 'confirmed'] } 
    })
    .populate('user', 'firstName lastName phone')
    .populate('items.product', 'title image')
    .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign order to delivery boy
exports.assignOrder = async (req, res) => {
  try {
    const { orderId, boyId } = req.body;

    // Check if order exists and is unassigned
    const order = await Order.findOne({ 
      _id: orderId, 
      assignedTo: { $exists: false },
      status: { $in: ['pending', 'confirmed'] }
    });
    
    if (!order) {
      return res.status(404).json({ error: "Order not found or already assigned" });
    }

    // Check if delivery boy exists and is available
    const deliveryBoy = await DeliveryBoy.findOne({ 
      boyId, 
      isActive: true, 
      isAvailable: true 
    });
    
    if (!deliveryBoy) {
      return res.status(404).json({ error: "Delivery boy not found or not available" });
    }

    // Assign order
    order.assignedTo = deliveryBoy._id;
    order.status = 'out_for_delivery';
    await order.save();

    // Update delivery boy
    deliveryBoy.assignedOrders.push(order._id);
    deliveryBoy.isAvailable = false;
    await deliveryBoy.save();

    res.json({ 
      success: true, 
      message: "Order assigned successfully",
      order,
      deliveryBoy: {
        boyId: deliveryBoy.boyId,
        name: deliveryBoy.name,
        phone: deliveryBoy.phone
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get delivery head dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalBoys = await DeliveryBoy.countDocuments({ isActive: true });
    const availableBoys = await DeliveryBoy.countDocuments({ isActive: true, isAvailable: true });
    const totalOrders = await Order.countDocuments({ status: { $in: ['pending', 'confirmed'] } });
    const assignedOrders = await Order.countDocuments({ assignedTo: { $exists: true } });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

    res.json({
      totalBoys,
      availableBoys,
      totalOrders,
      assignedOrders,
      deliveredOrders,
      unassignedOrders: totalOrders - assignedOrders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
