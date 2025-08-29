import { useEffect, useState } from "react";
import axiosDeliveryClient from "../../api/axiosDeliveryClient";
import { Link } from "react-router-dom";

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [taking, setTaking] = useState({});
  const [coords, setCoords] = useState({ lat: null, lng: null });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }, () => setCoords({ lat: null, lng: null }));
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const params = coords.lat ? { params: { lat: coords.lat, lng: coords.lng, radius: 10 } } : {};
        const res = await axiosDeliveryClient.get('/delivery/orders/available', params);
        setOrders(res.data || []);
      } catch (e) {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [coords.lat, coords.lng]);

  const takeOrder = async (id) => {
    try {
      setTaking(prev => ({ ...prev, [id]: true }));
      await axiosDeliveryClient.post(`/delivery/orders/${id}/take`);
      setOrders(prev => prev.filter(o => o._id !== id));
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to take order');
    } finally {
      setTaking(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
          <Link to="/delivery/scan" className="btn-primary">Confirm Delivery</Link>
        </div>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        {loading ? (
          <div>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-600">No nearby orders available.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {orders.map(o => (
              <div key={o._id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">Order #{o._id.slice(-6)}</div>
                  <div className="text-sm text-gray-600">₹{o.total}</div>
                </div>
                <div className="text-sm text-gray-700 mb-2">{o.shippingDetails?.address}, {o.shippingDetails?.city}</div>
                <button onClick={() => takeOrder(o._id)} disabled={taking[o._id]} className="btn-primary w-full">
                  {taking[o._id] ? 'Taking...' : 'Take Order'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


