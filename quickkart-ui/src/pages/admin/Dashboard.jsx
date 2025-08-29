import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [pendingShops, setPendingShops] = useState([]);
  const [pendingDeliveryHeads, setPendingDeliveryHeads] = useState([]);
  const [payoutSummary, setPayoutSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTab, setCurrentTab] = useState("overview");

  const tabs = [
    { id: "overview", name: "Overview", icon: "📊" },
    { id: "orders", name: "Orders & Sales", icon: "📦" },
    { id: "pending-shops", name: "Pending Shops", icon: "🏪" },
    { id: "pending-delivery", name: "Pending Delivery Heads", icon: "🚚" },
    { id: "payouts", name: "Payouts", icon: "💰" }
  ];

  useEffect(() => {
    console.log("🔄 Admin Dashboard component mounted");
    loadDashboardData();
  }, []);

  const testAdminAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("authRole");
      console.log("🔍 Debug - Token:", token ? "Present" : "Missing");
      console.log("🔍 Debug - Role:", role);
      
      const res = await axiosClient.get("/admin/test-auth");
      console.log("✅ Admin auth test:", res.data);
      alert(`Admin authenticated! Admin ID: ${res.data.adminId}`);
    } catch (err) {
      console.error("❌ Admin auth test failed:", err);
      alert("Admin authentication failed: " + (err.response?.data?.error || err.message));
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔄 Loading admin dashboard data...");

      const [statsRes, ordersRes, shopsRes, deliveryHeadsRes, payoutsRes] = await Promise.all([
        axiosClient.get("/admin/orders/stats"),
        axiosClient.get("/admin/orders"),
        axiosClient.get("/admin/pending-shops"),
        axiosClient.get("/admin/pending-delivery-heads"),
        axiosClient.get("/admin/payouts/summary")
      ]);

      console.log("✅ Admin dashboard data loaded:", {
        stats: statsRes.data,
        orders: ordersRes.data,
        shops: shopsRes.data,
        deliveryHeads: deliveryHeadsRes.data,
        payouts: payoutsRes.data
      });

      setStats(statsRes.data);
      setOrders(ordersRes.data.orders || ordersRes.data);
      setPendingShops(shopsRes.data);
      setPendingDeliveryHeads(deliveryHeadsRes.data);
      setPayoutSummary(payoutsRes.data);
    } catch (err) {
      console.error("❌ Admin dashboard loading error:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      let errorMessage = "Failed to load dashboard data";
      if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (err.response?.status === 404) {
        errorMessage = "Admin data not found.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const approveShop = async (shopId) => {
    try {
      await axiosClient.put(`/admin/shops/${shopId}/approve`);
      loadDashboardData();
    } catch (err) {
      setError("Failed to approve shop");
    }
  };

  const rejectShop = async (shopId) => {
    if (window.confirm("Are you sure you want to reject this shop?")) {
      try {
        await axiosClient.delete(`/admin/shops/${shopId}/reject`);
        loadDashboardData();
      } catch (err) {
        setError("Failed to reject shop");
      }
    }
  };

  const approveDeliveryHead = async (deliveryHeadId) => {
    try {
      await axiosClient.put(`/admin/delivery-heads/${deliveryHeadId}/approve`);
      loadDashboardData();
    } catch (err) {
      setError("Failed to approve delivery head");
    }
  };

  const rejectDeliveryHead = async (deliveryHeadId) => {
    if (window.confirm("Are you sure you want to reject this delivery head?")) {
      try {
        await axiosClient.delete(`/admin/delivery-heads/${deliveryHeadId}/reject`);
        loadDashboardData();
      } catch (err) {
        setError("Failed to reject delivery head");
      }
    }
  };

  const settleOrderWithShop = async (orderId) => {
    try {
      await axiosClient.put(`/admin/orders/${orderId}/settle-shop`);
      loadDashboardData();
    } catch (err) {
      setError("Failed to settle order with shop");
    }
  };

  // Simple loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
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
              onClick={testAdminAuth}
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
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-2xl">👑</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage QuickKart platform</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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

        {/* Tab Content */}
        {currentTab === "overview" && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📦</span>
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💰</span>
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">₹{stats?.totalRevenue || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🏪</span>
                  <div>
                    <p className="text-sm text-gray-600">Pending Shops</p>
                    <p className="text-2xl font-bold">{pendingShops.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🚚</span>
                  <div>
                    <p className="text-sm text-gray-600">Pending Delivery Heads</p>
                    <p className="text-2xl font-bold">{pendingDeliveryHeads.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  <span>Dashboard loaded successfully</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  <span>{orders.length} orders in system</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                  <span>{pendingShops.length} shops pending approval</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  <span>{pendingDeliveryHeads.length} delivery heads pending approval</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === "orders" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders & Sales</h3>
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders found</p>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 10).map((order) => (
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
        )}

        {currentTab === "pending-shops" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Shops</h3>
            {pendingShops.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending shops</p>
            ) : (
              <div className="space-y-4">
                {pendingShops.map((shop) => (
                  <div key={shop._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">{shop.name}</p>
                      <p className="text-sm text-gray-600">{shop.ownerEmail}</p>
                      <p className="text-sm text-gray-600">{shop.address}, {shop.city}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveShop(shop._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectShop(shop._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === "pending-delivery" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Delivery Heads</h3>
            {pendingDeliveryHeads.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending delivery heads</p>
            ) : (
              <div className="space-y-4">
                {pendingDeliveryHeads.map((deliveryHead) => (
                  <div key={deliveryHead._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">{deliveryHead.name}</p>
                      <p className="text-sm text-gray-600">{deliveryHead.email}</p>
                      <p className="text-sm text-gray-600">{deliveryHead.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveDeliveryHead(deliveryHead._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectDeliveryHead(deliveryHead._id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === "payouts" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payouts Summary</h3>
            {payoutSummary ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Total Pending</p>
                    <p className="text-2xl font-bold text-blue-800">₹{payoutSummary.totalPending || 0}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Total Settled</p>
                    <p className="text-2xl font-bold text-green-800">₹{payoutSummary.totalSettled || 0}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-600">Pending Orders</p>
                    <p className="text-2xl font-bold text-yellow-800">{payoutSummary.pendingOrders || 0}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No payout data available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
