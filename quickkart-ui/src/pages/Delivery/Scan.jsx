import { useState } from "react";
import axiosDeliveryClient from "../../api/axiosDeliveryClient";

export default function DeliveryScan() {
  const [orderId, setOrderId] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const confirm = async (e) => {
    e.preventDefault();
    if (!orderId.trim() || !otp.trim()) {
      setMessage("Please enter both Order ID and OTP");
      return;
    }
    
    try {
      setLoading(true);
      setMessage("");
      await axiosDeliveryClient.post(`/delivery/orders/${orderId}/confirm`, { otp });
      setMessage("✅ Delivery confirmed successfully!");
      setOrderId("");
      setOtp("");
    } catch (e) {
      setMessage(e.response?.data?.error || 'Failed to confirm delivery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full card">
        <h1 className="text-2xl font-bold mb-4">🔐 Confirm Delivery</h1>
        <p className="text-gray-600 mb-6 text-center">
          Enter the Order ID and OTP provided by the customer to confirm delivery
        </p>
        <form onSubmit={confirm} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order ID</label>
            <input 
              className="input-field w-full" 
              placeholder="Enter Order ID" 
              value={orderId} 
              onChange={e=>setOrderId(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery OTP</label>
            <input 
              className="input-field w-full" 
              placeholder="Enter 6-digit OTP" 
              value={otp} 
              onChange={e=>setOtp(e.target.value)}
              maxLength={6}
              pattern="[0-9]{6}"
            />
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Confirming...' : 'Confirm Delivery'}
          </button>
        </form>
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}


