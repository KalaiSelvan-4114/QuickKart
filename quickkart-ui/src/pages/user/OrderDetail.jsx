import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/user/orders/${orderId}`);
        setOrder(res.data);
      } catch (e) {
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !order) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Order not found</h3>
        <Link to="/user/orders" className="btn-primary">Back to Orders</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Order #{order._id?.slice(-6)}</h1>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">{order.status}</span>
        </div>
        {order.deliveryOTP && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <div className="font-semibold text-lg mb-2">🔐 Delivery OTP: {order.deliveryOTP}</div>
            <div className="text-sm">
              Share this 6-digit OTP with the delivery agent to confirm delivery.<br/>
              <span className="text-orange-600">⚠️ OTP expires in 24 hours</span>
            </div>
          </div>
        )}
        <div className="space-y-3 mb-6">
          {(order.items || []).map((it, idx) => (
            <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                {it.product?.image ? <img src={it.product.image} alt={it.product.title} className="w-full h-full object-cover"/> : null}
              </div>
              <div className="flex-1">
                <div className="font-medium">{it.product?.title || 'Product'}</div>
                <div className="text-sm text-gray-600">{it.selectedSize ? `Size: ${it.selectedSize} • `: ''}{it.selectedColor ? `Color: ${it.selectedColor} • `: ''}Qty: {it.quantity}</div>
              </div>
              <div className="font-semibold">₹{it.price}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <div>
            <div className="font-semibold mb-1">Shipping</div>
            <div className="text-sm text-gray-700">
              {order.shippingDetails?.firstName} {order.shippingDetails?.lastName}<br/>
              {order.shippingDetails?.address}<br/>
              {order.shippingDetails?.city}, {order.shippingDetails?.state} - {order.shippingDetails?.pincode}
            </div>
          </div>
          <div>
            <div className="font-semibold mb-1">Totals</div>
            <div className="text-sm text-gray-700">Subtotal: ₹{order.subtotal}</div>
            <div className="text-sm text-gray-700">Delivery: ₹{order.deliveryFee}</div>
            <div className="font-bold">Total: ₹{order.total}</div>
          </div>
        </div>
        <div className="mt-6">
          <Link to="/user/orders" className="btn-secondary">← Back to Orders</Link>
        </div>
      </div>
    </div>
  );
}


