import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function SignupForm({ 
  userType, 
  title, 
  subtitle, 
  icon, 
  primaryColor = "primary",
  accentColor = "accent",
  loginLink,
  loginText,
  redirectPath,
  endpoint,
  fields = []
}) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // Initialize form data based on fields
  useEffect(() => {
    const initialData = {};
    fields.forEach(field => {
      initialData[field.name] = "";
    });
    setFormData(initialData);
  }, [fields]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axiosClient.post(endpoint, formData);
      setSuccess(res.data.message || "Registration successful!");
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate(redirectPath, { 
          state: { message: res.data.message || "Registration successful!" }
        });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      primary: {
        bg: "from-primary-400 to-primary-600",
        text: "text-primary-600",
        hover: "hover:text-primary-500",
        border: "border-primary-200",
        bgLight: "bg-primary-50"
      },
      accent: {
        bg: "from-accent-400 to-accent-600",
        text: "text-accent-600",
        hover: "hover:text-accent-500",
        border: "border-accent-200",
        bgLight: "bg-accent-50"
      },
      secondary: {
        bg: "from-secondary-400 to-secondary-600",
        text: "text-secondary-600",
        hover: "hover:text-secondary-500",
        border: "border-secondary-200",
        bgLight: "bg-secondary-50"
      }
    };
    return colors[color] || colors.primary;
  };

  const primaryColors = getColorClasses(primaryColor);
  const accentColors = getColorClasses(accentColor);

  const renderField = (field) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      type: field.type || "text",
      required: field.required !== false,
      className: "input-field",
      placeholder: field.placeholder,
      value: formData[field.name] || "",
      onChange: handleChange,
      autoComplete: field.autoComplete
    };

    if (field.type === "textarea") {
      return (
        <textarea
          {...commonProps}
          rows={field.rows || 3}
          className="input-field resize-none"
        />
      );
    }

    if (field.type === "select") {
      return (
        <select {...commonProps}>
          <option value="">{field.placeholder}</option>
          {field.options?.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return <input {...commonProps} />;
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className={`absolute top-20 left-10 w-72 h-72 bg-${primaryColor}-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle`}></div>
      <div className={`absolute bottom-20 right-10 w-72 h-72 bg-${accentColor}-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle`} style={{ animationDelay: '1s' }}></div>
      
      <div className="relative z-10 max-w-md w-full space-y-8">
        <div className="text-center">
          <div className={`mx-auto h-16 w-16 bg-gradient-to-br ${primaryColors.bg} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2 font-display">
            {title}
          </h2>
          <p className="text-gray-600">
            {subtitle}
          </p>
          {loginLink && (
            <p className="mt-2 text-sm text-gray-600">
              {loginText}{" "}
              <Link
                to={loginLink}
                className={`font-semibold ${accentColors.text} ${accentColors.hover} transition-colors duration-300`}
              >
                Sign in here
              </Link>
            </p>
          )}
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl animate-fade-in">
            <div className="flex items-center">
              <span className="mr-2">✅</span>
              {success}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-fade-in">
            <div className="flex items-center">
              <span className="mr-2">❌</span>
              {error}
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={index}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r ${primaryColors.bg} hover:from-${primaryColor}-500 hover:to-${primaryColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${primaryColor}-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
