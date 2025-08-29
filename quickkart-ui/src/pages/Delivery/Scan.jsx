import { useState } from "react";
import QrScanner from "../../components/QrScanner";

export default function DeliveryScan() {
  const [boyId, setBoyId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [qrToken, setQrToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/delivery/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boyId, orderId, qrToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to confirm delivery');
      setResult({ type: 'success', message: 'Delivery confirmed successfully' });
      setBoyId(""); setOrderId(""); setQrToken("");
    } catch (err) {
      setResult({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-xl font-semibold mb-4">Delivery Confirmation</h1>
        <p className="text-sm text-gray-600 mb-6">Enter your Delivery ID, Order ID, and the QR Token from the customer.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <QrScanner onScan={(text)=>setQrToken(text)} onError={()=>{}} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Delivery ID</label>
            <input value={boyId} onChange={e=>setBoyId(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="e.g., DB123" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Order ID</label>
            <input value={orderId} onChange={e=>setOrderId(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Paste Order ObjectId" required />
          </div>
          <button disabled={loading} className="w-full btn-primary py-2">{loading ? 'Confirming...' : 'Confirm Delivery'}</button>
        </form>
        {result && (
          <div className={`mt-4 text-sm ${result.type === 'success' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'} p-3 rounded`}>
            {result.message}
          </div>
        )}
      </div>
    </div>
  );
}


