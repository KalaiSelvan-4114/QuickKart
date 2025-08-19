const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  price: Number,
  category: String,
  tags: [String],
  color: String,
  sizes: [String], // list of size labels for selection
  sizeStocks: [{
    size: String,
    quantity: { type: Number, default: 0 }
  }], // per-size inventory tracking
  totalStock: { type: Number, default: 0 }, // derived sum of sizeStocks
  gender: String,
  ageCategory: String,
  styleFit: String,
  productType: { type: String, enum: ["clothing", "footwear", "Dress", "Footwear"] }, // Added frontend values
  footwearCategory: String,
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  location: { type: { lat: Number, lng: Number } },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Product", productSchema);
