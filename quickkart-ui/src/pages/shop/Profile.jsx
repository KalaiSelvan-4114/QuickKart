import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { uploadImageToFirebase } from "../../lib/firebase";
import PageLayout from "../../components/PageLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import NotificationToast from "../../components/NotificationToast";

export default function ShopProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [form, setForm] = useState({
    name: "",
    ownerEmail: "",
    ownerPhone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gst: "",
    upiVpa: "",
    upiName: "",
    shopImage: null,
    description: ""
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/shop/profile");
      setProfile(res.data);
      setForm({
        name: res.data.name || "",
        ownerEmail: res.data.ownerEmail || "",
        ownerPhone: res.data.ownerPhone || "",
        address: res.data.address || "",
        city: res.data.city || "",
        state: res.data.state || "",
        pincode: res.data.pincode || "",
        gst: res.data.gst || "",
        upiVpa: res.data.upiVpa || "",
        upiName: res.data.upiName || "",
        shopImage: null,
        description: res.data.description || ""
      });
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      setForm(prev => ({ ...prev, shopImage: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      let shopImageUrl = profile?.shopImage || "";

      // Upload new shop image if provided
      if (form.shopImage) {
        shopImageUrl = await uploadImageToFirebase(form.shopImage);
      }

      const updateData = {
        ...form,
        shopImage: shopImageUrl
      };

      await axiosClient.put("/shop/profile", updateData);
      
      setNotification({
        show: true,
        message: "Profile updated successfully!",
        type: "success"
      });

      // Reload profile to get updated data
      await loadProfile();
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
      setNotification({
        show: true,
        message: err.response?.data?.error || "Failed to update profile",
        type: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    setForm({
      name: profile?.name || "",
      ownerEmail: profile?.ownerEmail || "",
      ownerPhone: profile?.ownerPhone || "",
      address: profile?.address || "",
      city: profile?.city || "",
      state: profile?.state || "",
      pincode: profile?.pincode || "",
      gst: profile?.gst || "",
      upiVpa: profile?.upiVpa || "",
      upiName: profile?.upiName || "",
      shopImage: null,
      description: profile?.description || ""
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <PageLayout
      title="Shop Profile"
      subtitle="Manage your shop details and settings"
      icon="🏪"
      iconBgColor="from-accent-400 to-accent-600"
    >
      <NotificationToast
        notification={notification}
        onClose={() => setNotification({ show: false, message: "", type: "" })}
      />

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Shop Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shop Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Image
                </label>
                <div className="flex items-center space-x-4">
                  {(profile?.shopImage || form.shopImage) && (
                    <img
                      src={form.shopImage ? URL.createObjectURL(form.shopImage) : profile.shopImage}
                      alt="Shop"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                  )}
                  <input
                    type="file"
                    name="shopImage"
                    onChange={handleChange}
                    accept="image/*"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter shop name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Email *
                  </label>
                  <input
                    type="email"
                    name="ownerEmail"
                    value={form.ownerEmail}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter owner email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Phone *
                  </label>
                  <input
                    type="tel"
                    name="ownerPhone"
                    value={form.ownerPhone}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter owner phone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gst"
                    value={form.gst}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter GST number"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter shop address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter pincode"
                  />
                </div>
              </div>

              {/* UPI Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UPI VPA
                  </label>
                  <input
                    type="text"
                    name="upiVpa"
                    value={form.upiVpa}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="example@upi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UPI Name
                  </label>
                  <input
                    type="text"
                    name="upiName"
                    value={form.upiName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter UPI name"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe your shop, products, and services..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Shop Image Display */}
              {profile?.shopImage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Image
                  </label>
                  <img
                    src={profile.shopImage}
                    alt="Shop"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}

              {/* Basic Information Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Name
                  </label>
                  <p className="text-gray-900">{profile?.name || "Not set"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Email
                  </label>
                  <p className="text-gray-900">{profile?.ownerEmail || "Not set"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Phone
                  </label>
                  <p className="text-gray-900">{profile?.ownerPhone || "Not set"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <p className="text-gray-900">{profile?.gst || "Not set"}</p>
                </div>
              </div>

              {/* Address Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <p className="text-gray-900">{profile?.address || "Not set"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <p className="text-gray-900">{profile?.city || "Not set"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <p className="text-gray-900">{profile?.state || "Not set"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <p className="text-gray-900">{profile?.pincode || "Not set"}</p>
                </div>
              </div>

              {/* UPI Information Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UPI VPA
                  </label>
                  <p className="text-gray-900">{profile?.upiVpa || "Not set"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UPI Name
                  </label>
                  <p className="text-gray-900">{profile?.upiName || "Not set"}</p>
                </div>
              </div>

              {/* Description Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Description
                </label>
                <p className="text-gray-900">{profile?.description || "No description available"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
