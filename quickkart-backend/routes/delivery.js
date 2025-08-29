const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const DeliveryAgent = require("../models/DeliveryAgent");
const { authenticateDelivery, authenticateAdmin } = require("../middlewares/auth");

function getDistanceKm(a, b) {
  if (!a || !b || typeof a.lat !== 'number' || typeof a.lng !== 'number' || typeof b.lat !== 'number' || typeof b.lng !== 'number') return Number.MAX_VALUE;
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const h = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}

// List available orders within radius (pending/confirmed without assignment)
router.get('/orders/available', authenticateDelivery, async (req, res) => {
  try {
    const radius = Math.max(1, Math.min(50, Number(req.query.radius) || 10));
    const orders = await Order.find({ assignedTo: { $exists: false }, status: { $in: ['pending', 'confirmed'] } });
    const nearby = orders.filter(o => getDistanceKm(req.query, o.shippingDetails?.location || o.user?.location || {}) <= radius);
    res.json(nearby);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Take an order
router.post('/orders/:orderId/take', authenticateDelivery, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, assignedTo: { $exists: false } });
    if (!order) return res.status(404).json({ error: 'Order not available' });
    order.assignedTo = req.delivery.id;
    order.status = 'out_for_delivery';
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Confirm delivery using OTP entered by user
router.post('/orders/:orderId/confirm', authenticateDelivery, async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ error: "Delivery OTP is required" });
    }

    const order = await Order.findOne({ _id: req.params.orderId, assignedTo: req.delivery.id });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.deliveryOTP !== otp) {
      return res.status(400).json({ error: 'Invalid delivery OTP' });
    }

    // Check if OTP is expired
    if (order.otpExpiresAt && new Date() > order.otpExpiresAt) {
      return res.status(400).json({ error: 'Delivery OTP has expired' });
    }

    order.status = 'delivered';
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Head endpoints: list agents and unassigned orders, assign to agent
router.get('/head/agents', authenticateAdmin, async (req, res) => {
  try {
    const agents = await DeliveryAgent.find({}).select('agentId name phone email');
    res.json(agents);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/head/unassigned-orders', authenticateAdmin, async (req, res) => {
  try {
    const orders = await Order.find({ assignedTo: { $exists: false }, status: { $in: ['pending', 'confirmed'] } });
    res.json(orders);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/head/assign', authenticateAdmin, async (req, res) => {
  try {
    const { orderId, agentId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const agent = await DeliveryAgent.findById(agentId);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    order.assignedTo = agent._id;
    order.status = 'out_for_delivery';
    await order.save();
    res.json({ success: true, order, agent: { id: agent._id, name: agent.name, phone: agent.phone } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;


