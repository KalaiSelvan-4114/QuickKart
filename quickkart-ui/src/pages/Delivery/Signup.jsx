import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosDeliveryClient from "../../api/axiosDeliveryClient";

export default function DeliverySignup() {
  const [form, setForm] = useState({ agentId: "", aadhar: "", name: "", phone: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const signup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await axiosDeliveryClient.post('/auth/delivery/signup', form);
      navigate('/delivery/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full card">
        <h1 className="text-2xl font-bold mb-4">Delivery Registration</h1>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        <form onSubmit={signup} className="space-y-3">
          <input className="input-field w-full" name="agentId" placeholder="Agent ID" value={form.agentId} onChange={onChange} />
          <input className="input-field w-full" name="aadhar" placeholder="Aadhar" value={form.aadhar} onChange={onChange} />
          <input className="input-field w-full" name="name" placeholder="Name" value={form.name} onChange={onChange} />
          <input className="input-field w-full" name="phone" placeholder="Phone" value={form.phone} onChange={onChange} />
          <input className="input-field w-full" name="email" placeholder="Email" value={form.email} onChange={onChange} />
          <input className="input-field w-full" name="password" placeholder="Password" type="password" value={form.password} onChange={onChange} />
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </form>
        <div className="mt-3 text-sm">Have an account? <Link to="/delivery/login" className="text-blue-600">Login</Link></div>
      </div>
    </div>
  );
}


