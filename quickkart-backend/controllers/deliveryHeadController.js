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
      status: 'notify_delivery'
    })
    .populate('user', 'firstName lastName phone')
    .populate('items.product', 'title image')
    .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get assigned orders that are out for delivery
exports.getAssignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
      assignedTo: { $exists: true },
      status: 'out_for_delivery'
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

    // Check if order exists and is unassigned (must be notified for delivery)
    const order = await Order.findOne({ 
      _id: orderId, 
      assignedTo: { $exists: false },
      status: 'notify_delivery'
    });
    
    if (!order) {
      return res.status(404).json({ error: "Order not found or not ready for assignment" });
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

    // Ensure QR token exists for delivery confirmation
    if (!order.qrToken) {
      const randomPart = Math.random().toString(36).slice(2, 10);
      const timePart = Date.now().toString(36).slice(-4);
      order.qrToken = `${randomPart}${timePart}`;
      order.qrGeneratedAt = new Date();
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

// Public: Confirm delivery via DeliveryBoy ID, Order ID, and QR token
exports.confirmDeliveryByQr = async (req, res) => {
  try {
    const { orderId, boyId, qrToken } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'out_for_delivery') {
      return res.status(400).json({ error: `Order is not out for delivery (current: ${order.status})` });
    }
    if (!order.qrToken) {
      return res.status(400).json({ error: 'QR token not set for this order' });
    }
    // Validate assigned delivery boy
    if (!order.assignedTo) {
      return res.status(400).json({ error: 'No delivery boy assigned to this order' });
    }
    const deliveryBoy = await DeliveryBoy.findOne({ boyId, _id: order.assignedTo });
    if (!deliveryBoy) {
      return res.status(400).json({ error: 'Delivery boy mismatch for this order' });
    }
    // Validate QR token match
    if (String(qrToken) !== String(order.qrToken)) {
      return res.status(400).json({ error: 'Invalid QR token' });
    }

    // Mark delivered
    order.status = 'delivered';
    // Optionally clear QR to prevent reuse
    // order.qrToken = undefined; order.qrGeneratedAt = undefined;
    await order.save();

    // Free delivery boy
    if (order.assignedTo) {
      const dBoy = await DeliveryBoy.findById(order.assignedTo);
      if (dboy) {
        dBoy.isAvailable = true;
        dBoy.totalDeliveries = (dBoy.totalDeliveries || 0) + 1;
        dBoy.assignedOrders = (dBoy.assignedOrders || []).filter(id => String(id) !== String(order._id));
        await dBoy.save();
      }
    }

    res.json({ success: true, message: 'Delivery confirmed', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get delivery head dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalBoys = await DeliveryBoy.countDocuments({ isActive: true });
    const availableBoys = await DeliveryBoy.countDocuments({ isActive: true, isAvailable: true });
    const totalNotifyOrders = await Order.countDocuments({ status: 'notify_delivery' });
    const unassignedNotifyOrders = await Order.countDocuments({ status: 'notify_delivery', assignedTo: { $exists: false } });
    const outForDelivery = await Order.countDocuments({ status: 'out_for_delivery' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

    res.json({
      totalBoys,
      availableBoys,
      totalOrders: totalNotifyOrders,
      assignedOrders: outForDelivery,
      deliveredOrders,
      unassignedOrders: unassignedNotifyOrders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
