import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function AdminPayouts() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState({});

  const load = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/user/orders'); // reuse endpoint, in real app add admin list
      setOrders(res.data || []);
    } catch (e) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const adminReceive = async (id) => {
    try { setBusy(p=>({...p,[id]:'receive'})); await axiosClient.post(`/admin/orders/${id}/settle/admin-receive`); load(); } catch { setError('Failed'); } finally { setBusy(p=>({...p,[id]:null})); }
  };
  const payShop = async (id) => {
    try { setBusy(p=>({...p,[id]:'pay'})); await axiosClient.post(`/admin/orders/${id}/settle/pay-shop`); load(); } catch { setError('Failed'); } finally { setBusy(p=>({...p,[id]:null})); }
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Admin Payouts</h1>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        {loading ? 'Loading...' : (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o._id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Order #{o._id.slice(-6)}</div>
                    <div className="text-sm text-gray-600">Status: {o.status}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>adminReceive(o._id)} disabled={busy[o._id]} className="btn-secondary">Mark Admin Received</button>
                    <button onClick={()=>payShop(o._id)} disabled={busy[o._id]} className="btn-primary">Pay Shop</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


