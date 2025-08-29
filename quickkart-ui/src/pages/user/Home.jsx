import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useCart } from "../../contexts/CartContext";
import { formatCoordinates, parseCoordinateInput } from "../../utils/coordinateConverter";

export default function Home() {
  const { addToCart } = useCart();
  const [stocks, setStocks] = useState([]);
  const [nearbyShops, setNearbyShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationInput, setLocationInput] = useState("");
  const [visibleCount, setVisibleCount] = useState(3);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [addingToCart, setAddingToCart] = useState({});
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [filters, setFilters] = useState({
    category: "",
    gender: "",
    ageCategory: "",
    priceRange: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🏠 Home component mounted");
    
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    console.log("🔑 Token found:", !!token);
    
    if (!token) {
      console.log("❌ No token, redirecting to login");
      navigate("/user/login");
      return;
    }

    console.log("✅ User authenticated, loading data...");
    loadUserLocation();
    loadHomeData();
  }, [navigate]);

  const loadUserLocation = async () => {
    try {
      const res = await axiosClient.get("/user/profile");
      if (res.data.location) {
        // Handle location object properly
        if (typeof res.data.location === 'object' && res.data.location.lat && res.data.location.lng) {
          setUserLocation(`${res.data.location.lat}, ${res.data.location.lng}`);
          setLocationInput(`${res.data.location.lat}, ${res.data.location.lng}`);
        } else if (typeof res.data.location === 'string') {
          setUserLocation(res.data.location);
          setLocationInput(res.data.location);
        } else {
          setShowLocationModal(true);
        }
      } else {
        setShowLocationModal(true);
      }
    } catch (err) {
      console.log("Location not set, showing modal");
      setShowLocationModal(true);
    }
  };

  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(""); // Clear any previous errors
      
      console.log("🔄 Loading home data...");
      
      // Try to load stocks and shops, but don't crash if they fail
      try {
        console.log("📦 Loading products...");
        const productsRes = await axiosClient.get("/user/products");
        console.log("✅ Products loaded:", productsRes.data);
        setStocks(productsRes.data || []);
      } catch (err) {
        console.error("❌ Products API error:", err.message, err.response?.data);
        setStocks([]);
      }

      try {
        console.log("🏪 Loading nearby shops within 10km...");
        const shopsRes = await axiosClient.get("/user/shops?filter=nearby&radius=10");
        console.log("✅ Nearby shops loaded:", shopsRes.data);
        setNearbyShops(shopsRes.data || []);
      } catch (err) {
        console.error("❌ Shops API error:", err.message, err.response?.data);
        setNearbyShops([]);
      }
    } catch (err) {
      console.error("❌ Home data loading error:", err.message, err.response?.data);
      setError("Some features may not be available yet. This is normal during development.");
    } finally {
      setLoading(false);
      console.log("🏁 Home data loading completed");
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationString = `${latitude}, ${longitude}`;
          setUserLocation(locationString);
          setLocationInput(locationString);
          setShowLocationModal(false);
          loadHomeData();
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Could not get your location. Please enter manually.");
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const saveLocation = async () => {
    try {
      // Parse location string to object format for backend
      let locationObj = locationInput;
      
      // Try to parse DMS format first
      if (locationInput.includes('°') && locationInput.includes("'") && locationInput.includes('"')) {
        const coords = parseCoordinateInput(locationInput);
        if (coords) {
          locationObj = coords;
        }
      } else if (locationInput.includes(',')) {
        // Parse decimal format
        const [lat, lng] = locationInput.split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          locationObj = { lat, lng };
        }
      }
      
      await axiosClient.put("/user/profile", { location: locationObj });
      setUserLocation(locationInput);
      setShowLocationModal(false);
      loadHomeData();
    } catch (err) {
      console.log("Could not save location:", err.message);
      // Don't crash, just use the location locally
      setUserLocation(locationInput);
      setShowLocationModal(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      setAddingToCart(prev => ({ ...prev, [product._id]: true }));
      const result = await addToCart(product._id, 1, null, null, product);
      if (result.success) {
        // Show success notification
        setError(""); // Clear any previous errors
        setNotification({ show: true, message: result.message, type: "success" });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
      } else {
        setError(result.message || "Could not add to cart. Please try again later.");
        setNotification({ show: true, message: result.message, type: "error" });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
      }
    } catch (err) {
      console.log("Could not add to cart:", err.message);
      setError("Could not add to cart. Please try again later.");
      setNotification({ show: true, message: "Could not add to cart. Please try again later.", type: "error" });
      setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    } finally {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const addToWishlist = async (productId) => {
    try {
      await axiosClient.post("/user/wishlist", { productId });
      // Show success notification
    } catch (err) {
      console.log("Could not add to wishlist:", err.message);
      // Don't crash, just show a message
      setError("Could not add to wishlist. Please try again later.");
    }
  };

  const filteredStocks = stocks.filter(product => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.gender && product.gender !== filters.gender) return false;
    if (filters.ageCategory && product.ageCategory !== filters.ageCategory) return false;
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (product.price < min || (max && product.price > max)) return false;
    }
    return true;
  });

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // If there's a critical error, show a simple fallback
  if (error && error.includes("critical")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Always show the main content, even if there are errors
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Amazon-like Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl mb-8">
          <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100">
            <div className="px-6 sm:px-10 py-12 md:py-16 grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                  Starting ₹99 | Budget store
                </h1>
                <p className="text-gray-700 mb-6 md:max-w-md">
                  Free delivery on first order. Discover daily deals across fashion, electronics and more.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="#deals" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-md">Shop deals</a>
                  <a href="#shops" className="bg-white hover:bg-gray-50 text-gray-800 font-semibold px-6 py-3 rounded-md border">Browse shops</a>
                </div>
                {userLocation && (
                  <div className="mt-4 inline-flex items-center bg-white px-3 py-1.5 rounded-lg shadow-sm">
                    <span className="mr-2">📍</span>
                    <span className="text-sm text-gray-700">{userLocation}</span>
                    <button onClick={() => setShowLocationModal(true)} className="ml-2 text-primary-600 text-sm">Change</button>
                  </div>
                )}
              </div>
              <div className="hidden md:block">
                <div className="h-64 rounded-xl bg-[url('https://images.unsplash.com/photo-1515165562835-c3b8c2e9f3f0?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center shadow-inner" />
              </div>
            </div>
          </div>
        </div>

        {/* Promo section removed as requested */}
        {/* Location Modal */}
        {showLocationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Set Your Location</h3>
              <p className="text-gray-600 mb-6">
                Help us show you products from shops near you
              </p>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter coordinates (e.g., 10.3651,77.9803 or 10°27'27.3N 77°53'28.5E)"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="input-field w-full"
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={getCurrentLocation}
                    className="btn-secondary flex-1"
                  >
                    📍 Use GPS
                  </button>
                  <button
                    onClick={saveLocation}
                    disabled={!locationInput.trim()}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    Save Location
                  </button>
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

        {/* Error Display */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-center">
              <span className="mr-2">ℹ️</span>
              {error}
            </div>
          </div>
        )}

        

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Shops Row (compact cards) */}
        <div id="shops" className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Top shops near you</h2>
            <Link to="/user/shops" className="text-blue-600 font-medium">See all →</Link>
          </div>
          {nearbyShops.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex gap-4 min-w-max">
                {nearbyShops.slice(0, 10).map((shop) => (
                  <Link key={shop._id} to={`/user/shop/${shop._id}`} className="bg-white rounded-lg border border-gray-200 p-4 w-64 flex-shrink-0 hover:shadow">
                    <div className="aspect-video rounded-md bg-gradient-to-br from-blue-50 to-indigo-100 mb-3 flex items-center justify-center">🏪</div>
                    <div className="font-semibold text-gray-900 line-clamp-1">{shop.name}</div>
                    <div className="text-sm text-gray-600 line-clamp-1">{shop.address}</div>
                    {(shop.distanceKm || shop.distance) && (
                      <div className="text-xs text-gray-500 mt-1">
                        {typeof shop.distanceKm === 'number' ? `${shop.distanceKm.toFixed(1)} km away` : `${shop.distance?.toFixed?.(1) || ''} km away`}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No shops found.</div>
          )}
        </div>

        {/* Filters removed as requested */}

        {/* Products Section (grid) */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 font-display">
              Available Products ({filteredStocks.length})
            </h2>
          </div>

          {filteredStocks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👕</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-600">
                {filters.category || filters.gender || filters.ageCategory || filters.priceRange
                  ? "Try adjusting your filters"
                  : "No products available in your area yet. This is normal during development!"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStocks.slice(0, visibleCount).map((product) => (
                  <div key={product._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <Link to={`/user/product/${product._id}`} className="block">
                      <div className="aspect-square bg-gray-100">
                        {product.image ? (
                          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">👕</div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">{product.title}</h3>
                        <div className="text-blue-600 font-bold whitespace-nowrap">₹{product.price}</div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {product.category && <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700">{product.category}</span>}
                        {product.gender && <span className="px-2 py-0.5 text-xs rounded-full bg-purple-50 text-purple-700">{product.gender}</span>}
                        {product.ageCategory && <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700">{product.ageCategory}</span>}
                      </div>
                      <div className="text-xs text-gray-600 mb-3">{product.color ? `Color: ${product.color}` : ''}{product.sizes?.length ? `  •  Sizes: ${product.sizes.join(', ')}` : ''}</div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAddToCart(product)} 
                          disabled={addingToCart[product._id]}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-4 py-2 rounded-md flex items-center justify-center"
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
                        <button onClick={() => addToWishlist(product._id)} className="px-3 py-2 text-sm rounded-md border">❤</button>
                        <Link to={`/user/product/${product._id}`} className="px-3 py-2 text-sm rounded-md border">View</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredStocks.length > visibleCount && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setVisibleCount(prev => Math.min(prev + 6, filteredStocks.length))}
                    className="px-6 py-3 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium"
                  >
                    Show more
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Deals Carousel (moved to end) */}
        <div id="deals" className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Today’s deals</h2>
            <a href="#" className="text-blue-600 font-medium">See all deals →</a>
          </div>
          {filteredStocks.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex gap-4 min-w-max pr-2">
                {filteredStocks.slice(0, 12).map((product) => (
                  <Link key={product._id} to={`/user/product/${product._id}`} className="bg-white rounded-lg border border-gray-200 w-56 flex-shrink-0 hover:shadow">
                    <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">👕</div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="text-sm text-gray-700 line-clamp-2 mb-2">{product.title}</div>
                      <div className="font-bold text-gray-900">₹{product.price}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No deals yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
