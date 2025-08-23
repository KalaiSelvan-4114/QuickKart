import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { formatCoordinates, parseCoordinateInput } from "../../utils/coordinateConverter";

export default function Home() {
  const [stocks, setStocks] = useState([]);
  const [nearbyShops, setNearbyShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationInput, setLocationInput] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    gender: "",
    ageCategory: "",
    priceRange: ""
  });
  const navigate = useNavigate();

  // Request cancellation and cleanup
  const abortControllerRef = useRef(null);
  const isComponentMountedRef = useRef(true);

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

    // Cleanup function
    return () => {
      isComponentMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [navigate]);

  const loadUserLocation = async () => {
    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      const res = await axiosClient.get("/user/profile", {
        signal: abortControllerRef.current.signal,
        timeout: 15000 // 15 second timeout
      });
      
      // Check if component is still mounted
      if (!isComponentMountedRef.current) return;
      
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
      // Check if component is still mounted
      if (!isComponentMountedRef.current) return;
      
      // Handle cancellation separately
      if (err.name === 'AbortError') {
        console.log("🔄 Location request was cancelled");
        return;
      }
      
      console.log("Location not set, showing modal");
      setShowLocationModal(true);
    }
  };

  const loadHomeData = async () => {
    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      setLoading(true);
      setError(""); // Clear any previous errors
      
      console.log("🔄 Loading home data...");
      
      // Try to load nearby products and shops, but don't crash if they fail
      try {
        console.log("📦 Loading nearby products within 10km...");
        const productsRes = await axiosClient.get("/user/stocks", {
          signal: abortControllerRef.current.signal,
          timeout: 20000 // 20 second timeout
        });
        
        // Check if component is still mounted
        if (!isComponentMountedRef.current) return;
        
        console.log("✅ Products loaded:", productsRes.data);
        setStocks(productsRes.data || []);
      } catch (err) {
        // Check if component is still mounted
        if (!isComponentMountedRef.current) return;
        
        // Handle cancellation separately
        if (err.name === 'AbortError') {
          console.log("🔄 Products request was cancelled");
          return;
        }
        
        console.error("❌ Products API error:", err.message, err.response?.data);
        setStocks([]);
      }

      try {
        console.log("🏪 Loading nearby shops within 10km...");
        const shopsRes = await axiosClient.get("/user/shops?filter=nearby&radius=10", {
          signal: abortControllerRef.current.signal,
          timeout: 20000 // 20 second timeout
        });
        
        // Check if component is still mounted
        if (!isComponentMountedRef.current) return;
        
        console.log("✅ Nearby shops loaded:", shopsRes.data);
        setNearbyShops(shopsRes.data || []);
      } catch (err) {
        // Check if component is still mounted
        if (!isComponentMountedRef.current) return;
        
        // Handle cancellation separately
        if (err.name === 'AbortError') {
          console.log("🔄 Shops request was cancelled");
          return;
        }
        
        console.error("❌ Shops API error:", err.message, err.response?.data);
        setNearbyShops([]);
      }
    } catch (err) {
      // Check if component is still mounted
      if (!isComponentMountedRef.current) return;
      
      console.error("❌ Home data loading error:", err.message, err.response?.data);
      setError("Some features may not be available yet. This is normal during development.");
    } finally {
      // Only update state if component is still mounted
      if (isComponentMountedRef.current) {
        setLoading(false);
        console.log("🏁 Home data loading completed");
      }
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

  const addToCart = async (product) => {
    try {
      // If sizes available, go to detail page to pick
      if (Array.isArray(product.sizes) && product.sizes.length > 0) {
        navigate(`/user/product/${product._id}`);
        return;
      }
      await axiosClient.post("/user/cart", { productId: product._id, quantity: 1 });
    } catch (err) {
      console.log("Could not add to cart:", err.message);
      setError("Could not add to cart. Please try again later.");
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
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-3xl">🏠</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 font-display">
            Welcome to QuickKart
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Discover amazing products from shops near you
          </p>
          
          {/* Location Display */}
          {userLocation && (
            <div className="inline-flex items-center bg-white px-4 py-2 rounded-xl shadow-sm">
              <span className="text-gray-500 mr-2">📍</span>
              <span className="text-gray-700">{userLocation}</span>
              <button
                onClick={() => setShowLocationModal(true)}
                className="ml-2 text-primary-600 hover:text-primary-700 text-sm"
              >
                Change
              </button>
            </div>
          )}
        </div>

        

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

        {/* Error Display */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-center">
              <span className="mr-2">ℹ️</span>
              {error}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 font-display">Filter Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Nearby Shops Section */}
        {!loading && nearbyShops.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 font-display">
                Nearby Shops (5-10km)
              </h2>
              <Link to="/user/shops" className="btn-secondary">
                View All Shops →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyShops.slice(0, 3).map((shop) => (
                <div key={shop._id} className="card hover:scale-105 transition-transform duration-300">
                  <div className="aspect-video bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl mb-4 flex items-center justify-center">
                    <span className="text-4xl">🏪</span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-800 font-display">
                      {shop.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      📍 {shop.address}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-gray-500">
                        {typeof shop.distanceKm === 'number'
                          ? `${shop.distanceKm.toFixed(1)} km away`
                          : (typeof shop.distance === 'number' ? `${shop.distance.toFixed(1)} km away` : 'Nearby')}
                      </span>
                      <Link
                        to={`/user/shop/${shop._id}`}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        View Products
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStocks.map((product) => (
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
                        onClick={() => addToCart(product)}
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
