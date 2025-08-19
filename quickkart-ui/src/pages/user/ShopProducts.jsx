import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useCart } from "../../contexts/CartContext";

export default function ShopProducts() {
  const { shopId } = useParams();
  const { addToCart } = useCart();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [filters, setFilters] = useState({
    category: "",
    gender: "",
    ageCategory: "",
    size: "",
    color: "",
    priceRange: ""
  });
  const [shopUpi, setShopUpi] = useState({ upiVpa: "", upiName: "" });

  useEffect(() => {
    loadShopAndProducts();
    loadShopUpi();
  }, [shopId]);

  const loadShopAndProducts = async () => {
    try {
      setLoading(true);
      const [shopRes, productsRes] = await Promise.all([
        axiosClient.get(`/user/shops/${shopId}`),
        axiosClient.get(`/user/shops/${shopId}/products`)
      ]);
      setShop(shopRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      setError("Failed to load shop and products");
    } finally {
      setLoading(false);
    }
  };

  const loadShopUpi = async () => {
    try {
      const res = await axiosClient.get(`/user/shops/${shopId}/upi`);
      setShopUpi(res.data || { upiVpa: "", upiName: "" });
    } catch (_) {}
  };

  const handleAddToCart = async (productId) => {
    try {
      const result = await addToCart(productId, 1);
      
      if (result.success) {
        setNotification({
          show: true,
          message: result.message,
          type: "success"
        });
      } else {
        setNotification({
          show: true,
          message: result.message,
          type: "error"
        });
      }
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
      
    } catch (err) {
      setNotification({
        show: true,
        message: "Failed to add to cart",
        type: "error"
      });
      
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      await axiosClient.post("/user/wishlist", { productId });
      // Show success notification
    } catch (err) {
      // Show error notification
    }
  };

  const filteredProducts = products.filter(product => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.gender && product.gender !== filters.gender) return false;
    if (filters.ageCategory && product.ageCategory !== filters.ageCategory) return false;
    if (filters.size && !product.sizes.includes(filters.size)) return false;
    if (filters.color && product.color !== filters.color) return false;
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (product.price < min || (max && product.price > max)) return false;
    }
    return true;
  });

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shop products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
          <Link to="/user/shops" className="btn-primary mt-4">
            Back to Shops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Shop Header */}
        {shop && (
          <div className="card mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">🏪</span>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">
                  {shop.name}
                </h1>
                <p className="text-gray-600 mb-2">📍 {shop.address}</p>
                {shop.license && (
                  <p className="text-gray-500 text-sm">📄 License: {shop.license}</p>
                )}
                {shop.gst && (
                  <p className="text-gray-500 text-sm">🏢 GST: {shop.gst}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {shop.distance ? `${shop.distance.toFixed(1)}km away` : "Location not set"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Notification Display */}
        {notification.show && (
          <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-xl shadow-lg transition-all duration-300 ${
            notification.type === "success" 
              ? "bg-green-500 text-white" 
              : "bg-red-500 text-white"
          }`}>
            <div className="flex items-center">
              <span className="mr-2">
                {notification.type === "success" ? "✅" : "❌"}
              </span>
              {notification.message}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 font-display">Filters</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input-field"
              >
                <option value="">All Categories</option>
                <option value="clothing">Clothing</option>
                <option value="footwear">Footwear</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="input-field"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age Category</label>
              <select
                value={filters.ageCategory}
                onChange={(e) => handleFilterChange('ageCategory', e.target.value)}
                className="input-field"
              >
                <option value="">All Ages</option>
                <option value="kid">Kid</option>
                <option value="teen">Teen</option>
                <option value="adult">Adult</option>
                <option value="senior">Senior</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <select
                value={filters.size}
                onChange={(e) => handleFilterChange('size', e.target.value)}
                className="input-field"
              >
                <option value="">All Sizes</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <input
                type="text"
                placeholder="Enter color"
                value={filters.color}
                onChange={(e) => handleFilterChange('color', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="input-field"
              >
                <option value="">All Prices</option>
                <option value="0-500">Under ₹500</option>
                <option value="500-1000">₹500 - ₹1000</option>
                <option value="1000-2000">₹1000 - ₹2000</option>
                <option value="2000-5000">₹2000 - ₹5000</option>
                <option value="5000-">Above ₹5000</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 font-display">
              Products ({filteredProducts.length})
            </h2>
            <Link to="/user/shops" className="btn-secondary">
              ← Back to Shops
            </Link>
          </div>

          {shopUpi.upiVpa && (
            <div className="mb-4 text-sm text-gray-600">UPI for this shop: {shopUpi.upiName || 'Merchant'} • {shopUpi.upiVpa}</div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👕</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product._id} className="card hover:scale-105 transition-transform duration-300">
                  <div className="aspect-square bg-gray-200 rounded-xl mb-4 overflow-hidden">
                    {product.image ? (
                      <a href={`/user/product/${product._id}`}>
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl">👕</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800 line-clamp-2">
                      <a href={`/user/product/${product._id}`}>{product.title}</a>
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {product.category && (
                        <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
                          {product.category}
                        </span>
                      )}
                      {product.gender && (
                        <span className="bg-accent-100 text-accent-800 px-2 py-1 rounded-full text-xs">
                          {product.gender}
                        </span>
                      )}
                      {product.ageCategory && (
                        <span className="bg-secondary-100 text-secondary-800 px-2 py-1 rounded-full text-xs">
                          {product.ageCategory}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">
                      Color: {product.color}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Sizes: {product.sizes?.join(', ')}
                    </p>
                    <p className="text-primary-600 font-bold text-lg">
                      ₹{product.price}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        className="btn-primary flex-1 text-sm py-2"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => addToWishlist(product._id)}
                        className="btn-secondary text-sm py-2 px-3"
                      >
                        ❤️
                      </button>
                      <a href={`/user/product/${product._id}`} className="btn-secondary text-sm py-2 px-3">View</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
