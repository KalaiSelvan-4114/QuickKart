const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  price: Number,
  category: String,
  tags: [String],
  color: String,
  sizes: [String], // Changed from size to sizes array
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
