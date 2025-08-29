import { useState } from "react";
import QrScanner from "../../components/QrScanner";

export default function DeliveryScan() {
  const [boyId, setBoyId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [qrToken, setQrToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
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

  const handleScan = (text) => {
    // Accept plain token, JSON, or URL formats
    try {
      // JSON: { orderId, qrToken }
      const obj = JSON.parse(text);
      if (obj && (obj.qrToken || obj.token)) setQrToken(obj.qrToken || obj.token);
      if (obj && obj.orderId) setOrderId(obj.orderId);
      return;
    } catch (_) {}
    try {
      // URL with query params ?orderId=...&token=...
      const u = new URL(text);
      const token = u.searchParams.get('qrToken') || u.searchParams.get('token');
      const oid = u.searchParams.get('orderId') || u.searchParams.get('order');
      if (token) setQrToken(token);
      if (oid) setOrderId(oid);
      if (token || oid) return;
    } catch (_) {}
    // Fallback: treat as raw token
    setQrToken(text);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-xl font-semibold mb-4">Delivery Confirmation</h1>
        <p className="text-sm text-gray-600 mb-6">Enter your Delivery ID, Order ID, and the QR Token from the customer.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Delivery ID</label>
            <input value={boyId} onChange={e=>setBoyId(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="e.g., DB123" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Order ID</label>
            <input value={orderId} onChange={e=>setOrderId(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Enter Order ID (24-char)" required />
          </div>
          <div>
            <button type="button" className="w-full btn-secondary py-2" onClick={()=>setShowScanner(true)}>Scan QR</button>
            {qrToken && (
              <div className="mt-2 text-xs text-gray-600">Scanned token: <span className="font-mono break-all select-all">{qrToken}</span></div>
            )}
          </div>
          <button disabled={loading} className="w-full btn-primary py-2">{loading ? 'Confirming...' : 'Confirm Delivery'}</button>
        </form>
        {showScanner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-4 w-[360px] max-w-full">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">Scan QR</h2>
                <button className="text-sm text-gray-600" onClick={()=>setShowScanner(false)}>Close</button>
              </div>
              <QrScanner onScan={(text)=>{ handleScan(text); setShowScanner(false); }} onError={()=>{}} />
            </div>
          </div>
        )}
        {result && (
          <div className={`mt-4 text-sm ${result.type === 'success' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'} p-3 rounded`}>
            {result.message}
          </div>
        )}
      </div>
    </div>
  );
}


