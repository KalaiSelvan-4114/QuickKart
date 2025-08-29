import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function ShopDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔄 Dashboard component mounted");
    loadDashboardData();
  }, []);

  const testShopAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("authRole");
      console.log("🔍 Debug - Token:", token ? "Present" : "Missing");
      console.log("🔍 Debug - Role:", role);
      
      const res = await axiosClient.get("/shop/debug");
      console.log("✅ Shop auth test:", res.data);
      alert(`Shop authenticated! Shop ID: ${res.data.shopId}, Email: ${res.data.shopEmail}`);
    } catch (err) {
      console.error("❌ Shop auth test failed:", err);
      alert("Shop authentication failed: " + (err.response?.data?.error || err.message));
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔄 Loading shop dashboard data...");

      // Load stats, orders, and products in parallel
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        axiosClient.get("/shop/orders/stats"),
        axiosClient.get("/shop/orders?limit=5"),
        axiosClient.get("/shop/products")
      ]);

      console.log("✅ Dashboard data loaded:", {
        stats: statsRes.data,
        orders: ordersRes.data,
        products: productsRes.data
      });

      setStats(statsRes.data);
      setOrders(ordersRes.data.orders || []);
      setProducts(productsRes.data || []);
    } catch (err) {
      console.error("❌ Dashboard loading error:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      let errorMessage = "Failed to load dashboard data";
      if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (err.response?.status === 404) {
        errorMessage = "Shop data not found.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllOrders = () => {
    navigate("/shop/orders");
  };

  const handleManageProducts = () => {
    navigate("/shop/stock");
  };

  // Simple loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Simple error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={loadDashboardData}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Retry
            </button>
            <button
              onClick={testShopAuth}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Test Authentication
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Simple dashboard content
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-2xl">🏪</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shop Dashboard</h1>
          <p className="text-gray-600">Manage your products, orders, and business</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📋</span>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats?.orderCounts?.total || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <span className="text-2xl mr-3">💰</span>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">₹{stats?.revenue?.total || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⏳</span>
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold">{stats?.orderCounts?.pending || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📢</span>
              <div>
                <p className="text-sm text-gray-600">Notify Delivery</p>
                <p className="text-2xl font-bold">{stats?.orderCounts?.notify_delivery || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📦</span>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleManageProducts}
                className="w-full flex items-center justify-between p-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <span>📦 Manage Products</span>
                <span>→</span>
              </button>
              <button
                onClick={handleViewAllOrders}
                className="w-full flex items-center justify-between p-3 bg-accent-50 text-accent-700 rounded-lg hover:bg-accent-100 transition-colors"
              >
                <span>📋 View All Orders</span>
                <span>→</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                <span>Dashboard loaded successfully</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                <span>{products.length} products in inventory</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                <span>{stats?.orderCounts?.pending || 0} pending orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button
              onClick={handleViewAllOrders}
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              View All →
            </button>
          </div>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order._id.slice(-8)}</p>
                    <p className="text-sm text-gray-600">
                      {order.user?.firstName} {order.user?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{order.total}</p>
                    <p className="text-sm text-gray-600">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Products</h3>
            <button
              onClick={handleManageProducts}
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              View All →
            </button>
          </div>
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No products yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.slice(0, 6).map((product) => (
                <div key={product._id} className="border border-gray-200 rounded-lg p-4">
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h4 className="font-medium text-gray-900">{product.title}</h4>
                  <p className="text-sm text-gray-600">{product.category}</p>
                  <p className="font-semibold text-primary-600">₹{product.price}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
