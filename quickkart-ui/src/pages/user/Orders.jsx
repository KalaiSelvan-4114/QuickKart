import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import PageLayout from "../../components/PageLayout";
import LoadingSpinner from "../../components/LoadingSpinner";

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
    return <LoadingSpinner message="Loading orders..." />;
  }

  return (
    <PageLayout
      title="Your Orders"
      subtitle={`${filteredOrders.length} orders found`}
      icon="📦"
      iconBgColor="from-primary-400 to-primary-600"
    >
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          <div className="flex items-center">
            <span className="mr-2">❌</span>
            {error}
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "confirmed", "delivered", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">📦</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600 mb-6">
            {filter === "all" 
              ? "You haven't placed any orders yet." 
              : `No ${filter} orders found.`
            }
          </p>
          {filter === "all" && (
            <Link
              to="/user/shops"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Start Shopping
            </Link>
          )}
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length > 0 && (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-md p-6">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    <span className="mr-1">{getStatusIcon(order.status)}</span>
                    {order.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Order #{order._id.slice(-8)}
                  </span>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={item.image || '/placeholder-product.jpg'}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} • ₹{item.price}
                        {item.size && ` • Size: ${item.size}`}
                        {item.color && ` • Color: ${item.color}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p>Subtotal: ₹{order.subtotal}</p>
                    <p>Delivery: ₹{order.deliveryFee}</p>
                    <p className="font-semibold text-lg text-gray-900">Total: ₹{order.total}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/user/orders/${order._id}`}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                    >
                      View Details
                    </Link>
                    {order.status.toLowerCase() === 'pending' && (
                      <button
                        onClick={() => cancelOrder(order._id)}
                        disabled={isCancelling[order._id]}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                      >
                        {isCancelling[order._id] ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
