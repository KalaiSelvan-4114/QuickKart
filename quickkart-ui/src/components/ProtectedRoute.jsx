import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children, userType = "user" }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Prefer unified token key
    let token = localStorage.getItem("token");

    // Backward compatibility for older role-specific keys
    if (!token) {
      if (userType === 'delivery') {
        token = localStorage.getItem('delivery_token');
      } else if (userType === 'delivery-head') {
        token = localStorage.getItem('delivery_head_token');
      }
    }
    
    if (token) {
      setIsAuthenticated(true);
      const storedRole = localStorage.getItem("authRole");
      if (!storedRole && userType) {
        localStorage.setItem("authRole", userType);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [userType]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="w-16 h-16 border-4 border-accent-200 border-t-accent-600 rounded-full animate-spin mx-auto absolute top-0 left-1/2 transform -translate-x-1/2" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading...</h3>
          <p className="text-gray-500">Please wait while we verify your credentials</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginPath = `/${userType}/login`;
    return <Navigate to={loginPath} replace />;
  }

  try {
    const path = window.location.pathname;
    if (path && typeof path === 'string') {
      localStorage.setItem('lastRoute', path);
    }
  } catch {}

  return children;
}
