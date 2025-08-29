import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

export default function DeliveryHeadBoys() {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBoy, setEditingBoy] = useState(null);
  const [formData, setFormData] = useState({
    boyId: "",
    name: "",
    phone: "",
    email: "",
    aadhar: "",
    location: {
      lat: "",
      lng: "",
      address: ""
    }
  });

  useEffect(() => {
    loadDeliveryBoys();
  }, []);

  const loadDeliveryBoys = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/delivery-head/boys");
      setDeliveryBoys(response.data);
    } catch (err) {
      setError("Failed to load delivery boys");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      boyId: "",
      name: "",
      phone: "",
      email: "",
      aadhar: "",
      location: { lat: "", lng: "", address: "" }
    });
    setEditingBoy(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBoy) {
        await axiosClient.put(`/delivery-head/boys/${editingBoy.boyId}`, formData);
      } else {
        await axiosClient.post("/delivery-head/boys", formData);
      }
      resetForm();
      loadDeliveryBoys();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save delivery boy");
    }
  };

  const handleEdit = (boy) => {
    setEditingBoy(boy);
    setFormData({
      boyId: boy.boyId,
      name: boy.name,
      phone: boy.phone,
      email: boy.email,
      aadhar: boy.aadhar,
      location: boy.location
    });
    setShowAddForm(true);
  };

  const handleDelete = async (boyId) => {
    if (window.confirm("Are you sure you want to remove this delivery boy?")) {
      try {
        await axiosClient.delete(`/delivery-head/boys/${boyId}`);
        loadDeliveryBoys();
      } catch (err) {
        setError("Failed to remove delivery boy");
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">👥 Manage Delivery Boys</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            + Add Delivery Boy
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              {editingBoy ? 'Edit Delivery Boy' : 'Add New Delivery Boy'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Boy ID</label>
                  <input
                    type="text"
                    name="boyId"
                    value={formData.boyId}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="e.g., DB001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
                  <input
                    type="text"
                    name="aadhar"
                    value={formData.aadhar}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="Enter Aadhar number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="Enter full address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    name="location.lat"
                    value={formData.location.lat}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="e.g., 28.6139"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    name="location.lng"
                    value={formData.location.lng}
                    onChange={handleChange}
                    className="input-field w-full"
                    placeholder="e.g., 77.2090"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary">
                  {editingBoy ? 'Update' : 'Add'} Delivery Boy
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Delivery Boys List */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Current Delivery Boys</h2>
          </div>
          <div className="p-6">
            {deliveryBoys.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No delivery boys added yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deliveryBoys.map((boy) => (
                  <div key={boy._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{boy.boyId}</h3>
                        <p className="text-sm text-gray-600">{boy.name}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        boy.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {boy.isAvailable ? 'Available' : 'Busy'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                      <p>📱 {boy.phone}</p>
                      <p>📧 {boy.email}</p>
                      <p>📍 {boy.location?.address}</p>
                      <p>🚚 Total: {boy.totalDeliveries}</p>
                      <p>⭐ Rating: {boy.rating}/5</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(boy)}
                        className="btn-secondary text-sm px-3 py-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(boy.boyId)}
                        className="btn-secondary text-sm px-3 py-1 text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
