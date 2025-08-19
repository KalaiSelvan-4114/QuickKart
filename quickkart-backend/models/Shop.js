const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
  name: String,
  location: { type: { lat: Number, lng: Number } },
  address: String,
  license: String,
  aadhaar: String,
  gst: String,
  approved: { type: Boolean, default: false },
  ownerEmail: { type: String, unique: true },
  password: String,
  stocks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  upiVpa: { type: String, default: "" },
  upiName: { type: String, default: "" }
});

module.exports = mongoose.model("Shop", shopSchema);
