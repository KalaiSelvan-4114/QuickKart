const User = require("../models/User");
const Product = require("../models/Product");
const Shop = require("../models/Shop");
const Order = require("../models/Order");

/** GET user profile */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist cart");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** UPDATE profile */
exports.updateProfile = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, req.body);
    res.json({ success: true, message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Get all products (for development) */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().limit(20); // Limit to 20 products for performance
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Get single product by ID */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate({ path: 'shop', select: 'name _id' });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Get nearby products (simple location filter by coordinates using Haversine) */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

exports.getNearbyStocks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const products = await Product.find();
    const filtered = products.filter(p => {
      if (p.location && user.location) {
        return getDistance(user.location.lat, user.location.lng, p.location.lat, p.location.lng) <= 10;
      }
      return false;
    });
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Get nearby shops */
exports.getNearbyShops = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const radiusKm = Math.max(1, Math.min(50, Number(req.query.radius) || 10));

    // If user has no location, just return approved shops
    if (!user || !user.location || typeof user.location.lat !== 'number' || typeof user.location.lng !== 'number') {
      const allApproved = await Shop.find({ approved: true });
      return res.json(allApproved);
    }

    const shops = await Shop.find({ approved: true });

    const nearby = shops
      .filter(s => s.location && typeof s.location.lat === 'number' && typeof s.location.lng === 'number')
      .map(s => ({
        shop: s,
        distance: getDistance(user.location.lat, user.location.lng, s.location.lat, s.location.lng)
      }))
      .filter(x => x.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .map(x => ({ ...x.shop.toObject(), distanceKm: Number(x.distance.toFixed(2)) }));

    res.json(nearby);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Get all shops (for development) */
exports.getAllShops = async (req, res) => {
  try {
    const { filter } = req.query;
    
    let shops = [];
    
    if (filter === "nearby") {
      // Reuse nearby logic with optional radius (default 10km)
      const user = await User.findById(req.user.id);
      const radiusKm = Math.max(1, Math.min(50, Number(req.query.radius) || 10));

      if (!user || !user.location || typeof user.location.lat !== 'number' || typeof user.location.lng !== 'number') {
        shops = await Shop.find({ approved: true });
      } else {
        const approved = await Shop.find({ approved: true });
        shops = approved
          .filter(s => s.location && typeof s.location.lat === 'number' && typeof s.location.lng === 'number')
          .map(s => ({
            shop: s,
            distance: getDistance(user.location.lat, user.location.lng, s.location.lat, s.location.lng)
          }))
          .filter(x => x.distance <= radiusKm)
          .sort((a, b) => a.distance - b.distance)
          .map(x => ({ ...x.shop.toObject(), distanceKm: Number(x.distance.toFixed(2)) }));
      }
    } else if (filter === "approved") {
      // Query only approved shops
      shops = await Shop.find({ approved: true });
    } else {
      // Query all shops (both approved and pending)
      shops = await Shop.find();
    }
    
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Get specific shop */
exports.getShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId);
    if (!shop) {
      return res.status(404).json({ error: "Shop not found" });
    }
    res.json(shop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Get shop products */
exports.getShopProducts = async (req, res) => {
  try {
    const products = await Product.find({ shop: req.params.shopId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Address management */
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.addresses || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.addresses) user.addresses = [];
    user.addresses.push(req.body);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === req.params.id);
    if (addressIndex === -1) {
      return res.status(404).json({ error: "Address not found" });
    }
    user.addresses[addressIndex] = { ...user.addresses[addressIndex], ...req.body };
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.forEach(addr => addr.isDefault = false);
    const address = user.addresses.find(addr => addr._id.toString() === req.params.id);
    if (address) {
      address.isDefault = true;
    }
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cart management */
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'cart',
      populate: {
        path: 'productId',
        model: 'Product'
      }
    });
    
    // Transform the cart data to include product information
    const cartWithProducts = user.cart.map(item => ({
      _id: item._id,
      quantity: item.quantity,
      // Extract product data
      title: item.productId?.title || 'Product',
      price: item.productId?.price || 0,
      image: item.productId?.image,
      category: item.productId?.category,
      color: item.productId?.color,
      sizes: item.productId?.sizes,
      gender: item.productId?.gender,
      ageCategory: item.productId?.ageCategory,
      styleFit: item.productId?.styleFit,
      productType: item.productId?.productType,
      footwearCategory: item.productId?.footwearCategory,
      shopId: item.productId?.shop,
      // Keep the original productId for reference
      productId: item.productId?._id
    }));
    
    res.json(cartWithProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Check if product already exists in cart
    const user = await User.findById(req.user.id);
    const existingCartItem = user.cart.find(item => item.productId && item.productId.toString() === productId);
    
    if (existingCartItem) {
      // Update quantity if product already exists
      existingCartItem.quantity += quantity;
    } else {
      // Add new item to cart
      user.cart.push({ productId, quantity });
    }
    
    await user.save();
    
    // Return populated cart data
    const populatedUser = await User.findById(req.user.id).populate({
      path: 'cart',
      populate: {
        path: 'productId',
        model: 'Product'
      }
    });
    
    const cartWithProducts = populatedUser.cart.map(item => ({
      _id: item._id,
      quantity: item.quantity,
      title: item.productId?.title || 'Product',
      price: item.productId?.price || 0,
      image: item.productId?.image,
      category: item.productId?.category,
      color: item.productId?.color,
      sizes: item.productId?.sizes,
      gender: item.productId?.gender,
      ageCategory: item.productId?.ageCategory,
      styleFit: item.productId?.styleFit,
      productType: item.productId?.productType,
      footwearCategory: item.productId?.footwearCategory,
      shopId: item.productId?.shop,
      productId: item.productId?._id
    }));
    
    res.json({ success: true, cart: cartWithProducts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user.id);
    
    const cartItem = user.cart.find(item => item._id.toString() === req.params.id);
    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }
    
    cartItem.quantity = quantity;
    await user.save();
    
    // Return populated cart data
    const populatedUser = await User.findById(req.user.id).populate({
      path: 'cart',
      populate: {
        path: 'productId',
        model: 'Product'
      }
    });
    
    const cartWithProducts = populatedUser.cart.map(item => ({
      _id: item._id,
      quantity: item.quantity,
      title: item.productId?.title || 'Product',
      price: item.productId?.price || 0,
      image: item.productId?.image,
      category: item.productId?.category,
      color: item.productId?.color,
      sizes: item.productId?.sizes,
      gender: item.productId?.gender,
      ageCategory: item.productId?.ageCategory,
      styleFit: item.productId?.styleFit,
      productType: item.productId?.productType,
      footwearCategory: item.productId?.footwearCategory,
      shopId: item.productId?.shop,
      productId: item.productId?._id
    }));
    
    res.json({ success: true, cart: cartWithProducts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $pull: { cart: { _id: req.params.id } } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Wishlist management */
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.json(user.wishlist || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { wishlist: req.body.productId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $pull: { wishlist: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Orders management */
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('shop', 'name');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// In createOrder, accept paid flag and normalize paymentMethod values
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingDetails,
      paymentMethod,
      paid,
      orderNotes,
      subtotal,
      deliveryFee,
      total
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item" });
    }
    if (!shippingDetails) {
      return res.status(400).json({ error: "Shipping details are required" });
    }

    const method = paymentMethod === 'online_upi' ? 'online_upi' : (paymentMethod === 'cod' ? 'cod' : 'cod');

    const orderData = {
      user: req.user.id,
      items: items.map(item => ({ product: item.productId, quantity: item.quantity, price: item.price })),
      shippingDetails,
      paymentMethod: method,
      paid: Boolean(paid),
      orderNotes: orderNotes || "",
      subtotal,
      deliveryFee,
      total,
      status: method === 'cod' ? 'pending' : (paid ? 'confirmed' : 'pending'),
      orderDate: new Date()
    };

    const order = new Order(orderData);
    const savedOrder = await order.save();

    // Decrement stock per size for each product
    for (const item of items) {
      try {
        const product = await Product.findById(item.productId);
        if (!product) continue;
        // For now, decrement from the first available sizeStocks entries proportionally to quantity
        // If frontend later sends selected size, we can decrement that exact size
        let remaining = Number(item.quantity) || 0;
        if (Array.isArray(product.sizeStocks) && product.sizeStocks.length > 0) {
          for (const ss of product.sizeStocks) {
            if (remaining <= 0) break;
            const take = Math.min(remaining, Math.max(0, ss.quantity));
            ss.quantity = Math.max(0, ss.quantity - take);
            remaining -= take;
          }
          product.totalStock = product.sizeStocks.reduce((sum, s) => sum + (Number.isFinite(s.quantity) ? s.quantity : 0), 0);
        } else if (typeof product.totalStock === 'number') {
          product.totalStock = Math.max(0, product.totalStock - remaining);
        }
        await product.save();
      } catch (_) {}
    }

    await User.findByIdAndUpdate(req.user.id, { $set: { cart: [] } });

    const populatedOrder = await Order.findById(savedOrder._id)
      .populate({ path: 'items.product', select: 'title image category color' })
      .populate('user', 'firstName lastName email');

    res.status(201).json({ success: true, message: "Order placed successfully!", order: populatedOrder });
  } catch (err) {
    res.status(500).json({ error: "Failed to create order. Please try again.", details: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'title image category color'
      })
      .sort({ orderDate: -1 }); // Most recent first

    res.json(orders);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch orders. Please try again.",
      details: err.message
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'title image category color sizes gender ageCategory styleFit productType footwearCategory'
      })
      .populate('user', 'firstName lastName email phone');

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch order. Please try again.",
      details: err.message
    });
  }
};

// helper: expose shop UPI for a given shop
exports.getShopUpi = async (req, res) => {
  try {
    const Shop = require("../models/Shop");
    const shop = await Shop.findById(req.params.shopId).select("upiVpa upiName name");
    if (!shop) return res.status(404).json({ error: "Shop not found" });
    res.json({ upiVpa: shop.upiVpa, upiName: shop.upiName, name: shop.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
