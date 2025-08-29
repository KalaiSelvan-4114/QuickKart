import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

export default function DeliveryHeadDashboard() {
  const [stats, setStats] = useState(null);
  const [unassignedOrders, setUnassignedOrders] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, boysRes] = await Promise.all([
        axiosClient.get("/delivery-head/dashboard/stats"),
        axiosClient.get("/delivery-head/orders/unassigned"),
        axiosClient.get("/delivery-head/boys")
      ]);

      setStats(statsRes.data);
      setUnassignedOrders(ordersRes.data);
      setDeliveryBoys(boysRes.data);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const assignOrder = async (orderId, boyId) => {
    try {
      await axiosClient.post("/delivery-head/orders/assign", { orderId, boyId });
      // Reload data after assignment
      loadDashboardData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to assign order");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🚚 Delivery Management Dashboard</h1>

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
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalBoys}</p>
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
                  <p className="text-2xl font-semibold text-gray-900">{stats.availableBoys}</p>
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
                  <p className="text-2xl font-semibold text-gray-900">{stats.unassignedOrders}</p>
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
                  <p className="text-2xl font-semibold text-gray-900">{stats.deliveredOrders}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Unassigned Orders */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">📦 Unassigned Orders</h2>
            </div>
            <div className="p-6">
              {unassignedOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No unassigned orders</p>
              ) : (
                <div className="space-y-4">
                  {unassignedOrders.map((order) => (
                    <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-gray-900">Order #{order._id.slice(-6)}</p>
                          <p className="text-sm text-gray-600">
                            {order.user?.firstName} {order.user?.lastName} • {order.user?.phone}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">
                          {order.items?.length || 0} items • ₹{order.total}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <select 
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          onChange={(e) => {
                            if (e.target.value) {
                              assignOrder(order._id, e.target.value);
                            }
                          }}
                        >
                          <option value="">Select delivery boy...</option>
                          {deliveryBoys
                            .filter(boy => boy.isAvailable)
                            .map(boy => (
                              <option key={boy._id} value={boy.boyId}>
                                {boy.boyId} - {boy.name}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Delivery Boys */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">👥 Delivery Boys</h2>
            </div>
            <div className="p-6">
              {deliveryBoys.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No delivery boys added yet</p>
              ) : (
                <div className="space-y-4">
                  {deliveryBoys.map((boy) => (
                    <div key={boy._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{boy.boyId} - {boy.name}</p>
                          <p className="text-sm text-gray-600">{boy.phone}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          boy.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {boy.isAvailable ? 'Available' : 'Busy'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p>Total deliveries: {boy.totalDeliveries}</p>
                        <p>Rating: {boy.rating}/5 ⭐</p>
                        <p>Location: {boy.location?.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


