const Product = require("../models/Product");
const Shop = require("../models/Shop");
const Order = require("../models/Order");
const { uploadImage } = require("../config/firebase");

/** Get shop's stock items */
exports.getStocks = async (req, res) => {
  try {
    const products = await Product.find({ shop: req.shop.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Add new stock item */
exports.addStock = async (req, res) => {
  try {
    // Validate productType
    const validProductTypes = ["clothing", "footwear", "Dress", "Footwear"];
    if (req.body.productType && !validProductTypes.includes(req.body.productType)) {
      return res.status(400).json({ 
        error: `Invalid productType. Must be one of: ${validProductTypes.join(", ")}` 
      });
    }
    
    // Handle sizes array properly
    let sizes = [];
    if (req.body.sizes) {
      if (Array.isArray(req.body.sizes)) {
        sizes = req.body.sizes;
      } else if (typeof req.body.sizes === 'string') {
        // Handle case where sizes might be sent as JSON string
        try {
          sizes = JSON.parse(req.body.sizes);
        } catch (e) {
          sizes = [req.body.sizes];
        }
      } else {
        sizes = [req.body.sizes];
      }
    }
    
    // Get shop info for location
    const shop = await Shop.findById(req.shop.id);
    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }
    
    // Prepare product data
    const productData = {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      color: req.body.color,
      sizes: sizes,
      gender: req.body.gender,
      ageCategory: req.body.ageCategory,
      styleFit: req.body.styleFit,
      productType: req.body.productType,
      footwearCategory: req.body.footwearCategory,
      image: req.body.image, // may be undefined; will set below if file uploaded
      shop: req.shop.id
    };

    // Handle per-size stock quantities
    // Expect req.body.sizeStocks as either JSON string or object array [{ size: "M", quantity: 10 }, ...]
    let sizeStocks = [];
    if (req.body.sizeStocks) {
      try {
        sizeStocks = Array.isArray(req.body.sizeStocks) ? req.body.sizeStocks : JSON.parse(req.body.sizeStocks);
      } catch (_) {
        sizeStocks = [];
      }
    } else if (Array.isArray(sizes) && sizes.length) {
      // If not provided, default all selected sizes to 0 stock
      sizeStocks = sizes.map(sz => ({ size: sz, quantity: 0 }));
    }
    productData.sizeStocks = sizeStocks.map(s => ({ size: String(s.size), quantity: Math.max(0, parseInt(s.quantity || 0)) }));
    productData.totalStock = productData.sizeStocks.reduce((sum, s) => sum + (Number.isFinite(s.quantity) ? s.quantity : 0), 0);
    
    // Add shop location if available
    if (shop.location) {
      productData.location = shop.location;
    }
    
    // If a file is still posted (legacy/mixed clients), upload it to Firebase
    if (req.file) {
      try {
        const imageUrl = await uploadImage(req.file, 'products');
        productData.image = imageUrl;
      } catch (uploadErr) {
        return res.status(500).json({ 
          error: "Failed to upload image. Please try again.",
          details: uploadErr.message
        });
      }
    }

    // Validate required fields minimally
    const required = ["title", "price", "productType", "color", "gender", "ageCategory"];
    const missing = required.filter(k => !productData[k]);
    if (missing.length) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
    }
    
    // Validate price is a number
    if (isNaN(productData.price) || productData.price <= 0) {
      return res.status(400).json({ error: "Price must be a positive number" });
    }
    
    // Validate sizes array is not empty
    if (!Array.isArray(productData.sizes) || productData.sizes.length === 0) {
      return res.status(400).json({ error: "At least one size must be selected" });
    }
    
    // Create and save the product
    const product = new Product(productData);
    const savedProduct = await product.save();
    
    // Update shop's stocks array
    await Shop.findByIdAndUpdate(req.shop.id, { $push: { stocks: savedProduct._id } });
    
    res.json({ success: true, product: savedProduct });
  } catch (err) {
    // Handle specific MongoDB errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validationErrors 
      });
    }
    
    if (err.name === 'MongoError' && err.code === 11000) {
      return res.status(400).json({ 
        error: "Duplicate product detected. Please check your input." 
      });
    }
    
    res.status(500).json({ 
      error: "Failed to save stock. Please try again.",
      details: err.message 
    });
  }
};

