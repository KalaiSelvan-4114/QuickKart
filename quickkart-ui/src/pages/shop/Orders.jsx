import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

export default function ShopOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, pending, confirmed, delivered
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosClient.get("/shop/orders");
      
      // Handle the response format from our backend
      if (res.data.orders) {
        setOrders(res.data.orders);
        setPagination(res.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalOrders: res.data.orders.length,
          hasNext: false,
          hasPrev: false
        });
      } else {
        // Fallback for direct array response
        setOrders(Array.isArray(res.data) ? res.data : []);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalOrders: Array.isArray(res.data) ? res.data.length : 0,
          hasNext: false,
          hasPrev: false
        });
      }
    } catch (err) {
      console.error("Error loading orders:", err);
      if (err.response?.status === 401) {
        setError("Token required. Please re-open this page or re-login as Shop.");
      } else {
        setError(err.response?.data?.error || "Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const RetryInline = () => (
    <button
      onClick={loadOrders}
      className="ml-3 text-sm bg-gray-800 text-white px-3 py-1 rounded-lg hover:bg-gray-900"
    >
      Retry
    </button>
  );

  const testShopAuth = async () => {
    try {
      const res = await axiosClient.get("/shop/debug");
      console.log("Shop auth test:", res.data);
      alert(`Shop authenticated! Shop ID: ${res.data.shopId}, Email: ${res.data.shopEmail}`);
    } catch (err) {
      console.error("Shop auth test failed:", err);
      alert("Shop authentication failed: " + (err.response?.data?.error || err.message));
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axiosClient.put(`/shop/orders/${orderId}/status`, { status: newStatus });
      loadOrders(); // Reload orders to get updated status
    } catch (err) {
      setError("Failed to update order status");
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'notify_delivery':
        return 'bg-orange-100 text-orange-800';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
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
      case 'notify_delivery':
        return '📢';
      case 'out_for_delivery':
        return '🚚';
      case 'delivered':
        return '📦';
      case 'cancelled':
        return '❌';
      default:
        return '📋';
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
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-3xl">📋</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-display">
            Shop Orders
          </h1>
          <p className="text-xl text-gray-600">
            Manage and track your customer orders
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
                <RetryInline />
              </div>
              <button
                onClick={testShopAuth}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
              >
                Test Shop Auth
              </button>
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
              { key: "notify_delivery", label: "Notify Delivery", count: orders.filter(o => o.status.toLowerCase() === 'notify_delivery').length },
              { key: "out_for_delivery", label: "Out for Delivery", count: orders.filter(o => o.status.toLowerCase() === 'out_for_delivery').length },
              { key: "delivered", label: "Delivered", count: orders.filter(o => o.status.toLowerCase() === 'delivered').length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors duration-300 ${
                  filter === key 
                    ? "bg-accent-600 text-white" 
                    : "bg-white text-gray-700 hover:bg-accent-50"
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {filter === "all" 
                ? "You haven't received any orders yet" 
                : `No ${filter} orders found`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="card">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt || order.orderDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Customer: {order.user?.firstName} {order.user?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Email: {order.user?.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      Phone: {order.user?.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Shipping Address</h4>
                  <p className="text-sm text-gray-600">
                    {order.shippingDetails?.firstName} {order.shippingDetails?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.shippingDetails?.address}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.shippingDetails?.city}, {order.shippingDetails?.state} - {order.shippingDetails?.pincode}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phone: {order.shippingDetails?.phone}
                  </p>
                </div>

                {/* Order Items */}
                <div className="space-y-4 mb-4">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product?.image ? (
                          <img 
                            src={item.product.image} 
                            alt={item.product.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-lg">👕</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.product?.title || 'Product'}</h4>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} • Price: ₹{item.price}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total: ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Subtotal: ₹{order.subtotal}</p>
                    <p className="text-sm text-gray-600">Delivery: ₹{order.deliveryFee || 0}</p>
                    <p className="font-semibold text-gray-800">Total: ₹{order.total}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Payment: {order.paymentMethod}</p>
                    {order.orderNotes && (
                      <p className="text-sm text-gray-600">Notes: {order.orderNotes}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'confirmed')}
                      className="btn-primary text-sm"
                    >
                      ✅ Confirm Order
                    </button>
                  )}
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'notify_delivery')}
                      className="btn-accent text-sm"
                    >
                      🚚 Notify Delivery
                    </button>
                  )}
                  {order.status === 'notify_delivery' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'out_for_delivery')}
                      className="btn-accent text-sm"
                    >
                      🚚 Out for Delivery
                    </button>
                  )}
                  {order.status === 'out_for_delivery' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'delivered')}
                      className="btn-success text-sm"
                    >
                      📦 Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              {pagination.hasPrev && (
                <button
                  onClick={() => loadOrders(pagination.currentPage - 1)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              <span className="px-4 py-2 bg-primary-600 text-white rounded-lg">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              {pagination.hasNext && (
                <button
                  onClick={() => loadOrders(pagination.currentPage + 1)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
