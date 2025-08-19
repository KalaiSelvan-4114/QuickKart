import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/user/profile");
      setProfile(res.data);
      setEditData(res.data);
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      
      await axiosClient.put("/user/profile", editData);
      setProfile(editData);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditData(profile);
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-3xl">👤</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-display">
            Your Profile
          </h1>
          <p className="text-xl text-gray-600">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-center">
              <span className="mr-2">✅</span>
              {success}
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 font-display">
              Personal Information
            </h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-primary"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={cancelEdit}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={editData.name || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editData.email || ""}
                  disabled={true}
                  className="input-field bg-gray-50"
                  placeholder="Email (cannot be changed)"
                />
              </div>
            </div>

            {/* Age and Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  value={editData.age || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field"
                  placeholder="Enter your age"
                  min="1"
                  max="120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Category *
                </label>
                <select
                  name="ageCategory"
                  value={editData.ageCategory || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field"
                >
                  <option value="">Select Age Category</option>
                  <option value="kid">Kid (0-12 years)</option>
                  <option value="teen">Teen (13-19 years)</option>
                  <option value="adult">Adult (20-59 years)</option>
                  <option value="senior">Senior (60+ years)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                name="gender"
                value={editData.gender || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="input-field"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Physical Attributes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skin Tone *
                </label>
                <select
                  name="skinTone"
                  value={editData.skinTone || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field"
                >
                  <option value="">Select Skin Tone</option>
                  <option value="Fair">Fair</option>
                  <option value="Medium">Medium</option>
                  <option value="Dusky">Dusky</option>
                  <option value="Dark">Dark</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body Size *
                </label>
                <select
                  name="bodySize"
                  value={editData.bodySize || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field"
                >
                  <option value="">Select Body Size</option>
                  <option value="S">S (Small)</option>
                  <option value="M">M (Medium)</option>
                  <option value="L">L (Large)</option>
                  <option value="XL">XL (Extra Large)</option>
                  <option value="XXL">XXL (Double Extra Large)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shoe Size *
              </label>
              <input
                type="text"
                name="shoeSize"
                value={editData.shoeSize || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="input-field"
                placeholder="e.g., 7, 8.5, 42 (US/UK/EU)"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={editData.location || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="input-field"
                placeholder="Enter your location (for nearby shops)"
              />
              <p className="text-sm text-gray-500 mt-1">
                This helps us show you products from shops near you
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={editData.phone || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="input-field"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          {/* Profile Completion Status */}
          {!isEditing && (
            <div className="mt-8 p-4 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-blue-800 mb-2">Profile Completion</h3>
              <div className="space-y-2">
                {[
                  { field: 'name', label: 'Full Name' },
                  { field: 'age', label: 'Age' },
                  { field: 'ageCategory', label: 'Age Category' },
                  { field: 'gender', label: 'Gender' },
                  { field: 'skinTone', label: 'Skin Tone' },
                  { field: 'bodySize', label: 'Body Size' },
                  { field: 'shoeSize', label: 'Shoe Size' }
                ].map(({ field, label }) => (
                  <div key={field} className="flex items-center">
                    <span className={`w-4 h-4 rounded-full mr-3 ${
                      editData[field] ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {editData[field] && '✓'}
                    </span>
                    <span className={`text-sm ${
                      editData[field] ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-blue-600 mt-3">
                Complete your profile to get better AI stylist recommendations!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
