import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

export default function ShopDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTab, setCurrentTab] = useState("overview");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        axiosClient.get("/shop/orders/stats"),
        axiosClient.get("/shop/orders"),
        axiosClient.get("/shop/products")
      ]);

      setStats(statsRes.data);
      setOrders(ordersRes.data.orders);
      setProducts(productsRes.data);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axiosClient.put(`/shop/orders/${orderId}/status`, { status: newStatus });
      loadDashboardData();
    } catch (err) {
      setError("Failed to update order status");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🏪 Shop Dashboard</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", name: "Overview", icon: "📊" },
              { id: "orders", name: "Orders & Sales", icon: "📦" },
              { id: "products", name: "Products", icon: "🛍️" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  currentTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {currentTab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.orderCounts.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.orderCounts.delivered}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900">₹{stats.revenue.total.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-semibold text-gray-900">₹{Math.round(stats.revenue.average)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Order Status Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(stats.orderCounts).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="capitalize text-gray-600">{status.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
                <div className="space-y-2">
                  {stats.monthlyRevenue.map((month) => (
                    <div key={month._id} className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {new Date(2024, month._id - 1).toLocaleDateString('en-US', { month: 'long' })}
                      </span>
                      <span className="font-semibold">₹{month.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Pending Payouts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Pending Amount</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{stats.pendingPayouts.totalAmount.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pendingPayouts.orderCount}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {currentTab === "orders" && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Shop Orders</h2>
            </div>
            <div className="p-6">
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No orders found</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-gray-900">Order #{order._id.slice(-6)}</p>
                          <p className="text-sm text-gray-600">
                            {order.user?.firstName} {order.user?.lastName} • {order.user?.phone}
                          </p>
                          <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                          <p className="text-sm font-medium mt-1">₹{order.total}</p>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <p>Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        {order.settlement?.paidToShop && (
                          <p className="text-green-600">✅ Settled with Admin</p>
                        )}
                      </div>

                      {/* Order Status Update */}
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order._id, 'confirmed')}
                              className="btn-primary text-sm px-3 py-1"
                            >
                              Confirm Order
                            </button>
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => updateOrderStatus(order._id, 'processing')}
                              className="btn-primary text-sm px-3 py-1"
                            >
                              Start Processing
                            </button>
                          )}
                          {order.status === 'processing' && (
                            <button
                              onClick={() => updateOrderStatus(order._id, 'shipped')}
                              className="btn-primary text-sm px-3 py-1"
                            >
                              Mark Shipped
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {currentTab === "products" && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Shop Products</h2>
            </div>
            <div className="p-6">
              {products.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No products found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div key={product._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="mb-3">
                        <h3 className="font-medium text-gray-900">{product.title}</h3>
                        <p className="text-sm text-gray-600">{product.category}</p>
                        <p className="text-sm text-gray-600">₹{product.price}</p>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        {product.sizes && product.sizes.length > 0 && (
                          <p>Sizes: {product.sizes.join(', ')}</p>
                        )}
                        {product.colors && product.colors.length > 0 && (
                          <p>Colors: {product.colors.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
