import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onBuyNow, 
  onRemoveFromWishlist,
  addingToCart = {},
  buyingNow = {},
  showShopInfo = true,
  showActions = true,
  variant = "default" // default, compact, detailed
}) {
  const {
    _id,
    title,
    price,
    originalPrice,
    image,
    images,
    shop,
    shopName,
    category,
    gender,
    ageCategory,
    sizes,
    colors,
    inventory,
    discount
  } = product;

  const mainImage = images?.[0] || image;
  const isOnSale = originalPrice && originalPrice > price;
  const discountPercentage = isOnSale ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const getCardStyles = () => {
    switch (variant) {
      case "compact":
        return "bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105";
      case "detailed":
        return "bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100";
      default:
        return "bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105";
    }
  };

  const getImageStyles = () => {
    switch (variant) {
      case "compact":
        return "w-full h-32 object-cover rounded-t-xl";
      case "detailed":
        return "w-full h-48 object-cover rounded-t-xl";
      default:
        return "w-full h-40 object-cover rounded-t-xl";
    }
  };

  const renderPrice = () => (
    <div className="flex items-center space-x-2">
      <span className="text-lg font-bold text-gray-900">₹{price}</span>
      {isOnSale && (
        <>
          <span className="text-sm text-gray-500 line-through">₹{originalPrice}</span>
          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
            {discountPercentage}% OFF
          </span>
        </>
      )}
    </div>
  );

  const renderActions = () => {
    if (!showActions) return null;

    return (
      <div className="flex space-x-2 mt-3">
        <button
          onClick={() => onAddToCart?.(_id)}
          disabled={addingToCart[_id]}
          className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {addingToCart[_id] ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Adding...
            </span>
          ) : (
            "Add to Cart"
          )}
        </button>
        
        {onBuyNow && (
          <button
            onClick={() => onBuyNow(_id)}
            disabled={buyingNow[_id]}
            className="flex-1 bg-accent-600 text-white py-2 px-4 rounded-lg hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {buyingNow[_id] ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </span>
            ) : (
              "Buy Now"
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={getCardStyles()}>
      {/* Product Image */}
      <Link to={`/user/product/${_id}`}>
        <div className="relative">
          <img 
            src={mainImage} 
            alt={title}
            className={getImageStyles()}
            onError={(e) => {
              e.target.src = '/placeholder-product.jpg';
            }}
          />
          {isOnSale && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              SALE
            </div>
          )}
          {onRemoveFromWishlist && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onRemoveFromWishlist(_id);
              }}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 p-2 rounded-full transition-colors"
            >
              ❌
            </button>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/user/product/${_id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>

        {showShopInfo && (shopName || shop?.name) && (
          <p className="text-sm text-gray-600 mb-2">
            by {(shopName || shop?.name)}
          </p>
        )}

        {/* Product Meta */}
        <div className="flex flex-wrap gap-1 mb-2">
          {category && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {category}
            </span>
          )}
          {gender && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              {gender}
            </span>
          )}
          {ageCategory && (
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
              {ageCategory}
            </span>
          )}
        </div>

        {/* Price */}
        {renderPrice()}

        {/* Actions */}
        {renderActions()}
      </div>
    </div>
  );
}
