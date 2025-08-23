import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, nearby, others
  const [radiusKm, setRadiusKm] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Request cancellation and cleanup
  const abortControllerRef = useRef(null);
  const isComponentMountedRef = useRef(true);

  useEffect(() => {
    loadShops();
    
    // Cleanup function
    return () => {
      isComponentMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filter, radiusKm]);

  const loadShops = async () => {
    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      abortControllerRef.current = new AbortController();
      
      setLoading(true);
      console.log("🔍 Loading shops with filter:", filter, "radius:", radiusKm);
      const radiusQuery = filter === 'nearby' ? `&radius=${radiusKm}` : '';
      const res = await axiosClient.get(`/user/shops?filter=${filter}${radiusQuery}`, {
        signal: abortControllerRef.current.signal,
        timeout: 25000 // 25 second timeout
      });
      
      // Check if component is still mounted
      if (!isComponentMountedRef.current) return;
      
      console.log("✅ Shops response:", res.data);
      setShops(res.data);
    } catch (err) {
      // Check if component is still mounted
      if (!isComponentMountedRef.current) return;
      
      // Handle cancellation separately
      if (err.name === 'AbortError') {
        console.log("🔄 Shops request was cancelled");
        return;
      }
      
      console.error("❌ Error loading shops:", err);
      setError("Failed to load shops");
    } finally {
      // Only update state if component is still mounted
      if (isComponentMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-2xl">🏪</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-display">
            Browse Shops
          </h1>
          <p className="text-xl text-gray-600">
            Discover amazing shops and their collections
          </p>
        </div>

        {/* Filter and Search */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl font-medium transition-colors duration-300 ${
                filter === "all" 
                  ? "bg-primary-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-primary-50"
              }`}
            >
              All Shops
            </button>
            <button
              onClick={() => setFilter("nearby")}
              className={`px-4 py-2 rounded-xl font-medium transition-colors duration-300 ${
                filter === "nearby" 
                  ? "bg-primary-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-primary-50"
              }`}
            >
              Nearby (5-10km)
            </button>
            {filter === 'nearby' && (
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="ml-2 input-field"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={15}>15 km</option>
              </select>
            )}
            <button
              onClick={() => setFilter("others")}
              className={`px-4 py-2 rounded-xl font-medium transition-colors duration-300 ${
                filter === "others" 
                  ? "bg-primary-600 text-white" 
                  : "bg-white text-gray-700 hover:bg-primary-50"
              }`}
            >
              Other Shops
            </button>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search shops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 pr-4"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading shops...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        

        {/* Shops Grid */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
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
                  {shop.license && (
                    <p className="text-gray-500 text-xs">
                      📄 License: {shop.license}
                    </p>
                  )}
                  {shop.gst && (
                    <p className="text-gray-500 text-xs">
                      🏢 GST: {shop.gst}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-gray-500">
                      {typeof shop.distanceKm === 'number'
                        ? `${shop.distanceKm.toFixed(1)} km away`
                        : (typeof shop.distance === 'number' ? `${shop.distance.toFixed(1)} km away` : 'Location not set')}
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
        )}

        {/* Empty State */}
        {!loading && !error && filteredShops.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No shops found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search terms" : "No shops available in this category"}
            </p>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            to="/user/home"
            className="btn-secondary inline-flex items-center"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
