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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, shopsRes, deliveryHeadsRes, payoutsRes] = await Promise.all([
        axiosClient.get("/admin/orders/stats"),
        axiosClient.get("/admin/orders"),
        axiosClient.get("/admin/pending-shops"),
        axiosClient.get("/admin/pending-delivery-heads"),
        axiosClient.get("/admin/payouts/summary")
      ]);

      setStats(statsRes.data);
      setOrders(ordersRes.data.orders);
      setPendingShops(shopsRes.data);
      setPendingDeliveryHeads(deliveryHeadsRes.data);
      setPayoutSummary(payoutsRes.data);
    } catch (err) {
      setError("Failed to load dashboard data");
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🛡️ Admin Dashboard</h1>

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
              { id: "shops", name: "Pending Shops", icon: "🏪" },
              { id: "delivery-heads", name: "Pending Delivery Heads", icon: "🚚" },
              { id: "payouts", name: "Payouts", icon: "💸" }
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
          </div>
        )}

        {/* Orders Tab */}
        {currentTab === "orders" && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Orders</h2>
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
                          <p className="text-sm text-gray-600">Shop: {order.shop?.name}</p>
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
                        <p>{order.items?.length || 0} items • {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>

                      {order.status === 'delivered' && !order.settlement?.paidToShop && (
                        <button
                          onClick={() => settleOrderWithShop(order._id)}
                          className="btn-primary text-sm px-3 py-1"
                        >
                          Settle with Shop
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pending Shops Tab */}
        {currentTab === "shops" && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pending Shop Approvals</h2>
            </div>
            <div className="p-6">
              {pendingShops.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending shops</p>
              ) : (
                <div className="space-y-4">
                  {pendingShops.map((shop) => (
                    <div key={shop._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{shop.name}</h3>
                          <p className="text-sm text-gray-600">{shop.ownerEmail}</p>
                          <p className="text-sm text-gray-600">{shop.ownerPhone}</p>
                          <p className="text-sm text-gray-600">{shop.address}, {shop.city}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveShop(shop._id)}
                            className="btn-primary text-sm px-3 py-1"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectShop(shop._id)}
                            className="btn-secondary text-sm px-3 py-1 text-red-600 hover:text-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pending Delivery Heads Tab */}
        {currentTab === "delivery-heads" && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pending Delivery Head Approvals</h2>
            </div>
            <div className="p-6">
              {pendingDeliveryHeads.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending delivery heads</p>
              ) : (
                <div className="space-y-4">
                  {pendingDeliveryHeads.map((deliveryHead) => (
                    <div key={deliveryHead._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{deliveryHead.name}</h3>
                          <p className="text-sm text-gray-600">@{deliveryHead.username}</p>
                          <p className="text-sm text-gray-600">{deliveryHead.email}</p>
                          <p className="text-sm text-gray-600">{deliveryHead.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveDeliveryHead(deliveryHead._id)}
                            className="btn-primary text-sm px-3 py-1"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectDeliveryHead(deliveryHead._id)}
                            className="btn-secondary text-sm px-3 py-1 text-red-600 hover:text-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payouts Tab */}
        {currentTab === "payouts" && payoutSummary && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Payout Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Pending Amount</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{payoutSummary.totalPendingAmount.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Pending Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{payoutSummary.totalPendingOrders}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Shops with Pending Payouts</p>
                  <p className="text-2xl font-semibold text-gray-900">{payoutSummary.pendingPayouts.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Pending Payouts by Shop</h3>
              </div>
              <div className="p-6">
                {payoutSummary.pendingPayouts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending payouts</p>
                ) : (
                  <div className="space-y-4">
                    {payoutSummary.pendingPayouts.map((payout) => (
                      <div key={payout._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-900">{payout.shopDetails.name}</h4>
                            <p className="text-sm text-gray-600">{payout.shopDetails.ownerEmail}</p>
                            <p className="text-sm text-gray-600">{payout.orderCount} orders</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">₹{payout.totalAmount.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">Pending</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
