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
    colors: [], // Changed from single color to array of colors
    sizes: [],
    gender: "",
    ageCategory: "",
    styleFit: "",
    productType: "clothing",
    footwearCategory: "",
    image: null,
    images: [], // New field for multiple images
    inventory: [] // New field for size and color specific inventory
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
      if (name === 'image') {
        setForm(prev => ({ ...prev, image: files[0] }));
      } else if (name === 'images') {
        // Handle multiple image files
        const fileArray = Array.from(files);
        setForm(prev => ({ ...prev, images: [...prev.images, ...fileArray] }));
      }
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

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addImageColor = (index, color) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, color } : img
      )
    }));
  };

  // Add a new color to the colors array
  const addColor = () => {
    setForm(prev => ({
      ...prev,
      colors: [...prev.colors, ""]
    }));
  };

  // Add a new color with an image
  const addColorWithImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setForm(prev => ({
          ...prev,
          colors: [...prev.colors, ""],
          images: [...prev.images, file]
        }));
      }
    };
    input.click();
  };

  // Update a specific color in the colors array
  const updateColor = (index, value) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.map((color, i) => i === index ? value : color),
      // Automatically link the image to the color
      images: prev.images.map((img, i) => 
        i === index ? { ...img, color: value } : img
      )
    }));
  };

  // Remove a color from the colors array
  const removeColor = (index) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
      // Also remove the corresponding image if it exists
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Assign an image to a specific color
  const assignImageToColor = (colorIndex, imageIndex) => {
    const selectedColor = form.colors[colorIndex];
    if (!selectedColor) return;

    setForm(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === imageIndex ? { ...img, color: selectedColor } : img
      )
    }));
  };

  // Generate inventory combinations for all sizes and colors
  const generateInventory = () => {
    const colors = [...form.colors.filter(Boolean), ...form.images.map(img => img.color).filter(Boolean)];
    const uniqueColors = [...new Set(colors)];
    
    const inventory = [];
    form.sizes.forEach(size => {
      uniqueColors.forEach(color => {
        if (color) {
          inventory.push({
            size,
            color,
            quantity: 0
          });
        }
      });
    });
    
    setForm(prev => ({ ...prev, inventory }));
  };

  // Update inventory quantity
  const updateInventoryQuantity = (size, color, quantity) => {
    setForm(prev => ({
      ...prev,
      inventory: prev.inventory.map(item => 
        item.size === size && item.color === color 
          ? { ...item, quantity: parseInt(quantity) || 0 }
          : item
      )
    }));
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

      // 1) Upload images to Firebase
      let imageUrl = editingStock ? editingStock.image : undefined;
      let uploadedImages = [];

      // Upload main image if provided
      if (form.image instanceof File) {
        try {
          imageUrl = await uploadImageToFirebase(form.image, "products");
        } catch (uploadErr) {
          setError("Failed to upload main image. Please try again.");
          setUploading(false);
          return;
        }
      }

             // Upload multiple images for color variants
       if (form.images.length > 0) {
         try {
           const uploadPromises = form.images.map(async (file, index) => {
             const url = await uploadImageToFirebase(file, "products");
             return {
               url,
               color: file.color || form.colors[index] || form.color,
               isPrimary: index === 0
             };
           });
           
           uploadedImages = await Promise.all(uploadPromises);
           
           // Set the first image as the main image if no main image was uploaded
           if (!imageUrl && uploadedImages.length > 0) {
             imageUrl = uploadedImages[0].url;
           }
         } catch (uploadErr) {
           setError("Failed to upload one or more images. Please try again.");
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
          color: form.colors[0] || "", // Use first color as primary color for backward compatibility
          colors: form.colors.filter(Boolean), // Add colors array
          sizes: form.sizes,
          gender: form.gender,
          ageCategory: form.ageCategory,
          styleFit: form.styleFit,
          productType: form.productType,
          image: imageUrl
        };

      // Add multiple images if uploaded
      if (uploadedImages.length > 0) {
        payload.images = uploadedImages;
      }

      // Add inventory if available
      if (form.inventory.length > 0) {
        payload.inventory = form.inventory;
      }

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
        colors: [], // Start with no colors
        sizes: [],
        gender: "",
        ageCategory: "",
        styleFit: "",
        productType: "clothing",
        footwearCategory: "",
        image: null,
        images: [],
        inventory: []
    });
  };

  const handleEdit = (stock) => {
    setEditingStock(stock);
    setForm({
      title: stock.title || "",
      description: stock.description || "",
      price: stock.price || "",
      category: stock.category || "",
      colors: stock.colors || [stock.color || ""], // Use colors array or fallback to single color
      sizes: stock.sizes || [],
      gender: stock.gender || "",
      ageCategory: stock.ageCategory || "",
      styleFit: stock.styleFit || "",
      productType: stock.productType || "clothing",
      footwearCategory: stock.footwearCategory || "",
      image: null,
      images: stock.images || [],
      inventory: stock.inventory || []
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

  // Predefined color list (merged from AI Stylist suggestions)
  const predefinedColors = [
    "Black","White","Grey","Navy","Red","Blue","Green","Yellow","Orange","Pink",
    "Purple","Brown","Beige","Maroon","Olive","Mustard","Coral","Teal","Tan",
    "Burgundy","Charcoal","Soft Pastels","Gold","Turquoise","Cobalt","Hot Pink",
    "Bright Yellow","Bright Green","Royal Blue","Emerald","Emerald Green","Lavender",
    "Light Green","Peach","Cream"
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
               // Automatically add first color when opening form
               setTimeout(() => {
                 setForm(prev => ({
                   ...prev,
                   colors: [""],
                   images: []
                 }));
               }, 100);
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

                                                           {/* Colors and Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Colors with Images *
                    </label>
                    
                    {/* Predefined Colors Dropdown for quick selection */}
                    <div className="mb-4 flex gap-2 items-center">
                      <select
                        className="input-field"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !form.colors.includes(val)) {
                            setForm(prev => ({ ...prev, colors: [...prev.colors, val] }));
                          }
                          e.target.value = "";
                        }}
                        defaultValue=""
                      >
                        <option value="">Select a color</option>
                        {predefinedColors.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <span className="text-xs text-gray-500">Pick a color to add</span>
                    </div>
                    
                    <div className="space-y-3">
                      {form.colors.map((color, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex gap-2 mb-2">
                            <select
                              value={color}
                              onChange={(e) => updateColor(index, e.target.value)}
                              required
                              className="input-field flex-1"
                            >
                              <option value="">Select color</option>
                              {predefinedColors.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => removeColor(index)}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                              disabled={form.colors.length === 1}
                            >
                              ×
                            </button>
                          </div>
                          
                          {/* Image preview for this color */}
                          {form.images[index] ? (
                            <div className="flex items-center gap-2">
                              <img
                                src={URL.createObjectURL(form.images[index])}
                                alt={`Color ${index + 1}`}
                                className="w-16 h-16 object-cover rounded border"
                              />
                              <div className="text-xs text-gray-600">
                                <p><strong>Image:</strong> {form.images[index].name}</p>
                                <p><strong>Size:</strong> {(form.images[index].size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500 italic">
                              No image uploaded for this color
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={addColorWithImage}
                          className="w-full px-4 py-2 border-2 border-dashed border-blue-300 rounded-lg text-blue-500 hover:border-blue-400 hover:text-blue-600 transition-colors bg-blue-50"
                        >
                          + Add Color with Image
                        </button>
                        <button
                          type="button"
                          onClick={addColor}
                          className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                        >
                          + Add Color Only (No Image)
                        </button>
                      </div>
                    </div>
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

                             {/* Inventory Management */}
               {form.sizes.length > 0 && (form.colors.length > 0 || form.images.length > 0) && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Inventory Management
                    </label>
                    <button
                      type="button"
                      onClick={generateInventory}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                    >
                      Generate Inventory Table
                    </button>
                  </div>
                  
                  {form.inventory.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Quantity by Size & Color</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 px-2">Size</th>
                              <th className="text-left py-2 px-2">Color</th>
                              <th className="text-left py-2 px-2">Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {form.inventory.map((item, index) => (
                              <tr key={index} className="border-b border-gray-100">
                                <td className="py-2 px-2 font-medium">{item.size}</td>
                                <td className="py-2 px-2">
                                  <div 
                                    className="w-4 h-4 rounded-full inline-block mr-2"
                                    style={{ backgroundColor: item.color || '#ccc' }}
                                  ></div>
                                  {item.color}
                                </td>
                                <td className="py-2 px-2">
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.quantity}
                                    onChange={(e) => updateInventoryQuantity(item.size, item.color, e.target.value)}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="0"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Set the quantity available for each size and color combination
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Main Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Product Image *
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
                  Upload the main image of your product (JPG, PNG, GIF)
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
                  </div>
                )}
              </div>

                             {/* Note: Images are now automatically linked to colors above */}
                    
                    {/* Image Preview */}
                    {form.image && form.image.type && form.image.type.startsWith('image/') && (
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
                       {stock.inventory && stock.inventory.length > 0 && (
                         <div className="text-xs text-gray-500">
                           <p><strong>Inventory:</strong></p>
                           <div className="space-y-1">
                             {stock.inventory.slice(0, 3).map((item, index) => (
                               <p key={index}>
                                 {item.size} - {item.color}: {item.quantity}
                               </p>
                             ))}
                             {stock.inventory.length > 3 && (
                               <p>+{stock.inventory.length - 3} more combinations</p>
                             )}
                           </div>
                         </div>
                       )}
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
