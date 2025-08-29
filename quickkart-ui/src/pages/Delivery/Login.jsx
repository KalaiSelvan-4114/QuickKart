import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosDeliveryClient from "../../api/axiosDeliveryClient";

export default function DeliveryLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const res = await axiosDeliveryClient.post('/auth/delivery/login', { email, password });
      localStorage.setItem('delivery_token', res.data.token);
      navigate('/delivery/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full card">
        <h1 className="text-2xl font-bold mb-4">Delivery Login</h1>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        <form onSubmit={login} className="space-y-4">
          <input className="input-field w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input-field w-full" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <div className="mt-3 text-sm">No account? <Link to="/delivery/signup" className="text-blue-600">Register</Link></div>
      </div>
    </div>
  );
}


