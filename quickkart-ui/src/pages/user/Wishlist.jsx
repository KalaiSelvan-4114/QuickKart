import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/user/wishlist");
      setWishlist(res.data);
    } catch (err) {
      setError("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axiosClient.delete(`/user/wishlist/${productId}`);
      setWishlist(prev => prev.filter(item => item._id !== productId));
    } catch (err) {
      setError("Failed to remove from wishlist");
    }
  };

  const addToCart = async (productId) => {
    try {
      await axiosClient.post("/user/cart", { productId, quantity: 1 });
      // Show success notification
    } catch (err) {
      setError("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wishlist...</p>
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
        <div className="text-center mb-12">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-3xl">❤️</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-display">
            Your Wishlist
          </h1>
          <p className="text-xl text-gray-600">
            {wishlist.length} items saved for later
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {wishlist.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Start adding products you love</p>
            <Link to="/user/home" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div key={item._id} className="card hover:scale-105 transition-transform duration-300">
                <div className="aspect-square bg-gray-200 rounded-xl mb-4 overflow-hidden relative">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">👕</span>
                    </div>
                  )}
                  
                  {/* Remove from wishlist button */}
                  <button
                    onClick={() => removeFromWishlist(item._id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-red-500 hover:text-red-700 transition-colors"
                    title="Remove from wishlist"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800 line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-1">
                    {item.category && (
                      <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
                        {item.category}
                      </span>
                    )}
                    {item.gender && (
                      <span className="bg-accent-100 text-accent-800 px-2 py-1 rounded-full text-xs">
                        {item.gender}
                      </span>
                    )}
                    {item.ageCategory && (
                      <span className="bg-secondary-100 text-secondary-800 px-2 py-1 rounded-full text-xs">
                        {item.ageCategory}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm">
                    Color: {item.color}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Sizes: {item.sizes?.join(', ')}
                  </p>
                  
                  <p className="text-primary-600 font-bold text-lg">
                    ₹{item.price}
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(item._id)}
                      className="btn-primary flex-1 text-sm py-2"
                    >
                      Add to Cart
                    </button>
                    <Link
                      to={`/user/shop/${item.shopId}`}
                      className="btn-secondary text-sm py-2 px-3"
                    >
                      View Shop
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {wishlist.length > 0 && (
          <div className="mt-12 text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/user/home" className="btn-secondary">
                Continue Shopping
              </Link>
              <Link to="/user/cart" className="btn-primary">
                View Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
