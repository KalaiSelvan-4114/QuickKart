import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

export default function DeliveryHeadDashboard() {
  const [stats, setStats] = useState(null);
  const [unassignedOrders, setUnassignedOrders] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("🔄 Delivery Head Dashboard component mounted");
    loadDashboardData();
  }, []);

  const testDeliveryHeadAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("authRole");
      console.log("🔍 Debug - Token:", token ? "Present" : "Missing");
      console.log("🔍 Debug - Role:", role);
      
      const res = await axiosClient.get("/delivery-head/profile");
      console.log("✅ Delivery Head auth test:", res.data);
      alert(`Delivery Head authenticated! ID: ${res.data._id}`);
    } catch (err) {
      console.error("❌ Delivery Head auth test failed:", err);
      alert("Delivery Head authentication failed: " + (err.response?.data?.error || err.message));
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🔄 Loading delivery head dashboard data...");

      const [statsRes, unassignedRes, boysRes, assignedRes] = await Promise.all([
        axiosClient.get("/delivery-head/dashboard/stats"),
        axiosClient.get("/delivery-head/orders/unassigned"),
        axiosClient.get("/delivery-head/boys"),
        axiosClient.get("/delivery-head/orders/assigned")
      ]);

      console.log("✅ Delivery head dashboard data loaded:", {
        stats: statsRes.data,
        unassigned: unassignedRes.data,
        assigned: assignedRes.data,
        boys: boysRes.data
      });

      setStats(statsRes.data);
      setUnassignedOrders(unassignedRes.data);
      setAssignedOrders(assignedRes.data);
      setDeliveryBoys(boysRes.data);
    } catch (err) {
      console.error("❌ Delivery head dashboard loading error:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      let errorMessage = "Failed to load dashboard data";
      if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (err.response?.status === 404) {
        errorMessage = "Dashboard data not found.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const assignOrder = async (orderId, boyId) => {
    try {
      await axiosClient.post("/delivery-head/orders/assign", { orderId, boyId });
      loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to assign order");
    }
  };

  const confirmDelivery = async (orderId, otp) => {
    if (!otp) return;
    try {
      await axiosClient.post("/delivery-head/orders/confirm", { orderId, otp });
      loadDashboardData();
      alert("Delivery confirmed!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to confirm delivery");
    }
  };

  // Simple loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading delivery dashboard...</p>
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
              onClick={testDeliveryHeadAuth}
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
            <span className="text-2xl">🚚</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Delivery Management Dashboard</h1>
          <p className="text-gray-600">Manage your delivery operations and assign orders</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Boys</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalBoys || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Boys</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.availableBoys || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unassigned Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.unassignedOrders || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">🚚</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.deliveredOrders || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/delivery-head/boys'}
                className="w-full flex items-center justify-between p-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <span>👥 Manage Delivery Boys</span>
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
                <span>{deliveryBoys.length} delivery boys managed</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                <span>{unassignedOrders.length} unassigned orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Unassigned Orders */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Unassigned Orders</h3>
          </div>
          {unassignedOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No unassigned orders</p>
          ) : (
            <div className="space-y-4">
              {unassignedOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order._id.slice(-8)}</p>
                    <p className="text-sm text-gray-600">
                      {order.user?.firstName} {order.user?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">₹{order.total}</p>
                  </div>
                  <div className="flex gap-2">
                    <select 
                      className="border border-gray-300 rounded px-3 py-2"
                      onChange={(e) => assignOrder(order._id, e.target.value)}
                    >
                      <option value="">Select Delivery Boy</option>
                      {deliveryBoys.filter(boy => boy.isAvailable).map(boy => (
                        <option key={boy._id} value={boy.boyId}>
                          {boy.name} ({boy.boyId})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Orders - Delivery confirmation is now via public QR Scan page */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Out for Delivery</h3>
          </div>
          {assignedOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders out for delivery</p>
          ) : (
            <div className="space-y-4">
              {assignedOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order._id.slice(-8)}</p>
                    <p className="text-sm text-gray-600">
                      {order.user?.firstName} {order.user?.lastName}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">Use the public delivery scan page to confirm.</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delivery Boys */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Delivery Boys</h3>
            <button
              onClick={() => window.location.href = '/delivery-head/boys'}
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              Manage All →
            </button>
          </div>
          {deliveryBoys.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No delivery boys added yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliveryBoys.slice(0, 6).map((boy) => (
                <div key={boy._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{boy.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      boy.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {boy.isAvailable ? 'Available' : 'Busy'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">ID: {boy.boyId}</p>
                  <p className="text-sm text-gray-600">Phone: {boy.phone}</p>
                  <p className="text-sm text-gray-600">Deliveries: {boy.totalDeliveries || 0}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


