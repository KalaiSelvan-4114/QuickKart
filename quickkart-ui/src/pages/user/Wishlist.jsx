import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useCart } from "../../contexts/CartContext";
import PageLayout from "../../components/PageLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import NotificationToast from "../../components/NotificationToast";
import ProductCard from "../../components/ProductCard";

export default function Wishlist() {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState({});
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

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
      setNotification({ show: true, message: "Removed from wishlist", type: "success" });
    } catch (err) {
      setNotification({ show: true, message: "Failed to remove from wishlist", type: "error" });
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      setAddingToCart(prev => ({ ...prev, [productId]: true }));
      const item = wishlist.find(w => w._id === productId);
      const result = await addToCart(productId, 1, null, null, item);
      
      if (result.success) {
        setError(""); // Clear any previous errors
        setNotification({ show: true, message: result.message, type: "success" });
      } else {
        setError(result.message || "Failed to add to cart");
        setNotification({ show: true, message: result.message, type: "error" });
      }
    } catch (err) {
      setError("Failed to add to cart");
      setNotification({ show: true, message: "Failed to add to cart", type: "error" });
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleBuyNow = async (productId) => {
    try {
      setAddingToCart(prev => ({ ...prev, [productId]: true }));
      const item = wishlist.find(w => w._id === productId);
      const result = await addToCart(productId, 1, null, null, item);
      
      if (result.success) {
        window.location.href = '/user/checkout';
      } else {
        setNotification({ show: true, message: result.message, type: "error" });
      }
    } catch (err) {
      setNotification({ show: true, message: "Failed to proceed to checkout", type: "error" });
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading wishlist..." />;
  }

  return (
    <PageLayout
      title="Your Wishlist"
      subtitle={`${wishlist.length} items saved for later`}
      icon="❤️"
      iconBgColor="from-accent-400 to-accent-600"
    >
      {/* Notification Toast */}
      <NotificationToast
        notification={notification}
        onClose={() => setNotification({ show: false, message: "", type: "" })}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          <div className="flex items-center">
            <span className="mr-2">❌</span>
            {error}
          </div>
        </div>
      )}

      {/* Empty State */}
      {wishlist.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">💔</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-6">Start adding items you love to your wishlist!</p>
          <Link
            to="/user/shops"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Browse Shops
          </Link>
        </div>
      )}

      {/* Wishlist Grid */}
      {wishlist.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <ProductCard
              key={item._id}
              product={item}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onRemoveFromWishlist={removeFromWishlist}
              addingToCart={addingToCart}
              buyingNow={addingToCart} // Reuse addingToCart state for buy now
              showShopInfo={true}
              showActions={true}
              variant="default"
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
