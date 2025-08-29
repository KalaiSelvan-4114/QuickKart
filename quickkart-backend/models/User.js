const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  pincode: String,
  isDefault: { type: Boolean, default: false }
});

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: { type: Number, default: 1 },
  selectedSize: { type: String, default: null },
  selectedColor: { type: String, default: null },
  notes: { type: String, default: null }
});

const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  ageCategory: { type: String, enum: ["kid", "teen", "adult", "senior"] },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  skinTone: { type: String, enum: ["Fair", "Medium", "Dusky", "Dark"] },
  bodySize: { type: String, enum: ["S", "M", "L", "XL", "XXL"] },
  shoeSize: String,
  email: { type: String, unique: true },
  password: String,
  location: { type: { lat: Number, lng: Number } },
  addresses: [addressSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  cart: [cartItemSchema]
});

module.exports = mongoose.model("User", userSchema);
