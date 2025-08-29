const mongoose = require("mongoose");

const deliveryHeadSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  aadhar: { type: String, required: true, unique: true },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("DeliveryHead", deliveryHeadSchema);
