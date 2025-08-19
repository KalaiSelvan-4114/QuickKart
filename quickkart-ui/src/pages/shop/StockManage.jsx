import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { uploadImageToFirebase } from "../../lib/firebase";

export default function StockManage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    color: "",
    sizes: [],
    gender: "",
    ageCategory: "",
    styleFit: "",
    productType: "clothing",
    footwearCategory: "",
    image: null
  });

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosClient.get("/shop/stocks");
      setStocks(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Token required. Please re-open this page or re-login as Shop.");
      } else {
        setError(err.response?.data?.error || "Failed to load stocks");
      }
    } finally {
      setLoading(false);
    }
  };

  const RetryInline = () => (
    <button
      onClick={loadStocks}
      className="ml-3 text-sm bg-gray-800 text-white px-3 py-1 rounded-lg hover:bg-gray-900"
    >
      Retry
    </button>
  );

  const handleChange = e => {
    const { name, value, files, type } = e.target;
    if (files) {
      setForm(prev => ({ ...prev, image: files[0] }));
    } else if (type === 'checkbox') {
      const { checked } = e.target;
      if (name === 'sizes') {
        setForm(prev => ({
          ...prev,
          sizes: checked 
            ? [...prev.sizes, value]
            : prev.sizes.filter(size => size !== value)
        }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!form.title || !form.price || !form.category || !form.productType) {
      setError("Please fill in all required fields (Title, Price, Category, Product Type)");
      return;
    }
    
    if (form.sizes.length === 0) {
      setError("Please select at least one size");
      return;
    }
    
    if (!editingStock && !form.image) {
      setError("Please upload a product image");
      return;
    }
    
    try {
      setUploading(true);
      setError(""); // Clear any previous errors

      // 1) Upload image to Firebase if a local File object is present
      let imageUrl = editingStock ? editingStock.image : undefined;
      if (form.image instanceof File) {
        try {
          imageUrl = await uploadImageToFirebase(form.image, "products");
        } catch (uploadErr) {
          setError("Failed to upload image. Please try again.");
          setUploading(false);
          return;
        }
      }

      // 2) Prepare payload
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category: form.productType === "clothing" ? form.category : undefined,
        footwearCategory: form.productType === "footwear" ? form.footwearCategory : undefined,
        color: form.color.trim(),
        sizes: form.sizes,
        gender: form.gender,
        ageCategory: form.ageCategory,
        styleFit: form.styleFit,
        productType: form.productType,
        image: imageUrl
      };

      // 3) Send request to backend
      let response;
      if (editingStock) {
        response = await axiosClient.put(`/shop/stocks/${editingStock._id}`, payload);
      } else {
        response = await axiosClient.post("/shop/stocks", payload);
      }

      setShowForm(false);
      setEditingStock(null);
      resetForm();
      loadStocks();

      // Show success message
      setError(""); // Clear any errors

    } catch (err) {
      let errorMessage = "Failed to save stock";

      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.error || err.response.data?.message || errorMessage;

        if (err.response.data?.details) {
          if (Array.isArray(err.response.data.details)) {
            errorMessage += `: ${err.response.data.details.join(", ")}`;
          } else {
            errorMessage += `: ${err.response.data.details}`;
          }
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = "Network error. Please check your connection and try again.";
      } else {
        // Something else happened
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
      setForm({
        title: "",
        description: "",
        price: "",
        category: "",
        color: "",
        sizes: [],
        gender: "",
        ageCategory: "",
        styleFit: "",
        productType: "clothing",
        footwearCategory: "",
        image: null
    });
  };

  const handleEdit = (stock) => {
    setEditingStock(stock);
    setForm({
      title: stock.title || "",
      description: stock.description || "",
      price: stock.price || "",
      category: stock.category || "",
      color: stock.color || "",
      sizes: stock.sizes || [],
      gender: stock.gender || "",
      ageCategory: stock.ageCategory || "",
      styleFit: stock.styleFit || "",
      productType: stock.productType || "clothing",
      footwearCategory: stock.footwearCategory || "",
      image: null
    });
    setShowForm(true);
  };

  const handleDelete = async (stockId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axiosClient.delete(`/shop/stocks/${stockId}`);
        loadStocks();
    } catch (err) {
        setError("Failed to delete product");
      }
    }
  };

  const createTestShop = async () => {
    try {
      const res = await axiosClient.post("/shop/create-test-shop");
      console.log("Test shop created:", res.data);
      alert("Test shop created! You can now login with test@shop.com / test123");
    } catch (err) {
      console.error("Failed to create test shop:", err);
      alert("Failed to create test shop: " + (err.response?.data?.error || err.message));
    }
  };

  const testAuth = async () => {
    try {
      const res = await axiosClient.get("/shop/test-auth");
      console.log("Auth test response:", res.data);
      alert("Authentication working! Shop ID: " + res.data.shopId);
    } catch (err) {
      console.error("Auth test failed:", err);
      alert("Authentication failed: " + (err.response?.data?.error || err.message));
    }
  };

  const sizeOptions = ["S", "M", "L", "XL", "XXL"];
  const clothingCategories = [
    "T-shirt", "Shirt", "Jeans", "Shorts", "Dress", "Skirt", "Hoodie", "Jacket",
    "Suit", "Trousers", "Blazer", "Saree", "Kurta", "Lehenga", "Sherwani",
    "Tracksuit", "Leggings", "Pyjamas", "Cargo pants"
  ];
  const footwearCategories = [
    "Sneakers", "Loafers", "Flats", "Heels", "Formal shoes", "Sports shoes",
    "Mojari", "Sandals", "Boots", "Flip-flops", "Party shoes", "School shoes"
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-3xl">📦</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-display">
            Manage Your Stock
          </h1>
          <p className="text-xl text-gray-600">
            Upload, edit, and manage your product inventory
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
                <RetryInline />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={createTestShop}
                  className="text-sm bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                >
                  Create Test Shop
                </button>
                <button
                  onClick={testAuth}
                  className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                >
                  Test Auth
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add New Product Button */}
        <div className="mb-8 text-center">
          <button
            onClick={() => {
              setShowForm(true);
              setEditingStock(null);
              resetForm();
            }}
            className="btn-primary px-8 py-3 text-lg"
          >
            + Add New Product
          </button>
        </div>

        {/* Product Form */}
        {showForm && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 font-display">
              {editingStock ? "Edit Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Enter product title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="input-field"
                    placeholder="Enter price"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="input-field"
                  placeholder="Enter product description"
                />
              </div>

              {/* Product Type and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Type *
                  </label>
                  <select
                    name="productType"
                    value={form.productType}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="clothing">Clothing</option>
                    <option value="footwear">Footwear</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {form.productType === "clothing" ? "Clothing Category" : "Footwear Category"} *
                  </label>
                  <select
                    name={form.productType === "clothing" ? "category" : "footwearCategory"}
                    value={form.productType === "clothing" ? form.category : form.footwearCategory}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select Category</option>
                    {form.productType === "clothing" 
                      ? clothingCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))
                      : footwearCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))
                    }
                  </select>
                </div>
              </div>

              {/* Color and Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color *
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={form.color}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Enter color"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Style Fit
                  </label>
                  <select
                    name="styleFit"
                    value={form.styleFit}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select Style</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="party">Party</option>
                    <option value="ethnic">Ethnic</option>
                    <option value="sports">Sports</option>
                    <option value="grand">Grand</option>
                  </select>
                </div>
              </div>

              {/* Demographics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age Category *
                  </label>
                  <select
                    name="ageCategory"
                    value={form.ageCategory}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select Age Category</option>
                    <option value="kid">Kid</option>
                    <option value="teen">Teen</option>
                    <option value="adult">Adult</option>
                    <option value="senior">Senior</option>
      </select>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Sizes *
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {sizeOptions.map(size => (
                    <label key={size} className="flex items-center">
                      <input
                        type="checkbox"
                        name="sizes"
                        value={size}
                        checked={form.sizes.includes(size)}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image *
                </label>
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  accept="image/*"
                  required={!editingStock}
                  className="input-field"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload a clear image of your product (JPG, PNG, GIF)
                </p>
                {form.image && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Selected file:</strong> {form.image.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Size:</strong> {(form.image.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Type:</strong> {form.image.type}
                    </p>
                    {form.image.size > 10 * 1024 * 1024 && (
                      <p className="text-sm text-red-600">
                        ⚠️ File is larger than 10MB. Please choose a smaller image.
                      </p>
                    )}
                    {!form.image.type.startsWith('image/') && (
                      <p className="text-sm text-red-600">
                        ⚠️ Please select an image file (JPG, PNG, GIF).
                      </p>
                    )}
                    
                    {/* Image Preview */}
                    {form.image.type.startsWith('image/') && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Preview:</strong>
                        </p>
                        <img 
                          src={URL.createObjectURL(form.image)} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-primary flex-1"
                >
                  {uploading ? "Saving..." : (editingStock ? "Update Product" : "Add Product")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingStock(null);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your products...</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 font-display">
                Your Products ({stocks.length})
              </h2>
            </div>

            {stocks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No products yet</h3>
                <p className="text-gray-600 mb-6">Start by adding your first product</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stocks.map((stock) => (
                  <div key={stock._id} className="card hover:scale-105 transition-transform duration-300">
                    <div className="aspect-square bg-gray-200 rounded-xl mb-4 overflow-hidden">
                      {stock.image ? (
                        <img 
                          src={stock.image} 
                          alt={stock.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl">👕</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-800 line-clamp-2">
                        {stock.title}
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {stock.category && (
                          <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
                            {stock.category}
                          </span>
                        )}
                        {stock.gender && (
                          <span className="bg-accent-100 text-accent-800 px-2 py-1 rounded-full text-xs">
                            {stock.gender}
                          </span>
                        )}
                        {stock.ageCategory && (
                          <span className="bg-secondary-100 text-secondary-800 px-2 py-1 rounded-full text-xs">
                            {stock.ageCategory}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">
                        Color: {stock.color}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Sizes: {stock.sizes?.join(', ')}
                      </p>
                      <p className="text-primary-600 font-bold text-lg">
                        ₹{stock.price}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(stock)}
                          className="btn-primary flex-1 text-sm py-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(stock._id)}
                          className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
