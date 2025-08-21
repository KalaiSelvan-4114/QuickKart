const Product = require("../models/Product");
const User = require("../models/User");

function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const skinToneColors = {
  Fair: ["Red", "Blue", "Green", "Black", "White", "Navy", "Grey"],
  Medium: ["Orange", "Purple", "Beige", "Brown", "Olive", "Teal"],
  Dusky: ["Pink", "Grey", "White", "Navy", "Maroon", "Burgundy"],
  Dark: ["Yellow", "Maroon", "Teal", "White", "Gold", "Bright colors"]
};

exports.getRecommendations = async (req, res) => {
  try {
    console.log("🎯 AI Stylist request received:", req.body);
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { productType, occasion, style, priceRange, categories, colors, radius, useLocationFilter } = req.body;

    // Base demographics filter
    const filterBase = {
      ageCategory: user.ageCategory,
      // include Unisex inventory alongside user's gender
      gender: { $in: [user.gender, 'Unisex'] }
    };

    // Handle product type
    const andClauses = [filterBase];
    if (productType === "Dress" || productType === "clothing") {
      andClauses.push({ productType: { $in: ["clothing", "Dress"] } });
      if (user.bodySize) {
        andClauses.push({ sizes: { $in: [user.bodySize] } });
      }
    } else if (productType === "Footwear" || productType === "footwear") {
      andClauses.push({ productType: { $in: ["footwear", "Footwear"] } });
      if (user.shoeSize) {
        andClauses.push({ shoeSize: user.shoeSize });
      }
    }

    // Handle occasion tags
    if (occasion) {
      // try to match product styleFit with occasion cluster as well as tags text
      const normalizeOccasion = String(occasion).toLowerCase().includes('formal') ? 'formal' : String(occasion).toLowerCase();
      andClauses.push({ $or: [
        { styleFit: { $regex: normalizeOccasion, $options: 'i' } },
        { tags: { $regex: occasion, $options: 'i' } }
      ]});
    }

    // Handle style preferences
    if (style && style !== "casual") {
      andClauses.push({ styleFit: { $regex: style, $options: 'i' } });
    }

    // Handle price range
    if (priceRange && !isNaN(priceRange)) {
      andClauses.push({ price: { $lte: parseInt(priceRange) } });
    }

    // Categories from frontend suggestions (category/footwearCategory/title/tags)
    const categoryOrs = [];
    const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (Array.isArray(categories) && categories.length > 0) {
      for (const cat of categories) {
        const rx = new RegExp(escapeRegex(cat), 'i');
        categoryOrs.push({ category: rx });
        categoryOrs.push({ footwearCategory: rx });
        categoryOrs.push({ title: rx });
        categoryOrs.push({ tags: rx });
      }
    }

    // Colors from frontend or fallback to skin tone colors
    const colorOrs = [];
    if (Array.isArray(colors) && colors.length > 0) {
      for (const c of colors) {
        colorOrs.push({ color: new RegExp(`^${escapeRegex(c)}$`, 'i') });
      }
    } else if (user.skinTone && skinToneColors[user.skinTone]) {
      // Fallback to skin tone palette
      for (const c of skinToneColors[user.skinTone]) {
        colorOrs.push({ color: new RegExp(`^${escapeRegex(c)}$`, 'i') });
      }
    }

    if (categoryOrs.length > 0) {
      andClauses.push({ $or: categoryOrs });
    }
    if (colorOrs.length > 0) {
      andClauses.push({ $or: colorOrs });
    }

    const filter = andClauses.length > 1 ? { $and: andClauses } : andClauses[0];

    console.log("🔍 Final filter (pre-distance):", filter);

    // Include shop to ensure only approved shops if attached
    const products = await Product.find(filter).populate({ path: 'shop', select: 'approved' });

    // Exclude products from unapproved shops
    const approvedOnly = products.filter(p => !(p.shop && p.shop.approved === false));

    // Optionally apply distance filter based on flag
    const userHasLocation = user.location && typeof user.location.lat === 'number' && typeof user.location.lng === 'number';
    const shouldUseLocation = Boolean(useLocationFilter) && userHasLocation;
    const radiusKm = Math.max(1, Math.min(50, Number(radius) || 10));

    if (!shouldUseLocation) {
      console.log(`✅ Returning ${approvedOnly.length} recommendations (no location filter)`);
      return res.json(approvedOnly);
    }

    const withDistance = approvedOnly
      .map(p => {
        const obj = p.toObject();
        if (p.location && typeof p.location.lat === 'number' && typeof p.location.lng === 'number') {
          obj.distanceKm = getDistance(user.location.lat, user.location.lng, p.location.lat, p.location.lng);
        }
        return obj;
      })
      .filter(p => typeof p.distanceKm === 'number' && p.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    console.log(`✅ Returning ${withDistance.length} recommendations within ${radiusKm}km`);
    res.json(withDistance);
  } catch (err) {
    console.error("❌ AI Stylist error:", err);
    res.status(500).json({ error: err.message });
  }
};
