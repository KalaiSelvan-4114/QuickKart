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
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get available quantity for selected size and color
  const getAvailableQuantity = (size, color) => {
    if (!product || !product.inventory) return 0;
    const item = product.inventory.find(
      inv => inv.size === size && inv.color === color
    );
    return item ? item.quantity : 0;
  };

  const availableQuantity = getAvailableQuantity(selectedSize, selectedColor);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axiosClient.get(`/user/products/${productId}`);
        setProduct(res.data);
        // Pre-select defaults
        if (Array.isArray(res.data.sizes) && res.data.sizes.length > 0) {
          setSelectedSize(res.data.sizes[0]);
        }
        if (Array.isArray(res.data.colors) && res.data.colors.length > 0) {
          setSelectedColor(res.data.colors[0]);
        } else if (res.data.color) {
          setSelectedColor(res.data.color);
        }
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
      const selectedImageColor = product.images?.[selectedImageIndex]?.color || selectedColor;
      await addToCart(product._id, quantity, selectedSize || null, selectedImageColor || null, product);
    } catch (_) {
      setError("Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setAdding(true);
      const selectedImageColor = product.images?.[selectedImageIndex]?.color || selectedColor;
      await addToCart(product._id, quantity, selectedSize || null, selectedImageColor || null, product);
      navigate("/user/checkout");
    } catch (_) {
      setError("Could not proceed to checkout");
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
          {/* Main Image Display */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[selectedImageIndex]?.url || product.image} 
                  alt={product.title} 
                  className="w-full h-full object-cover" 
                />
              ) : product.image ? (
                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl">👕</span>
                </div>
              )}
            </div>
            
            {/* Image Thumbnails for Color Variants */}
            {product.images && product.images.length > 1 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">More Colors</h3>
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index 
                          ? 'border-blue-600 ring-2 ring-blue-200' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img 
                        src={img.url} 
                        alt={`${product.title} - ${img.color || 'Variant'}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
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
            {/* Color selection */}
            {(product.images?.length > 1 || product.colors?.length > 0 || product.color) && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.images && product.images.length > 1 ? (
                    // Use colors from multiple images
                    product.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedImageIndex(index);
                          setSelectedColor(img.color || product.color);
                        }}
                        className={`w-9 h-9 rounded-full border-2 ${
                          selectedImageIndex === index ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-300'
                        }`}
                        title={img.color || `Variant ${index + 1}`}
                        style={{ backgroundColor: img.color || '#ccc' }}
                      />
                    ))
                  ) : (product.colors?.length ? product.colors : [product.color]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`w-9 h-9 rounded-full border-2 ${selectedColor === c ? 'border-blue-600' : 'border-gray-300'}`}
                      title={c}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {product.sizes?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => {
                    const hasStock = product.inventory?.some(inv => 
                      inv.size === s && inv.quantity > 0
                    );
                    return (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        disabled={!hasStock}
                        className={`px-3 py-2 border-2 rounded-md text-sm ${
                          selectedSize === s 
                            ? 'border-blue-600 bg-blue-50 text-blue-700' 
                            : hasStock 
                              ? 'border-gray-300 hover:border-gray-400' 
                              : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        title={hasStock ? `Select size ${s}` : `Size ${s} out of stock`}
                      >
                        {s}
                        {!hasStock && <span className="ml-1 text-xs">(OOS)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Quantity</h3>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  disabled={quantity <= 1}
                  className="w-10 h-10 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="w-10 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  disabled={quantity >= availableQuantity}
                  className="w-10 h-10 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              {availableQuantity > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {availableQuantity} available in stock
                </p>
              )}
              {availableQuantity === 0 && selectedSize && selectedColor && (
                <p className="text-xs text-red-500 mt-1">
                  Out of stock for this size and color combination
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button 
                onClick={handleAddToCart} 
                disabled={adding || availableQuantity === 0 || !selectedSize || !selectedColor} 
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? "Adding..." : availableQuantity === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
              <button 
                onClick={handleBuyNow} 
                disabled={adding || availableQuantity === 0 || !selectedSize || !selectedColor} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? "Processing..." : availableQuantity === 0 ? "Out of Stock" : "Shop Now"}
              </button>
              <div className="flex gap-3">
                <button onClick={handleAddToWishlist} className="btn-secondary flex-1">❤️ Wishlist</button>
                {product.shop && (
                  <Link to={`/user/shop/${product.shop._id || product.shop}`} className="btn-secondary flex-1">Visit Shop</Link>
                )}
              </div>
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
