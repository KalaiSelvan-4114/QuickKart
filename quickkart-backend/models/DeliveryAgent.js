const mongoose = require("mongoose");

const deliveryAgentSchema = new mongoose.Schema({
  agentId: { type: String, required: true, unique: true },
  aadhar: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: { lat: Number, lng: Number } },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("DeliveryAgent", deliveryAgentSchema);


