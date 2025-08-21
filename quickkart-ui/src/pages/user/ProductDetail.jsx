import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useCart } from "../../contexts/CartContext";

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axiosClient.get(`/user/products/${productId}`);
        setProduct(res.data);
      } catch (err) {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await addToCart(product._id, 1, selectedSize || null);
      navigate("/user/cart");
    } catch (_) {
      setError("Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      await axiosClient.post("/user/wishlist", { productId: product._id });
    } catch (_) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Product not found</h3>
          <p className="text-gray-600">{error || "We couldn't find this product."}</p>
          <Link to="/user/home" className="btn-primary mt-4">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 card">
          <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden">
            {product.image ? (
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl">👕</span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900 font-display">{product.title}</h1>
            <p className="text-primary-600 font-bold text-2xl">₹{product.price}</p>
            {product.description && (
              <p className="text-gray-700">{product.description}</p>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              {product.category && <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">{product.category}</span>}
              {product.footwearCategory && <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">{product.footwearCategory}</span>}
              {product.gender && <span className="bg-accent-100 text-accent-800 px-2 py-1 rounded-full text-xs">{product.gender}</span>}
              {product.ageCategory && <span className="bg-secondary-100 text-secondary-800 px-2 py-1 rounded-full text-xs">{product.ageCategory}</span>}
              {product.styleFit && <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">{product.styleFit}</span>}
              {product.color && <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs">{product.color}</span>}
            </div>
            {product.sizes?.length > 0 && (
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3 py-1 rounded-full border ${selectedSize === sz ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300'}`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button onClick={handleAddToCart} disabled={adding} className="btn-primary">
                {adding ? "Adding..." : "Add to Cart"}
              </button>
              <button onClick={handleAddToWishlist} className="btn-secondary">❤️ Wishlist</button>
              {product.shop && (
                <Link to={`/user/shop/${product.shop._id || product.shop}`} className="btn-secondary">Visit Shop</Link>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <button onClick={() => navigate(-1)} className="btn-secondary">← Back</button>
        </div>
      </div>
    </div>
  );
}
