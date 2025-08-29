import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/user/cart');
      
      // The backend now returns properly populated cart data
      setCart(res.data);
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1, selectedSize = null, selectedColor = null, productData = null) => {
    try {
      setLoading(true);
      const res = await axiosClient.post('/user/cart', { productId, quantity, selectedSize, selectedColor });
      
      if (res.data.success) {
        // If it's a new item, add it optimistically with actual product data
        if (res.data.cartItem) {
          const newItem = {
            _id: res.data.cartItem._id,
            productId: productId,
            quantity: res.data.cartItem.quantity,
            selectedSize: res.data.cartItem.selectedSize,
            selectedColor: res.data.cartItem.selectedColor,
            // Use actual product data if available, otherwise use backend response
            title: productData?.title || res.data.cart?.find(item => item.productId === productId)?.title || 'Product',
            price: productData?.price || res.data.cart?.find(item => item.productId === productId)?.price || 0,
            image: productData?.image || res.data.cart?.find(item => item.productId === productId)?.image || null,
            category: productData?.category || res.data.cart?.find(item => item.productId === productId)?.category || null,
            color: productData?.color || res.data.cart?.find(item => item.productId === productId)?.color || null,
            sizes: productData?.sizes || res.data.cart?.find(item => item.productId === productId)?.sizes || null,
            gender: productData?.gender || res.data.cart?.find(item => item.productId === productId)?.gender || null,
            ageCategory: productData?.ageCategory || res.data.cart?.find(item => item.productId === productId)?.ageCategory || null,
            styleFit: productData?.styleFit || res.data.cart?.find(item => item.productId === productId)?.styleFit || null,
            productType: productData?.productType || res.data.cart?.find(item => item.productId === productId)?.productType || null,
            footwearCategory: productData?.footwearCategory || res.data.cart?.find(item => item.productId === productId)?.footwearCategory || null,
            shopId: productData?.shop || res.data.cart?.find(item => item.productId === productId)?.shopId || null
          };
          
          // If we still don't have proper product data, reload the cart to get it from backend
          if (!productData?.title || productData?.title === 'Product' || !productData?.price) {
            await loadCart();
          } else {
            setCart(prev => [...prev, newItem]);
          }
        } else {
          // Item already exists, just reload to get updated quantities
          await loadCart();
        }
        return { success: true, message: productData?.title ? `Added ${productData.title} to cart!` : 'Added to cart successfully!' };
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to add to cart';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity, selectedSize, selectedColor, notes) => {
    try {
      setLoading(true);
      const res = await axiosClient.put(`/user/cart/${itemId}`, { quantity, selectedSize, selectedColor, notes });
      
      if (res.data.success) {
        // Optimistically update the cart instead of reloading
        setCart(prev => prev.map(item => 
          item._id === itemId 
            ? { ...item, quantity, selectedSize, selectedColor, notes }
            : item
        ));
        return { success: true, message: 'Cart updated successfully!' };
      }
    } catch (err) {
      console.error('Failed to update cart:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update cart';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const res = await axiosClient.delete(`/user/cart/${itemId}`);
      
      if (res.data.success) {
        // Optimistically update the cart instead of reloading
        setCart(prev => prev.filter(item => item._id !== itemId));
        return { success: true, message: 'Item removed from cart!' };
      }
    } catch (err) {
      console.error('Failed to remove from cart:', err);
      const errorMessage = err.response?.data?.error || 'Failed to remove from cart';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setCart([]);
    setError('');
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
    getCartItemCount,
    getCartTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
