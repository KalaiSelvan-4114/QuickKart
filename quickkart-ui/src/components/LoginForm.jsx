import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function LoginForm({ 
  userType, 
  title, 
  subtitle, 
  icon, 
  primaryColor = "primary",
  accentColor = "accent",
  signupLink,
  signupText,
  redirectPath,
  endpoint 
}) {
  const [email, setEmail] = useState("");
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

  // If already authenticated, redirect
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("authRole");
    if (token && role === userType) {
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, userType, redirectPath]);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axiosClient.post(endpoint, { 
        [userType === 'shop' ? 'ownerEmail' : 'email']: email, 
        password 
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("authRole", userType);
      navigate(redirectPath);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      primary: {
        bg: "from-primary-400 to-primary-600",
        text: "text-primary-600",
        hover: "hover:text-primary-500",
        border: "border-primary-200",
        bgLight: "bg-primary-50"
      },
      accent: {
        bg: "from-accent-400 to-accent-600",
        text: "text-accent-600",
        hover: "hover:text-accent-500",
        border: "border-accent-200",
        bgLight: "bg-accent-50"
      },
      secondary: {
        bg: "from-secondary-400 to-secondary-600",
        text: "text-secondary-600",
        hover: "hover:text-secondary-500",
        border: "border-secondary-200",
        bgLight: "bg-secondary-50"
      }
    };
    return colors[color] || colors.primary;
  };

  const primaryColors = getColorClasses(primaryColor);
  const accentColors = getColorClasses(accentColor);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className={`absolute top-20 left-10 w-72 h-72 bg-${primaryColor}-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle`}></div>
      <div className={`absolute bottom-20 right-10 w-72 h-72 bg-${accentColor}-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle`} style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 max-w-md w-full space-y-8">
        <div className="text-center">
          <div className={`mx-auto h-16 w-16 bg-gradient-to-br ${primaryColors.bg} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2 font-display">
            {title}
          </h2>
          <p className="text-gray-600">
            {subtitle}
          </p>
          {signupLink && (
            <p className="mt-2 text-sm text-gray-600">
              {signupText}{" "}
              <Link
                to={signupLink}
                className={`font-semibold ${accentColors.text} ${accentColors.hover} transition-colors duration-300`}
              >
                {userType === 'user' ? 'Create one here' : 'Register here'}
              </Link>
            </p>
          )}
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl animate-fade-in">
            <div className="flex items-center">
              <span className="mr-2">✅</span>
              {success}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-fade-in">
            <div className="flex items-center">
              <span className="mr-2">❌</span>
              {error}
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={login}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {userType === 'shop' ? 'Owner Email' : `${userType.charAt(0).toUpperCase() + userType.slice(1)} Email`}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder={`Enter ${userType} email`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r ${primaryColors.bg} hover:from-${primaryColor}-500 hover:to-${primaryColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${primaryColor}-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
