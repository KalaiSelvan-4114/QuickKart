import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import axios from "axios"; // Added for axios.CancelToken

export default function Stylist() {
  const [userProfile, setUserProfile] = useState({
    age: "",
    ageCategory: "",
    gender: "",
    skinTone: "",
    bodySize: "",
    shoeSize: ""
  });
  const [stylingInputs, setStylingInputs] = useState({
    occasion: "",
    productType: "clothing",
    colorPreference: "",
    budget: ""
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [previewProducts, setPreviewProducts] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [useLocationFilter, setUseLocationFilter] = useState(false);

  // Request cancellation and deduplication
  const abortControllerRef = useRef(null);
  const pendingRequestRef = useRef(null);
  const isComponentMountedRef = useRef(true);

  // Clothing categories based on age and occasion
  const clothingCategories = {
    teen: {
      casual: {
        male: ["T-shirt", "Shirt", "Jeans", "Shorts"],
        female: ["Dress", "T-shirt", "Jeans", "Skirt"],
        unisex: ["Hoodie", "Jacket"]
      },
      formal: {
        male: ["Suit", "Shirt", "Trousers", "Blazer"],
        female: ["Saree", "Kurta set", "Blouse", "Trousers"],
        unisex: ["Blazer", "Shirt"]
      },
      party: {
        male: ["Blazer", "Party shirt", "Jeans"],
        female: ["Gown", "Party dress", "Saree", "Lehenga"],
        unisex: ["Sequined Jackets"]
      },
      sports: {
        male: ["Tracksuit", "Shorts", "T-shirt"],
        female: ["Leggings", "Sports bra", "Tracksuit"],
        unisex: ["Tracksuits"]
      },
      ethnic: {
        male: ["Sherwani", "Kurta-Pajama", "Dhoti"],
        female: ["Saree", "Lehenga", "Salwar", "Anarkali"],
        unisex: ["Kurta"]
      },
      travel: {
        male: ["Cargo pants", "Jacket", "Hoodie"],
        female: ["Jeans", "Jacket", "Hoodie"],
        unisex: ["Tracksuits", "Jackets"]
      },
      lounge: {
        male: ["Pyjamas", "T-shirt"],
        female: ["Pyjamas", "Nightgown", "Shorts"],
        unisex: ["Pyjamas"]
      }
    },
    adult: {
      casual: {
        male: ["T-shirt", "Shirt", "Jeans", "Shorts"],
        female: ["Dress", "T-shirt", "Jeans", "Skirt"],
        unisex: ["Hoodie", "Jacket"]
      },
      formal: {
        male: ["Suit", "Shirt", "Trousers", "Blazer"],
        female: ["Saree", "Kurta set", "Blouse", "Trousers"],
        unisex: ["Blazer", "Shirt"]
      },
      party: {
        male: ["Blazer", "Party shirt", "Jeans"],
        female: ["Gown", "Party dress", "Saree", "Lehenga"],
        unisex: ["Sequined Jackets"]
      },
      sports: {
        male: ["Tracksuit", "Shorts", "T-shirt"],
        female: ["Leggings", "Sports bra", "Tracksuit"],
        unisex: ["Tracksuits"]
      },
      ethnic: {
        male: ["Sherwani", "Kurta-Pajama", "Dhoti"],
        female: ["Saree", "Lehenga", "Salwar", "Anarkali"],
        unisex: ["Kurta"]
      },
      travel: {
        male: ["Cargo pants", "Jacket", "Hoodie"],
        female: ["Jeans", "Jacket", "Hoodie"],
        unisex: ["Tracksuits", "Jackets"]
      },
      lounge: {
        male: ["Pyjamas", "T-shirt"],
        female: ["Pyjamas", "Nightgown", "Shorts"],
        unisex: ["Pyjamas"]
      }
    },
    senior: {
      casual: {
        male: ["T-shirt", "Shirt", "Jeans", "Shorts"],
        female: ["Dress", "T-shirt", "Jeans", "Skirt"],
        unisex: ["Hoodie", "Jacket"]
      },
      formal: {
        male: ["Suit", "Shirt", "Trousers", "Blazer"],
        female: ["Saree", "Kurta set", "Blouse", "Trousers"],
        unisex: ["Blazer", "Shirt"]
      },
      party: {
        male: ["Blazer", "Party shirt", "Jeans"],
        female: ["Gown", "Party dress", "Saree", "Lehenga"],
        unisex: ["Sequined Jackets"]
      },
      sports: {
        male: ["Tracksuit", "Shorts", "T-shirt"],
        female: ["Leggings", "Sports bra", "Tracksuit"],
        unisex: ["Tracksuits"]
      },
      ethnic: {
        male: ["Sherwani", "Kurta-Pajama", "Dhoti"],
        female: ["Saree", "Lehenga", "Salwar", "Anarkali"],
        unisex: ["Kurta"]
      },
      travel: {
        male: ["Cargo pants", "Jacket", "Hoodie"],
        female: ["Jeans", "Jacket", "Hoodie"],
        unisex: ["Tracksuits", "Jackets"]
      },
      lounge: {
        male: ["Pyjamas", "T-shirt"],
        female: ["Pyjamas", "Nightgown", "Shorts"],
        unisex: ["Pyjamas"]
      }
    },
    kid: {
      casual: ["T-shirt & Shorts", "Frocks", "Rompers", "Jeans & Tops", "Dungarees", "Leggings", "Jumpsuits", "Hoodies"],
      party: ["Party Frocks", "Suits", "Waistcoat Sets", "Tutu Skirts", "Party Tops", "Sequin Dresses", "Stylish Sets"],
      festival: ["Ethnic Frocks", "Lehenga Choli", "Sherwani", "Kurta Pajama", "Dhoti Kurta", "Festive Skirts & Tops"],
      sports: ["Tracksuits", "Sports Tees & Shorts", "Jersey Sets", "Activewear"],
      school: ["School Uniforms", "Pinafores", "Shirts & Shorts", "Shirts & Skirts"],
      winter: ["Sweaters", "Cardigans", "Sweatshirts", "Thermal Wear", "Raincoats", "Jackets"],
      formal: ["Blazers", "Waistcoat Sets", "Stylish Dresses", "Gown Sets", "Collar Shirts & Pants"]
    }
  };

  // Footwear categories
  const footwearCategories = {
    teen: {
      casual: {
        male: ["Sneakers", "Loafers"],
        female: ["Flats", "Sneakers"],
        unisex: ["Flip-flops", "Sandals"]
      },
      formal: {
        male: ["Formal shoes", "Loafers"],
        female: ["Heels", "Formal flats"],
        unisex: ["Loafers"]
      },
      party: {
        male: ["Party loafers"],
        female: ["Heels", "Shimmer flats"],
        unisex: ["Party sneakers"]
      },
      sports: {
        male: ["Sports shoes"],
        female: ["Sports shoes"],
        unisex: ["Sports shoes"]
      },
      ethnic: {
        male: ["Mojari", "Sandals"],
        female: ["Mojari", "Sandals"],
        unisex: ["Mojari", "Sandals"]
      },
      travel: {
        male: ["Boots", "Sneakers"],
        female: ["Boots", "Sneakers"],
        unisex: ["Boots", "Sneakers"]
      },
      lounge: {
        male: ["Flip-flops"],
        female: ["Flip-flops"],
        unisex: ["Flip-flops"]
      }
    },
    adult: {
      casual: {
        male: ["Sneakers", "Loafers"],
        female: ["Flats", "Sneakers"],
        unisex: ["Flip-flops", "Sandals"]
      },
      formal: {
        male: ["Formal shoes", "Loafers"],
        female: ["Heels", "Formal flats"],
        unisex: ["Loafers"]
      },
      party: {
        male: ["Party loafers"],
        female: ["Heels", "Shimmer flats"],
        unisex: ["Party sneakers"]
      },
      sports: {
        male: ["Sports shoes"],
        female: ["Sports shoes"],
        unisex: ["Sports shoes"]
      },
      ethnic: {
        male: ["Mojari", "Sandals"],
        female: ["Mojari", "Sandals"],
        unisex: ["Mojari", "Sandals"]
      },
      travel: {
        male: ["Boots", "Sneakers"],
        female: ["Boots", "Sneakers"],
        unisex: ["Boots", "Sneakers"]
      },
      lounge: {
        male: ["Flip-flops"],
        female: ["Flip-flops"],
        unisex: ["Flip-flops"]
      }
    },
    senior: {
      casual: {
        male: ["Sneakers", "Loafers"],
        female: ["Flats", "Sneakers"],
        unisex: ["Flip-flops", "Sandals"]
      },
      formal: {
        male: ["Formal shoes", "Loafers"],
        female: ["Heels", "Formal flats"],
        unisex: ["Loafers"]
      },
      party: {
        male: ["Party loafers"],
        female: ["Heels", "Shimmer flats"],
        unisex: ["Party sneakers"]
      },
      sports: {
        male: ["Sports shoes"],
        female: ["Sports shoes"],
        unisex: ["Sports shoes"]
      },
      ethnic: {
        male: ["Mojari", "Sandals"],
        female: ["Mojari", "Sandals"],
        unisex: ["Mojari", "Sandals"]
      },
      travel: {
        male: ["Boots", "Sneakers"],
        female: ["Boots", "Sneakers"],
        unisex: ["Boots", "Sneakers"]
      },
      lounge: {
        male: ["Flip-flops"],
        female: ["Flip-flops"],
        unisex: ["Flip-flops"]
      }
    },
    kid: {
      casual: ["Sneakers", "Sandals", "Casual Shoes"],
      party: ["Party Shoes", "Ballet Flats", "Loafers"],
      festival: ["Mojari", "Kolhapuri", "Sandals"],
      sports: ["Sports Shoes", "Trainers"],
      school: ["School Shoes", "Sneakers"],
      winter: ["Boots", "Waterproof Shoes"],
      formal: ["Formal Shoes", "Loafers"]
    }
  };

  // Color matching rules
  const colorRules = {
    teen: {
      light: ["Navy", "Emerald", "Burgundy", "Charcoal", "Soft Pastels", "Black", "White", "Grey", "Red", "Blue"],
      medium: ["Olive", "Mustard", "Coral", "Teal", "Maroon", "Tan", "Purple", "Warm Beige", "Blue", "Green"],
      dark: ["Bright Yellow", "Cobalt", "Hot Pink", "Orange", "White", "Gold", "Turquoise", "Bright Green", "Bold Prints"]
    },
    adult: {
      light: ["Navy", "Emerald", "Burgundy", "Charcoal", "Soft Pastels", "Black", "White", "Grey", "Red", "Blue"],
      medium: ["Olive", "Mustard", "Coral", "Teal", "Maroon", "Tan", "Purple", "Warm Beige", "Blue", "Green"],
      dark: ["Bright Yellow", "Cobalt", "Hot Pink", "Orange", "White", "Gold", "Turquoise", "Bright Green", "Bold Prints"]
    },
    senior: {
      light: ["Navy", "Emerald", "Burgundy", "Charcoal", "Soft Pastels", "Black", "White", "Grey", "Red", "Blue"],
      medium: ["Olive", "Mustard", "Coral", "Teal", "Maroon", "Tan", "Purple", "Warm Beige", "Blue", "Green"],
      dark: ["Bright Yellow", "Cobalt", "Hot Pink", "Orange", "White", "Gold", "Turquoise", "Bright Green", "Bold Prints"]
    },
    kid: {
      fair: ["Sky Blue", "Pink", "Yellow", "Lavender", "Red", "Light Green", "White", "Peach"],
      medium: ["Turquoise", "Orange", "Olive", "Maroon", "Navy Blue", "Mustard", "Cream", "Teal"],
      dark: ["Bright Yellow", "Royal Blue", "Emerald Green", "Hot Pink", "White", "Purple", "Red"]
    }
  };

  // Occasion-based colors
  const occasionColors = {
    teen: {
      casual: ["Neutral shades", "Denim blues", "Pastels", "Earth tones"],
      formal: ["Black", "Navy", "Grey", "White", "Beige", "Subtle tones"],
      party: ["Metallics", "Gold", "Silver", "Red", "Bold prints", "Jewel tones"],
      sports: ["Neon", "Bright colors", "Black", "White"],
      ethnic: ["Gold", "Red", "Royal Blue", "Maroon", "Green", "Orange", "Embellished prints"],
      travel: ["Olive", "Brown", "Blue", "Grey", "Comfortable tones"],
      lounge: ["Soft pastels", "White", "Grey", "Light blue", "Comfort shades"]
    },
    adult: {
      casual: ["Neutral shades", "Denim blues", "Pastels", "Earth tones"],
      formal: ["Black", "Navy", "Grey", "White", "Beige", "Subtle tones"],
      party: ["Metallics", "Gold", "Silver", "Red", "Bold prints", "Jewel tones"],
      sports: ["Neon", "Bright colors", "Black", "White"],
      ethnic: ["Gold", "Red", "Royal Blue", "Maroon", "Green", "Orange", "Embellished prints"],
      travel: ["Olive", "Brown", "Blue", "Grey", "Comfortable tones"],
      lounge: ["Soft pastels", "White", "Grey", "Light blue", "Comfort shades"]
    },
    senior: {
      casual: ["Neutral shades", "Denim blues", "Pastels", "Earth tones"],
      formal: ["Black", "Navy", "Grey", "White", "Beige", "Subtle tones"],
      party: ["Metallics", "Gold", "Silver", "Red", "Bold prints", "Jewel tones"],
      sports: ["Neon", "Bright colors", "Black", "White"],
      ethnic: ["Gold", "Red", "Royal Blue", "Maroon", "Green", "Orange", "Embellished prints"],
      travel: ["Olive", "Brown", "Blue", "Grey", "Comfortable tones"],
      lounge: ["Soft pastels", "White", "Grey", "Light blue", "Comfort shades"]
    },
    kid: {
      casual: ["Red", "Yellow", "Blue", "Green", "Orange", "Pink", "Purple", "Cyan", "Magenta", "Lime", "Turquoise"],
      party: ["Gold", "Silver", "Red", "Royal Blue", "Pink"],
      festival: ["Maroon", "Gold", "Cream", "Green", "Orange"],
      sports: ["White", "Blue", "Red", "Yellow", "Green", "Black", "Neon Green", "Neon Pink", "Neon Orange"],
      school: ["Navy", "White", "Grey", "Black", "Brown"],
      winter: ["Brown", "Grey", "Navy", "Maroon"],
      formal: ["Pastel Blue", "Pastel Pink", "Pastel Yellow", "Navy", "Black", "Grey", "Cream"]
    }
  };

  const showNotification = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  useEffect(() => {
    // Load user profile from localStorage or API
    const loadUserProfile = async () => {
      try {
        console.log("👤 Loading user profile...");
        const token = localStorage.getItem("token");
        if (token) {
          const res = await axiosClient.get("/user/profile");
          console.log("✅ User profile loaded:", res.data);
          setUserProfile(res.data);
        } else {
          console.log("❌ No token found");
        }
      } catch (err) {
        console.error("❌ Could not load user profile:", err);
        showNotification("Could not load user profile", "error");
      }
    };
    loadUserProfile();

    // Cleanup function to cancel pending requests when component unmounts
    return () => {
      isComponentMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (pendingRequestRef.current) {
        pendingRequestRef.current.cancel();
      }
    };
  }, []);

  const handleProfileChange = e => {
    setUserProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStylingChange = e => {
    setStylingInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getRecommendations = async () => {
    if (!userProfile.ageCategory || !userProfile.gender || !userProfile.skinTone || !stylingInputs.occasion) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (pendingRequestRef.current) {
      pendingRequestRef.current.cancel();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    // Check if component is still mounted
    if (!isComponentMountedRef.current) return;

    setLoading(true);
    setError("");

    try {
      showNotification("Generating personalized recommendations...", "info");

      // Get clothing/footwear categories based on age and occasion
      let categories = [];
      if (stylingInputs.productType === "clothing") {
        if (userProfile.ageCategory === "kid") {
          categories = clothingCategories.kid[stylingInputs.occasion] || [];
        } else {
          const genderCats = clothingCategories[userProfile.ageCategory]?.[stylingInputs.occasion] || {};
          const union = [
            ...(genderCats[userProfile.gender?.toLowerCase()] || []),
            ...(genderCats.unisex || [])
          ];
          categories = Array.from(new Set(union));
        }
      } else {
        if (userProfile.ageCategory === "kid") {
          categories = footwearCategories.kid[stylingInputs.occasion] || [];
        } else {
          const genderCats = footwearCategories[userProfile.ageCategory]?.[stylingInputs.occasion] || {};
          const union = [
            ...(genderCats[userProfile.gender?.toLowerCase()] || []),
            ...(genderCats.unisex || [])
          ];
          categories = Array.from(new Set(union));
        }
      }

      // Get color recommendations
      let colors = [];
      if (userProfile.ageCategory === "kid") {
        colors = colorRules.kid[userProfile.skinTone.toLowerCase()] || [];
      } else {
        // Map Fair/Medium/Dusky/Dark to light/medium/dark buckets
        const toneMap = { Fair: 'light', Medium: 'medium', Dusky: 'dark', Dark: 'dark' };
        const bucket = toneMap[userProfile.skinTone] || 'medium';
        colors = colorRules[userProfile.ageCategory]?.[bucket] || [];
      }

      // Get occasion-based colors
      const occasionBasedColors = occasionColors[userProfile.ageCategory]?.[stylingInputs.occasion] || [];
      // Merge and de-dup
      const combinedColors = [...new Set([...(colors || []), ...(occasionBasedColors || [])])];

      // Prepare data for backend API (matching backend expectations)
      const recommendationData = {
        productType: stylingInputs.productType === "clothing" ? "Dress" : "Footwear",
        occasion: stylingInputs.occasion,
        style: stylingInputs.colorPreference || "casual",
        priceRange: stylingInputs.budget ? parseInt(stylingInputs.budget) : undefined,
        categories,
        colors: combinedColors,
        radius: 10,
        useLocationFilter
      };

      console.log("🎯 Sending recommendation request:", recommendationData);

      // Create cancelable request
      const cancelTokenSource = axios.CancelToken.source();
      pendingRequestRef.current = cancelTokenSource;

      const res = await axiosClient.post("/stylist/recommend", recommendationData, {
        signal: abortControllerRef.current.signal,
        cancelToken: cancelTokenSource.token,
        timeout: 30000 // 30 second timeout for this specific request
      });

      // Check if component is still mounted
      if (!isComponentMountedRef.current) return;

      console.log("✅ Recommendations received:", res.data);
      
      setRecommendations(res.data || []);
      showNotification("Recommendations generated successfully!", "success");
    } catch (err) {
      // Check if component is still mounted
      if (!isComponentMountedRef.current) return;

      // Handle cancellation separately
      if (err.name === 'AbortError' || err.message === 'canceled') {
        console.log("🔄 Request was cancelled");
        return;
      }

      console.error("❌ Recommendation error:", err);
      const errorMessage = err.response?.data?.error || "Failed to fetch recommendations";
      setError(errorMessage);
      showNotification("Failed to generate recommendations", "error");
    } finally {
      // Only update state if component is still mounted
      if (isComponentMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const getSuggestedCategories = () => {
    if (!userProfile.ageCategory || !stylingInputs.occasion) return [];
    
    try {
      if (stylingInputs.productType === "clothing") {
        if (userProfile.ageCategory === "kid") {
          return clothingCategories.kid[stylingInputs.occasion] || [];
        } else {
          const ageCategory = clothingCategories[userProfile.ageCategory];
          const occasion = ageCategory?.[stylingInputs.occasion];
          const gender = userProfile.gender?.toLowerCase();
          return occasion?.[gender] || [];
        }
      } else {
        if (userProfile.ageCategory === "kid") {
          return footwearCategories.kid[stylingInputs.occasion] || [];
        } else {
          const ageCategory = footwearCategories[userProfile.ageCategory];
          const occasion = ageCategory?.[stylingInputs.occasion];
          const gender = userProfile.gender?.toLowerCase();
          return occasion?.[gender] || [];
        }
      }
    } catch (error) {
      console.error("❌ Error getting suggested categories:", error);
      return [];
    }
  };

  const getSuggestedColors = () => {
    if (!userProfile.ageCategory || !userProfile.skinTone || !stylingInputs.occasion) return [];
    
    try {
      let skinToneColors = [];
      if (userProfile.ageCategory === "kid") {
        skinToneColors = colorRules.kid[userProfile.skinTone.toLowerCase()] || [];
      } else {
        skinToneColors = colorRules[userProfile.ageCategory]?.[userProfile.skinTone.toLowerCase()] || [];
      }
      
      const occasionBasedColors = occasionColors[userProfile.ageCategory]?.[stylingInputs.occasion] || [];
      
      return [...new Set([...skinToneColors, ...occasionBasedColors])];
    } catch (error) {
      console.error("❌ Error getting suggested colors:", error);
      return [];
    }
  };

  const getColorCategoryCombos = () => {
    const categories = getSuggestedCategories();
    const colors = getSuggestedColors();
    if ((!categories || categories.length === 0) && (!colors || colors.length === 0)) return [];
    if (!categories || categories.length === 0) return colors;
    if (!colors || colors.length === 0) return categories;
    const combos = [];
    for (const category of categories) {
      for (const color of colors) {
        combos.push(`${color} ${category}`);
        if (combos.length >= 12) break; // keep preview concise
      }
      if (combos.length >= 12) break;
    }
    return combos;
  };

  // Auto-preview actual products from nearby shops matching current inputs
  useEffect(() => {
    const ready = Boolean(
      userProfile.ageCategory &&
      userProfile.gender &&
      userProfile.skinTone &&
      stylingInputs.occasion
    );
    if (!ready) { 
      setPreviewProducts([]); 
      setPreviewLoading(false); 
      setPreviewError(""); 
      return; 
    }

    // Cancel any existing preview request
    if (pendingRequestRef.current) {
      pendingRequestRef.current.cancel();
    }

    setPreviewLoading(true);
    setPreviewError("");
    
    const timer = setTimeout(async () => {
      try {
        // Check if component is still mounted
        if (!isComponentMountedRef.current) return;

        const recommendationData = {
          productType: stylingInputs.productType === "clothing" ? "Dress" : "Footwear",
          occasion: stylingInputs.occasion,
          style: stylingInputs.colorPreference || "casual",
          priceRange: stylingInputs.budget ? parseInt(stylingInputs.budget) : undefined,
          categories: getSuggestedCategories(),
          colors: getSuggestedColors(),
          radius: 10,
          useLocationFilter
        };

        // Create cancelable request for preview
        const cancelTokenSource = axios.CancelToken.source();
        pendingRequestRef.current = cancelTokenSource;

        const res = await axiosClient.post("/stylist/recommend", recommendationData, {
          cancelToken: cancelTokenSource.token,
          timeout: 20000 // 20 second timeout for preview requests
        });

        // Check if component is still mounted
        if (!isComponentMountedRef.current) return;

        setPreviewProducts((res.data || []).slice(0, 12));
      } catch (e) {
        // Check if component is still mounted
        if (!isComponentMountedRef.current) return;

        // Handle cancellation separately
        if (e.message === 'canceled') {
          console.log("🔄 Preview request was cancelled");
          return;
        }

        setPreviewProducts([]);
        setPreviewError("Failed to load preview products");
      } finally {
        // Only update state if component is still mounted
        if (isComponentMountedRef.current) {
          setPreviewLoading(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      if (pendingRequestRef.current) {
        pendingRequestRef.current.cancel();
      }
    };
  }, [userProfile.ageCategory, userProfile.gender, userProfile.skinTone, stylingInputs.occasion, stylingInputs.productType, stylingInputs.budget, stylingInputs.colorPreference]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Loading State Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Generating Recommendations</h3>
            <p className="text-gray-600 mb-4">This may take a few moments. Please don't navigate away from this page.</p>
            <div className="text-sm text-gray-500">
              <p>• Analyzing your preferences</p>
              <p>• Searching nearby shops</p>
              <p>• Calculating best matches</p>
            </div>
          </div>
        </div>
      )}

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
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-primary-400 to-accent-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-3xl">🎨</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 font-display">
            AI Fashion Stylist
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get personalized fashion recommendations based on your age, skin tone, occasion, and style preferences
          </p>
        </div>

        

        <div className="grid lg:grid-cols-2 gap-8">
          {/* User Profile Section */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 font-display">Your Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age Category</label>
                <select
                  name="ageCategory"
                  value={userProfile.ageCategory}
                  onChange={handleProfileChange}
                  className="input-field"
                >
                  <option value="">Select Age Category</option>
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
                  value={userProfile.gender}
                  onChange={handleProfileChange}
                  className="input-field"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skin Tone</label>
                <select
                  name="skinTone"
                  value={userProfile.skinTone}
                  onChange={handleProfileChange}
                  className="input-field"
                >
                  <option value="">Select Skin Tone</option>
                  <option value="Fair">Fair</option>
                  <option value="Medium">Medium</option>
                  <option value="Dusky">Dusky</option>
                  <option value="Dark">Dark</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Body Size</label>
                  <select
                    name="bodySize"
                    value={userProfile.bodySize}
                    onChange={handleProfileChange}
                    className="input-field"
                  >
                    <option value="">Select Size</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shoe Size</label>
                  <input
                    name="shoeSize"
                    type="text"
                    value={userProfile.shoeSize}
                    onChange={handleProfileChange}
                    className="input-field"
                    placeholder="e.g. 7, 8.5, 42"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Styling Preferences Section */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 font-display">Styling Preferences</h2>
            <div className="space-y-4">
      <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
                <select
                  name="productType"
                  value={stylingInputs.productType}
                  onChange={handleStylingChange}
                  className="input-field"
                >
                  <option value="clothing">Clothing</option>
                  <option value="footwear">Footwear</option>
        </select>
      </div>
      <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Occasion</label>
                <select
                  name="occasion"
                  value={stylingInputs.occasion}
                  onChange={handleStylingChange}
                  className="input-field"
                >
                  <option value="">Select Occasion</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal/Office</option>
                  <option value="party">Party</option>
                  <option value="sports">Sports/Gym</option>
                  <option value="ethnic">Ethnic/Festive</option>
                  <option value="travel">Travel/Outdoor</option>
                  <option value="lounge">Lounge/Homewear</option>
                  {userProfile.ageCategory === "kid" && (
                    <>
                      <option value="festival">Festival/Traditional</option>
                      <option value="school">School</option>
                      <option value="winter">Winter/Rainy</option>
                    </>
                  )}
                </select>
      </div>
      <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹)</label>
                <input
                  name="budget"
                  type="number"
                  value={stylingInputs.budget}
                  onChange={handleStylingChange}
                  className="input-field"
                  placeholder="Enter your budget"
                />
              </div>
              <button
                onClick={getRecommendations}
                disabled={loading}
                className="btn-primary w-full py-4 text-lg font-semibold"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Generating Recommendations...
                  </div>
                ) : (
                  "Get AI Recommendations"
                )}
              </button>
              {loading && (
                <div className="text-center text-sm text-gray-600 mt-2">
                  This may take a few moments. Please don't navigate away.
                </div>
              )}
              <div className="pt-2 flex items-center gap-3">
                <input
                  id="useLocationFilter"
                  type="checkbox"
                  checked={useLocationFilter}
                  onChange={(e) => setUseLocationFilter(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="useLocationFilter" className="text-sm text-gray-700">Filter by nearby products (10 km)</label>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Products from Nearby Shops */}
        {(userProfile.ageCategory && stylingInputs.occasion) && (
          <div className="mt-8 card">
            <h3 className="text-xl font-bold text-gray-800 mb-4 font-display">Preview Suggestions</h3>
            {previewLoading ? (
              <div className="text-center py-8 text-gray-600">Loading nearby products...</div>
            ) : previewError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{previewError}</div>
            ) : previewProducts.length === 0 ? (
              <div className="text-gray-600">No nearby products match your current selections.</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {previewProducts.map((product, index) => (
                  <div key={product._id || index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <a href={`/user/product/${product._id}`}>
                      <div className="aspect-square bg-gray-200 flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl">👕</span>
                        )}
                      </div>
                    </a>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-800 mb-2"><a href={`/user/product/${product._id}`}>{product.title}</a></h4>
                      <p className="text-gray-600 text-sm mb-1">{product.category}</p>
                      {product.color && (<p className="text-gray-500 text-xs mb-1">Color: {product.color}</p>)}
                      <p className="text-primary-600 font-bold">₹{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                <div>
                  <p className="font-semibold">Recommendation Failed</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
              <button 
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700 text-lg"
              >
                ×
              </button>
            </div>
            {error.includes('timeout') && (
              <div className="mt-3 p-3 bg-red-100 rounded-lg">
                <p className="text-sm font-medium">💡 Tips to avoid timeouts:</p>
                <ul className="text-xs mt-1 space-y-1">
                  <li>• Ensure you have a stable internet connection</li>
                  <li>• Try again in a few moments</li>
                  <li>• Reduce the search radius if using location filter</li>
                  <li>• Check if your profile information is complete</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Recommendations Display */}
      {recommendations.length > 0 && (
          <div className="mt-8 card">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 font-display">Your Personalized Recommendations</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((product, index) => (
                <div key={product._id || index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="aspect-square bg-gray-200 flex items-center justify-center">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">👕</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">{product.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                    <p className="text-primary-600 font-bold">₹{product.price}</p>
                    <button className="mt-3 w-full btn-primary text-sm py-2">
                      View Details
                    </button>
                  </div>
            </div>
          ))}
            </div>
        </div>
      )}

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            to="/user/home"
            className="btn-secondary inline-flex items-center"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
