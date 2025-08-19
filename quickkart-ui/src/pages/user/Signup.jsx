import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function UserSignup() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    age: "",
    ageCategory: "adult",
    gender: "Male",
    skinTone: "Fair",
    bodySize: "M",
    shoeSize: "",
    location: { lat: 0, lng: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const navigate = useNavigate();

  const showNotification = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Show immediate feedback
      showNotification("Creating your account...", "info");
      
      // Geolocation for location, optional
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          const updatedForm = {
            ...form,
            location: { lat: position.coords.latitude, lng: position.coords.longitude }
          };
          axiosClient.post("/auth/user/signup", updatedForm).then(() => {
            showNotification("Account created successfully! Redirecting to login...", "success");
            setTimeout(() => {
              navigate("/user/login", { state: { message: "Signup successful! Please login." } });
            }, 2000);
          }).catch(err => {
            showNotification(err.response?.data?.error || "Signup failed. Please try again.", "error");
            setError(err.response?.data?.error || "Signup failed. Please try again.");
          });
        }, () => {
          // Geolocation failed, proceed without location
          axiosClient.post("/auth/user/signup", form).then(() => {
            showNotification("Account created successfully! Redirecting to login...", "success");
            setTimeout(() => {
              navigate("/user/login", { state: { message: "Signup successful! Please login." } });
            }, 2000);
          }).catch(err => {
            showNotification(err.response?.data?.error || "Signup failed. Please try again.", "error");
            setError(err.response?.data?.error || "Signup failed. Please try again.");
          });
        });
      } else {
        await axiosClient.post("/auth/user/signup", form);
        showNotification("Account created successfully! Redirecting to login...", "success");
        setTimeout(() => {
          navigate("/user/login", { state: { message: "Signup successful! Please login." } });
        }, 2000);
      }
    } catch (err) {
      showNotification(err.response?.data?.error || "Signup failed. Please try again.", "error");
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
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
          <div className="flex items-center">
            <span className="mr-2">
              {toastType === 'success' ? '✅' : toastType === 'error' ? '❌' : 'ℹ️'}
            </span>
            {toastMessage}
          </div>
        </div>
      )}

      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 max-w-2xl w-full">
        <div className="card">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <span className="text-2xl">🎉</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2 font-display">
              Join QuickKart
            </h2>
            <p className="text-gray-600">
              Create your account and start your fashion journey
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/user/login"
                className="font-semibold text-primary-600 hover:text-primary-500 transition-colors duration-300"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step {currentStep} of 3</span>
              <span className="text-sm text-gray-500">{Math.round((currentStep / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 animate-fade-in">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="input-field"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="input-field"
                    placeholder="Enter your email"
                    value={form.email}
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
              </div>
            )}

            {/* Step 2: Personal Details */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <input
                      name="age"
                      type="number"
                      min="1"
                      max="120"
                      required
                      className="input-field"
                      placeholder="Enter your age"
                      value={form.age}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age Category</label>
                    <select
                      name="ageCategory"
                      onChange={handleChange}
                      value={form.ageCategory}
                      className="input-field"
                    >
                      <option value="kid">Kid</option>
                      <option value="teen">Teen</option>
                      <option value="adult">Adult</option>
                      <option value="senior">Senior</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      name="gender"
                      onChange={handleChange}
                      value={form.gender}
                      className="input-field"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skin Tone</label>
                    <select
                      name="skinTone"
                      onChange={handleChange}
                      value={form.skinTone}
                      className="input-field"
                    >
                      <option>Fair</option>
                      <option>Medium</option>
                      <option>Dusky</option>
                      <option>Dark</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Size Information */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Size Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Body Size</label>
                    <select
                      name="bodySize"
                      onChange={handleChange}
                      value={form.bodySize}
                      className="input-field"
                    >
                      <option>S</option>
                      <option>M</option>
                      <option>L</option>
                      <option>XL</option>
                      <option>XXL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shoe Size</label>
                    <input
                      name="shoeSize"
                      type="text"
                      required
                      className="input-field"
                      placeholder="e.g. 7, 8.5, 42"
                      value={form.shoeSize}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">💡</span>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Why do we need this information?</p>
                      <p>This helps us provide personalized fashion recommendations and find the perfect fit for you.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-secondary"
                >
                  Previous
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary ml-auto"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary ml-auto"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
