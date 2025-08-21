import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(Boolean(token));

    const path = location.pathname || "";
    let role = "";
    if (path.startsWith("/user/")) role = "user";
    else if (path.startsWith("/shop/")) role = "shop";
    else if (path.startsWith("/admin/")) role = "admin";
    else role = localStorage.getItem("authRole") || ""; // fallback to persisted role

    setUserType(role);
    setShowMobileMenu(false); // close menu on route change
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authRole");
    localStorage.removeItem("lastRoute");
    setIsLoggedIn(false);
    setUserType("");
    setShowMobileMenu(false);
    navigate("/");
  };

  const isActiveLink = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-white/20' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-2xl font-bold text-gradient font-display hover:scale-105 transition-transform duration-300"
            >
              QuickKart
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {!isLoggedIn ? (
              <>
                <Link to="/user/login" className="nav-link">User Login</Link>
                <Link to="/shop/login" className="nav-link">Shop Login</Link>
                <Link to="/admin/login" className="nav-link">Admin Login</Link>
                <Link to="/coordinate-demo" className="nav-link">📍 Coordinates</Link>
                <div className="ml-4">
                  <Link to="/user/signup" className="btn-primary text-sm px-4 py-2">Get Started</Link>
                </div>
              </>
            ) : (
              <>
                {userType === "user" && (
                  <>
                    <Link to="/user/home" className={`nav-link ${isActiveLink('/user/home') ? 'nav-link-active' : ''}`}>🏠 Home</Link>
                    <Link to="/user/shops" className={`nav-link ${isActiveLink('/user/shops') ? 'nav-link-active' : ''}`}>🏪 Shops</Link>
                    <Link to="/user/profile" className={`nav-link ${isActiveLink('/user/profile') ? 'nav-link-active' : ''}`}>👤 Profile</Link>
                    <Link to="/user/wishlist" className={`nav-link ${isActiveLink('/user/wishlist') ? 'nav-link-active' : ''}`}>❤️ Wishlist</Link>
                    <Link to="/user/cart" className={`nav-link ${isActiveLink('/user/cart') ? 'nav-link-active' : ''}`}>
                      🛒 Cart
                      {getCartItemCount() > 0 && (
                        <span className="ml-1 bg-primary-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] inline-flex items-center justify-center">{getCartItemCount()}</span>
                      )}
                    </Link>
                    <Link to="/user/orders" className={`nav-link ${isActiveLink('/user/orders') ? 'nav-link-active' : ''}`}>📦 Orders</Link>
                    <Link to="/user/stylist" className={`nav-link ${isActiveLink('/user/stylist') ? 'nav-link-active' : ''}`}>🎨 AI Stylist</Link>
                  </>
                )}
                {userType === "shop" && (
                  <>
                    <Link to="/shop/stock" className={`nav-link ${isActiveLink('/shop/stock') ? 'nav-link-active' : ''}`}>📦 Manage Stock</Link>
                    <Link to="/shop/orders" className={`nav-link ${isActiveLink('/shop/orders') ? 'nav-link-active' : ''}`}>📋 Orders</Link>
                  </>
                )}
                {userType === "admin" && (
                  <>
                    <Link to="/admin/pending" className={`nav-link ${isActiveLink('/admin/pending') ? 'nav-link-active' : ''}`}>🛡️ Pending Shops</Link>
                  </>
                )}
                <button onClick={handleLogout} className="ml-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg">Logout</button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {!isLoggedIn ? (
                <>
                  <Link to="/user/login" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg" onClick={() => setShowMobileMenu(false)}>User Login</Link>
                  <Link to="/shop/login" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg" onClick={() => setShowMobileMenu(false)}>Shop Login</Link>
                  <Link to="/admin/login" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg" onClick={() => setShowMobileMenu(false)}>Admin Login</Link>
                  <Link to="/coordinate-demo" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg" onClick={() => setShowMobileMenu(false)}>📍 Coordinates</Link>
                  <Link to="/user/signup" className="block px-3 py-2 text-base font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-lg" onClick={() => setShowMobileMenu(false)}>Get Started</Link>
                </>
              ) : (
                <>
                  {userType === "user" && (
                    <>
                      <Link to="/user/home" className={`block px-3 py-2 text-base font-medium rounded-lg ${isActiveLink('/user/home') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`} onClick={() => setShowMobileMenu(false)}>🏠 Home</Link>
                      <Link to="/user/shops" className={`block px-3 py-2 text-base font-medium rounded-lg ${isActiveLink('/user/shops') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`} onClick={() => setShowMobileMenu(false)}>🏪 Shops</Link>
                      <Link to="/user/profile" className={`block px-3 py-2 text-base font-medium rounded-lg ${isActiveLink('/user/profile') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`} onClick={() => setShowMobileMenu(false)}>👤 Profile</Link>
                      <Link to="/user/wishlist" className={`block px-3 py-2 text-base font-medium rounded-lg ${isActiveLink('/user/wishlist') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`} onClick={() => setShowMobileMenu(false)}>❤️ Wishlist</Link>
                      <Link to="/user/cart" className={`block px-3 py-2 text-base font-medium rounded-lg ${isActiveLink('/user/cart') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`} onClick={() => setShowMobileMenu(false)}>🛒 Cart</Link>
                      <Link to="/user/orders" className={`block px-3 py-2 text-base font-medium rounded-lg ${isActiveLink('/user/orders') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`} onClick={() => setShowMobileMenu(false)}>📦 Orders</Link>
                      <Link to="/user/stylist" className={`block px-3 py-2 text-base font-medium rounded-lg ${isActiveLink('/user/stylist') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`} onClick={() => setShowMobileMenu(false)}>🎨 AI Stylist</Link>
                    </>
                  )}
                  {userType === "shop" && (
                    <>
                      <Link to="/shop/stock" className={`block px-3 py-2 text-base font-medium rounded-lg ${isActiveLink('/shop/stock') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`} onClick={() => setShowMobileMenu(false)}>📦 Manage Stock</Link>
                      <Link to="/shop/orders" className={`block px-3 py-2 text-base font-medium rounded-lg ${isActiveLink('/shop/orders') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`} onClick={() => setShowMobileMenu(false)}>📋 Orders</Link>
                    </>
                  )}
                  {userType === "admin" && (
                    <Link to="/admin/pending" className={`block px-3 py-2 text-base font-medium rounded-lg ${isActiveLink('/admin/pending') ? 'text-primary-600 bg-primary-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`} onClick={() => setShowMobileMenu(false)}>🛡️ Pending Shops</Link>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg">Logout</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
