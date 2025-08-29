import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, pending, confirmed, delivered, cancelled
  const [isCancelling, setIsCancelling] = useState({});

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/user/orders");
      // Normalize into a UI-friendly shape
      const normalized = (res.data || []).map(o => ({
        _id: o._id,
        status: o.status,
        createdAt: o.orderDate || o.createdAt,
        subtotal: o.subtotal,
        deliveryFee: o.deliveryFee,
        total: o.total,
        items: (o.items || []).map(it => ({
          title: it.product?.title || 'Product',
          image: it.product?.image || null,
          quantity: it.quantity,
          price: it.price,
          size: it.selectedSize || null,
          color: it.selectedColor || (it.product?.color || null),
          productId: it.product?._id || null,
          shopId: it.product?.shop || null
        })),
        shopId: (o.items?.[0]?.product?.shop) || null,
        shippingDetails: o.shippingDetails || null,
        trackingNumber: o.trackingId || null
      }));
      setOrders(normalized);
    } catch (err) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '⏳';
      case 'confirmed':
        return '✅';
      case 'delivered':
        return '📦';
      case 'cancelled':
        return '❌';
      default:
        return '📋';
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      setIsCancelling(prev => ({ ...prev, [orderId]: true }));
      await axiosClient.post(`/user/orders/${orderId}/cancel`);
      // Refresh orders list after cancellation
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to cancel order");
    } finally {
      setIsCancelling(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    return order.status.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
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
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-3xl">📦</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-display">
            Your Orders
          </h1>
          <p className="text-xl text-gray-600">
            Track your orders and delivery status
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

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { key: "all", label: "All Orders", count: orders.length },
              { key: "pending", label: "Pending", count: orders.filter(o => o.status.toLowerCase() === 'pending').length },
              { key: "confirmed", label: "Confirmed", count: orders.filter(o => o.status.toLowerCase() === 'confirmed').length },
              { key: "delivered", label: "Delivered", count: orders.filter(o => o.status.toLowerCase() === 'delivered').length },
              { key: "cancelled", label: "Cancelled", count: orders.filter(o => o.status.toLowerCase() === 'cancelled').length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors duration-300 ${
                  filter === key 
                    ? "bg-primary-600 text-white" 
                    : "bg-white text-gray-700 hover:bg-primary-50"
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {filter === "all" 
                ? "You haven't placed any orders yet" 
                : `No ${filter} orders found`
              }
            </p>
            <Link to="/user/home" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="card">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Order #{order._id?.slice(-6) || ''}</h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-lg">👕</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.size ? `Size: ${item.size} • `: ''}{item.color ? `Color: ${item.color} • `: ''}Qty: {item.quantity}</p>
                        <p className="text-primary-600 font-medium">
                          ₹{item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Delivery Address</h4>
                    <p className="text-sm text-gray-600">
                      {order.shippingDetails?.firstName} {order.shippingDetails?.lastName}<br />
                      {order.shippingDetails?.address}<br />
                      {order.shippingDetails?.city}, {order.shippingDetails?.state} - {order.shippingDetails?.pincode}<br />
                      Phone: {order.shippingDetails?.phone}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Order Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>₹{order.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Fee:</span>
                        <span>₹{order.deliveryFee}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-1">
                        <span>Total:</span>
                        <span className="text-primary-600">₹{order.total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  {order.status.toLowerCase() === 'pending' && (
                    <button 
                      onClick={() => cancelOrder(order._id)}
                      disabled={isCancelling[order._id]}
                      className="btn-secondary text-sm disabled:opacity-50"
                    >
                      {isCancelling[order._id] ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                  {order.status.toLowerCase() === 'delivered' && (
                    <button className="btn-primary text-sm">
                      Rate & Review
                    </button>
                  )}
                  <Link to={`/user/orders/${order._id}`} className="btn-secondary text-sm">View Details</Link>
                  {order.shopId && (
                    <Link to={`/user/shop/${order.shopId}`} className="btn-secondary text-sm">Visit Shop</Link>
                  )}
                </div>

                {/* Tracking Info */}
                {order.trackingNumber && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-1">Tracking Information</h4>
                    <p className="text-sm text-blue-700">
                      Tracking Number: {order.trackingNumber}
                    </p>
                    {order.trackingUrl && (
                      <a 
                        href={order.trackingUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Track Package →
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
