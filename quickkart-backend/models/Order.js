const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  selectedSize: { type: String, default: null },
  selectedColor: { type: String, default: null }
});

const shippingDetailsSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: "India" }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  shippingDetails: shippingDetailsSchema,
  paymentMethod: { 
    type: String, 
    enum: ["cod", "online"], 
    default: "cod" 
  },
  orderNotes: { type: String, default: "" },
  subtotal: { type: Number, required: true, min: 0 },
  deliveryFee: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "notify_delivery", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"], 
    default: "pending" 
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryBoy" },
  qrToken: { type: String },
  qrGeneratedAt: { type: Date },
  orderDate: { type: Date, default: Date.now },
  estimatedDelivery: { type: Date },
  trackingId: String,
  deliveryNotification: Date,
  settlement: {
    method: { type: String, enum: ['cod', 'online'], default: 'cod' },
    paidToAdmin: { type: Boolean, default: false },
    paidToShop: { type: Boolean, default: false },
    paidAmount: { type: Number, default: 0 },
    settledAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate estimated delivery (2-3 business days from order date)
orderSchema.pre('save', function(next) {
  if (!this.estimatedDelivery) {
    const deliveryDate = new Date(this.orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days from order
    this.estimatedDelivery = deliveryDate;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
