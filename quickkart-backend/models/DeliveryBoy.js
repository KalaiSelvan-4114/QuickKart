const mongoose = require("mongoose");

const deliveryBoySchema = new mongoose.Schema({
  boyId: { type: String, required: true, unique: true }, // Custom ID like "DB001"
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  aadhar: { type: String, required: true, unique: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true }
  },
  isAvailable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  assignedOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  totalDeliveries: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
deliveryBoySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("DeliveryBoy", deliveryBoySchema);
