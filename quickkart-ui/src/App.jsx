import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
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
import OrderDetail from "./pages/user/OrderDetail";
import Address from "./pages/user/Address";
import Stylist from "./pages/user/Stylist";
import ProductDetail from "./pages/user/ProductDetail";
import CoordinateDemo from "./pages/CoordinateDemo";

// Shop pages
import ShopLogin from "./pages/shop/Login";
import ShopSignup from "./pages/shop/Signup";
import ShopDashboard from "./pages/shop/Dashboard";
import StockManage from "./pages/shop/StockManage";
import ShopOrders from "./pages/shop/Orders";

// Admin pages
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import PendingShops from "./pages/admin/PendingShops";
import AdminPayouts from "./pages/admin/Payouts";
// Delivery Head pages
import DeliveryHeadLogin from "./pages/DeliveryHead/Login";
import DeliveryHeadRegister from "./pages/DeliveryHead/Register";
import DeliveryHeadDashboard from "./pages/DeliveryHead/Dashboard";
import DeliveryHeadBoys from "./pages/DeliveryHead/Boys";

export default function App() {
  return (
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
              <Route path="/user/orders/:orderId" element={
                <ProtectedRoute userType="user">
                  <OrderDetail />
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
              <Route path="/shop/dashboard" element={
                <ProtectedRoute userType="shop">
                  <ShopDashboard />
                </ProtectedRoute>
              } />
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
              <Route path="/admin/dashboard" element={
                <ProtectedRoute userType="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/pending" element={
                <ProtectedRoute userType="admin">
                  <PendingShops />
                </ProtectedRoute>
              } />
              <Route path="/admin/payouts" element={
                <ProtectedRoute userType="admin">
                  <AdminPayouts />
                </ProtectedRoute>
              } />
              {/* Delivery Head */}
              <Route path="/delivery-head/login" element={<DeliveryHeadLogin />} />
              <Route path="/delivery-head/register" element={<DeliveryHeadRegister />} />
              <Route path="/delivery-head/dashboard" element={
                <ProtectedRoute userType="delivery-head">
                  <DeliveryHeadDashboard />
                </ProtectedRoute>
              } />
              <Route path="/delivery-head/boys" element={
                <ProtectedRoute userType="delivery-head">
                  <DeliveryHeadBoys />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}
