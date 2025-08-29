import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import axiosClient from "../../api/axiosClient";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [upiLink, setUpiLink] = useState("");
  const [upiTxnRef, setUpiTxnRef] = useState("");

  const [shippingDetails, setShippingDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India"
  });

  // Only two choices now: cod or online_upi
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderNotes, setOrderNotes] = useState("");

  const subtotal = getCartTotal();
  const deliveryFee = subtotal >= 1000 ? 0 : 50;
  const total = subtotal + deliveryFee;

  // Prefer seller's UPI when single-shop order; otherwise fallback to site-level UPI
  const siteUpiVPA = import.meta.env.VITE_UPI_VPA || "merchant@upi";
  const siteUpiName = import.meta.env.VITE_UPI_NAME || "QuickKart";
  const [resolvedUpiVPA, setResolvedUpiVPA] = useState(siteUpiVPA);
  const [resolvedUpiName, setResolvedUpiName] = useState(siteUpiName);

  useEffect(() => {
    if (cart.length === 0) {
      navigate("/user/cart");
      return;
    }

    const loadUserDetails = async () => {
      try {
        const response = await axiosClient.get("/user/profile");
        if (response.data) {
          const user = response.data;
          setShippingDetails(prev => ({
            ...prev,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            phone: user.phone || ""
          }));
        }
      } catch (_) {}
    };

    loadUserDetails();

    // Resolve UPI receiver: if all items from same shop and shop has UPI, use it
    const resolveUpi = async () => {
      try {
        const shopIds = Array.from(new Set(cart.map(i => i.shopId).filter(Boolean)));
        if (shopIds.length === 1) {
          const res = await axiosClient.get(`/user/shops/${shopIds[0]}/upi`);
          if (res.data?.upiVpa) {
            setResolvedUpiVPA(res.data.upiVpa);
            setResolvedUpiName(res.data.upiName || siteUpiName);
            return;
          }
        }
        setResolvedUpiVPA(siteUpiVPA);
        setResolvedUpiName(siteUpiName);
      } catch (_) {
        setResolvedUpiVPA(siteUpiVPA);
        setResolvedUpiName(siteUpiName);
      }
    };
    resolveUpi();
  }, [cart, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ["firstName", "lastName", "email", "phone", "address", "city", "state", "pincode"];
    const missing = required.filter(field => !shippingDetails[field].trim());
    if (missing.length > 0) {
      setNotification({ show: true, message: `Please fill in: ${missing.join(", ")}`, type: "error" });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingDetails.email)) { setNotification({ show: true, message: "Please enter a valid email address", type: "error" }); return false; }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(shippingDetails.phone)) { setNotification({ show: true, message: "Please enter a valid 10-digit phone number", type: "error" }); return false; }
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(shippingDetails.pincode)) { setNotification({ show: true, message: "Please enter a valid 6-digit pincode", type: "error" }); return false; }
    return true;
  };

  function generateTxnRef() {
    return `QK${Date.now()}`;
  }
  function buildUpiLink(amount) {
    const txnRef = generateTxnRef();
    setUpiTxnRef(txnRef);
    const note = encodeURIComponent("QuickKart Order");
    const pn = encodeURIComponent(resolvedUpiName);
    const vpa = encodeURIComponent(resolvedUpiVPA);
    const am = encodeURIComponent(amount.toFixed(2));
    const link = `upi://pay?pa=${vpa}&pn=${pn}&am=${am}&tn=${note}&cu=INR&tr=${txnRef}`;
    setUpiLink(link);
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) { setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000); return; }

    if (paymentMethod === "cod") {
      await createOrder(false, "cod");
      return;
    }
    // online upi flow
    buildUpiLink(total);
    setShowPaymentOptions(true);
  };

  const createOrder = async (paid, methodOverride) => {
    try {
      setLoading(true);
      const method = methodOverride || (paymentMethod === "cod" ? "cod" : "online_upi");
      const orderData = {
        items: cart.map(item => ({ 
          productId: item.productId, 
          quantity: item.quantity, 
          price: item.price,
          selectedSize: item.selectedSize ?? null,
          selectedColor: item.selectedColor ?? null
        })),
        shippingDetails,
        paymentMethod: method,
        paid: Boolean(paid),
        orderNotes,
        subtotal,
        deliveryFee,
        total
      };
      const response = await axiosClient.post("/user/orders", orderData);
      if (response.data.success) {
        setNotification({ show: true, message: "Order placed successfully! Redirecting to orders...", type: "success" });
        setTimeout(() => { clearCart(); navigate("/user/orders"); }, 2000);
      }
    } catch (err) {
      setNotification({ show: true, message: err.response?.data?.error || "Failed to place order. Please try again.", type: "error" });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    }
  };

  if (cart.length === 0) return null;

  if (showPaymentOptions) {
    const qrUrl = upiLink ? `https://chart.googleapis.com/chart?cht=qr&chs=220x220&chl=${encodeURIComponent(upiLink)}` : "";
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="relative inline-block mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-4xl">📱</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 font-display">Pay via UPI</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">Scan the QR or tap the UPI link below to pay ₹{total.toFixed(2)}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
            {upiLink && (
              <>
                <img src={qrUrl} alt="UPI QR" className="mx-auto mb-4 rounded-xl border border-gray-100" />
                <a href={upiLink} className="btn-accent inline-block" >Open in UPI app</a>
                <p className="mt-3 text-sm text-gray-600 break-all">UPI ID: {resolvedUpiVPA} • Ref: {upiTxnRef}</p>
              </>
            )}
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <button onClick={() => createOrder(true, "online_upi")} disabled={loading} className="btn-primary">
                {loading ? "Processing..." : "I have paid - Place Order"}
              </button>
              <button onClick={() => setShowPaymentOptions(false)} className="btn-secondary">Back</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <span className="text-4xl">🚀</span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
              ✓
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-green-600 to-emerald-600 bg-clip-text text-transparent mb-6 font-display">
            Complete Your Order
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Almost there! Just a few more details to get your order on its way
          </p>
        </div>

        {notification.show && (
          <div className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl transition-all duration-500 transform ${
            notification.type === "success" 
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" 
              : "bg-gradient-to-r from-red-500 to-pink-600 text-white"
          }`}>
            <div className="flex items-center space-x-3">
              <span className="text-xl">
                {notification.type === "success" ? "✅" : "❌"}
              </span>
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-white text-xl">📍</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 font-display">Shipping Details</h2>
                  <p className="text-gray-600">Where should we deliver your order?</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={shippingDetails.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your first name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={shippingDetails.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your last name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={shippingDetails.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingDetails.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={shippingDetails.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="House number, street, area"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingDetails.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your city"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingDetails.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your state"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={shippingDetails.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="6-digit pincode"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={shippingDetails.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm bg-gray-50"
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-white text-xl">💳</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 font-display">Payment Method</h2>
                  <p className="text-gray-600">Choose how you'd like to pay</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center p-4 border border-gray-200 rounded-2xl cursor-pointer hover:border-primary-300 transition-all duration-200 bg-white/50 backdrop-blur-sm">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <div className="ml-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">💵</span>
                      <div>
                        <div className="text-lg font-semibold text-gray-800">Cash on Delivery</div>
                        <div className="text-gray-600">Pay when you receive your order</div>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-200 rounded-2xl cursor-pointer hover:border-primary-300 transition-all duration-200 bg-white/50 backdrop-blur-sm">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <div className="ml-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🌐</span>
                      <div>
                        <div className="text-lg font-semibold text-gray-800">Online Payment</div>
                        <div className="text-gray-600">Credit/Debit cards, UPI, Net Banking</div>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Payment Method Info */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <div className="flex items-center mb-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">ℹ️</span>
                  </div>
                  <h3 className="text-sm font-bold text-blue-800">What happens next?</h3>
                </div>
                
                <div className="space-y-2 text-sm text-blue-700">
                  {paymentMethod === "cod" ? (
                    <>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span>Order will be placed immediately</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span>Pay cash when delivery arrives</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span>No payment processing required</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span>You'll be redirected to payment options</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span>Choose UPI, Card, Net Banking, or Wallet</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span>Order created after successful payment</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-white text-xl">📝</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 font-display">Order Notes</h2>
                  <p className="text-gray-600">Any special instructions for delivery?</p>
                </div>
              </div>

              <textarea
                name="orderNotes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
                placeholder="e.g., Call before delivery, Leave at security desk, etc."
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 font-display">Order Summary</h2>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Items in your order</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.map((item, index) => (
                      <div key={item._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-lg">👕</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 truncate">{item.title}</h4>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Subtotal ({cart.length} items)</span>
                    <span className="text-xl font-bold text-gray-800">₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Delivery Fee</span>
                    <span className="text-xl font-bold text-gray-800">
                      {deliveryFee === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        "₹50.00"
                      )}
                    </span>
                  </div>
                  
                  <div className="pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-gray-800">Total</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                    
                    {deliveryFee === 0 && (
                      <div className="mt-2 text-center">
                        <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                          🎉 FREE delivery unlocked!
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {paymentMethod === "cod" ? (
                        <>
                          🚀 Place Order (Cash on Delivery)
                          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      ) : (
                        <>
                          💳 Proceed to Payment
                          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </>
                  )}
                </button>

                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                      <span className="text-white text-sm">🔒</span>
                    </div>
                    <h3 className="text-lg font-bold text-blue-800">Secure Checkout</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span>SSL encrypted checkout</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span>Your data is protected</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span>100% secure payment</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
