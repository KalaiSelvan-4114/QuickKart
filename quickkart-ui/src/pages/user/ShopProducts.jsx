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
  const [addingToCart, setAddingToCart] = useState({});
  const [buyingNow, setBuyingNow] = useState({});
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
      setAddingToCart(prev => ({ ...prev, [productId]: true }));
      const product = products.find(p => p._id === productId);
      const result = await addToCart(productId, 1, null, null, product);
      
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
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleBuyNow = async (productId) => {
    try {
      setBuyingNow(prev => ({ ...prev, [productId]: true }));
      const product = products.find(p => p._id === productId);
      const result = await addToCart(productId, 1, null, null, product);
      
      if (result.success) {
        window.location.href = '/user/checkout';
      } else {
        setNotification({
          show: true,
          message: result.message,
          type: "error"
        });
        
        setTimeout(() => {
          setNotification({ show: false, message: "", type: "" });
        }, 3000);
      }
      
    } catch (err) {
      setNotification({
        show: true,
        message: "Failed to buy now",
        type: "error"
      });
      
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    } finally {
      setBuyingNow(prev => ({ ...prev, [productId]: false }));
    }
  };

  const addToWishlist = async (productId) => {
    try {
      await axiosClient.post("/user/wishlist", { productId });
      setNotification({
        show: true,
        message: "Added to wishlist!",
        type: "success"
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    } catch (err) {
      setNotification({
        show: true,
        message: "Failed to add to wishlist",
        type: "error"
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    }
  };

  const filteredProducts = products.filter(product => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.gender && product.gender !== filters.gender) return false;
    if (filters.ageCategory && product.ageCategory !== filters.ageCategory) return false;
    if (filters.size && !product.sizes?.includes(filters.size)) return false;
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-accent-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading shop products...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the products</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 via-indigo-50/50 to-purple-50/50"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Shop Header */}
        {shop && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Shop Logo/Icon */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-4xl">🏪</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  ✓
                </div>
              </div>
              
              {/* Shop Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3 font-display">
                  {shop.name}
                </h1>
                <div className="space-y-2">
                  <p className="text-gray-600 flex items-center">
                    <span className="mr-2">📍</span>
                    {shop.address}
                  </p>
                  {shop.license && (
                    <p className="text-gray-500 text-sm flex items-center">
                      <span className="mr-2">📄</span>
                      License: {shop.license}
                    </p>
                  )}
                  {shop.gst && (
                    <p className="text-gray-500 text-sm flex items-center">
                      <span className="mr-2">🏢</span>
                      GST: {shop.gst}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Location Status */}
              <div className="text-right">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  shop.distance 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                }`}>
                  <span className="mr-2">
                    {shop.distance ? '📍' : '⏳'}
                  </span>
                  {shop.distance ? `${shop.distance.toFixed(1)} km away` : "Location not set"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Display */}
        {notification.show && (
          <div className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl transition-all duration-500 transform ${
            notification.type === "success" 
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" 
              : "bg-gradient-to-r from-red-500 to-pink-600 text-white"
          }`}>
            <div className="flex items-center space-x-3">
              <span className="text-xl">
                {notification.type === "success" ? "✅" : "❌"}
              </span>
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Products Section with Sidebar Layout */}
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 sticky top-8">
              {/* Filter Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 font-display">Filters</h2>
                <button 
                  onClick={() => setFilters({
                    category: "",
                    gender: "",
                    ageCategory: "",
                    size: "",
                    color: "",
                    priceRange: ""
                  })}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Clear all
                </button>
              </div>
              
              {/* Filter Sections */}
              <div className="space-y-6">
                {/* Category Filter */}
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Category</h3>
                  <div className="space-y-2">
                    {[
                      { value: "", label: "All Categories" },
                      { value: "clothing", label: "Clothing" },
                      { value: "footwear", label: "Footwear" }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={option.value}
                          checked={filters.category === option.value}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gender Filter */}
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Gender</h3>
                  <div className="space-y-2">
                    {[
                      { value: "", label: "All Genders" },
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" },
                      { value: "Unisex", label: "Unisex" }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value={option.value}
                          checked={filters.gender === option.value}
                          onChange={(e) => handleFilterChange('gender', e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Age Category Filter */}
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Age Category</h3>
                  <div className="space-y-2">
                    {[
                      { value: "", label: "All Ages" },
                      { value: "kid", label: "Kid" },
                      { value: "teen", label: "Teen" },
                      { value: "adult", label: "Adult" },
                      { value: "senior", label: "Senior" }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="ageCategory"
                          value={option.value}
                          checked={filters.ageCategory === option.value}
                          onChange={(e) => handleFilterChange('ageCategory', e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Size Filter */}
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Size</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "", label: "All Sizes" },
                      { value: "S", label: "S" },
                      { value: "M", label: "M" },
                      { value: "L", label: "L" },
                      { value: "XL", label: "XL" },
                      { value: "XXL", label: "XXL" }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="size"
                          value={option.value}
                          checked={filters.size === option.value}
                          onChange={(e) => handleFilterChange('size', e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Color Filter */}
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Color</h3>
                  <input
                    type="text"
                    placeholder="Enter color name"
                    value={filters.color}
                    onChange={(e) => handleFilterChange('color', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Price Range Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
                  <div className="space-y-2">
                    {[
                      { value: "", label: "All Prices" },
                      { value: "0-500", label: "Under ₹500" },
                      { value: "500-1000", label: "₹500 - ₹1000" },
                      { value: "1000-2000", label: "₹1000 - ₹2000" },
                      { value: "2000-5000", label: "₹2000 - ₹5000" },
                      { value: "5000-", label: "Above ₹5000" }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="priceRange"
                          value={option.value}
                          checked={filters.priceRange === option.value}
                          onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 font-display">
                Products ({filteredProducts.length})
              </h2>
              <Link 
                to="/user/shops" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
              >
                ← Back to Shops
              </Link>
            </div>

            {shopUpi.upiVpa && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                💳 UPI for this shop: <strong>{shopUpi.upiName || 'Merchant'}</strong> • {shopUpi.upiVpa}
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">👕</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters</p>
                <button 
                  onClick={() => setFilters({
                    category: "",
                    gender: "",
                    ageCategory: "",
                    size: "",
                    color: "",
                    priceRange: ""
                  })}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    {/* Product Image */}
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                      {product.image ? (
                        <Link to={`/user/product/${product._id}`}>
                          <img 
                            src={product.image} 
                            alt={product.title} 
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        </Link>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">👕</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="p-4 space-y-3">
                      <h3 className="font-semibold text-gray-800 line-clamp-2">
                        <Link to={`/user/product/${product._id}`} className="hover:text-blue-600 transition-colors">
                          {product.title}
                        </Link>
                      </h3>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {product.category && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {product.category}
                          </span>
                        )}
                        {product.gender && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                            {product.gender}
                          </span>
                        )}
                        {product.ageCategory && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            {product.ageCategory}
                          </span>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="text-xs text-gray-600 space-y-1">
                        {product.color && (
                          <p>Color: {product.color}</p>
                        )}
                        {product.sizes?.length > 0 && (
                          <p>Sizes: {product.sizes.join(', ')}</p>
                        )}
                      </div>
                      
                      {/* Price */}
                      <p className="text-blue-600 font-bold text-lg">
                        ₹{product.price}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="space-y-2">
                        {/* Buy Now Button */}
                        <button
                          onClick={() => handleBuyNow(product._id)}
                          disabled={buyingNow[product._id]}
                          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center justify-center transition-colors duration-200"
                        >
                          {buyingNow[product._id] ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            'Buy Now'
                          )}
                        </button>
                        
                        {/* Add to Cart Button */}
                        <button
                          onClick={() => handleAddToCart(product._id)}
                          disabled={addingToCart[product._id]}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center justify-center transition-colors duration-200"
                        >
                          {addingToCart[product._id] ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Adding...
                            </>
                          ) : (
                            'Add to Cart'
                          )}
                        </button>
                        
                        {/* Secondary Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => addToWishlist(product._id)}
                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                            title="Add to Wishlist"
                          >
                            ❤️
                          </button>
                          <Link 
                            to={`/user/product/${product._id}`} 
                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200 text-center"
                            title="View Details"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
