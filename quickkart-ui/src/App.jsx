import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { CartProvider } from "./contexts/CartContext";
import Landing from "./pages/Landing";

// User pages
import UserLogin from "./pages/user/Login";
import UserSignup from "./pages/user/Signup";
import Profile from "./pages/user/Profile";
import Home from "./pages/user/Home";
import Shops from "./pages/user/Shops";
import ShopProducts from "./pages/user/ShopProducts";
import Wishlist from "./pages/user/Wishlist";
import Cart from "./pages/user/Cart";
import Checkout from "./pages/user/Checkout";
import Orders from "./pages/user/Orders";
import Address from "./pages/user/Address";
import Stylist from "./pages/user/Stylist";
import ProductDetail from "./pages/user/ProductDetail";
import CoordinateDemo from "./pages/CoordinateDemo";

// Shop pages
import ShopLogin from "./pages/shop/Login";
import ShopSignup from "./pages/shop/Signup";
import StockManage from "./pages/shop/StockManage";
import ShopOrders from "./pages/shop/Orders";

// Admin pages
import AdminLogin from "./pages/admin/Login";
import PendingShops from "./pages/admin/PendingShops";

export default function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <Navbar />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<Landing />} />

                {/* User */}
                <Route path="/user/login" element={<UserLogin />} />
                <Route path="/user/signup" element={<UserSignup />} />
                <Route path="/user/profile" element={
                  <ProtectedRoute userType="user">
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/user/home" element={
                  <ProtectedRoute userType="user">
                    <Home />
                  </ProtectedRoute>
                } />
                <Route path="/user/shops" element={
                  <ProtectedRoute userType="user">
                    <Shops />
                  </ProtectedRoute>
                } />
                <Route path="/user/shop/:shopId" element={
                  <ProtectedRoute userType="user">
                    <ShopProducts />
                  </ProtectedRoute>
                } />
                <Route path="/user/wishlist" element={
                  <ProtectedRoute userType="user">
                    <Wishlist />
                  </ProtectedRoute>
                } />
                <Route path="/user/cart" element={
                  <ProtectedRoute userType="user">
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="/user/product/:productId" element={
                  <ProtectedRoute userType="user">
                    <ProductDetail />
                  </ProtectedRoute>
                } />
                <Route path="/user/checkout" element={
                  <ProtectedRoute userType="user">
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/user/orders" element={
                  <ProtectedRoute userType="user">
                    <Orders />
                  </ProtectedRoute>
                } />
                <Route path="/user/address" element={
                  <ProtectedRoute userType="user">
                    <Address />
                  </ProtectedRoute>
                } />
                <Route path="/user/stylist" element={
                  <ProtectedRoute userType="user">
                    <Stylist />
                  </ProtectedRoute>
                } />
                <Route path="/coordinate-demo" element={<CoordinateDemo />} />

                {/* Shop */}
                <Route path="/shop/login" element={<ShopLogin />} />
                <Route path="/shop/signup" element={<ShopSignup />} />
                <Route path="/shop/stock" element={
                  <ProtectedRoute userType="shop">
                    <StockManage />
                  </ProtectedRoute>
                } />
                <Route path="/shop/orders" element={
                  <ProtectedRoute userType="shop">
                    <ShopOrders />
                  </ProtectedRoute>
                } />

                {/* Admin */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/pending" element={
                  <ProtectedRoute userType="admin">
                    <PendingShops />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </CartProvider>
    </ErrorBoundary>
  );
}
