import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import { coordsToDMS, parseCoordinateInput, formatCoordinates } from "../../utils/coordinateConverter";

export default function ShopSignup() {
  const [form, setForm] = useState({
    ownerEmail: "",
    password: "",
    name: "",
    address: "",
    license: "",
    aadhaar: "",
    gst: "",
    location: { lat: 0, lng: 0 },
    upiVpa: "",
    upiName: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [locating, setLocating] = useState(false);
  const [mapsLink, setMapsLink] = useState("");

  // Google Maps picker state
  const [showGMapsPicker, setShowGMapsPicker] = useState(false);
  const gmapContainerRef = useRef(null);
  const gmapSearchInputRef = useRef(null);
  const gmapRef = useRef(null);
  const gmarkerRef = useRef(null);
  const geocoderRef = useRef(null);
  const navigate = useNavigate();

  const showNotification = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  async function reverseGeocode(lat, lng) {
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`, { headers: { 'Accept': 'application/json' } });
      const data = await resp.json();
      return data.display_name || "";
    } catch (_) {
      return "";
    }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { showNotification("Geolocation not supported by this browser", "error"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const addr = await reverseGeocode(lat, lng);
      setForm(prev => ({ ...prev, location: { lat, lng }, address: addr || prev.address }));
      showNotification("Location captured from GPS", "success");
      setLocating(false);
    }, err => { setLocating(false); showNotification(err.message || "Failed to get location", "error"); }, { enableHighAccuracy: true, timeout: 15000 });
  };

  function parseMapsLatLng(link) {
    if (!link) return null;
    const s = link.trim();
    
    // Try DMS format first
    if (s.includes('°') && s.includes("'") && s.includes('"')) {
      const coords = parseCoordinateInput(s);
      if (coords) return coords;
    }
    
    // 1) Plain coordinates: "lat,lng"
    let m = s.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
    
    // 2) Google Maps patterns: ...@lat,lng... or ...?q=lat,lng
    m = s.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
    m = s.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
    
    return null;
  }

  // Load Google Maps JS API if available (for geocoding)
  function ensureGoogleMaps() {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) return resolve();
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) return reject(new Error("Missing VITE_GOOGLE_MAPS_API_KEY"));
      const scriptId = 'gmaps-js';
      if (document.getElementById(scriptId)) {
        document.getElementById(scriptId).addEventListener('load', resolve, { once: true });
        return;
      }
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      s.async = true;
      s.defer = true;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Failed to load Google Maps'));
      document.body.appendChild(s);
    });
  }

  const applyMapsLink = async () => {
    const coords = parseMapsLatLng(mapsLink.trim());
    if (!coords) { showNotification("Could not extract coordinates from the input", "error"); return; }

    // Try Google Maps reverse geocode first
    let addr = '';
    try {
      await ensureGoogleMaps();
      const geocoder = new window.google.maps.Geocoder();
      await new Promise((resolve) => {
        geocoder.geocode({ location: { lat: coords.lat, lng: coords.lng } }, (results, status) => {
          if (status === 'OK' && results && results[0]) addr = results[0].formatted_address;
          resolve();
        });
      });
    } catch (_) {
      // ignore and fallback
    }

    if (!addr) {
      // Fallback to OSM
      addr = await reverseGeocode(coords.lat, coords.lng);
    }

    setForm(prev => ({ ...prev, location: coords, address: addr || prev.address }));
    showNotification("Coordinates applied and address filled", "success");
  };

  const openGoogleMaps = () => {
    const useLat = form.location?.lat && form.location?.lat !== 0 ? form.location.lat : 20.5937;
    const useLng = form.location?.lng && form.location?.lng !== 0 ? form.location.lng : 78.9629;
    const url = `https://www.google.com/maps/@${useLat},${useLng},16z`;
    window.open(url, "_blank", "noopener");
    showNotification("Google Maps opened. Drop a pin and copy the link here.", "info");
  };

  useEffect(() => {
    if (!showGMapsPicker) return;
    if (!(window.google && window.google.maps)) return;
    const { maps } = window.google;
    const lat = form.location?.lat && form.location.lat !== 0 ? form.location.lat : 20.5937;
    const lng = form.location?.lng && form.location.lng !== 0 ? form.location.lng : 78.9629;

    // Initialize map
    const map = new maps.Map(gmapContainerRef.current, { center: { lat, lng }, zoom: 15 });
    gmapRef.current = map;
    const marker = new maps.Marker({ position: { lat, lng }, map, draggable: true });
    gmarkerRef.current = marker;
    geocoderRef.current = new maps.Geocoder();

    // On map click move marker
    map.addListener('click', (e) => {
      marker.setPosition(e.latLng);
    });

    // Places autocomplete
    const input = gmapSearchInputRef.current;
    const ac = new maps.places.Autocomplete(input, { fields: ['geometry', 'formatted_address', 'name'] });
    ac.bindTo('bounds', map);
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place.geometry || !place.geometry.location) return;
      map.panTo(place.geometry.location);
      map.setZoom(17);
      marker.setPosition(place.geometry.location);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGMapsPicker]);

  const saveGMapsSelection = async () => {
    if (!gmarkerRef.current || !(window.google && window.google.maps)) { setShowGMapsPicker(false); return; }
    const pos = gmarkerRef.current.getPosition();
    const lat = pos.lat();
    const lng = pos.lng();

    let addr = form.address;
    try {
      const { results } = await geocoderRef.current.geocode({ location: { lat, lng } });
      if (results && results[0]) addr = results[0].formatted_address;
    } catch (_) {}

    setForm(prev => ({ ...prev, location: { lat, lng }, address: addr || prev.address }));
    setShowGMapsPicker(false);
    showNotification("Location selected on Google Maps", "success");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      showNotification("Registering your shop...", "info");
      await axiosClient.post("/auth/shop/signup", form);
      showNotification("Shop registered successfully! Awaiting admin approval.", "success");
      setTimeout(() => { navigate("/shop/login", { state: { message: "Shop registered successfully! Please wait for admin approval." } }); }, 2000);
    } catch (err) {
      showNotification(err.response?.data?.error || "Registration failed. Please try again.", "error");
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg animate-fade-in ${
          toastType === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
          toastType === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
          'bg-blue-50 border border-blue-200 text-blue-700'
        }`}>
          <div className="flex items-center"><span className="mr-2">{toastType === 'success' ? '✅' : toastType === 'error' ? '❌' : 'ℹ️'}</span>{toastMessage}</div>
        </div>
      )}

      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 max-w-2xl w-full">
        <div className="card">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <span className="text-2xl">🏪</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2 font-display">Register Your Shop</h2>
            <p className="text-gray-600">Join QuickKart as a shop owner and start selling</p>
            <p className="mt-2 text-sm text-gray-600">Already have a shop account? <Link to="/shop/login" className="font-semibold text-accent-600 hover:text-accent-500 transition-colors duration-300">Sign in here</Link></p>
          </div>

          {error && (<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 animate-fade-in"><div className="flex items-center"><span className="mr-2">⚠️</span>{error}</div></div>)}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Owner Email</label>
                <input
                  name="ownerEmail"
                  type="email"
                  required
                  className="input-field"
                  placeholder="Enter your email"
                  value={form.ownerEmail}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="input-field pr-12"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter shop name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                <input
                  name="license"
                  type="text"
                  className="input-field"
                  placeholder="Enter license number"
                  value={form.license}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea name="address" rows="3" className="input-field resize-none" placeholder="Enter shop address" value={form.address} onChange={handleChange} />
              <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={locating}
                  className="btn-secondary md:w-auto"
                >
                  {locating ? "Getting GPS..." : "Use current location (GPS)"}
                </button>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={mapsLink}
                    onChange={e => setMapsLink(e.target.value)}
                    className="input-field"
                    placeholder="Paste Google Maps link, decimal (10.3651,77.9803), or DMS (10°27'27.3N 77°53'28.5E)"
                  />
                  <button type="button" onClick={applyMapsLink} className="btn-secondary md:w-auto">
                    Apply
                  </button>
                </div>
              </div>
              {form.location?.lat !== 0 && form.location?.lng !== 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Decimal:</span> {form.location.lat.toFixed(6)}, {form.location.lng.toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">DMS:</span> {formatCoordinates(form.location, 'dms')}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number (Optional)</label>
                <input
                  name="aadhaar"
                  type="text"
                  className="input-field"
                  placeholder="Enter Aadhaar number"
                  value={form.aadhaar}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text sm font-medium text-gray-700 mb-2">GST Number (Optional)</label>
                <input
                  name="gst"
                  type="text"
                  className="input-field"
                  placeholder="Enter GST number"
                  value={form.gst}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UPI VPA (optional)</label>
                <input
                  name="upiVpa"
                  type="text"
                  className="input-field"
                  placeholder="e.g., shop@bank"
                  value={form.upiVpa}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UPI Name (optional)</label>
                <input
                  name="upiName"
                  type="text"
                  className="input-field"
                  placeholder="Account holder name"
                  value={form.upiName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <span className="text-blue-600 mr-2">ℹ️</span>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Important Information</p>
                  <p>Your shop registration will be reviewed by our admin team. You'll be notified once approved and can start selling on QuickKart.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6">
              <Link to="/shop/login" className="btn-secondary">Back to Login</Link>
              <button type="submit" disabled={loading} className="btn-accent">{loading ? (<div className="flex items-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>Registering...</div>) : ("Register Shop")}</button>
            </div>
          </form>
        </div>
      </div>

      {/* Google Maps Picker Modal */}
      {showGMapsPicker && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-[95vw] max-w-3xl p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Pick shop location</h3>
            <input ref={gmapSearchInputRef} type="text" placeholder="Search place" className="input-field mb-3" />
            <div ref={gmapContainerRef} style={{ height: 420, borderRadius: 12 }} className="overflow-hidden border border-gray-200" />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setShowGMapsPicker(false)}>Cancel</button>
              <button type="button" className="btn-primary" onClick={saveGMapsSelection}>Use this location</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
