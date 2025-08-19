import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function PendingShops() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axiosClient.get("/admin/pending");
        setPending(res.data || []);
      } catch (e) {
        setError("Failed to fetch pending shops");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const approveShop = async (id) => {
    try {
      await axiosClient.put(`/admin/approve/${id}`);
      setPending(prev => prev.filter(s => s._id !== id));
      setToast("✅ Shop approved");
      setTimeout(() => setToast(""), 2500);
    } catch {
      setToast("❌ Approval failed");
      setTimeout(() => setToast(""), 2500);
    }
  };

  const declineShop = async (id) => {
    try {
      await axiosClient.delete(`/admin/decline/${id}`);
      setPending(prev => prev.filter(s => s._id !== id));
      setToast("🛑 Shop declined");
      setTimeout(() => setToast(""), 2500);
    } catch {
      setToast("❌ Decline failed");
      setTimeout(() => setToast(""), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-secondary-200 border-t-secondary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending shops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-3xl">🛡️</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 font-display">Pending Shops</h1>
          <p className="text-gray-600">Review and approve shop registrations</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed top-6 right-6 bg-white shadow-xl border border-gray-200 px-4 py-3 rounded-xl">{toast}</div>
        )}

        {pending.length === 0 ? (
          <div className="card text-center">
            <div className="text-6xl mb-3">🎉</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-1">All caught up</h3>
            <p className="text-gray-600">There are no shops waiting for approval.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {pending.map(shop => (
              <div key={shop._id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{shop.name}</h3>
                    <p className="text-sm text-gray-600">Owner: {shop.ownerEmail}</p>
                    {shop.address && (
                      <p className="text-sm text-gray-600">{shop.address}</p>
                    )}
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Pending</span>
                </div>
                {shop.location?.lat && shop.location?.lng && (
                  <p className="text-xs text-gray-500 mb-3">Location: {shop.location.lat.toFixed(4)}, {shop.location.lng.toFixed(4)}</p>
                )}
                <div className="flex gap-3">
                  <button onClick={() => approveShop(shop._id)} className="btn-secondary">Approve</button>
                  <button onClick={() => declineShop(shop._id)} className="btn-accent bg-red-500 hover:bg-red-600">Decline</button>
                  <a
                    href={`https://www.google.com/maps?q=${shop.location?.lat || 0},${shop.location?.lng || 0}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                  >
                    View Map
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