/** Edit stock item */
exports.editStock = async (req, res) => {
  try {
    // Check if product belongs to this shop
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    if (existingProduct.shop.toString() !== req.shop.id) {
      return res.status(403).json({ error: "Not authorized to edit this product" });
    }
    
    // Handle sizes array properly
    let sizes = existingProduct.sizes;
    if (req.body.sizes) {
      if (Array.isArray(req.body.sizes)) {
        sizes = req.body.sizes;
      } else if (typeof req.body.sizes === 'string') {
        try {
          sizes = JSON.parse(req.body.sizes);
        } catch (e) {
          sizes = [req.body.sizes];
        }
      } else {
        sizes = [req.body.sizes];
      }
    }
    
    // Prepare update data
    const updateData = {
      title: req.body.title ?? existingProduct.title,
      description: req.body.description ?? existingProduct.description,
      price: req.body.price ?? existingProduct.price,
      category: req.body.category ?? existingProduct.category,
      color: req.body.color ?? existingProduct.color,
      sizes: sizes,
      gender: req.body.gender ?? existingProduct.gender,
      ageCategory: req.body.ageCategory ?? existingProduct.ageCategory,
      styleFit: req.body.styleFit ?? existingProduct.styleFit,
      productType: req.body.productType ?? existingProduct.productType,
      footwearCategory: req.body.footwearCategory ?? existingProduct.footwearCategory,
      image: req.body.image ?? existingProduct.image
    };

    // Update per-size stock if provided
    if (req.body.sizeStocks) {
      let nextStocks = [];
      try {
        nextStocks = Array.isArray(req.body.sizeStocks) ? req.body.sizeStocks : JSON.parse(req.body.sizeStocks);
      } catch (_) {
        nextStocks = [];
      }
      updateData.sizeStocks = nextStocks.map(s => ({ size: String(s.size), quantity: Math.max(0, parseInt(s.quantity || 0)) }));
      updateData.totalStock = updateData.sizeStocks.reduce((sum, s) => sum + (Number.isFinite(s.quantity) ? s.quantity : 0), 0);
    }
    
    // If a new file is provided (legacy/mixed clients), upload and override image URL
    if (req.file) {
      try {
        const imageUrl = await uploadImage(req.file, 'products');
        updateData.image = imageUrl;
      } catch (uploadErr) {
        return res.status(500).json({ 
          error: "Failed to upload image. Please try again.",
          details: uploadErr.message
        });
      }
    }
    
    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      updateData,
      { new: true }
    );
    
    res.json({ success: true, product: updatedProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Delete stock item */
exports.deleteStock = async (req, res) => {
  try {
    // Check if product exists and belongs to this shop
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    if (existingProduct.shop.toString() !== req.shop.id) {
      return res.status(403).json({ error: "Not authorized to delete this product" });
    }
    
    // Delete the product
    await Product.findByIdAndDelete(req.params.id);
    
    // Remove from shop's stocks array
    await Shop.findByIdAndUpdate(req.shop.id, { $pull: { stocks: req.params.id } });
    
    res.json({ success: true, message: "Product removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Get shop's orders */
exports.getOrders = async (req, res) => {
  try {
    // Find all products that belong to this shop
    const shopProducts = await Product.find({ shop: req.shop.id }).select('_id');
    const productIds = shopProducts.map(product => product._id);

    // Find orders that contain any of these products
    const orders = await Order.find({
      'items.product': { $in: productIds }
    })
    .populate({
      path: 'user',
      select: 'firstName lastName email phone'
    })
    .populate({
      path: 'items.product',
      select: 'title image category color price'
    })
    .sort({ orderDate: -1 }); // Most recent first

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Confirm an order */
exports.confirmOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    // For now, allow confirming the whole order without enforcing shop-ownership
    const updated = await Order.findByIdAndUpdate(orderId, { status: "confirmed" }, { new: true });
    if (!updated) return res.status(404).json({ error: "Order not found" });

    res.json({ success: true, message: "Order confirmed successfully", order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Mark order as delivered */
exports.deliverOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const updated = await Order.findByIdAndUpdate(orderId, { status: "delivered" }, { new: true });
    if (!updated) return res.status(404).json({ error: "Order not found" });

    res.json({ success: true, message: "Order marked as delivered successfully", order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Notify delivery */
exports.notifyDelivery = async (req, res) => {
  try {
    const orderId = req.params.id;

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { status: "out_for_delivery", deliveryNotification: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Order not found" });

    res.json({ success: true, message: "Delivery notification sent successfully", order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
