import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function ShopLogin() {
  const [ownerEmail, setOwnerEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for success message from signup
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Clear the message from location state
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axiosClient.post("/auth/shop/login", { ownerEmail, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("authRole", "shop");
      navigate("/shop/stock");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-2xl">🏪</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2 font-display">
            Shop Login
          </h2>
          <p className="text-gray-600">
            Sign in to your QuickKart shop account
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Don't have a shop account?{" "}
            <Link
              to="/shop/signup"
              className="font-semibold text-accent-600 hover:text-accent-500 transition-colors duration-300"
            >
              Register here
            </Link>
          </p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl animate-fade-in">
            <div className="flex items-center">
              <span className="mr-2">✅</span>
              {success}
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={login}>
          <div className="space-y-4">
            <div>
              <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Owner Email
              </label>
              <input
                id="ownerEmail"
                name="ownerEmail"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="Enter your email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="input-field pr-12"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="text-gray-400 hover:text-gray-600 transition-colors duration-300">
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-fade-in">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-accent-600 hover:text-accent-500 transition-colors duration-300">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full flex justify-center py-4 text-lg font-semibold"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Need help?</span>
              </div>
            </div>
            <div className="mt-6">
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-accent-600 transition-colors duration-300"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
