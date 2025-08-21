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

  const addToCart = async (productId, quantity = 1, selectedSize = null) => {
    try {
      setLoading(true);
      const res = await axiosClient.post('/user/cart', { productId, quantity, selectedSize });
      
      if (res.data.success) {
        // Reload cart to get updated data
        await loadCart();
        return { success: true, message: 'Added to cart successfully!' };
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
      const errorMessage = err.response?.data?.error || 'Failed to add to cart';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      setLoading(true);
      const res = await axiosClient.put(`/user/cart/${itemId}`, { quantity });
      
      if (res.data.success) {
        await loadCart();
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
        await loadCart();
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
