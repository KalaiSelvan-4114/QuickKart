import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Landing() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    // Auto-redirect if already authenticated
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("authRole");
    if (token) {
      if (role === "user") navigate("/user/home", { replace: true });
      else if (role === "shop") navigate("/shop/stock", { replace: true });
      else if (role === "admin") navigate("/admin/pending", { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle" style={{ animationDelay: '2s' }}></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 font-display">
            Welcome to{" "}
            <span className="text-gradient bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent">
              QuickKart
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Your one-stop destination for fashion and style. Discover trends, manage your wardrobe, 
            and get personalized styling advice powered by AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/user/signup"
              className="btn-primary text-lg px-8 py-4"
            >
              Get Started Today
            </Link>
            <Link
              to="/user/login"
              className="btn-secondary text-lg px-8 py-4"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {/* User Section */}
          <div className={`card-hover transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '200ms' }}>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl">👤</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4 font-display">User</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Discover the latest fashion trends, manage your personal wardrobe, 
                and get AI-powered styling recommendations tailored just for you.
              </p>
              <div className="space-y-4">
                <Link
                  to="/user/login"
                  className="btn-primary w-full"
                >
                  User Login
                </Link>
                <Link
                  to="/user/signup"
                  className="btn-secondary w-full"
                >
                  User Signup
                </Link>
              </div>
            </div>
          </div>

          {/* Shop Owner Section */}
          <div className={`card-hover transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '400ms' }}>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl">🏪</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4 font-display">Shop Owner</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Manage your inventory efficiently, process orders seamlessly, 
                and grow your business with our comprehensive shop management tools.
              </p>
              <div className="space-y-4">
                <Link
                  to="/shop/login"
                  className="btn-accent w-full"
                >
                  Shop Login
                </Link>
                <Link
                  to="/shop/signup"
                  className="btn-secondary w-full"
                >
                  Shop Signup
                </Link>
              </div>
            </div>
          </div>

          {/* Admin Section */}
          <div className={`card-hover transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms' }}>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl">⚙️</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4 font-display">Admin</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Oversee platform operations, approve new shops, and ensure 
                the highest quality experience for all users and merchants.
              </p>
              <div className="space-y-4">
                <Link
                  to="/admin/login"
                  className="btn-secondary w-full"
                >
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '800ms' }}>
          <div className="glass-effect p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 font-display">Why Choose QuickKart?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">10K+</div>
                <div className="text-gray-600">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent-600 mb-2">500+</div>
                <div className="text-gray-600">Verified Shops</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary-600 mb-2">24/7</div>
                <div className="text-gray-600">AI Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
