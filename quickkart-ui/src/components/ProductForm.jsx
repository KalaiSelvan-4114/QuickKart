import React, { useState, useEffect } from 'react';
import { uploadImageToFirebase } from '../lib/firebase';

export default function ProductForm({ 
  product = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    colors: [],
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

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title || "",
        description: product.description || "",
        price: product.price || "",
        category: product.category || "",
        colors: product.colors || [],
        sizes: product.sizes || [],
        gender: product.gender || "",
        ageCategory: product.ageCategory || "",
        styleFit: product.styleFit || "",
        productType: product.productType || "clothing",
        footwearCategory: product.footwearCategory || "",
        image: null,
        images: product.images || [],
        inventory: product.inventory || []
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    
    if (files) {
      if (name === 'image') {
        setForm(prev => ({ ...prev, image: files[0] }));
      } else if (name === 'images') {
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

  const addColor = () => {
    const newColor = prompt("Enter color name:");
    if (newColor && !form.colors.includes(newColor)) {
      setForm(prev => ({
        ...prev,
        colors: [...prev.colors, newColor]
      }));
    }
  };

  const removeColor = (colorToRemove) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.filter(color => color !== colorToRemove)
    }));
  };

  const addSize = () => {
    const newSize = prompt("Enter size:");
    if (newSize && !form.sizes.includes(newSize)) {
      setForm(prev => ({
        ...prev,
        sizes: [...prev.sizes, newSize]
      }));
    }
  };

  const removeSize = (sizeToRemove) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.filter(size => size !== sizeToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setUploading(true);

    try {
      let imageUrls = [...form.images];

      // Upload new images
      if (form.image) {
        const imageUrl = await uploadImageToFirebase(form.image);
        imageUrls.unshift(imageUrl);
      }

      // Upload new image files
      const newImageFiles = form.images.filter(img => img instanceof File);
      for (const file of newImageFiles) {
        const imageUrl = await uploadImageToFirebase(file);
        imageUrls = imageUrls.map(img => img === file ? imageUrl : img);
      }

      const productData = {
        ...form,
        images: imageUrls,
        price: parseFloat(form.price)
      };

      await onSubmit(productData);
    } catch (err) {
      setError(err.message || "Failed to save product");
    } finally {
      setUploading(false);
    }
  };

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48", "50", "52", "54", "56", "58", "60", "62", "64", "66", "68", "70", "72", "74", "76", "78", "80", "82", "84", "86", "88", "90", "92", "94", "96", "98", "100", "102", "104", "106", "108", "110", "112", "114", "116", "118", "120", "122", "124", "126", "128", "130", "132", "134", "136", "138", "140", "142", "144", "146", "148", "150", "152", "154", "156", "158", "160", "162", "164", "166", "168", "170", "172", "174", "176", "178", "180", "182", "184", "186", "188", "190", "192", "194", "196", "198", "200", "202", "204", "206", "208", "210", "212", "214", "216", "218", "220", "222", "224", "226", "228", "230", "232", "234", "236", "238", "240", "242", "244", "246", "248", "250", "252", "254", "256", "258", "260", "262", "264", "266", "268", "270", "272", "274", "276", "278", "280", "282", "284", "286", "288", "290", "292", "294", "296", "298", "300", "302", "304", "306", "308", "310", "312", "314", "316", "318", "320", "322", "324", "326", "328", "330", "332", "334", "336", "338", "340", "342", "344", "346", "348", "350", "352", "354", "356", "358", "360", "362", "364", "366", "368", "370", "372", "374", "376", "378", "380", "382", "384", "386", "388", "390", "392", "394", "396", "398", "400", "402", "404", "406", "408", "410", "412", "414", "416", "418", "420", "422", "424", "426", "428", "430", "432", "434", "436", "438", "440", "442", "444", "446", "448", "450", "452", "454", "456", "458", "460", "462", "464", "466", "468", "470", "472", "474", "476", "478", "480", "482", "484", "486", "488", "490", "492", "494", "496", "498", "500"];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {product ? "Edit Product" : "Add New Product"}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter product description"
          />
        </div>

        {/* Category and Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select Category</option>
              <option value="Shirt">Shirt</option>
              <option value="T-Shirt">T-Shirt</option>
              <option value="Jeans">Jeans</option>
              <option value="Trousers">Trousers</option>
              <option value="Dress">Dress</option>
              <option value="Saree">Saree</option>
              <option value="Kurta">Kurta</option>
              <option value="Shoes">Shoes</option>
              <option value="Sneakers">Sneakers</option>
              <option value="Sandals">Sandals</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select Gender</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
              <option value="Kids">Kids</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age Category
            </label>
            <select
              name="ageCategory"
              value={form.ageCategory}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select Age</option>
              <option value="Infant">Infant (0-2 years)</option>
              <option value="Toddler">Toddler (3-5 years)</option>
              <option value="Kids">Kids (6-12 years)</option>
              <option value="Teen">Teen (13-17 years)</option>
              <option value="Adult">Adult (18+ years)</option>
            </select>
          </div>
        </div>

        {/* Colors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Colors
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.colors.map((color, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {color}
                <button
                  type="button"
                  onClick={() => removeColor(color)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={addColor}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            + Add Color
          </button>
        </div>

        {/* Sizes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Sizes
          </label>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-2">
            {sizeOptions.map((size) => (
              <label key={size} className="flex items-center">
                <input
                  type="checkbox"
                  name="sizes"
                  value={size}
                  checked={form.sizes.includes(size)}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm">{size}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images
          </label>
          <input
            type="file"
            name="image"
            onChange={handleChange}
            accept="image/*"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload a main product image
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Images
          </label>
          <input
            type="file"
            name="images"
            onChange={handleChange}
            accept="image/*"
            multiple
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload additional product images
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || uploading ? "Saving..." : (product ? "Update Product" : "Add Product")}
          </button>
        </div>
      </form>
    </div>
  );
}
