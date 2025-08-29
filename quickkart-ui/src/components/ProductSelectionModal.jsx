import { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";

export default function ProductSelectionModal({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart, 
  onBuyNow,
  mode = "cart" // "cart" or "buyNow"
}) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize("");
      setSelectedColor("");
      setQuantity(1);
      setError("");
      
      // Auto-select first available size and color if only one option
      if (product.sizes && product.sizes.length === 1) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.color && !product.colors) {
        setSelectedColor(product.color);
      }
      if (product.colors && product.colors.length === 1) {
        setSelectedColor(product.colors[0]);
      }
    }
  }, [product]);

  const handleSubmit = async () => {
    if (!product) return;

    // Validate selections
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setError("Please select a size");
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setError("Please select a color");
      return;
    }
    if (quantity < 1) {
      setError("Please select a valid quantity");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (mode === "buyNow") {
        await onBuyNow({
          productId: product._id,
          quantity,
          selectedSize: selectedSize || null,
          selectedColor: selectedColor || null
        });
      } else {
        await onAddToCart({
          productId: product._id,
          quantity,
          selectedSize: selectedSize || null,
          selectedColor: selectedColor || null
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {mode === "buyNow" ? "Buy Now" : "Add to Cart"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Product Info */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl">👕</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-800 line-clamp-2 mb-1">
              {product.title}
            </h4>
            <p className="text-primary-600 font-bold">
              ₹{product.price?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>

        {/* Size Selection */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Size {product.sizes.length === 1 && "(Only one available)"}
            </label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition-all duration-200 ${
                    selectedSize === size
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-25'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Selection */}
        {product.colors && product.colors.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Color {product.colors.length === 1 && "(Only one available)"}
            </label>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 rounded-lg border-2 font-medium transition-all duration-200 ${
                    selectedColor === color
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-25'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-gray-700"
            >
              -
            </button>
            <span className="w-12 text-center font-semibold text-gray-800">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700"
            >
              +
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 ${
              mode === "buyNow"
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {mode === "buyNow" ? "Processing..." : "Adding..."}
              </div>
            ) : (
              <>
                {mode === "buyNow" ? "🚀 Buy Now" : "🛒 Add to Cart"}
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>

        {/* Total Price */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">Total:</p>
          <p className="text-xl font-bold text-primary-600">
            ₹{(product.price * quantity)?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>
    </div>
  );
}
